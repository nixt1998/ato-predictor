'use client'

import { useTranslations } from 'next-intl'
import { Trash2, CheckSquare } from 'lucide-react'

interface BatchActionsProps {
  totalCount: number
  selectedCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  onDeleteSelected: () => void
}

/**
 * 批量操作工具栏
 * 显示：全选按钮、已选数量、批量删除按钮
 */
export default function BatchActions({
  totalCount,
  selectedCount,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
}: BatchActionsProps) {
  const t = useTranslations('history.batch')

  if (totalCount === 0) return null

  return (
    <div className="flex items-center gap-3 p-3 bg-[#F0F7FF] rounded-lg border border-[#005EB8]/20">
      {/* 全选按钮 */}
      <button
        onClick={onSelectAll}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#005EB8] bg-white border border-[#005EB8] rounded-lg hover:bg-[#E0F0FF] transition-colors"
      >
        <CheckSquare className="w-4 h-4" />
        {t('selectAll')}
      </button>

      {/* 清空全选按钮（仅选中时显示） */}
      {selectedCount > 0 && (
        <button
          onClick={onClearSelection}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#757575] bg-white border border-[#E0E0E0] rounded-lg hover:bg-[#F5F5F5] transition-colors"
        >
          {t('clearSelection')}
        </button>
      )}

      {/* 已选数量 */}
      <span className="text-sm text-[#212121]">
        {t('selected', { count: selectedCount })}
      </span>

      {/* 批量删除按钮（仅选中时显示） */}
      {selectedCount > 0 && (
        <button
          onClick={onDeleteSelected}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#DA291C] rounded-lg hover:bg-[#B02116] transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {t('deleteSelected')}
        </button>
      )}
    </div>
  )
}
