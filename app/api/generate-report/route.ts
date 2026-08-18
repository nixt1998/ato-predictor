import { NextRequest, NextResponse } from 'next/server'

// 使用动态导入避免 Edge Runtime 问题
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/generate-report
 *
 * 生成 PDF 报告
 */
export async function POST(request: NextRequest) {
  try {
    const { PDFGenerator } = await import('@/lib/pdf/PDFGenerator')
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
    const config = {
      language: language as 'zh' | 'en',
      reportNumber,
      generatedAt: new Date().toISOString(),
    }

    // 创建 PDF 生成器
    const generator = new (PDFGenerator as any)(config, predictionData)
    const doc = await generator.generate()

    // 收集 PDF 数据到 Buffer
    const chunks: Buffer[] = []

    return new Promise((resolve) => {
      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks)
        const pdfBase64 = pdfBuffer.toString('base64')

        resolve(
          NextResponse.json({
            success: true,
            reportNumber,
            pdfBase64,
            filename: `${reportNumber}.pdf`,
          })
        )
      })

      doc.on('error', (error: Error) => {
        console.error('PDF generation error:', error)
        resolve(
          NextResponse.json(
            {
              error: 'Failed to generate PDF',
              details: error.message,
            },
            { status: 500 }
          )
        )
      })
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

/**
 * 生成报告编号
 */
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
