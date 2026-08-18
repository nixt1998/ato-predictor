import { NextRequest, NextResponse } from 'next/server'
import { SimplePDFGenerator } from '@/lib/pdf/SimplePDFGenerator'
import type { PredictionData, PDFConfig } from '@/lib/pdf/PDFGenerator'

export const dynamic = 'force-dynamic'

/**
 * POST /api/generate-report
 * 使用 jsPDF 生成简化版 PDF 报告
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { language = 'zh', predictionData } = body

    if (!predictionData) {
      return NextResponse.json(
        { error: 'Missing predictionData' },
        { status: 400 }
      )
    }

    // 生成报告编号
    const reportNumber = generateReportNumber()

    // 创建 PDF 配置
    const config: PDFConfig = {
      language: language as 'zh' | 'en',
      reportNumber,
      generatedAt: new Date().toISOString(),
    }

    // 使用简化版生成器（jsPDF）
    const generator = new SimplePDFGenerator(config, predictionData as PredictionData)
    const doc = generator.generate()

    // 转换为 base64
    const pdfBase64 = doc.output('datauristring').split(',')[1]

    return NextResponse.json({
      success: true,
      reportNumber,
      pdfBase64,
      filename: `${reportNumber}.pdf`,
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate PDF report',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

function generateReportNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  const timestamp = Date.now().toString().slice(-4)
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  const serial = `${timestamp}${random}`

  return `ATO-${dateStr}-${serial}`
}
