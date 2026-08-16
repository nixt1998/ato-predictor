import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化数字（保留小数位）
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals)
}

/**
 * 格式化百分比
 */
export function formatPercentage(num: number, decimals: number = 1): string {
  return `${(num * 100).toFixed(decimals)}%`
}

/**
 * 延迟函数（用于模拟异步操作）
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 判断风险等级
 */
export function getRiskLevel(probability: number): 'low' | 'medium' | 'high' {
  if (probability < 0.2) return 'low'
  if (probability < 0.5) return 'medium'
  return 'high'
}

/**
 * 获取风险等级颜色
 */
export function getRiskColor(level: 'low' | 'medium' | 'high'): string {
  const colors = {
    low: '#007F3B',
    medium: '#ED8B00',
    high: '#DA291C'
  }
  return colors[level]
}

/**
 * 获取风险等级文本（中文）
 */
export function getRiskLevelText(level: 'low' | 'medium' | 'high', locale: 'zh' | 'en'): string {
  const texts = {
    zh: {
      low: '低风险',
      medium: '中风险',
      high: '高风险'
    },
    en: {
      low: 'Low Risk',
      medium: 'Medium Risk',
      high: 'High Risk'
    }
  }
  return texts[locale][level]
}
