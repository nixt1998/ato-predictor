/**
 * 历史记录存储层
 * 基于 LocalStorage 的预测记录本地持久化与查询
 *
 * 设计要点：
 * - 数据仅保存在浏览器本地，不上传服务器
 * - 置顶记录（pinned）无上限，普通记录（normal）最多200条
 * - 所有函数均为纯客户端操作，需在浏览器环境调用
 */

import {
  SavedPrediction,
  StorageData,
  FilterOptions,
  SortOption,
  PaginationState,
  SaveCheckResult,
  RiskLevel,
  STORAGE_VERSION,
  NORMAL_RECORDS_LIMIT,
  PAGE_SIZE,
} from '@/types/history'
import { PredictionInput, PredictionResult } from '@/types/prediction'

const STORAGE_KEY = 'ato-predictions'

// ============================================================
// 基础存储读写
// ============================================================

/**
 * 创建空的存储数据结构
 */
function createEmptyStorage(): StorageData {
  return {
    version: STORAGE_VERSION,
    pinned: [],
    normal: [],
    lastModified: new Date().toISOString(),
  }
}

/**
 * 获取存储数据（容错：解析失败返回空结构）
 */
export function getStorageData(): StorageData {
  if (typeof window === 'undefined') return createEmptyStorage()

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return createEmptyStorage()

    const parsed = JSON.parse(data) as StorageData
    // 基本结构校验，防止旧数据或损坏数据导致崩溃
    if (!Array.isArray(parsed.pinned) || !Array.isArray(parsed.normal)) {
      return createEmptyStorage()
    }
    return parsed
  } catch {
    return createEmptyStorage()
  }
}

/**
 * 保存存储数据
 * @returns 是否保存成功（LocalStorage 满时会失败）
 */
export function saveStorageData(data: StorageData): boolean {
  if (typeof window === 'undefined') return false

  try {
    data.lastModified = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('保存历史记录失败（存储空间可能不足）:', e)
    return false
  }
}

// ============================================================
// 编号与名称生成
// ============================================================

/**
 * 生成唯一的报告编号
 * 格式: ATO-YYYYMMDD-XXXXXX
 * 示例: ATO-20260820-483972
 */
export function generateReportNumber(): string {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 900000) + 100000 // 6位随机数 100000-999999
  return `ATO-${yyyy}${mm}${dd}-${random}`
}

/**
 * 生成默认记录名称
 * 格式: YYYY-MM-DD HH:mm 预测
 * 示例: 2026-08-20 14:30 预测
 */
