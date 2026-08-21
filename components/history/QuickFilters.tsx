'use client'

import { useTranslations } from 'next-intl'
import { FilterOptions } from '@/types/history'

interface QuickFiltersProps {
  filters: FilterOptions
  onChange: (filters: FilterOptions) => void
}

type QuickFilterKey = 'high' | 'medium' | 'low' | 'pinned' | 'today' | 'thisWeek'

/**
 * 快速筛选标签栏
 * 单击切换对应筛选条件
 */
export default function QuickFilters({ filters, onChange }: QuickFiltersProps) {
  const t = useTranslations('history')

  const quickFilters: Array<{
    key: QuickFilterKey
    label: string
    emoji: string
    color: string
    hoverColor: string
  }> = [
    { key: 'high', label: t('quickFilters.high'), emoji: '🔴', color: 'bg-red-100 text-red-600', hoverColor: 'hover:bg-red-200' },
    { key: 'medium', label: t('quickFilters.medium'), emoji: '🟡', color: 'bg-yellow-100 text-yellow-600', hoverColor: 'hover:bg-yellow-200' },
    { key: 'low', label: t('quickFilters.low'), emoji: '🟢', color: 'bg-green-100 text-green-600', hoverColor: 'hover:bg-green-200' },
    { key: 'pinned', label: t('quickFilters.pinned'), emoji: '📌', color: 'bg-blue-100 text-[#005EB8]', hoverColor: 'hover:bg-blue-200' },
    { key: 'today', label: t('quickFilters.today'), emoji: '📅', color: 'bg-purple-100 text-purple-600', hoverColor: 'hover:bg-purple-200' },
    { key: 'thisWeek', label: t('quickFilters.thisWeek'), emoji: '🗓️', color: 'bg-indigo-100 text-indigo-600', hoverColor: 'hover:bg-indigo-200' },
  ]

  // 判断某个快速筛选是否激活
  const isActive = (key: QuickFilterKey): boolean => {
    if (key === 'high') return filters.riskLevels.includes('high')
    if (key === 'medium') return filters.riskLevels.includes('medium')
    if (key === 'low') return filters.riskLevels.includes('low')
    if (key === 'pinned') return !!filters.pinnedOnly
    if (key === 'today') return filters.dateRange.preset === 'today'
    if (key === 'thisWeek') return filters.dateRange.preset === '7days'
    return false
  }

  // 切换快速筛选
  const toggleQuickFilter = (key: QuickFilterKey) => {
    if (key === 'high' || key === 'medium' || key === 'low') {
      // 切换风险等级
      const newLevels = filters.riskLevels.includes(key)
        ? filters.riskLevels.filter((l) => l !== key)
        : [...filters.riskLevels, key]
      onChange({ ...filters, riskLevels: newLevels })
    } else if (key === 'pinned') {
      // 切换置顶
      onChange({ ...filters, pinnedOnly: !filters.pinnedOnly })
    } else if (key === 'today') {
      // 切换今天
      const newPreset = filters.dateRange.preset === 'today' ? undefined : 'today'
      onChange({ ...filters, dateRange: { preset: newPreset } })
    } else if (key === 'thisWeek') {
      // 切换本周
      const newPreset = filters.dateRange.preset === '7days' ? undefined : '7days'
      onChange({ ...filters, dateRange: { preset: newPreset } })
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {quickFilters.map(({ key, label, emoji, color, hoverColor }) => {
        const active = isActive(key)
        return (
          <button
            key={key}
            onClick={() => toggleQuickFilter(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              active
                ? `${color} ring-2 ring-offset-1 ring-current`
                : `bg-[#F5F5F5] text-[#757575] ${hoverColor}`
            }`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
