'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  Pin,
  PinOff,
  Pencil,
  Check,
  X,
  Eye,
  Download,
  Trash2,
  Clock,
  Loader2,
} from 'lucide-react'
import { SavedPrediction, NICKNAME_MAX_LENGTH } from '@/types/history'
import { RISK_COLORS, getRiskLabel, formatTimestamp, formatProbability } from '@/lib/history-format'

interface RecordCardProps {
  record: SavedPrediction
  isSelected: boolean
  isDownloading?: boolean
  onToggleSelect: (id: string) => void
  onViewDetail: (record: SavedPrediction) => void
  onDownloadPDF: (record: SavedPrediction) => void
  onDelete: (record: SavedPrediction) => void
  onTogglePin: (id: string) => void
  onRename: (id: string, newName: string) => void
}

/**
 * 历史记录卡片
 * 显示单条预测记录的完整信息与操作按钮
 */
export default function RecordCard({
  record,
  isSelected,
  isDownloading = false,
  onToggleSelect,
  onViewDetail,
  onDownloadPDF,
  onDelete,
  onTogglePin,
  onRename,
}: RecordCardProps) {
  const t = useTranslations('history.card')
  const locale = useLocale()

  const [isRenaming, setIsRenaming] = useState(false)
  const [tempName, setTempName] = useState(record.nickname)

  const riskLevel = record.result.prediction.risk_level
  const riskColor = RISK_COLORS[riskLevel]
  const { input, result } = record

  // 保存重命名
  const handleRenameSave = () => {
    const trimmed = tempName.trim()
    if (trimmed && trimmed !== record.nickname) {
      onRename(record.id, trimmed)
    }
    setIsRenaming(false)
  }

  // 取消重命名
  const handleRenameCancel = () => {
    setTempName(record.nickname)
    setIsRenaming(false)
  }

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${
        isSelected ? 'border-[#005EB8] ring-1 ring-[#005EB8]' : 'border-[#E0E0E0]'
      }`}
    >
      {/* 顶部：选择框 + 置顶标记 + 名称 + 重命名 */}
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(record.id)}
          className="w-4 h-4 text-[#005EB8] rounded focus:ring-[#005EB8] cursor-pointer flex-shrink-0"
        />

        {record.isPinned && <Pin className="w-4 h-4 text-[#005EB8] flex-shrink-0" />}

        {isRenaming ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              maxLength={NICKNAME_MAX_LENGTH}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSave()
                if (e.key === 'Escape') handleRenameCancel()
              }}
              className="flex-1 px-2 py-1 text-sm border border-[#005EB8] rounded focus:outline-none"
            />
            <button
              onClick={handleRenameSave}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title={t('save')}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleRenameCancel}
              className="p-1 text-[#757575] hover:bg-[#F5F5F5] rounded"
              title={t('cancelRename')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <span className="font-semibold text-[#212121] truncate">{record.nickname}</span>
            <button
              onClick={() => {
                setTempName(record.nickname)
                setIsRenaming(true)
              }}
              className="p-1 text-[#757575] hover:text-[#005EB8] hover:bg-[#F0F7FF] rounded flex-shrink-0"
              title={t('rename')}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 编号 + 时间 */}
      <div className="text-xs text-[#757575] mb-3 space-y-0.5">
        <p>{record.reportNumber}</p>
        <p className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTimestamp(record.timestamp)}
        </p>
      </div>

      {/* 输入参数 */}
      <div className="text-sm text-[#212121] mb-2">
        <span className="text-[#757575]">{t('input')}：</span>
        iAs: {input.iAs} | MMA: {input.MMA} | DMA: {input.DMA} | CT_drug: {input.CT_drug}
      </div>

      {/* 预测结果 */}
      <div className="text-sm mb-3">
        <span className="text-[#757575]">{t('result')}：</span>
        <span className={`font-semibold ${riskColor.text}`}>
          {getRiskLabel(riskLevel, locale)} ({formatProbability(result.prediction.probability)})
        </span>
        <span className="text-[#757575] ml-2">
          tAs: {result.metabolism.tAs.toFixed(1)} ng/mL | SMI: {result.metabolism.SMI.toFixed(3)} |
          PMI: {result.metabolism.PMI.toFixed(3)}
        </span>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-[#F0F0F0]">
        <button
          onClick={() => onViewDetail(record)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#005EB8] bg-[#F0F7FF] rounded-lg hover:bg-[#E0F0FF] transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          {t('viewDetail')}
        </button>
        <button
          onClick={() => onDownloadPDF(record)}
          disabled={isDownloading}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#005EB8] bg-[#F0F7FF] rounded-lg hover:bg-[#E0F0FF] transition-colors disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {t('downloadPDF')}
        </button>
        <button
          onClick={() => onTogglePin(record.id)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#ED8B00] bg-[#FFF9E6] rounded-lg hover:bg-[#FFF0CC] transition-colors"
        >
          {record.isPinned ? (
            <>
              <PinOff className="w-3.5 h-3.5" />
              {t('unpin')}
            </>
          ) : (
            <>
              <Pin className="w-3.5 h-3.5" />
              {t('pin')}
            </>
          )}
        </button>
        <button
          onClick={() => onDelete(record)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#DA291C] bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t('delete')}
        </button>
      </div>
    </div>
  )
}
