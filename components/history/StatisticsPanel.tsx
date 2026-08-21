'use client'

import { useTranslations } from 'next-intl'
import { TrendingUp, AlertTriangle, Activity, Calendar } from 'lucide-react'
import { PredictionRecord } from '@/types/history'

interface StatisticsPanelProps {
  records: PredictionRecord[]
}

/**
 * 统计面板
 * 显示：总记录数、风险分布、平均概率、近7天趋势
 */
export default function StatisticsPanel({ records }: StatisticsPanelProps) {
  const t = useTranslations('history.statistics')

  // 统计数据
  const totalRecords = records.length
  const highRiskCount = records.filter((r) => r.result.prediction.risk_level === 'high').length
  const mediumRiskCount = records.filter((r) => r.result.prediction.risk_level === 'medium').length
  const lowRiskCount = records.filter((r) => r.result.prediction.risk_level === 'low').length

  // 平均概率
  const avgProbability =
    totalRecords > 0
      ? (records.reduce((sum, r) => sum + r.result.prediction.probability, 0) / totalRecords) * 100
      : 0

  // 近7天记录数
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentCount = records.filter((r) => new Date(r.timestamp) >= sevenDaysAgo).length

  if (totalRecords === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* 总记录数 */}
      <div className="bg-white rounded-lg border border-[#E0E0E0] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-[#005EB8]" />
          <p className="text-xs text-[#757575]">{t('totalRecords')}</p>
        </div>
        <p className="text-2xl font-bold text-[#212121]">{totalRecords}</p>
      </div>

      {/* 高风险 */}
      <div className="bg-white rounded-lg border border-[#E0E0E0] p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <p className="text-xs text-[#757575]">{t('highRisk')}</p>
        </div>
        <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
      </div>

      {/* 中风险 */}
      <div className="bg-white rounded-lg border border-[#E0E0E0] p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <p className="text-xs text-[#757575]">{t('mediumRisk')}</p>
        </div>
        <p className="text-2xl font-bold text-yellow-600">{mediumRiskCount}</p>
      </div>

      {/* 低风险 */}
      <div className="bg-white rounded-lg border border-[#E0E0E0] p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-green-600" />
          <p className="text-xs text-[#757575]">{t('lowRisk')}</p>
        </div>
        <p className="text-2xl font-bold text-green-600">{lowRiskCount}</p>
      </div>

      {/* 平均概率 */}
      <div className="bg-white rounded-lg border border-[#E0E0E0] p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-[#005EB8]" />
          <p className="text-xs text-[#757575]">{t('avgProbability')}</p>
        </div>
        <p className="text-2xl font-bold text-[#005EB8]">{avgProbability.toFixed(1)}%</p>
        <p className="text-xs text-[#BDBDBD] mt-1">
          <Calendar className="w-3 h-3 inline mr-1" />
          {t('recentDays', { count: recentCount })}
        </p>
      </div>
    </div>
  )
}
