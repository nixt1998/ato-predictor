'use client'

import { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message?: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onClose: () => void
  variant?: 'default' | 'danger'  // danger 用红色确认按钮
  tip?: string                    // 底部提示（浅蓝背景）
  children?: ReactNode            // 额外内容（如待删除记录列表）
}

/**
 * 通用确认对话框
 * 用于：新建预测、单条删除、批量删除、清空全部等需要二次确认的操作
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onClose,
  variant = 'default',
  tip,
  children,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 flex items-center gap-2 border-b border-[#E0E0E0] flex-shrink-0">
          <AlertTriangle
            className={`w-6 h-6 ${variant === 'danger' ? 'text-[#DA291C]' : 'text-[#ED8B00]'}`}
          />
          <h3 className="text-lg font-bold text-[#212121]">{title}</h3>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {message && <p className="text-sm text-[#212121] whitespace-pre-line">{message}</p>}

          {children}

          {tip && (
            <div className="bg-[#F0F7FF] rounded-lg p-3 text-xs text-[#757575]">💡 {tip}</div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#E0E0E0] rounded-lg text-[#757575] hover:bg-[#F5F5F5] transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors ${
                variant === 'danger'
                  ? 'bg-[#DA291C] hover:bg-[#B02116]'
                  : 'bg-gradient-to-r from-[#005EB8] to-[#0073D1] hover:shadow-lg'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
