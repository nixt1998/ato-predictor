'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAppStore } from '@/lib/store'
import { getRiskLevel, getRiskColor, getRiskLevelText, formatPercentage } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'

export default function PredictionResult() {
  const t = useTranslations('predict.result')
  const { result, locale } = useAppStore()

  if (!result) return null

  const { prediction, metabolism } = result
  const riskLevel = prediction.risk_level
  const riskColor = getRiskColor(riskLevel)

  // 风险等级图标
  const RiskIcon =
    riskLevel === 'low' ? CheckCircle2 :
    riskLevel === 'medium' ? AlertCircle :
    AlertTriangle

  return (
    <div className="space-y-6">
      {/* 风险等级卡片 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-2" style={{ borderColor: riskColor }}>
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              {/* 图标 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${riskColor}15` }}
                >
                  <RiskIcon className="w-12 h-12" style={{ color: riskColor }} />
                </div>
              </motion.div>

              {/* 风险等级文本 */}
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: riskColor }}>
                  {getRiskLevelText(riskLevel, locale as 'zh' | 'en')}
                </h2>
                <p className="text-[#757575]">
                  {t('riskProbability')}: <span className="font-semibold text-[#212121]">
                    {formatPercentage(prediction.probability)}
                  </span>
                </p>
              </div>

              {/* 预测结果 */}
              <div className="pt-4 border-t border-[#E0E0E0]">
                <p className="text-sm text-[#757575] mb-2">{t('prediction')}</p>
                <p className="text-xl font-semibold text-[#212121]">
                  {prediction.class === 'Yes' ? t('cardiotoxicityDetected') : t('noCardiotoxicityDetected')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 砷代谢参数 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('metabolismTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* 总砷 */}
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p className="text-sm text-[#757575] mb-1">{t('tAs')}</p>
                <p className="text-2xl font-bold text-[#212121]">
                  {metabolism.tAs.toFixed(2)}
                  <span className="text-sm font-normal text-[#757575] ml-1">ng/mL</span>
                </p>
              </div>

              {/* PMI */}
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p className="text-sm text-[#757575] mb-1">{t('PMI')}</p>
                <p className="text-2xl font-bold text-[#212121]">
                  {metabolism.PMI.toFixed(3)}
                </p>
              </div>

              {/* SMI */}
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p className="text-sm text-[#757575] mb-1">{t('SMI')}</p>
                <p className="text-2xl font-bold text-[#212121]">
                  {metabolism.SMI.toFixed(3)}
                </p>
              </div>

              {/* 百分比 */}
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p className="text-sm text-[#757575] mb-1">{t('iAsPct')}</p>
                <p className="text-2xl font-bold text-[#212121]">
                  {metabolism.iAs_pct.toFixed(1)}%
                </p>
              </div>

              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p className="text-sm text-[#757575] mb-1">{t('MMAPct')}</p>
                <p className="text-2xl font-bold text-[#212121]">
                  {metabolism.MMA_pct.toFixed(1)}%
                </p>
              </div>

              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p className="text-sm text-[#757575] mb-1">{t('DMAPct')}</p>
                <p className="text-2xl font-bold text-[#212121]">
                  {metabolism.DMA_pct.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 主要风险因素 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('majorRiskFactor')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-[#F0F7FF] to-[#E3F2FD] rounded-lg p-6">
              <p className="text-lg font-semibold text-[#005EB8]">
                {t(`riskFactor.${result.major_risk_factor}`)}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
