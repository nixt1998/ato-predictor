'use client'

import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationNavProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * 生成要显示的页码数组
 * 页数多时用 -1 表示省略号
 * 例: [1, -1, 4, 5, 6, -1, 10]
 */
function getPageNumbers(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: number[] = [1]

  if (current > 3) pages.push(-1) // 左省略号

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push(-1) // 右省略号

  pages.push(total)
  return pages
}

/**
 * 分页导航
 */
export default function PaginationNav({ currentPage, totalPages, onPageChange }: PaginationNavProps) {
  const t = useTranslations('history.pagination')

  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {/* 上一页 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm text-[#212121] rounded-lg hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('prev')}
      </button>

      {/* 页码 */}
      {pageNumbers.map((page, index) =>
        page === -1 ? (
          <span key={`ellipsis-${index}`} className="px-2 text-[#757575]">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[36px] h-9 px-2 text-sm rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-[#005EB8] text-white font-semibold'
                : 'text-[#212121] hover:bg-[#F5F5F5]'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* 下一页 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm text-[#212121] rounded-lg hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {t('next')}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
