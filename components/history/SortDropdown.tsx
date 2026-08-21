'use client'

import { useTranslations } from 'next-intl'
import { ArrowUpDown } from 'lucide-react'
import { SortOption } from '@/types/history'

interface SortDropdownProps {
  sortBy: SortOption
  onChange: (sortBy: SortOption) => void
}

const sortOptions: SortOption[] = [
  'date-newest',
  'date-oldest',
  'risk-desc',
  'risk-asc',
  'prob-desc',
  'prob-asc',
]

/**
 * 排序下拉选择器
 */
export default function SortDropdown({ sortBy, onChange }: SortDropdownProps) {
  const t = useTranslations('history.sort')

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="w-4 h-4 text-[#757575]" />
      <select
        value={sortBy}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="px-3 py-2 text-sm border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#005EB8] focus:ring-1 focus:ring-[#005EB8] bg-white cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option key={option} value={option}>
            {t(option.replace(/-/g, '_') as any)}
          </option>
        ))}
      </select>
    </div>
  )
}
