'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Save, CheckCircle2, AlertTriangle, Shield, Info } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import {
  buildRecord,
  generateReportNumber,
  generateDefaultNickname,
  saveRecordWithLimitCheck,
  confirmSaveWithDelete,
} from '@/lib/history-storage'
import { formatTimestamp } from '@/lib/history-format'
import { SavedPrediction, NICKNAME_MAX_LENGTH } from '@/types/history'

interface SaveRecordDialogProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: (record: SavedPrediction) => void
}

// 对话框内部视图状态
type DialogView = 'form' | 'limit-warning' | 'success'

export default function SaveRecordDialog({ isOpen, onClose, onSaved }: SaveRecordDialogProps) {
  const t = useTranslations('saveRecord')
  const { input, result } = useAppStore()

  const [nickname, setNickname] = useState('')
  const [reportNumber, setReportNumber] = useState('')
  const [predictTime, setPredictTime] = useState('')
  const [view, setView] = useState<DialogView>('form')
  const [recordsToDelete, setRecordsToDelete] = useState<SavedPrediction[]>([])
  const [pendingRecord, setPendingRecord] = useState<SavedPrediction | null>(null)

  // 打开时生成编号和时间，并重置状态
  useEffect(() => {
    if (isOpen) {
      setReportNumber(generateReportNumber())
      setPredictTime(new Date().toISOString())
      setNickname('')
      setView('form')
      setRecordsToDelete([])
      setPendingRecord(null)
    }
  }, [isOpen])

  if (!isOpen) return null
  if (!input || !result) return null

  // 默认名称（用于占位提示）
  const defaultName = generateDefaultNickname()

  // 点击确认保存
  const handleSave = () => {
    const record = buildRecord(input, result, nickname, reportNumber)
    const checkResult = saveRecordWithLimitCheck(record)

    if (checkResult.needsConfirmation) {
      // 超过200条上限，切换到警告视图
      setRecordsToDelete(checkResult.recordsToDelete || [])
      setPendingRecord(record)
      setView('limit-warning')
      return
    }

    // 保存成功
    handleSaveSuccess(record)
  }

  // 用户确认删除旧记录并保存
  const handleConfirmDelete = () => {
    if (!pendingRecord) return
    confirmSaveWithDelete(pendingRecord)
    handleSaveSuccess(pendingRecord)
  }

  // 保存成功处理
  const handleSaveSuccess = (record: SavedPrediction) => {
    setView('success')
    onSaved?.(record)
    // 1.5秒后自动关闭
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005EB8] to-[#0073D1] p-5 text-white flex items-center gap-3 flex-shrink-0">
          <Save className="w-7 h-7" />
          <h3 className="text-xl font-bold">{t('title')}</h3>
        </div>

        {/* 表单视图 */}
        {view === 'form' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            {/* 编号和时间 */}
            <div className="text-sm text-[#757575] space-y-1">
              <p>
                <span className="font-medium text-[#212121]">{t('reportNumber')}：</span>
                {reportNumber}
              </p>
              <p>
                <span className="font-medium text-[#212121]">{t('predictTime')}：</span>
                {formatTimestamp(predictTime)}
              </p>
            </div>

            {/* 名称输入 */}
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">
                {t('nicknameLabel')}
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t('nicknamePlaceholder')}
                maxLength={NICKNAME_MAX_LENGTH}
                className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#005EB8] focus:ring-1 focus:ring-[#005EB8]"
              />
              <p className="text-xs text-[#757575] mt-1">
                💡 {t('nicknameHint')}：{defaultName}
              </p>
            </div>

            {/* 隐私提醒（黄色背景） */}
            <div className="bg-[#FFF9E6] border border-[#ED8B00] rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ED8B00] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#212121] space-y-1">
                  <p className="font-semibold text-[#ED8B00]">{t('privacyWarning')}</p>
                  <p>• {t('privacyNote1')}</p>
                  <p>• {t('privacyNote2')}</p>
                </div>
              </div>
            </div>

            {/* 数据保护说明（灰色小字） */}
            <div className="bg-[#F5F5F5] rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#757575] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#757575] space-y-1">
                  <p className="font-semibold text-[#212121]">{t('dataProtection')}</p>
                  <p>• {t('dataNote1')}</p>
                  <p>• {t('dataNote2')}</p>
                  <p>• {t('dataNote3')}</p>
                  <p>• {t('dataNote4')}</p>
                </div>
              </div>
            </div>

            {/* 查看提示 */}
            <div className="flex items-center gap-2 text-sm text-[#005EB8]">
              <Info className="w-4 h-4 flex-shrink-0" />
              <p>{t('viewHint')}</p>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[#E0E0E0] rounded-lg text-[#757575] hover:bg-[#F5F5F5] transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#005EB8] to-[#0073D1] text-white rounded-lg hover:shadow-lg transition-all"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        )}

        {/* 200条上限警告视图 */}
        {view === 'limit-warning' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center gap-2 text-[#ED8B00]">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-lg font-bold">{t('limitTitle')}</h4>
            </div>

            <p className="text-sm text-[#212121]">
              {t('limitMessage', { count: recordsToDelete.length })}
            </p>

            {/* 待删除记录列表 */}
            <div className="bg-[#F5F5F5] rounded-lg p-3 max-h-40 overflow-y-auto">
              <ul className="text-sm text-[#212121] space-y-2">
                {recordsToDelete.map((r) => (
                  <li key={r.id}>
                    • {r.nickname} <span className="text-[#757575]">({r.reportNumber})</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 提示 */}
            <div className="bg-[#F0F7FF] rounded-lg p-3 text-xs text-[#757575] space-y-1">
              <p>💡 {t('limitTip1')}</p>
              <p>💡 {t('limitTip2')}</p>
              <p>💡 {t('limitTip3')}</p>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[#E0E0E0] rounded-lg text-[#757575] hover:bg-[#F5F5F5] transition-colors"
              >
                {t('limitCancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 bg-[#DA291C] text-white rounded-lg hover:bg-[#B02116] transition-colors"
              >
                {t('limitConfirm')}
              </button>
            </div>
          </div>
        )}

        {/* 成功视图 */}
        {view === 'success' && (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-green-600">{t('saved')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
