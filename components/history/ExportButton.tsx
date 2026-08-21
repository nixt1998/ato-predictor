'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, FileText, FileSpreadsheet, ChevronDown, X, Loader2 } from 'lucide-react'
import { PredictionRecord } from '@/types/history'

interface ExportButtonProps {
  allRecords: PredictionRecord[]
  selectedRecords: PredictionRecord[]
}

type ExportMode = 'all' | 'selected'
type ExportFormat = 'csv' | 'pdf'

/**
 * 导出按钮
 * 支持：导出全部/导出选中 + CSV/PDF格式 + PDF语言选择
 */
export default function ExportButton({ allRecords, selectedRecords }: ExportButtonProps) {
  const t = useTranslations('history.export')
  const [showMenu, setShowMenu] = useState(false)
  const [showPDFLangDialog, setShowPDFLangDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [pdfLanguage, setPdfLanguage] = useState<'zh' | 'en'>('zh')
  const [pendingExport, setPendingExport] = useState<{ mode: ExportMode; format: ExportFormat } | null>(null)

  // 导出CSV
  const exportCSV = (records: PredictionRecord[]) => {
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

  // 导出PDF（批量）
  const exportPDF = async (records: PredictionRecord[], language: 'zh' | 'en') => {
    if (records.length === 0) return
    setIsExporting(true)

    try {
      // 逐个生成 PDF 并下载
      for (const record of records) {
        const response = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            predictionData: {
              input: record.input,
              result: record.result,
              timestamp: record.timestamp,
            },
          }),
        })

        if (!response.ok) throw new Error('Failed to generate report')

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
      setShowPDFLangDialog(false)
    }
  }

  // 处理导出操作
  const handleExport = (mode: ExportMode, format: ExportFormat) => {
    const records = mode === 'all' ? allRecords : selectedRecords

    if (records.length === 0) {
      alert(mode === 'selected' ? '请先选择要导出的记录' : '没有可导出的记录')
      return
    }

    if (format === 'csv') {
      exportCSV(records)
    } else {
      // PDF需要选择语言
      setPendingExport({ mode, format })
      setShowPDFLangDialog(true)
      setShowMenu(false)
    }
  }

  // 确认PDF语言并导出
  const confirmPDFExport = () => {
    if (!pendingExport) return
    const records = pendingExport.mode === 'all' ? allRecords : selectedRecords
    exportPDF(records, pdfLanguage)
    setPendingExport(null)
  }

  if (allRecords.length === 0) return null

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#005EB8] text-white rounded-lg hover:bg-[#004A94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('exporting')}
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {t('export')}
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {/* 导出菜单 */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-[#E0E0E0] overflow-hidden z-10">
            {/* 导出全部记录 */}
            <div className="p-2 bg-[#F5F5F5] border-b border-[#E0E0E0]">
              <div className="text-xs font-semibold text-[#757575] px-2 py-1">
                导出全部记录 ({allRecords.length}条)
              </div>
            </div>
            <button
              onClick={() => handleExport('all', 'csv')}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-[#F0F7FF] transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span>导出全部为 CSV</span>
            </button>
            <button
              onClick={() => handleExport('all', 'pdf')}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-[#F0F7FF] transition-colors border-b border-[#E0E0E0]"
            >
              <FileText className="w-4 h-4 text-red-600" />
              <span>导出全部为 PDF</span>
            </button>

            {/* 导出选中记录 */}
            <div className="p-2 bg-[#F5F5F5] border-b border-[#E0E0E0]">
              <div className="text-xs font-semibold text-[#757575] px-2 py-1">
                导出选中记录 ({selectedRecords.length}条)
              </div>
            </div>
            <button
              onClick={() => handleExport('selected', 'csv')}
              disabled={selectedRecords.length === 0}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-[#F0F7FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span>导出选中为 CSV</span>
            </button>
            <button
              onClick={() => handleExport('selected', 'pdf')}
              disabled={selectedRecords.length === 0}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-[#F0F7FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4 text-red-600" />
              <span>导出选中为 PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* PDF语言选择对话框 */}
      {showPDFLangDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#005EB8] to-[#0073D1] p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8" />
                  <div>
                    <h3 className="text-xl font-bold">选择PDF报告语言</h3>
                    <p className="text-sm text-white/80">
                      {pendingExport?.mode === 'all'
                        ? `导出全部 ${allRecords.length} 条记录`
                        : `导出选中 ${selectedRecords.length} 条记录`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPDFLangDialog(false)
                    setPendingExport(null)
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* 语言选择 */}
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-3">
                  报告语言
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPdfLanguage('zh')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      pdfLanguage === 'zh'
                        ? 'border-[#005EB8] bg-[#F0F7FF] text-[#005EB8]'
                        : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                    }`}
                  >
                    <div className="font-semibold">中文</div>
                    <div className="text-xs text-[#757575]">Chinese</div>
                  </button>
                  <button
                    onClick={() => setPdfLanguage('en')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      pdfLanguage === 'en'
                        ? 'border-[#005EB8] bg-[#F0F7FF] text-[#005EB8]'
                        : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                    }`}
                  >
                    <div className="font-semibold">English</div>
                    <div className="text-xs text-[#757575]">英文</div>
                  </button>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPDFLangDialog(false)
                    setPendingExport(null)
                  }}
                  disabled={isExporting}
                  className="flex-1 px-4 py-3 border border-[#E0E0E0] rounded-lg text-[#757575] hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  取消
                </button>
                <button
                  onClick={confirmPDFExport}
                  disabled={isExporting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#005EB8] to-[#0073D1] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      导出中...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      开始导出
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
