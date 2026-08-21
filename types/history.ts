/**
 * 历史记录功能类型定义
 * 用于浏览器本地（LocalStorage）保存与管理预测记录
 */

import { PredictionInput, PredictionResult } from './prediction'

/**
 * 单条保存的预测记录
 */
export interface SavedPrediction {
  // 元数据
  id: string                   // 唯一ID（使用 Date.now().toString() + 随机后缀）
  reportNumber: string         // 报告编号 "ATO-YYYYMMDD-XXXXXX"
  nickname: string             // 用户自定义名称或默认名称
  timestamp: string            // 创建时间（ISO 8601）
  isPinned: boolean            // 是否置顶
  pinnedAt?: string            // 置顶时间（ISO 8601，仅置顶记录有值）

  // 输入数据
  input: PredictionInput

  // 预测结果（复用现有的 PredictionResult 结构）
  result: PredictionResult
}

/**
 * 预测记录别名（用于组件）
 */
export type PredictionRecord = SavedPrediction

/**
 * LocalStorage 存储结构
 */
export interface StorageData {
  version: string              // 数据版本号，用于未来迁移
  pinned: SavedPrediction[]    // 置顶记录数组（无上限）
  normal: SavedPrediction[]    // 普通记录数组（最多200条）
  lastModified: string         // 最后修改时间（ISO 8601）
}

/**
 * 风险等级
 */
export type RiskLevel = 'low' | 'medium' | 'high'

/**
 * 排序选项
 */
export type SortOption =
  | 'default'        // 默认排序（置顶优先，其他按保存时间）
  | 'date_newest'    // 日期最新
  | 'date_oldest'    // 日期最旧
  | 'risk_asc'       // 风险升序（低→中→高）
  | 'risk_desc'      // 风险降序（高→中→低）
  | 'prob_asc'       // 概率升序
  | 'prob_desc'      // 概率降序

/**
 * 日期范围预设
 */
export type DatePreset = 'today' | '7days' | '30days'

/**
 * 筛选条件
 */
export interface FilterOptions {
  riskLevels: RiskLevel[]      // 风险等级（多选，空数组表示全部）
  dateRange: {
    start?: string             // 开始日期（YYYY-MM-DD）
    end?: string               // 结束日期（YYYY-MM-DD）
    preset?: DatePreset        // 预设快捷选项
  }
  probabilityRange: {
    min: number                // 最小概率（0-100）
    max: number                // 最大概率（0-100）
  }
  pinnedOnly?: boolean         // 仅显示置顶记录
}

/**
 * 分页状态
 */
export interface PaginationState {
  currentPage: number          // 当前页码（从1开始）
  pageSize: number             // 每页条数（固定20）
  totalPages: number           // 总页数
  totalRecords: number         // 普通记录总数（不含置顶）
}

/**
 * 保存记录时的上限检查结果
 */
export interface SaveCheckResult {
  success: boolean             // 是否成功保存
  needsConfirmation: boolean   // 是否需要用户确认（超过200条）
  recordsToDelete?: SavedPrediction[]  // 需要删除的记录列表
  savedRecord?: SavedPrediction        // 已保存的记录
}

/**
 * 存储数据版本常量
 */
export const STORAGE_VERSION = '1.0.0'

/**
 * 普通记录上限
 */
export const NORMAL_RECORDS_LIMIT = 200

/**
 * 每页显示条数
 */
export const PAGE_SIZE = 20

/**
 * 记录名称最大长度
 */
export const NICKNAME_MAX_LENGTH = 50
