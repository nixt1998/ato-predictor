'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface DownloadDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function DownloadReportDialog({ isOpen, onClose }: DownloadDialogProps) {
  const t = useTranslations('predict.download')
  const { result } = useAppStore()
  const [language, setLanguage] = useState<'zh' | 'en'>('zh')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleDownload = async () => {
    if (!result) return

    setIsGenerating(true)
    setError(null)
    setSuccess(false)

    try {
      // 准备预测数据
      const predictionData = {
        inputs: result.inputs,
        results: {
          probability: result.prediction.probability,
          riskLevel: result.prediction.risk_level,
        },
        shapValues: result.shap_values || {},
        arsMetabolism: result.metabolism ? {
          PMI: result.metabolism.PMI,
          SMI: result.metabolism.SMI,
          iAsPercent: result.metabolism.iAs_percent,
          MMAPercent: result.metabolism.MMA_percent,
          DMAPercent: result.metabolism.DMA_percent,
        } : undefined,
        timestamp: new Date().toISOString(),
      }

      // 调用 API 生成 PDF
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          predictionData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate report')
      }

      const data = await response.json()

      // 将 base64 转换为 Blob 并下载
      const pdfBlob = base64ToBlob(data.pdfBase64, 'application/pdf')
      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.filename || `${data.reportNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Download error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005EB8] to-[#0073D1] p-6 text-white">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">{t('title')}</h3>
              <p className="text-sm text-white/80">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* 语言选择 */}
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-3">
              {t('languageLabel')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('zh')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  language === 'zh'
                    ? 'border-[#005EB8] bg-[#F0F7FF] text-[#005EB8]'
                    : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                }`}
              >
                <div className="font-semibold">中文</div>
                <div className="text-xs text-[#757575]">Chinese</div>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  language === 'en'
                    ? 'border-[#005EB8] bg-[#F0F7FF] text-[#005EB8]'
                    : 'border-[#E0E0E0] hover:border-[#BDBDBD]'
                }`}
              >
                <div className="font-semibold">English</div>
                <div className="text-xs text-[#757575]">英文</div>
              </button>
            </div>
          </div>

          {/* 报告内容预览 */}
          <div className="bg-[#F5F5F5] rounded-lg p-4">
            <p className="text-sm text-[#757575] mb-2">{t('contentLabel')}</p>
            <ul className="text-sm text-[#212121] space-y-1">
              <li>• {t('content.cover')}</li>
              <li>• {t('content.inputData')}</li>
              <li>• {t('content.riskResult')}</li>
              <li>• {t('content.metabolism')}</li>
              <li>• {t('content.shap')}</li>
              <li>• {t('content.recommendations')}</li>
              <li>• {t('content.references')}</li>
            </ul>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div className="text-sm text-green-700">{t('success')}</div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1 px-4 py-3 border border-[#E0E0E0] rounded-lg text-[#757575] hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating || success}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#005EB8] to-[#0073D1] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('generating')}
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {t('completed')}
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  {t('download')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 将 base64 字符串转换为 Blob
 */
function base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: contentType })
}
