import { NextRequest, NextResponse } from 'next/server'
import { PredictionInput, PredictionResult } from '@/types/prediction'

// R API 地址（从环境变量读取）
const R_API_URL = process.env.NEXT_PUBLIC_R_API_URL || 'http://localhost:8000'
const API_TIMEOUT = 30000 // 30 秒超时

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const locale: string = (body as any).locale || 'zh'
    const data: PredictionInput = body as PredictionInput

    // 验证输入
    if (data.iAs < 0 || data.MMA < 0 || data.DMA < 0) {
      return NextResponse.json(
        { error: 'All values must be positive' },
        { status: 400 }
      )
    }

    // 调用 R API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const response = await fetch(`${R_API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          iAs: data.iAs,
          MMA: data.MMA,
          DMA: data.DMA,
          CT_drug: data.CT_drug,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`R API error: ${response.status} ${response.statusText}`)
      }

      const rResult = await response.json()

      // R 返回的 JSON 中数值以数组形式包装：[225.5] → 提取为标量
      const scalar = (v: any): any => Array.isArray(v) ? v[0] : v

      // 将所有嵌套的数组值转换为标量
      const normalizedResult = {
        prediction: {
          class: scalar(rResult.prediction.class),
          probability: scalar(rResult.prediction.probability),
          risk_level: scalar(rResult.prediction.risk_level),
        },
        metabolism: {
          tAs:     scalar(rResult.metabolism.tAs),
          PMI:     scalar(rResult.metabolism.PMI),
          SMI:     scalar(rResult.metabolism.SMI),
          iAs_pct: scalar(rResult.metabolism.iAs_pct),
          MMA_pct: scalar(rResult.metabolism.MMA_pct),
          DMA_pct: scalar(rResult.metabolism.DMA_pct),
        },
        shap_values: {
          tAs:     scalar(rResult.shap_values.tAs),
          SMI:     scalar(rResult.shap_values.SMI),
          MMA_per: scalar(rResult.shap_values.MMA_per),
          DMA_per: scalar(rResult.shap_values.DMA_per),
          CT_drug: scalar(rResult.shap_values.CT_drug),
        },
        major_risk_factor: scalar(rResult.major_risk_factor),
      }

      // 生成临床建议（使用标量化后的结果）
      const suggestions = generateSuggestions(normalizedResult, data, locale)

      // 返回标量化结果
      return NextResponse.json({
        ...normalizedResult,
        suggestions,
        timestamp: new Date().toISOString(),
      })
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        console.error('R API request timeout')
        return NextResponse.json(
          { error: 'Prediction timeout. Please try again.' },
          { status: 504 }
        )
      }

      console.error('R API fetch error:', fetchError)

      // 如果 R API 不可用，使用回退逻辑
      return useFallbackPrediction(data, locale)
    }
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 生成临床建议
function generateSuggestions(rResult: any, input: PredictionInput, locale: string = 'zh') {
  const suggestions: Array<{ risk_factor: string; suggestion: string }> = []
  const { metabolism } = rResult
  const { tAs, SMI, MMA_pct } = metabolism

  const isZh = locale === 'zh'

  // 基于总砷浓度的建议
  if (tAs > 200) {
    suggestions.push({
      risk_factor: isZh ? '总砷浓度偏高' : 'High Total Arsenic',
      suggestion: isZh
        ? '建议适当调整砷剂给药剂量或延长治疗间隔以降低体内砷总暴露量，同时加强肾功能监测。\n(Consider adjusting ATO dosage or extending treatment intervals; monitor renal function.)'
        : 'Consider adjusting ATO dosage or extending treatment intervals; monitor renal function.',
    })
  }

  // 基于 SMI 的建议
  if (SMI < 2) {
    suggestions.push({
      risk_factor: isZh ? '二级甲基化能力低下' : 'Low Secondary Methylation Index (SMI)',
      suggestion: isZh
        ? '检测到砷甲基化能力下降，建议适量补充叶酸、维生素B12等甲基供体，并监测同型半胱氨酸水平。\n(Low methylation capacity detected; consider methyl donor supplementation and monitor homocysteine.)'
        : 'Low methylation capacity detected; consider methyl donor supplementation and monitor homocysteine.',
    })
  }

  // 基于 MMA 百分比的建议
  if (MMA_pct > 20) {
    suggestions.push({
      risk_factor: isZh ? '一甲基砷酸百分比升高' : 'Elevated MMA%',
      suggestion: isZh
        ? '心血管风险增高，建议增加心脏监测频率：每周心电图、每月超声心动图及心脏标志物检测（肌钙蛋白、BNP）。\n(Elevated cardiovascular risk; enhance cardiac monitoring: weekly ECG, monthly echocardiography and biomarkers.)'
        : 'Elevated cardiovascular risk; enhance cardiac monitoring: weekly ECG, monthly echocardiography and biomarkers.',
    })
  } else if (MMA_pct > 15) {
    suggestions.push({
      risk_factor: isZh ? '一甲基砷酸百分比偏高' : 'Moderately Elevated MMA%',
      suggestion: isZh
        ? '建议密切监测心功能，每两周进行心电图检查，每月检测心脏生物标志物。\n(Monitor cardiac function closely; bi-weekly ECG and monthly cardiac biomarkers.)'
        : 'Monitor cardiac function closely; bi-weekly ECG and monthly cardiac biomarkers.',
    })
  }

  // 基于心毒性药物的建议
  if (input.CT_drug === 'Yes') {
    suggestions.push({
      risk_factor: isZh ? '合并使用心毒性药物' : 'Concurrent Cardiotoxic Drug',
      suggestion: isZh
        ? '需仔细权衡合并用药的风险/获益比，必要时考虑替代治疗方案，或实施加强型心脏监测方案。\n(Carefully evaluate benefit-risk ratio; consider alternative therapies or intensive cardiac surveillance.)'
        : 'Carefully evaluate benefit-risk ratio; consider alternative therapies or intensive cardiac surveillance.',
    })
  }

  // 基于风险等级的建议
  if (rResult.prediction.risk_level === 'high') {
    suggestions.push({
      risk_factor: isZh ? '综合评估：高风险' : 'High Risk',
      suggestion: isZh
        ? '建议立即进行心脏科会诊，评估是否需要调整砷剂剂量或暂停治疗，并实施每日症状评估的强化监测方案。\n(Immediate cardiology consultation recommended; consider dose reduction or treatment pause with intensive daily monitoring.)'
        : 'Immediate cardiology consultation recommended; consider dose reduction or treatment pause with intensive daily monitoring.',
    })
  } else if (rResult.prediction.risk_level === 'medium') {
    suggestions.push({
      risk_factor: isZh ? '综合评估：中等风险' : 'Medium Risk',
      suggestion: isZh
        ? '建议加强监测：每周临床评估，每两周心脏专项评估，并向患者充分说明需要报告的心脏相关症状。\n(Enhanced monitoring: weekly clinical assessment, bi-weekly cardiac evaluation; educate patient on cardiac symptoms.)'
        : 'Enhanced monitoring: weekly clinical assessment, bi-weekly cardiac evaluation; educate patient on cardiac symptoms.',
    })
  }

  // 如果没有特殊风险
  if (suggestions.length === 0) {
    suggestions.push({
      risk_factor: isZh ? '综合评估：低风险' : 'Low Risk',
      suggestion: isZh
        ? '继续执行常规监测方案，按治疗计划定期随访，进行标准化心脏功能评估。\n(Continue routine monitoring; maintain regular follow-up and standard cardiac assessments.)'
        : 'Continue routine monitoring; maintain regular follow-up and standard cardiac assessments.',
    })
  }

  return suggestions
}

