'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * 搜索框组件
 * 支持实时搜索（300ms防抖）
 */
export default function SearchBox({ value, onChange, placeholder }: SearchBoxProps) {
  const t = useTranslations('history')
  const [localValue, setLocalValue] = useState(value)

  // 防抖：300ms后触发实际搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [localValue, onChange])

  // 清空搜索
  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder || t('searchPlaceholder')}
        className="w-full pl-10 pr-10 py-2.5 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#005EB8] focus:ring-1 focus:ring-[#005EB8] text-sm"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757575] hover:text-[#212121]"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
