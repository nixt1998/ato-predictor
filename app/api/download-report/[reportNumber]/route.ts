import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * GET /api/download-report/[reportNumber]
 *
 * 下载生成的 PDF 报告
 *
 * Response: PDF file stream
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { reportNumber: string } }
) {
  try {
    const { reportNumber } = params

    // 验证报告编号格式
    if (!reportNumber || !/^ATO-\d{8}-\d{6}$/.test(reportNumber)) {
      return NextResponse.json(
        { error: 'Invalid report number format' },
        { status: 400 }
      )
    }

    // 查找 PDF 文件
    const pdfPath = path.join(process.cwd(), 'tmp', 'reports', `${reportNumber}.pdf`)

    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { error: 'Report not found or expired' },
        { status: 404 }
      )
    }

    // 读取 PDF 文件
    const pdfBuffer = fs.readFileSync(pdfPath)

    // 返回 PDF 文件流
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${reportNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('PDF download error:', error)
    return NextResponse.json(
      {
        error: 'Failed to download PDF report',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
