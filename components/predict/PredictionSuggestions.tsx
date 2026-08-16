'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { Download, Printer, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { getRiskLevel } from '@/lib/utils'

export default function PredictionSuggestions() {
  const t = useTranslations('predict.suggestions')
  const { result } = useAppStore()

  if (!result) return null

  const { suggestions, prediction } = result
  const riskLevel = prediction.risk_level

  // 根据风险等级选择图标
  const RiskIcon =
    riskLevel === 'high' ? AlertCircle :
    riskLevel === 'medium' ? Info :
    CheckCircle

  const handleDownloadPDF = () => {
    // TODO: 实现 PDF 下载功能
    console.log('Download PDF')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* 建议列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiskIcon className="w-6 h-6 text-[#005EB8]" />
              {t('clinicalSuggestions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gradient-to-r from-[#F0F7FF] to-white rounded-lg p-4 border-l-4 border-[#005EB8]"
                >
                  {/* 风险因素 */}
                  <div className="mb-2">
                    <span className="inline-block bg-[#005EB8] text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {suggestion.risk_factor}
                    </span>
                  </div>

                  {/* 建议内容 */}
                  <p className="text-[#212121] leading-relaxed">
                    {suggestion.suggestion}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 免责声明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="bg-[#FFF9E6] border-[#ED8B00]">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#ED8B00] flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-[#757575]">
                <p className="font-semibold text-[#ED8B00]">
                  {t('disclaimer.title')}
                </p>
                <p>
                  {t('disclaimer.content')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 操作按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleDownloadPDF}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                <Download className="w-5 h-5 mr-2" />
                {t('downloadReport')}
              </Button>

              <Button
                onClick={handlePrint}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                <Printer className="w-5 h-5 mr-2" />
                {t('printReport')}
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
              <p className="text-sm text-[#757575] text-center">
                {t('reportInfo')}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