// 回退预测逻辑（当 R API 不可用时）
function useFallbackPrediction(data: PredictionInput, locale: string = 'zh') {
  console.warn('Using fallback prediction logic - R API unavailable')

  // 计算砷代谢参数
  const tAs = data.iAs + data.MMA + data.DMA
  const PMI = data.iAs > 0 ? data.MMA / data.iAs : 0
  const SMI = data.MMA > 0 ? data.DMA / data.MMA : 0
  const iAs_pct = tAs > 0 ? (data.iAs / tAs) * 100 : 0
  const MMA_pct = tAs > 0 ? (data.MMA / tAs) * 100 : 0
  const DMA_pct = tAs > 0 ? (data.DMA / tAs) * 100 : 0

  // 简化的风险评估逻辑
  let riskScore = 0

  // 总砷贡献
  if (tAs > 300) riskScore += 0.3
  else if (tAs > 200) riskScore += 0.2
  else if (tAs > 150) riskScore += 0.1

  // SMI 贡献
  if (SMI < 2) riskScore += 0.25
  else if (SMI < 4) riskScore += 0.15

  // MMA% 贡献
  if (MMA_pct > 20) riskScore += 0.2
  else if (MMA_pct > 15) riskScore += 0.1

  // CT drug 贡献
  if (data.CT_drug === 'Yes') riskScore += 0.25

  const probability = Math.min(0.95, Math.max(0.05, riskScore))

  const riskLevel =
    probability < 0.2 ? 'low' :
    probability < 0.5 ? 'medium' :
    'high'

  // SHAP 值（简化版）
  const shapValues = {
    tAs: tAs > 200 ? 0.15 : tAs > 150 ? 0.08 : -0.05,
    SMI: SMI < 2 ? 0.12 : SMI < 4 ? 0.06 : -0.08,
    MMA_per: MMA_pct > 20 ? 0.1 : MMA_pct > 15 ? 0.05 : -0.03,
    DMA_per: DMA_pct > 80 ? -0.06 : DMA_pct < 60 ? 0.04 : 0,
    CT_drug: data.CT_drug === 'Yes' ? 0.15 : -0.05,
  }

  // 找出主要风险因素
  const shapEntries = Object.entries(shapValues).map(([key, value]) => ({
    key,
    value: Math.abs(value as number),
  }))
  shapEntries.sort((a, b) => b.value - a.value)
  const majorRiskFactor = shapEntries[0].key

  const result: PredictionResult = {
    prediction: {
      class: probability > 0.5 ? 'Yes' : 'No',
      probability,
      risk_level: riskLevel,
    },
    metabolism: {
      tAs,
      PMI,
      SMI,
      iAs_pct,
      MMA_pct,
      DMA_pct,
    },
    shap_values: shapValues,
    major_risk_factor: majorRiskFactor,
    suggestions: generateSuggestions(
      {
        prediction: { risk_level: riskLevel },
        metabolism: { tAs, SMI, MMA_pct },
      },
      data,
      locale
    ),
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(result, {
    headers: {
      'X-Prediction-Mode': 'fallback',
    },
  })
}