export function generateDefaultNickname(): string {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min} 预测`
}

/**
 * 生成唯一 ID（时间戳 + 随机后缀，避免同一毫秒内冲突）
 */
function generateId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

// ============================================================
// 创建与保存记录
// ============================================================

/**
 * 从输入和结果构建一条待保存记录
 */
export function buildRecord(
  input: PredictionInput,
  result: PredictionResult,
  nickname?: string,
  reportNumber?: string
): SavedPrediction {
  return {
    id: generateId(),
    reportNumber: reportNumber || generateReportNumber(),
    nickname: nickname?.trim() || generateDefaultNickname(),
    timestamp: new Date().toISOString(),
    isPinned: false,
    input,
    result,
  }
}

/**
 * 保存记录（带200条上限检查）
 *
 * 逻辑：
 * - 普通记录未超限：直接保存
 * - 普通记录已达上限：返回 needsConfirmation=true 和待删除列表，等待用户确认
 */
export function saveRecordWithLimitCheck(record: SavedPrediction): SaveCheckResult {
  const data = getStorageData()

  // 普通记录：检查是否超过上限
  if (data.normal.length >= NORMAL_RECORDS_LIMIT) {
    // 需要删除的数量 = 当前数量 - 上限 + 1（为新记录腾出空间）
    const toDeleteCount = data.normal.length - NORMAL_RECORDS_LIMIT + 1
    // 最旧的 N 条（normal 数组头部为最新，尾部为最旧）
    const recordsToDelete = data.normal.slice(-toDeleteCount)

    return {
      success: false,
      needsConfirmation: true,
      recordsToDelete,
    }
  }

  // 未超限，直接保存到头部（最新在前）
  data.normal.unshift(record)
  saveStorageData(data)
  return { success: true, needsConfirmation: false, savedRecord: record }
}

/**
 * 用户确认后：删除最旧记录并保存新记录
 * @param record 待保存的新记录
 */
export function confirmSaveWithDelete(record: SavedPrediction): SaveCheckResult {
  const data = getStorageData()

  // 保留最新的 (上限-1) 条，为新记录腾出1个位置
  data.normal = data.normal.slice(0, NORMAL_RECORDS_LIMIT - 1)

  // 保存新记录到头部
  data.normal.unshift(record)
  saveStorageData(data)

  return { success: true, needsConfirmation: false, savedRecord: record }
}

// ============================================================
// 删除记录
// ============================================================

/**
 * 删除单条记录（同时在置顶和普通列表中查找）
 */
export function deleteRecord(recordId: string): void {
  const data = getStorageData()
  data.pinned = data.pinned.filter((r) => r.id !== recordId)
  data.normal = data.normal.filter((r) => r.id !== recordId)
  saveStorageData(data)
}

/**
 * 批量删除记录
 */
export function deleteRecords(recordIds: string[]): void {
  const data = getStorageData()
  const idSet = new Set(recordIds)
  data.pinned = data.pinned.filter((r) => !idSet.has(r.id))
  data.normal = data.normal.filter((r) => !idSet.has(r.id))
  saveStorageData(data)
}

/**
 * 清空所有记录（含置顶）
 */
export function clearAllRecords(): void {
  saveStorageData(createEmptyStorage())
}

// ============================================================
// 修改记录（重命名、置顶）
// ============================================================

/**
 * 重命名记录
 */
export function renameRecord(recordId: string, newNickname: string): void {
  const data = getStorageData()
  const record =
    data.pinned.find((r) => r.id === recordId) ||
    data.normal.find((r) => r.id === recordId)

  if (record) {
    record.nickname = newNickname.trim()
    saveStorageData(data)
  }
}

/**
 * 切换置顶状态
 * - 置顶：从 normal 移到 pinned，设置 isPinned=true, pinnedAt=当前时间
 * - 取消置顶：从 pinned 移到 normal，设置 isPinned=false，清除 pinnedAt
 */
export function togglePin(recordId: string): void {
  const data = getStorageData()

  // 先在置顶列表查找
  const pinnedRecord = data.pinned.find((r) => r.id === recordId)
  if (pinnedRecord) {
    // 取消置顶
    data.pinned = data.pinned.filter((r) => r.id !== recordId)
    pinnedRecord.isPinned = false
    delete pinnedRecord.pinnedAt
    data.normal.unshift(pinnedRecord)
    saveStorageData(data)
    return
  }

  // 再在普通列表查找
  const normalRecord = data.normal.find((r) => r.id === recordId)
  if (normalRecord) {
    // 置顶
    data.normal = data.normal.filter((r) => r.id !== recordId)
    normalRecord.isPinned = true
    normalRecord.pinnedAt = new Date().toISOString()
    data.pinned.unshift(normalRecord)
    saveStorageData(data)
  }
}

// ============================================================
// 查询：搜索、筛选、排序、分页
// ============================================================

/**
 * 搜索记录（仅匹配名称和报告编号，不搜索数值字段避免精度问题）
 */
export function searchRecords(
  query: string,
  records: SavedPrediction[]
): SavedPrediction[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return records

  return records.filter(
    (record) =>
      record.nickname.toLowerCase().includes(lowerQuery) ||
      record.reportNumber.toLowerCase().includes(lowerQuery)
  )
}

/**
 * 筛选记录
 */
export function filterRecords(
  records: SavedPrediction[],
  filters: FilterOptions
): SavedPrediction[] {
  return records.filter((record) => {
    // 1. 风险等级筛选（空数组表示全部）
    if (
      filters.riskLevels.length > 0 &&
      !filters.riskLevels.includes(record.result.prediction.risk_level)
    ) {
      return false
    }

    // 2. 日期范围筛选
    const recordDate = new Date(record.timestamp)
    if (filters.dateRange.preset) {
      const now = new Date()
      if (filters.dateRange.preset === 'today') {
        if (recordDate.toDateString() !== now.toDateString()) return false
      } else if (filters.dateRange.preset === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        if (recordDate < sevenDaysAgo) return false
      } else if (filters.dateRange.preset === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        if (recordDate < thirtyDaysAgo) return false
      }
    } else if (filters.dateRange.start || filters.dateRange.end) {
      // 自定义日期范围
      if (filters.dateRange.start && recordDate < new Date(filters.dateRange.start)) {
        return false
      }
      if (filters.dateRange.end) {
        // 结束日期包含当天，故加一天
        const endDate = new Date(filters.dateRange.end)
        endDate.setHours(23, 59, 59, 999)
        if (recordDate > endDate) return false
      }
    }

    // 3. 概率区间筛选
    const prob = record.result.prediction.probability * 100
    if (prob < filters.probabilityRange.min || prob > filters.probabilityRange.max) {
      return false
    }

    // 4. 仅置顶筛选
    if (filters.pinnedOnly && !record.isPinned) {
      return false
    }

    return true
  })
}

/**
 * 风险等级转数值（用于排序：低=1，中=2，高=3）
 */
function getRiskScore(level: RiskLevel): number {
  return level === 'low' ? 1 : level === 'medium' ? 2 : 3
}

/**
 * 对普通记录数组应用排序规则（不含置顶逻辑）
 */
export function sortNormalRecords(
  records: SavedPrediction[],
  sortBy: SortOption
): SavedPrediction[] {
  const sorted = [...records]

  switch (sortBy) {
    case 'date-newest':
      sorted.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      break
    case 'date-oldest':
      sorted.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      break
    case 'risk-asc':
      sorted.sort(
        (a, b) =>
          getRiskScore(a.result.prediction.risk_level) -
          getRiskScore(b.result.prediction.risk_level)
      )
      break
    case 'risk-desc':
      sorted.sort(
        (a, b) =>
          getRiskScore(b.result.prediction.risk_level) -
          getRiskScore(a.result.prediction.risk_level)
      )
      break
    case 'prob-asc':
      sorted.sort(
        (a, b) => a.result.prediction.probability - b.result.prediction.probability
      )
      break
    case 'prob-desc':
      sorted.sort(
        (a, b) => b.result.prediction.probability - a.result.prediction.probability
      )
      break
  }

  return sorted
}

/**
 * 对置顶记录按置顶时间降序排列
 */
export function sortPinnedRecords(records: SavedPrediction[]): SavedPrediction[] {
  return [...records].sort((a, b) => {
    const aTime = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0
    const bTime = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0
    return bTime - aTime
  })
}

/**
 * 分页处理
 * 置顶记录仅在第一页显示，不计入分页
 */
export function paginateRecords(
  pinnedRecords: SavedPrediction[],
  normalRecords: SavedPrediction[],
  page: number,
  pageSize: number = PAGE_SIZE
): {
  pinnedRecords: SavedPrediction[]
  normalRecords: SavedPrediction[]
  pagination: PaginationState
} {
  const totalPages = Math.max(1, Math.ceil(normalRecords.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  const end = start + pageSize

  return {
    // 仅第一页显示置顶记录
    pinnedRecords: safePage === 1 ? pinnedRecords : [],
    normalRecords: normalRecords.slice(start, end),
    pagination: {
      currentPage: safePage,
      pageSize,
      totalPages,
      totalRecords: normalRecords.length,
    },
  }
}

// ============================================================
// 去重（用于导入合并）
// ============================================================

/**
 * 根据报告编号去重
 */
export function deduplicateByReportNumber(
  records: SavedPrediction[]
): SavedPrediction[] {
  const seen = new Set<string>()
  return records.filter((record) => {
    if (seen.has(record.reportNumber)) return false
    seen.add(record.reportNumber)
    return true
  })
}
