import { NextRequest, NextResponse } from 'next/server'
import { PredictionInput, PredictionResult } from '@/types/prediction'

// R API 地址（从环境变量读取）
const R_API_URL = process.env.NEXT_PUBLIC_R_API_URL || 'http://localhost:8000'
const API_TIMEOUT = 30000 // 30 秒超时

export async function POST(request: NextRequest) {
  try {
    const data: PredictionInput = await request.json()

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
      const suggestions = generateSuggestions(normalizedResult, data)

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
      return useFallbackPrediction(data)
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
function generateSuggestions(rResult: any, input: PredictionInput) {
  const suggestions = []
  const { metabolism } = rResult
  const { tAs, SMI, MMA_pct } = metabolism

  // 基于总砷浓度的建议
  if (tAs > 200) {
    suggestions.push({
      risk_factor: 'High Total Arsenic',
      suggestion: 'Consider adjusting ATO dosage or extending treatment intervals to reduce total arsenic exposure. Monitor renal function regularly.',
    })
  }

  // 基于 SMI 的建议
  if (SMI < 2) {
    suggestions.push({
      risk_factor: 'Low Secondary Methylation Index (SMI)',
      suggestion: 'Low methylation capacity detected. Consider supplementation with methyl donors (folate, vitamin B12) and monitor homocysteine levels.',
    })
  }

  // 基于 MMA 百分比的建议
  if (MMA_pct > 20) {
    suggestions.push({
      risk_factor: 'Elevated MMA%',
      suggestion: 'Increased cardiovascular risk. Recommend enhanced cardiac monitoring: weekly ECG, monthly echocardiography, and cardiac biomarkers (troponin, BNP).',
    })
  } else if (MMA_pct > 15) {
    suggestions.push({
      risk_factor: 'Moderately Elevated MMA%',
      suggestion: 'Monitor cardiac function closely. Consider bi-weekly ECG and monthly cardiac biomarkers.',
    })
  }

  // 基于心毒性药物的建议
  if (input.CT_drug === 'Yes') {
    suggestions.push({
      risk_factor: 'Concurrent Cardiotoxic Drug',
      suggestion: 'Carefully evaluate benefit-risk ratio of concurrent cardiotoxic medication. Consider alternative therapies if available, or implement intensive cardiac surveillance protocol.',
    })
  }

  // 基于风险等级的建议
  if (rResult.prediction.risk_level === 'high') {
    suggestions.push({
      risk_factor: 'High Risk Assessment',
      suggestion: 'Immediate cardiology consultation recommended. Consider dose reduction or treatment pause. Implement intensive monitoring protocol with daily symptom assessment.',
    })
  } else if (rResult.prediction.risk_level === 'medium') {
    suggestions.push({
      risk_factor: 'Medium Risk Assessment',
      suggestion: 'Enhanced monitoring recommended. Weekly clinical assessment and bi-weekly cardiac evaluation. Educate patient on cardiac symptoms to report.',
    })
  }

  // 如果没有特殊风险
  if (suggestions.length === 0) {
    suggestions.push({
      risk_factor: 'Low Risk - Routine Monitoring',
      suggestion: 'Continue routine monitoring protocol. Maintain regular follow-up appointments and standard cardiac assessments as per treatment protocol.',
    })
  }

  return suggestions
}

// 回退预测逻辑（当 R API 不可用时）
function useFallbackPrediction(data: PredictionInput) {
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
      data
    ),
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(result, {
    headers: {
      'X-Prediction-Mode': 'fallback',
    },
  })
}
