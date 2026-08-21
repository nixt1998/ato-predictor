'use client'

import { useTranslations } from 'next-intl'
import { Filter, RotateCcw } from 'lucide-react'
import { FilterOptions, RiskLevel, DatePreset } from '@/types/history'

interface FilterPanelProps {
  filters: FilterOptions
  onChange: (filters: FilterOptions) => void
}

/**
 * 筛选面板
 * 支持：风险等级（多选）、日期范围（单选+自定义）、概率区间（单选）
 */
export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const t = useTranslations('history.filter')

  // 切换风险等级（多选）
  const toggleRiskLevel = (level: RiskLevel) => {
    const newLevels = filters.riskLevels.includes(level)
      ? filters.riskLevels.filter((l) => l !== level)
      : [...filters.riskLevels, level]
    onChange({ ...filters, riskLevels: newLevels })
  }

  // 设置日期预设
  const setDatePreset = (preset?: DatePreset) => {
    onChange({
      ...filters,
      dateRange: { preset, start: undefined, end: undefined },
    })
  }

  // 设置自定义日期范围
  const setCustomDateRange = (start?: string, end?: string) => {
    onChange({
      ...filters,
      dateRange: { preset: undefined, start, end },
    })
  }

  // 设置概率区间
  const setProbRange = (min: number, max: number) => {
    onChange({ ...filters, probabilityRange: { min, max } })
  }

  // 重置所有筛选
  const resetFilters = () => {
    onChange({
      riskLevels: [],
      dateRange: {},
      probabilityRange: { min: 0, max: 100 },
    })
  }

  // 判断是否有激活的筛选
  const hasActiveFilters =
    filters.riskLevels.length > 0 ||
    filters.dateRange.preset ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.probabilityRange.min > 0 ||
    filters.probabilityRange.max < 100

  return (
    <div className="bg-white rounded-xl border border-[#E0E0E0] p-4 shadow-sm">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#005EB8]" />
          <h3 className="font-semibold text-[#212121]">{t('title')}</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-[#757575] hover:text-[#005EB8] flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            {t('reset')}
          </button>
        )}
      </div>

      {/* 风险等级（多选） */}
      <div className="mb-4">
        <p className="text-sm font-medium text-[#212121] mb-2">{t('riskLevel')}</p>
        <div className="space-y-1.5">
          {(['low', 'medium', 'high'] as RiskLevel[]).map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.riskLevels.includes(level)}
                onChange={() => toggleRiskLevel(level)}
                className="w-4 h-4 text-[#005EB8] rounded focus:ring-[#005EB8]"
              />
              <span className="text-sm text-[#212121]">
                {level === 'low' && '🟢 '}
                {level === 'medium' && '🟡 '}
                {level === 'high' && '🔴 '}
                {t(`../quickFilters.${level}`)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 日期范围 */}
      <div className="mb-4">
        <p className="text-sm font-medium text-[#212121] mb-2">{t('dateRange')}</p>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!filters.dateRange.preset && !filters.dateRange.start}
              onChange={() => setDatePreset(undefined)}
              className="w-4 h-4 text-[#005EB8]"
            />
            <span className="text-sm text-[#212121]">{t('all')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={filters.dateRange.preset === 'today'}
              onChange={() => setDatePreset('today')}
              className="w-4 h-4 text-[#005EB8]"
            />
            <span className="text-sm text-[#212121]">{t('today')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={filters.dateRange.preset === '7days'}
              onChange={() => setDatePreset('7days')}
              className="w-4 h-4 text-[#005EB8]"
            />
            <span className="text-sm text-[#212121]">{t('last7Days')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={filters.dateRange.preset === '30days'}
              onChange={() => setDatePreset('30days')}
              className="w-4 h-4 text-[#005EB8]"
            />
            <span className="text-sm text-[#212121]">{t('last30Days')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!!filters.dateRange.start || !!filters.dateRange.end}
              onChange={() => {}}
              className="w-4 h-4 text-[#005EB8]"
            />
            <span className="text-sm text-[#212121]">{t('custom')}</span>
          </label>

          {/* 自定义日期输入 */}
          {(filters.dateRange.start || filters.dateRange.end || (!filters.dateRange.preset && filters.dateRange.start === undefined && filters.dateRange.end === undefined)) && (
            <div className="ml-6 space-y-2 pt-1">
              <input
                type="date"
                value={filters.dateRange.start || ''}
                onChange={(e) => setCustomDateRange(e.target.value, filters.dateRange.end)}
                className="w-full text-xs px-2 py-1 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#005EB8]"
              />
              <p className="text-xs text-[#757575] text-center">{t('to')}</p>
              <input
                type="date"
                value={filters.dateRange.end || ''}
                onChange={(e) => setCustomDateRange(filters.dateRange.start, e.target.value)}
                className="w-full text-xs px-2 py-1 border border-[#E0E0E0] rounded focus:outline-none focus:border-[#005EB8]"
              />
            </div>
          )}
        </div>
      </div>

      {/* 概率区间 */}
      <div>
        <p className="text-sm font-medium text-[#212121] mb-2">{t('probRange')}</p>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={filters.probabilityRange.min === 0 && filters.probabilityRange.max === 100}
              onChange={() => setProbRange(0, 100)}
              className="w-4 h-4 text-[#005EB8]"
            />
            <span className="text-sm text-[#212121]">{t('all')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={filters.probabilityRange.min === 0 && filters.probabilityRange.max === 20}
              onChange={() => setProbRange(0, 20)}
              className="w-4 h-4 text-[#005EB8]"
            />
            <span className="text-sm text-[#212121]">{t('prob0')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={filters.probabilityRange.min === 20 && filters.probabilityRange.max === 40}
              onChange={() => setProbRange(20, 40)}
              className="w-4 h-4 text-[#005EB8]"
            />
            <span className="text-sm text-[#212121]">{t('prob20')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={filters.probabilityRange.min === 40 && filters.probabilityRange.max === 60}
              onChange={() => setProbRange(40, 60)}
              className="w-4 h-4 text-[#005EB8]"
            />
            <span className="text-sm text-[#212121]">{t('prob40')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={filters.probabilityRange.min === 60 && filters.probabilityRange.max === 100}
              onChange={() => setProbRange(60, 100)}
              className="w-4 h-4 text-[#005EB8]"
            />
            <span className="text-sm text-[#212121]">{t('prob60')}</span>
          </label>
        </div>
      </div>
    </div>
  )
}
