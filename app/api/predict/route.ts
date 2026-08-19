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
        console.warn('R API request timeout, falling back to local prediction')
        // R API 超时，使用本地回退逻辑，不报错
        return useFallbackPrediction(data, locale)
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

// 语言无关的建议数据（key 供前端按当前语言渲染）
function generateSuggestionKeys(rResult: any, input: PredictionInput) {
  const keys: Array<{ key: string }> = []
  const { metabolism } = rResult
  const { tAs, SMI, MMA_pct } = metabolism

  if (tAs > 200)    keys.push({ key: 'high_tAs' })
  if (SMI < 2)      keys.push({ key: 'low_SMI' })
  if (MMA_pct > 20) keys.push({ key: 'high_MMA' })
  else if (MMA_pct > 15) keys.push({ key: 'mod_MMA' })
  if (input.CT_drug === 'Yes') keys.push({ key: 'ct_drug' })

  const level = rResult.prediction.risk_level
  if (level === 'high')   keys.push({ key: 'risk_high' })
  else if (level === 'medium') keys.push({ key: 'risk_medium' })

  if (keys.length === 0) keys.push({ key: 'risk_low' })

  return keys
}

// 生成临床建议（locale 参数决定语言）
function generateSuggestions(rResult: any, input: PredictionInput, locale: string = 'zh') {
  const suggestions: Array<{ risk_factor: string; suggestion: string; key: string }> = []
  const { metabolism } = rResult
  const { tAs, SMI, MMA_pct } = metabolism
  const isZh = locale !== 'en'   // 仅 'en' 使用英文，其余均用中文

  const zh: Record<string, [string, string]> = {
    high_tAs:    ['总砷浓度偏高',       '建议适当调整砷剂给药剂量或延长治疗间隔以降低体内砷总暴露量，同时加强肾功能监测。'],
    low_SMI:     ['二级甲基化能力低下', '检测到砷甲基化能力下降，建议适量补充叶酸、维生素B12等甲基供体，并监测同型半胱氨酸水平。'],
    high_MMA:    ['一甲基砷酸百分比升高','心血管风险增高，建议增加心脏监测频率：每周心电图、每月超声心动图及心脏标志物检测（肌钙蛋白、BNP）。'],
    mod_MMA:     ['一甲基砷酸百分比偏高','建议密切监测心功能，每两周进行心电图检查，每月检测心脏生物标志物。'],
    ct_drug:     ['合并使用心毒性药物', '需仔细权衡合并用药的风险/获益比，必要时考虑替代治疗方案，或实施加强型心脏监测方案。'],
    risk_high:   ['综合评估：高风险',   '建议立即进行心脏科会诊，评估是否需要调整砷剂剂量或暂停治疗，并实施每日症状评估的强化监测方案。'],
    risk_medium: ['综合评估：中等风险', '建议加强监测：每周临床评估，每两周心脏专项评估，并向患者充分说明需要报告的心脏相关症状。'],
    risk_low:    ['综合评估：低风险',   '继续执行常规监测方案，按治疗计划定期随访，进行标准化心脏功能评估。'],
  }
  const en: Record<string, [string, string]> = {
    high_tAs:    ['High Total Arsenic',                   'Consider adjusting ATO dosage or extending treatment intervals to reduce total arsenic exposure; monitor renal function regularly.'],
    low_SMI:     ['Low Secondary Methylation Index (SMI)','Low methylation capacity detected; consider methyl donor supplementation (folate, vitamin B12) and monitor homocysteine levels.'],
    high_MMA:    ['Elevated MMA%',                        'Elevated cardiovascular risk; enhance cardiac monitoring: weekly ECG, monthly echocardiography and cardiac biomarkers (troponin, BNP).'],
    mod_MMA:     ['Moderately Elevated MMA%',             'Monitor cardiac function closely; consider bi-weekly ECG and monthly cardiac biomarker assessment.'],
    ct_drug:     ['Concurrent Cardiotoxic Drug',          'Carefully evaluate the benefit-risk ratio of concomitant cardiotoxic medication; consider alternative therapies or an intensive cardiac surveillance protocol.'],
    risk_high:   ['High Risk',                            'Immediate cardiology consultation is recommended; evaluate the need for dose reduction or treatment interruption and implement an intensive daily symptom-monitoring protocol.'],
    risk_medium: ['Medium Risk',                          'Enhanced monitoring is recommended: weekly clinical assessment, bi-weekly cardiac evaluation; educate the patient on cardiac symptoms that should prompt immediate reporting.'],
    risk_low:    ['Low Risk',                             'Continue routine monitoring; maintain regular follow-up appointments and standard cardiac function assessments as per the treatment protocol.'],
  }

  const dict = isZh ? zh : en

  const keys = generateSuggestionKeys(rResult, input)
  for (const { key } of keys) {
    if (dict[key]) {
      suggestions.push({ key, risk_factor: dict[key][0], suggestion: dict[key][1] })
    }
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
