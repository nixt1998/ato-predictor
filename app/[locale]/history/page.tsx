'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { History, Pin, FileText, AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import {
  getStorageData,
  deleteRecord,
  deleteRecords,
  togglePin,
  renameRecord,
  searchRecords,
  filterRecords,
  sortPinnedRecords,
  sortNormalRecords,
  paginateRecords,
} from '@/lib/history-storage'
import { SavedPrediction, StorageData, FilterOptions, SortOption } from '@/types/history'
import RecordCard from '@/components/history/RecordCard'
import PaginationNav from '@/components/history/PaginationNav'
import SearchBox from '@/components/history/SearchBox'
import QuickFilters from '@/components/history/QuickFilters'
import FilterPanel from '@/components/history/FilterPanel'
import SortDropdown from '@/components/history/SortDropdown'
import BatchActions from '@/components/history/BatchActions'
import StatisticsPanel from '@/components/history/StatisticsPanel'
import ExportButton from '@/components/history/ExportButton'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DownloadPDFDialog from '@/components/history/DownloadPDFDialog'

/**
 * 将 base64 转换为 Blob（用于 PDF 下载）
 */
function base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: contentType })
}

export default function HistoryPage() {
  const t = useTranslations('history')
  const locale = useLocale()
  const router = useRouter()
  const { loadPrediction } = useAppStore()

  // 原始存储数据
  const [storage, setStorage] = useState<StorageData>({
    version: '1.0.0',
    pinned: [],
    normal: [],
    lastModified: '',
  })

  // 搜索、筛选、排序
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    riskLevels: [],
    dateRange: {},
    probabilityRange: { min: 0, max: 100 },
  })
  const [sortBy, setSortBy] = useState<SortOption>('default')

  // 分页
  const [currentPage, setCurrentPage] = useState(1)

  // 批量选择
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // UI状态
  const [mounted, setMounted] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [pdfDownloadRecord, setPdfDownloadRecord] = useState<SavedPrediction | null>(null)

  // 删除确认
  const [deleteTarget, setDeleteTarget] = useState<SavedPrediction | null>(null)
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false)
  const [clearAllConfirm, setClearAllConfirm] = useState(false)

  // 从 LocalStorage 加载数据
  const reload = useCallback(() => {
    setStorage(getStorageData())
    setSelectedIds(new Set()) // 重新加载后清空选择
  }, [])

  useEffect(() => {
    setMounted(true)
    reload()
  }, [reload])

  // 数据处理流水线：搜索 → 筛选 → 排序 → 分页
  const processedData = useMemo(() => {
    // 1. 搜索（作用于置顶+普通）
    const allRecords = [...storage.pinned, ...storage.normal]
    const searchedAll = searchRecords(searchQuery, allRecords)
    const searchedPinned = searchedAll.filter((r) => r.isPinned)
    const searchedNormal = searchedAll.filter((r) => !r.isPinned)

    // 2. 筛选（作用于搜索结果）
    const filteredPinned = filterRecords(searchedPinned, filters)
    const filteredNormal = filterRecords(searchedNormal, filters)

    // 3. 排序
    const sortedPinned = sortPinnedRecords(filteredPinned)
    const sortedNormal = sortNormalRecords(filteredNormal, sortBy)

    // 4. 分页
    return paginateRecords(sortedPinned, sortedNormal, currentPage)
  }, [storage, searchQuery, filters, sortBy, currentPage])

  const { pinnedRecords, normalRecords, pagination } = processedData

  // 搜索/筛选/排序变化时回到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filters, sortBy])

  // ---- 操作处理 ----

  // 批量选择
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAllVisible = () => {
    const allVisibleIds = [...pinnedRecords, ...normalRecords].map((r) => r.id)
    setSelectedIds(new Set(allVisibleIds))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  // 批量删除
  const handleBatchDelete = () => {
    deleteRecords(Array.from(selectedIds))
    setSelectedIds(new Set())
    setBatchDeleteConfirm(false)
    reload()
  }

  // 清空全部记录
  const handleClearAll = () => {
    localStorage.removeItem('ato-prediction-history')
    setClearAllConfirm(false)
    reload()
  }

  // 查看详情：加载数据到 store 并跳转预测页
  const handleViewDetail = (record: SavedPrediction) => {
    loadPrediction(record.input, record.result)
    router.push(`/${locale}/predict`)
  }

  // 下载 PDF（打开语言选择对话框）
  const handleDownloadPDF = (record: SavedPrediction) => {
    setPdfDownloadRecord(record)
  }

  // 置顶/取消置顶
  const handleTogglePin = (id: string) => {
    togglePin(id)
    reload()
  }

  // 重命名
  const handleRename = (id: string, newName: string) => {
    renameRecord(id, newName)
    reload()
  }

  // 确认删除单条
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteRecord(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    }
  }

  // 避免 SSR/CSR 不一致：挂载前不渲染列表
  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-b from-[#F0F7FF] to-white py-12" />
  }

  const totalRecords = storage.pinned.length + storage.normal.length
  const isEmpty = totalRecords === 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F7FF] to-white py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        {/* 页面标题 */}
        <div className="flex items-center gap-3 mb-6">
          <History className="w-8 h-8 text-[#005EB8]" />
          <h1 className="text-3xl font-bold text-[#212121]">{t('title')}</h1>
        </div>

        {/* 搜索、筛选、排序区域（非空时显示） */}
        {!isEmpty && (
          <div className="space-y-4 mb-6">
            {/* 统计面板 */}
            <StatisticsPanel records={[...storage.pinned, ...storage.normal]} />

            {/* 第一行：搜索框 + 排序 + 导出 */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <SearchBox value={searchQuery} onChange={setSearchQuery} />
              </div>
              <SortDropdown sortBy={sortBy} onChange={setSortBy} />
              <ExportButton
                allRecords={[...storage.pinned, ...storage.normal]}
                selectedRecords={[...storage.pinned, ...storage.normal].filter((r) =>
                  selectedIds.has(r.id)
                )}
              />
            </div>

            {/* 第二行：快速筛选标签 */}
            <QuickFilters filters={filters} onChange={setFilters} />

            {/* 第三行：筛选面板（可折叠） */}
            <FilterPanel filters={filters} onChange={setFilters} />

            {/* 第四行：批量操作栏 */}
            <BatchActions
              totalCount={pinnedRecords.length + normalRecords.length}
              selectedCount={selectedIds.size}
              onSelectAll={selectAllVisible}
              onClearSelection={clearSelection}
              onDeleteSelected={() => setBatchDeleteConfirm(true)}
            />
          </div>
        )}

        {isEmpty ? (
          /* 空状态 */
          <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm py-16 text-center">
            <FileText className="w-16 h-16 text-[#BDBDBD] mx-auto mb-4" />
            <p className="text-[#757575] mb-2">{t('empty.title')}</p>
            <p className="text-sm text-[#BDBDBD]">{t('empty.hint')}</p>
          </div>
        ) : (
          <>
            {/* 分页信息 */}
            <div className="text-sm text-[#757575] mb-4">
              {t('pagination.info', {
                current: pagination.currentPage,
                total: pagination.totalPages,
              })}
              {' | '}
              {t('pagination.records', {
                normal: storage.normal.length,
                pinned: storage.pinned.length,
              })}
            </div>

            {/* 置顶记录区（仅第一页） */}
            {pinnedRecords.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Pin className="w-4 h-4 text-[#005EB8]" />
                  <h2 className="text-sm font-semibold text-[#212121]">
                    {t('pinnedSection', { count: pinnedRecords.length })}
                  </h2>
                </div>
                <div className="space-y-3">
                  {pinnedRecords.map((record) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      isSelected={selectedIds.has(record.id)}
                      isDownloading={downloadingId === record.id}
                      onToggleSelect={toggleSelect}
                      onViewDetail={handleViewDetail}
                      onDownloadPDF={handleDownloadPDF}
                      onDelete={setDeleteTarget}
                      onTogglePin={handleTogglePin}
                      onRename={handleRename}
                    />
                  ))}
                </div>

                {/* 分隔线 */}
                <div className="border-t-2 border-dashed border-[#E0E0E0] my-6" />
              </div>
            )}

            {/* 普通记录区 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#757575]" />
                <h2 className="text-sm font-semibold text-[#212121]">
                  {t('normalSection', {
                    start: (pagination.currentPage - 1) * pagination.pageSize + 1,
                    end: Math.min(
                      pagination.currentPage * pagination.pageSize,
                      pagination.totalRecords
                    ),
                    total: pagination.totalRecords,
                  })}
                </h2>
              </div>

              {normalRecords.length > 0 ? (
                <div className="space-y-3">
                  {normalRecords.map((record) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      isSelected={selectedIds.has(record.id)}
                      isDownloading={downloadingId === record.id}
                      onToggleSelect={toggleSelect}
                      onViewDetail={handleViewDetail}
                      onDownloadPDF={handleDownloadPDF}
                      onDelete={setDeleteTarget}
                      onTogglePin={handleTogglePin}
                      onRename={handleRename}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#BDBDBD] py-4">{t('noNormalRecords')}</p>
              )}
            </div>

            {/* 分页导航 */}
            <div className="mb-8">
              <PaginationNav
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}

        {/* 底部固定提示栏 */}
        <div className="bg-[#FFF9E6] border border-[#ED8B00] rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-[#ED8B00] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#757575] space-y-1">
              <p className="font-semibold text-[#ED8B00]">{t('warnings.title')}</p>
              <p>• {t('warnings.privacy')}</p>
              <p>• {t('warnings.dataLoss')}</p>
              <p>• {t('warnings.limit')}</p>
              <p>• {t('warnings.backup')}</p>
              <p>• {t('warnings.public')}</p>
            </div>
          </div>
        </div>

        {/* 清空全部按钮 */}
        {!isEmpty && (
          <div className="flex justify-center">
            <button
              onClick={() => setClearAllConfirm(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {t('clearAll.button')}
            </button>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={t('deleteConfirm.title')}
        message={
          deleteTarget
            ? `${t('deleteConfirm.message')}\n\n• ${deleteTarget.nickname}\n  ${deleteTarget.reportNumber}`
            : ''
        }
        variant="danger"
        confirmText={t('deleteConfirm.confirm')}
        cancelText={t('deleteConfirm.cancel')}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* 批量删除确认对话框 */}
      <ConfirmDialog
        isOpen={batchDeleteConfirm}
        title={t('batchDeleteConfirm.title')}
        message={t('batchDeleteConfirm.message', { count: selectedIds.size })}
        tip={t('batchDeleteConfirm.tip')}
        variant="danger"
        confirmText={t('batchDeleteConfirm.confirm')}
        cancelText={t('batchDeleteConfirm.cancel')}
        onConfirm={handleBatchDelete}
        onClose={() => setBatchDeleteConfirm(false)}
      />

      {/* 清空全部确认对话框 */}
      <ConfirmDialog
        isOpen={clearAllConfirm}
        title={t('clearAllConfirm.title')}
        message={t('clearAllConfirm.message')}
        tip={t('clearAllConfirm.tip')}
        variant="danger"
        confirmText={t('clearAllConfirm.confirm')}
        cancelText={t('clearAllConfirm.cancel')}
        onConfirm={handleClearAll}
        onClose={() => setClearAllConfirm(false)}
      />

      {/* PDF下载对话框 */}
      <DownloadPDFDialog
        isOpen={pdfDownloadRecord !== null}
        record={pdfDownloadRecord}
        onClose={() => setPdfDownloadRecord(null)}
      />
    </div>
  )
}
