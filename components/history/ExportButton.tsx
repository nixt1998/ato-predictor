'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { PredictionRecord } from '@/types/history'

interface ExportButtonProps {
  records: PredictionRecord[]
}

/**
 * 导出按钮
 * 支持：CSV 批量导出、单条 PDF 报告
 */
export default function ExportButton({ records }: ExportButtonProps) {
  const t = useTranslations('history.export')
  const [isExporting, setIsExporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // 导出为 CSV
  const exportToCSV = () => {
    if (records.length === 0) return

    // CSV 表头
    const headers = [
      'ID',
      'Name',
      'Timestamp',
      'Risk Level',
      'Probability (%)',
      'iAs (µg/L)',
      'MMA (µg/L)',
      'DMA (µg/L)',
      'CT Drug',
      'tAs (µg/L)',
      'PMI',
      'SMI',
      'iAs%',
      'MMA%',
      'DMA%',
    ]

    // CSV 数据行
    const rows = records.map((record) => [
      record.id,
      record.nickname || '',
      new Date(record.timestamp).toLocaleString('zh-CN'),
      record.result.prediction.risk_level,
      (record.result.prediction.probability * 100).toFixed(1),
      record.input.iAs,
      record.input.MMA,
      record.input.DMA,
      record.input.CT_drug,
      record.result.metabolism.tAs.toFixed(2),
      record.result.metabolism.PMI.toFixed(3),
      record.result.metabolism.SMI.toFixed(3),
      record.result.metabolism.iAs_pct.toFixed(1),
      record.result.metabolism.MMA_pct.toFixed(1),
      record.result.metabolism.DMA_pct.toFixed(1),
    ])

    // 生成 CSV 内容
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    // 创建 Blob 并下载
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ato-prediction-history-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)

    setShowMenu(false)
  }

  // 导出所有记录的 PDF 报告（批量）
  const exportAllPDF = async () => {
    if (records.length === 0) return
    setIsExporting(true)

    try {
      // 逐个生成 PDF 并下载
      for (const record of records) {
        const response = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: 'zh',
            predictionData: {
              input: record.input,
              result: record.result,
              timestamp: record.timestamp,
            },
          }),
        })

        if (!response.ok) throw new Error('PDF generation failed')

        const data = await response.json()
        const pdfBlob = await fetch(`data:application/pdf;base64,${data.pdfBase64}`).then((r) =>
          r.blob()
        )
        const url = URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${record.nickname || record.id}-report.pdf`
        link.click()
        URL.revokeObjectURL(url)

        // 避免短时间内大量请求
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error('Batch PDF export error:', error)
      alert(t('error'))
    } finally {
      setIsExporting(false)
      setShowMenu(false)
    }
  }

  if (records.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#005EB8] text-white rounded-lg hover:bg-[#004A94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        {isExporting ? t('exporting') : t('export')}
      </button>

      {/* 下拉菜单 */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E0E0E0] rounded-lg shadow-lg z-10">
          <button
            onClick={exportToCSV}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#212121] hover:bg-[#F5F5F5] transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            {t('exportCSV')}
          </button>
          <button
            onClick={exportAllPDF}
            disabled={isExporting}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#212121] hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-red-600" />
            {t('exportAllPDF')} ({records.length})
          </button>
        </div>
      )}
    </div>
  )
}
