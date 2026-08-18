import { NextRequest, NextResponse } from 'next/server'
import { PDFGenerator, type PredictionData, type PDFConfig } from '@/lib/pdf/PDFGenerator'
import fs from 'fs'
import path from 'path'

/**
 * POST /api/generate-report
 *
 * 生成 PDF 报告
 *
 * Body:
 * {
 *   language: 'zh' | 'en',
 *   predictionData: PredictionData
 * }
 *
 * Response:
 * {
 *   success: true,
 *   reportNumber: 'ATO-20260818-000001',
 *   downloadUrl: '/api/download-report/ATO-20260818-000001'
 * }
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

    // 创建 PDF 生成器
    const generator = new PDFGenerator(config, predictionData as PredictionData)
    const doc = await generator.generate()

    // 确保临时目录存在
    const tmpDir = path.join(process.cwd(), 'tmp', 'reports')
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }

    // 保存 PDF 到临时文件
    const pdfPath = path.join(tmpDir, `${reportNumber}.pdf`)
    const writeStream = fs.createWriteStream(pdfPath)

    doc.pipe(writeStream)

    // 等待写入完成
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })

    // 返回成功响应
    return NextResponse.json({
      success: true,
      reportNumber,
      downloadUrl: `/api/download-report/${reportNumber}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1小时后过期
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
 * 格式：ATO-YYYYMMDD-NNNNNN
 *
 * 注意：这是简化版本，使用时间戳+随机数。
 * 生产环境应使用数据库自增ID确保唯一性。
 */
function generateReportNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  // 使用时间戳的最后6位 + 随机2位确保唯一性
  const timestamp = Date.now().toString().slice(-4)
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  const serial = `${timestamp}${random}`

  return `ATO-${dateStr}-${serial}`
}
