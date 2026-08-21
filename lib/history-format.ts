/**
 * 历史记录 UI 格式化与颜色工具
 * 风险等级颜色需与预测页面保持一致
 */

import { RiskLevel } from '@/types/history'

/**
 * 风险等级颜色映射（与预测页面一致）
 */
export const RISK_COLORS: Record<RiskLevel, { text: string; bg: string; border: string; hex: string }> = {
  low: {
    text: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-500',
    hex: '#10B981',
  },
  medium: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-100',
    border: 'border-yellow-500',
    hex: '#F59E0B',
  },
  high: {
    text: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-500',
    hex: '#EF4444',
  },
}

/**
 * 获取风险等级的本地化文本
 */
export function getRiskLabel(level: RiskLevel, locale: string): string {
  const isZh = locale !== 'en'
  const zh: Record<RiskLevel, string> = {
    low: '低风险',
    medium: '中等风险',
    high: '高风险',
  }
  const en: Record<RiskLevel, string> = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  }
  return isZh ? zh[level] : en[level]
}

/**
 * 格式化时间戳为可读字符串
 * 输出: YYYY-MM-DD HH:mm:ss
 */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
}

/**
 * 格式化概率为百分比字符串
 * 输入: 0.2585 → 输出: "25.85%"
 */
export function formatProbability(prob: number): string {
  return `${(prob * 100).toFixed(2)}%`
}
