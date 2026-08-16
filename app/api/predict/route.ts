import { NextRequest, NextResponse } from 'next/server'
import { PredictionInput, PredictionResult } from '@/types/prediction'

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

    // 计算砷代谢参数
    const tAs = data.iAs + data.MMA + data.DMA
    const PMI = data.iAs > 0 ? data.MMA / data.iAs : 0
    const SMI = data.MMA > 0 ? data.DMA / data.MMA : 0
    const iAs_pct = tAs > 0 ? (data.iAs / tAs) * 100 : 0
    const MMA_pct = tAs > 0 ? (data.MMA / tAs) * 100 : 0
    const DMA_pct = tAs > 0 ? (data.DMA / tAs) * 100 : 0

    // TODO: 调用 R API 进行预测
    // 这里暂时使用模拟数据
    const mockProbability = Math.random() * 0.8 + 0.1 // 0.1-0.9

    const riskLevel =
      mockProbability < 0.2 ? 'low' :
      mockProbability < 0.5 ? 'medium' :
      'high'

    // SHAP 值（模拟）
    const shapValues = {
      tAs: (Math.random() - 0.5) * 0.2,
      SMI: (Math.random() - 0.5) * 0.15,
      MMA_per: (Math.random() - 0.5) * 0.1,
      DMA_per: (Math.random() - 0.5) * 0.1,
      CT_drug: data.CT_drug === 'Yes' ? 0.15 : -0.05,
    }

    // 找出最大的 SHAP 值作为主要风险因素
    const shapEntries = Object.entries(shapValues).map(([key, value]) => ({
      key,
      value: Math.abs(value as number),
    }))
    shapEntries.sort((a, b) => b.value - a.value)
    const majorRiskFactor = shapEntries[0].key

    // 生成建议
    const suggestions = []

    if (tAs > 100) {
      suggestions.push({
        risk_factor: 'High Total Arsenic',
        suggestion: 'Consider adjusting ATO dosage or extending treatment intervals to reduce total arsenic exposure.',
      })
    }

    if (SMI < 2) {
      suggestions.push({
        risk_factor: 'Low SMI',
        suggestion: 'Monitor arsenic methylation capacity. Consider supplementation with methyl donors (e.g., folate, B12).',
      })
    }

    if (MMA_pct > 20) {
      suggestions.push({
        risk_factor: 'Elevated MMA%',
        suggestion: 'Increased cardiovascular risk. Recommend more frequent cardiac monitoring (ECG, biomarkers).',
      })
    }

    if (data.CT_drug === 'Yes') {
      suggestions.push({
        risk_factor: 'Concurrent Cardiotoxic Drug',
        suggestion: 'Carefully evaluate benefit-risk ratio. Consider alternative therapies or enhanced cardiac surveillance.',
      })
    }

    if (suggestions.length === 0) {
      suggestions.push({
        risk_factor: 'General',
        suggestion: 'Continue routine monitoring. Maintain regular follow-up appointments and cardiac assessments.',
      })
    }

    const result: PredictionResult = {
      prediction: {
        class: mockProbability > 0.5 ? 'Yes' : 'No',
        probability: mockProbability,
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
      suggestions,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
