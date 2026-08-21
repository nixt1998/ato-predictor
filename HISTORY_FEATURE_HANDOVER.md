# 历史记录功能完整设计文档 (Handover Document)

**项目**: ATO心脏毒性预测系统  
**功能**: 浏览器本地历史记录保存与管理  
**版本**: v1.0  
**日期**: 2026-08-21  
**状态**: 待实施

---

## 📋 目录

1. [功能概述](#功能概述)
2. [核心需求确认](#核心需求确认)
3. [UI设计方案](#ui设计方案)
4. [数据结构设计](#数据结构设计)
5. [核心功能逻辑](#核心功能逻辑)
6. [技术实现细节](#技术实现细节)
7. [实施计划](#实施计划)
8. [测试清单](#测试清单)

---

## 功能概述

### 背景
- 医生需要对比患者不同时期的预测结果
- 门诊场景下需要快速查看历史预测
- 数据隐私要求不能上传服务器

### 核心价值
1. **本地存储**: 数据仅保存在用户浏览器，不上传服务器
2. **快速对比**: 查看历史预测结果，追踪风险变化
3. **批量管理**: 支持筛选、排序、批量删除
4. **数据导出**: Excel导出用于统计分析

### 技术选型
- **存储**: LocalStorage (5MB容量，200条记录约500KB)
- **导出**: xlsx库 (Excel生成)
- **UI框架**: React + TailwindCSS (与现有系统一致)

---

## 核心需求确认

### 1. 保存记录功能

#### 触发位置
- 预测结果页 → 建议Tab → 底部操作按钮区

#### 按钮布局
```
┌─────────────────────────────────────────────────┐
│  📥 下载报告    💾 保存记录    ➕ 新建预测       │
└─────────────────────────────────────────────────┘
```

#### 保存对话框要求
1. **报告编号**: 自动生成 `ATO-YYYYMMDD-XXXXXX` (6位随机数)
2. **记录名称**: 
   - 输入框，支持自定义（最多50字符）
   - 默认值: `YYYY-MM-DD HH:mm 预测`
   - 提示文字: "留空则使用默认名称"
3. **隐私提醒** (⚠️ 黄色背景):
   - "请勿在名称中填写患者真实姓名、身份证号等敏感信息"
   - "如在公共电脑使用，建议使用后清除所有记录"
4. **数据保护说明** (浅灰色小字):
   - "数据仅保存在本浏览器，不会上传到服务器"
   - "清除浏览器数据或更换设备后，记录会丢失"
   - "建议定期下载PDF报告作为永久存档"
   - "上限200条，超过后自动删除最旧记录（置顶除外）"
5. **底部提示**: "💡 保存后可在【导航栏 - 历史记录】中查看"
6. **操作按钮**: [取消] [确认保存]

#### 保存对话框完整UI设计

```
┌──────────────────────────────────────────────────┐
│  💾 保存预测记录                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  记录编号：ATO-20260820-483972                   │
│  预测时间：2026-08-20 14:30:15                   │
│                                                  │
│  ┌────────────────────────────────────────┐      │
│  │ 记录名称（选填）                        │      │
│  │ [患者A-第1次随访________________]      │      │
│  └────────────────────────────────────────┘      │
│  💡 留空则使用默认名称："2026-08-20 14:30 预测" │
│                                                  │
│  ⚠️ 隐私提醒：                                   │
│  • 请勿在名称中填写患者真实姓名、身份证号等      │
│    敏感信息                                      │
│  • 如在公共电脑使用，建议使用后清除所有记录      │
│                                                  │
│  🔒 数据保护：                                   │
│  • 数据仅保存在本浏览器，不会上传到服务器        │
│  • 清除浏览器数据或更换设备后，记录会丢失        │
│  • 建议定期下载PDF报告作为永久存档              │
│  • 上限200条，超过后自动删除最旧记录（置顶除外） │
│                                                  │
│  💡 保存后可在【导航栏 - 历史记录】中查看        │
│                                                  │
│  [取消]                          [确认保存]      │
└──────────────────────────────────────────────────┘
```

### 2. 存储限制规则

#### 上限管理
- **普通记录**: 最多200条
- **置顶记录**: 无上限（独立池）
- **超限处理**: 删除最旧的未置顶记录

#### 200条上限触发流程
1. 用户点击"确认保存"
2. 检测普通记录是否 ≥ 200条
3. 如果超限，弹出确认对话框：

```
┌─────────────────────────────────────────────┐
│  ⚠️ 存储空间提示                             │
├─────────────────────────────────────────────┤
│                                             │
│  普通记录已达到200条上限！                   │
│                                             │
│  为保存新记录，系统将自动删除以下            │
│  最旧的 3 条记录：                           │
│                                             │
│  • 2026-01-15 预测 (ATO-20260115-123456)   │
│  • 2026-01-18 预测 (ATO-20260118-234567)   │
│  • 2026-01-20 预测 (ATO-20260120-345678)   │
│                                             │
│  💡 提示：                                   │
│  • 置顶记录不会被删除                        │
│  • 建议将重要记录置顶                        │
│  • 可以导出备份保存历史数据                  │
│                                             │
│  [取消保存]          [继续保存并删除旧记录]  │
└─────────────────────────────────────────────┘
```

4. 用户确认后，删除最旧的N条普通记录，保存新记录
5. 显示提示: "已保存记录，自动删除了N条最旧的记录"

### 3. 导航栏修改

#### 新增入口
```
原导航栏：[首页] [预测] [数据上传] [关于]
新导航栏：[首页] [预测] [历史记录] [数据上传] [关于]
                         ↑ 新增
```

#### 路由配置
- 路径: `/[locale]/history`
- 页面组件: `app/[locale]/history/page.tsx`

### 4. 历史记录页面核心需求

#### 4.1 页面头部
```
┌────────────────────────────────────────────────────────────────────────┐
│  历史记录                 [📤 导出Excel] [📦 导出备份] [🗑️ 清空全部]    │
└────────────────────────────────────────────────────────────────────────┘
```

**按钮说明**:
- **导出Excel**: 生成 `.xlsx` 文件，包含详细数据+统计摘要
- **导出备份**: 生成 `.json` 文件，用于数据备份和恢复
- **清空全部**: 删除所有记录（需二次确认）

#### 4.2 搜索栏
```
┌────────────────────────────────────────────────────────────────────────┐
│  🔍 [搜索名称或编号_________________________] [🔍 搜索]               │
└────────────────────────────────────────────────────────────────────────┘
```

**搜索范围** (用户确认):
- ✅ 记录名称 (nickname)
- ✅ 报告编号 (reportNumber)
- ❌ 不搜索数值型字段 (避免精度问题)

**搜索逻辑**:
- 实时搜索（输入时触发）
- 不区分大小写
- 支持部分匹配

#### 4.3 快速筛选标签 (用户确认)
```
┌────────────────────────────────────────────────────────────────────────┐
│  🔖 快速筛选：                                                          │
│  [高风险(5)] [中风险(12)] [低风险(8)] [置顶(3)] [今天(2)] [本周(7)]   │
└────────────────────────────────────────────────────────────────────────┘
```

**标签列表**:
1. 🔴 高风险 (N) - 筛选 risk_level === 'high'
2. 🟡 中风险 (N) - 筛选 risk_level === 'medium'
3. 🟢 低风险 (N) - 筛选 risk_level === 'low'
4. 📌 置顶 (N) - 筛选 isPinned === true
5. 📅 今天 (N) - 筛选今天创建的记录
6. 📆 本周 (N) - 筛选近7天的记录

**交互**:
- 点击标签自动应用筛选条件
- 标签显示实时计数
- 可以取消筛选（再次点击或点击"全部"）

#### 4.4 筛选面板

```
┌─────────────────┐
│ 筛选            │
│ □ 全部风险      │
│ ☑️ 高风险        │
│ ☑️ 中风险        │
│ ☑️ 低风险        │
│                 │
│ 日期范围：      │
│ • 全部          │
│ ○ 今天          │
│ ○ 近7天         │
│ ○ 近30天        │
│ ○ 自定义        │
│ [2026-08-01] 至 │
│ [2026-08-20]    │
│                 │
│ 概率区间：      │
│ • 全部          │
│ ○ 0-20% (低)    │
│ ○ 20-40% (中低) │
│ ○ 40-60% (中高) │
│ ○ 60-100% (高)  │
└─────────────────┘
```

**筛选条件详解** (用户确认):

1. **风险分层筛选**:
   - 多选（可同时选择多个风险等级）
   - 默认全选

2. **日期范围筛选** (用户确认):
   - 单选（5个选项互斥）
   - 今天: 当天创建的记录
   - 近7天: 最近7天内创建的记录
   - 近30天: 最近30天内创建的记录
   - 自定义: 用户选择起止日期
   - 默认: 全部

3. **概率区间筛选** (用户确认):
   - 单选（5个选项互斥）
   - 0-20%: 低风险区间
   - 20-40%: 中低风险区间
   - 40-60%: 中高风险区间
   - 60-100%: 高风险区间
   - 默认: 全部

#### 4.5 排序面板

```
┌──────────────┐
│ 排序          │
│ • 日期最新    │
│ ○ 日期最旧    │
│ ○ 风险升序    │
│ ○ 风险降序    │
│ ○ 概率升序    │
│ ○ 概率降序    │
└──────────────┘
```

**排序规则** (用户确认):
1. **日期最新**: 按timestamp降序（默认）
2. **日期最旧**: 按timestamp升序
3. **风险升序**: 低→中→高
4. **风险降序**: 高→中→低
5. **概率升序**: probability 从小到大
6. **概率降序**: probability 从大到小

**重要**: 
- 置顶记录始终在最前面，不受排序影响
- 置顶记录内部按置顶时间降序排列

#### 4.6 批量操作面板

```
┌─────────────────────────┐
│ 批量操作                 │
│ ☑️ 全选 (3/12)           │
│ 🗑️ 删除选中(3)          │
└─────────────────────────┘
```

**功能说明**:
- **全选**: 选中当前页所有普通记录（置顶记录需单独选择）
- **删除选中**: 批量删除已选记录（需确认）

#### 4.7 分页显示 (用户确认重点)

**核心规则**:
1. 每页显示20条普通记录
2. 置顶记录不计入分页
3. 置顶记录仅在第一页显示
4. 置顶记录与普通记录用横线分隔

**分页信息显示**:
```
┌────────────────────────────────────────────────────────────────┐
│  第 1 页 / 共 3 页  |  共 45 条普通记录 + 3 条置顶记录         │
└────────────────────────────────────────────────────────────────┘
```

**分页导航**:
```
┌────────────────────────────────────────────────────────────────┐
│  [< 上一页]  [1] [2] [3] [4] [5] ... [10]  [下一页 >]        │
└────────────────────────────────────────────────────────────────┘
```

#### 4.8 记录卡片设计

**置顶记录卡片**:
```
┌──────────────────────────────────────────────────────────────┐
│ ☑️ 📌 患者A-重点关注               ✏️                          │
│ 编号：ATO-20260820-483972                                    │
│ ⏰ 2026-08-20 14:30:15                                       │
│                                                              │
│ 输入参数：                                                    │
│ iAs: 14 | MMA: 16 | DMA: 12 | CT_drug: No                   │
│                                                              │
│ 预测结果：                                                    │
│ 🎯 中等风险 (25.85%)  ← 黄色字体 #F59E0B                     │
│ tAs: 42.0 ng/mL | SMI: 0.750 | PMI: 1.143                   │
│                                                              │
│ [📊 查看详情] [📥 下载PDF] [🗑️ 删除] [📌 取消置顶]          │
└──────────────────────────────────────────────────────────────┘
```

**普通记录卡片**:
```
┌──────────────────────────────────────────────────────────────┐
│ ☐ 2026-08-18 预测                  ✏️                        │
│ 编号：ATO-20260818-192847                                    │
│ ⏰ 2026-08-18 11:30:15                                       │
│                                                              │
│ 输入参数：                                                    │
│ iAs: 25 | MMA: 35 | DMA: 60 | CT_drug: No                   │
│                                                              │
│ 预测结果：                                                    │
│ 🎯 中等风险 (35.60%)  ← 黄色字体 #F59E0B                     │
│ tAs: 120.0 ng/mL | SMI: 1.714 | PMI: 1.400                  │
│                                                              │
│ [📊 查看详情] [📥 下载PDF] [🗑️ 删除] [📌 置顶]              │
└──────────────────────────────────────────────────────────────┘
```

**卡片元素说明**:
1. ☑️/☐ - 多选框（用于批量操作）
2. 📌 - 置顶标记（仅置顶记录显示）
3. 名称 + ✏️ - 点击✏️可重命名
4. 编号 - 自动生成的报告编号
5. ⏰ 时间 - 预测创建时间
6. 输入参数 - iAs, MMA, DMA, CT_drug
7. 预测结果 - 风险等级（带颜色）+ 概率
8. 代谢指标 - tAs, SMI, PMI
9. 操作按钮 - 查看详情/下载PDF/删除/置顶

**风险等级颜色映射** (与预测页面一致):
```typescript
const RISK_COLORS = {
  low: {
    text: 'text-green-600',
    bg: 'bg-green-100',
    hex: '#10B981'
  },
  medium: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-100',
    hex: '#F59E0B'
  },
  high: {
    text: 'text-red-600',
    bg: 'bg-red-100',
    hex: '#EF4444'
  }
}
```

#### 4.9 置顶与普通记录分隔 (用户确认重点)

**第一页布局**:
```
┌────────────────────────────────────────────────────────────┐
│  📌 置顶记录 (3 条)                                         │
│                                                            │
│  [置顶记录卡片1]                                            │
│  [置顶记录卡片2]                                            │
│  [置顶记录卡片3]                                            │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │  ← 分隔线
│                                                            │
│  📋 普通记录 (当前页 1-20 / 共 45 条)                       │
│                                                            │
│  [普通记录卡片1]                                            │
│  [普通记录卡片2]                                            │
│  ...                                                       │
│  [普通记录卡片20]                                           │
└────────────────────────────────────────────────────────────┘
```

**第二页及以后布局**:
```
┌────────────────────────────────────────────────────────────┐
│  📋 普通记录 (当前页 21-40 / 共 45 条)                      │
│                                                            │
│  [普通记录卡片21]                                           │
│  [普通记录卡片22]                                           │
│  ...                                                       │
│  [普通记录卡片40]                                           │
└────────────────────────────────────────────────────────────┘
```

#### 4.10 记录操作功能

##### A. 查看详情
**功能**: 跳转到预测结果页面，自动填充该记录的数据

**实现**:
1. 从LocalStorage读取该记录的完整数据
2. 将数据加载到Zustand store
3. 跳转到 `/predict?tab=result`
4. 自动显示结果Tab、分析Tab、建议Tab

##### B. 下载PDF
**功能**: 重新生成并下载该记录的PDF报告

**实现**:
1. 读取记录的input和result数据
2. 调用 `/api/generate-report` API
3. 自动下载生成的PDF文件

##### C. 删除记录
**功能**: 删除单条记录（需确认）

**确认对话框**:
```
┌─────────────────────────────────────┐
│  ⚠️ 确认删除                         │
├─────────────────────────────────────┤
│  确定要删除以下记录吗？              │
│                                     │
│  • 患者A-重点关注                    │
│    ATO-20260820-483972              │
│    2026-08-20 14:30:15              │
│                                     │
│  此操作不可恢复！                    │
│                                     │
│  [取消]              [确认删除]     │
└─────────────────────────────────────┘
```

##### D. 置顶/取消置顶
**功能**: 切换记录的置顶状态

**逻辑**:
1. 点击"置顶": 将记录从normal数组移到pinned数组，设置isPinned=true, pinnedAt=当前时间
2. 点击"取消置顶": 将记录从pinned数组移到normal数组，设置isPinned=false, 删除pinnedAt
3. 重新渲染列表

##### E. 重命名
**功能**: 修改记录的显示名称

**交互**:
1. 点击名称右侧的 ✏️ 图标
2. 弹出输入框（内联编辑）
3. 输入新名称（最多50字符）
4. 按Enter或失焦保存
5. 按Esc取消

**UI示例**:
```
原状态: 患者A-重点关注  ✏️
点击后: [患者A-重点关注___________] ✓ ✗
```

#### 4.11 批量删除确认 (用户确认)

**触发**: 选中多条记录后，点击"删除选中"

**确认对话框**:
```
┌─────────────────────────────────────────────┐
│  ⚠️ 确认删除                                 │
├─────────────────────────────────────────────┤
│                                             │
│  即将删除 3 条记录，此操作不可恢复！         │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 📋 患者A-重点关注                      │  │
│  │    ATO-20260820-483972                │  │
│  │    2026-08-20 14:30:15                │  │
│  │                                       │  │
│  │ 📋 患者D-第3次随访                     │  │
│  │    ATO-20260819-582910                │  │
│  │    2026-08-19 16:45:20                │  │
│  │                                       │  │
│  │ 📋 2026-08-18 预测                     │  │
│  │    ATO-20260818-192847                │  │
│  │    2026-08-18 11:30:15                │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  💡 提示：删除前建议先导出备份               │
│                                             │
│  [取消]                      [确认删除]     │
└─────────────────────────────────────────────┘
```

#### 4.12 页面底部固定提示栏

```
┌────────────────────────────────────────────────────────────────┐
│  ⚠️ 重要提醒：                                                  │
│  • 数据仅保存在本浏览器，不会上传服务器                         │
│  • 清除浏览器缓存、更换设备或浏览器会丢失所有记录                │
│  • 最多保存200条普通记录（置顶记录不计入限制）                   │
│  • 建议定期导出Excel或PDF备份                                  │
│  • 如在公共电脑使用，请使用后点击"清空全部"                      │
└────────────────────────────────────────────────────────────────┘
```

**显示位置**: 页面底部固定，始终可见

### 5. 导出功能需求 (用户确认)

#### 5.1 导出Excel格式

**文件名**: `ATO预测记录_YYYY-MM-DD.xlsx`

**Sheet 1: 预测记录汇总表**

| 列名 | 数据来源 | 格式 |
|------|---------|------|
| 序号 | 自动编号 | 1, 2, 3... |
| 报告编号 | reportNumber | ATO-20260820-483972 |
| 记录名称 | nickname | 患者A-重点关注 |
| 是否置顶 | isPinned | 是/否 |
| 预测时间 | timestamp | 2026-08-20 14:30:15 |
| iAs | input.iAs | 14 |
| MMA | input.MMA | 16 |
| DMA | input.DMA | 12 |
| CT_drug | input.CT_drug | Yes/No |
| 风险等级 | result.prediction.risk_level | 高风险/中风险/低风险 |
| 风险概率 | result.prediction.probability | 25.85% |
| tAs | result.metabolism.tAs | 42.0 |
| PMI | result.metabolism.PMI | 1.143 |
| SMI | result.metabolism.SMI | 0.750 |
| iAs% | result.metabolism.iAs_pct | 33.3% |
| MMA% | result.metabolism.MMA_pct | 38.1% |
| DMA% | result.metabolism.DMA_pct | 28.6% |
| 主要风险因素 | result.major_risk_factor | CT_drug |

**Sheet 2: 统计摘要**

```
统计项              数值
─────────────────────────
总记录数            48
置顶记录            3
普通记录            45

高风险记录          5 (10.4%)
中风险记录          18 (37.5%)
低风险记录          25 (52.1%)

平均风险概率        28.6%
平均tAs浓度         85.3 ng/mL
```

**实现库**: `xlsx` (SheetJS)

#### 5.2 导出JSON备份

**文件名**: `ato-history-backup-{timestamp}.json`

**数据结构**:
```json
{
  "version": "1.0.0",
  "exportTime": "2026-08-20T14:30:15.000Z",
  "totalRecords": 48,
  "records": [
    {
      "id": "1692534615000",
      "reportNumber": "ATO-20260820-483972",
      "nickname": "患者A-重点关注",
      "timestamp": "2026-08-20T14:30:15.000Z",
      "isPinned": true,
      "pinnedAt": "2026-08-20T14:30:15.000Z",
      "input": { ... },
      "result": { ... }
    },
    ...
  ]
}
```

**用途**: 数据备份和恢复

### 6. 新建预测功能

**触发位置**: 建议Tab → 底部操作按钮 → "新建预测"

**功能逻辑**:
1. 点击"新建预测"按钮
2. 弹出确认对话框:
```
┌─────────────────────────────────────┐
│  ⚠️ 确认新建预测                     │
├─────────────────────────────────────┤
│  确定要清空当前结果并开始新的预测吗？│
│                                     │
│  当前预测结果将会被清空。            │
│                                     │
│  💡 提示：如需保留当前结果，         │
│  请先点击"保存记录"。                │
│                                     │
│  [取消]              [确认新建]     │
└─────────────────────────────────────┘
```
3. 用户确认后，清空Zustand store的input和result
4. 跳转到预测页面的输入Tab: `/predict?tab=input`

---

## UI设计方案

### 完整页面布局 (第一页)

```
┌────────────────────────────────────────────────────────────────────────┐
│  历史记录                 [📤 导出Excel] [📦 导出备份] [🗑️ 清空全部]    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  🔍 [搜索名称或编号_________________________] [🔍 搜索]               │
│                                                                        │
│  🔖 快速筛选：                                                          │
│  [高风险(5)] [中风险(12)] [低风险(8)] [置顶(3)] [今天(2)] [本周(7)]   │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ 筛选            │  │ 排序          │  │ 批量操作                 │  │
│  │ □ 全部风险      │  │ • 日期最新    │  │ ☑️ 全选 (3/12)           │  │
│  │ ☑️ 高风险        │  │ ○ 日期最旧    │  │ 🗑️ 删除选中(3)          │  │
│  │ ☑️ 中风险        │  │ ○ 风险升序    │  └─────────────────────────┘  │
│  │ ☑️ 低风险        │  │ ○ 风险降序    │                              │
│  │                 │  │ ○ 概率升序    │                              │
│  │ 日期范围：      │  │ ○ 概率降序    │                              │
│  │ • 全部          │  └──────────────┘                              │
│  │ ○ 今天          │                                                  │
│  │ ○ 近7天         │                                                  │
│  │ ○ 近30天        │                                                  │
│  │ ○ 自定义        │                                                  │
│  │ [2026-08-01] 至 │                                                  │
│  │ [2026-08-20]    │                                                  │
│  │                 │                                                  │
│  │ 概率区间：      │                                                  │
│  │ • 全部          │                                                  │
│  │ ○ 0-20% (低)    │                                                  │
│  │ ○ 20-40% (中低) │                                                  │
│  │ ○ 40-60% (中高) │                                                  │
│  │ ○ 60-100% (高)  │                                                  │
│  └─────────────────┘                                                  │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  第 1 页 / 共 3 页  |  共 45 条普通记录 + 3 条置顶记录                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  📌 置顶记录 (3 条)                                                    │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ ☑️ 📌 患者A-重点关注               ✏️                               │ │
│  │ 编号：ATO-20260820-483972                                         │ │
│  │ ⏰ 2026-08-20 14:30:15                                            │ │
│  │ 输入：iAs: 14 | MMA: 16 | DMA: 12 | CT_drug: No                  │ │
│  │ 结果：🎯 中等风险 (25.85%)                                         │ │
│  │       tAs: 42.0 ng/mL | SMI: 0.750 | PMI: 1.143                  │ │
│  │ [📊 查看详情] [📥 下载PDF] [🗑️ 删除] [📌 取消置顶]                 │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ ☑️ 📌 患者B-高风险监测             ✏️                               │ │
│  │ 编号：ATO-20260818-392847                                         │ │
│  │ ⏰ 2026-08-18 10:15:42                                            │ │
│  │ 输入：iAs: 50 | MMA: 100 | DMA: 100 | CT_drug: Yes               │ │
│  │ 结果：🎯 高风险 (83.35%)                                           │ │
│  │       tAs: 250.0 ng/mL | SMI: 1.000 | PMI: 2.000                 │ │
│  │ [📊 查看详情] [📥 下载PDF] [🗑️ 删除] [📌 取消置顶]                 │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ ☐ 📌 患者C-定期复查               ✏️                               │ │
│  │ 编号：ATO-20260810-192038                                         │ │
│  │ ⏰ 2026-08-10 09:20:38                                            │ │
│  │ 输入：iAs: 8 | MMA: 10 | DMA: 30 | CT_drug: No                   │ │
│  │ 结果：🎯 低风险 (12.50%)                                           │ │
│  │       tAs: 48.0 ng/mL | SMI: 3.000 | PMI: 1.250                  │ │
│  │ [📊 查看详情] [📥 下载PDF] [🗑️ 删除] [📌 取消置顶]                 │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                        │
│  📋 普通记录 (当前页 1-20 / 共 45 条)                                  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ ☑️ 患者D-第3次随访                ✏️                               │ │
│  │ 编号：ATO-20260819-582910                                         │ │
│  │ ⏰ 2026-08-19 16:45:20                                            │ │
│  │ 输入：iAs: 12 | MMA: 18 | DMA: 22 | CT_drug: No                  │ │
│  │ 结果：🎯 低风险 (15.20%)                                           │ │
│  │       tAs: 52.0 ng/mL | SMI: 1.222 | PMI: 1.500                  │ │
│  │ [📊 查看详情] [📥 下载PDF] [🗑️ 删除] [📌 置顶]                     │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ ☐ 2026-08-18 预测                  ✏️                             │ │
│  │ 编号：ATO-20260818-192847                                         │ │
│  │ ⏰ 2026-08-18 11:30:15                                            │ │
│  │ 输入：iAs: 25 | MMA: 35 | DMA: 60 | CT_drug: No                  │ │
│  │ 结果：🎯 中等风险 (35.60%)                                         │ │
│  │       tAs: 120.0 ng/mL | SMI: 1.714 | PMI: 1.400                 │ │
│  │ [📊 查看详情] [📥 下载PDF] [🗑️ 删除] [📌 置顶]                     │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ... (共20条记录) ...                                                  │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  分页导航：                                                             │
│  [< 上一页]  [1] [2] [3] [4] [5] ... [10]  [下一页 >]                │
└────────────────────────────────────────────────────────────────────────┘

底部固定提示栏：
┌────────────────────────────────────────────────────────────────────────┐
│  ⚠️ 重要提醒：                                                          │
│  • 数据仅保存在本浏览器，不会上传服务器                                 │
│  • 清除浏览器缓存、更换设备或浏览器会丢失所有记录                        │
│  • 最多保存200条普通记录（置顶记录不计入限制）                           │
│  • 建议定期导出Excel或PDF备份                                          │
│  • 如在公共电脑使用，请使用后点击"清空全部"                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 数据结构设计

### LocalStorage存储结构

**存储键**: `ato-predictions`

**数据格式**:
```typescript
interface StorageData {
  version: string              // "1.0.0" - 数据版本号，用于未来迁移
  pinned: SavedPrediction[]    // 置顶记录数组（无上限）
  normal: SavedPrediction[]    // 普通记录数组（最多200条）
  lastModified: string         // 最后修改时间（ISO 8601）
}
```

### 单条记录结构

```typescript
interface SavedPrediction {
  // 元数据
  id: string                   // 唯一ID（使用 Date.now().toString()）
  reportNumber: string         // 报告编号 "ATO-YYYYMMDD-XXXXXX"
  nickname: string             // 用户自定义名称或默认名称
  timestamp: string            // 创建时间（ISO 8601）
  isPinned: boolean            // 是否置顶
  pinnedAt?: string            // 置顶时间（ISO 8601，仅置顶记录有值）
  
  // 输入数据
  input: {
    iAs: number                // 无机砷
    MMA: number                // 一甲基砷
    DMA: number                // 二甲基砷
    CT_drug: 'Yes' | 'No'      // 是否使用心毒性药物
  }
  
  // 预测结果
  result: {
    prediction: {
      class: 'Yes' | 'No'              // 分类结果
      probability: number              // 概率（0-1之间的小数）
      risk_level: 'low' | 'medium' | 'high'  // 风险等级
    }
    metabolism: {
      tAs: number              // 总砷浓度
      PMI: number              // 一级甲基化指数
      SMI: number              // 二级甲基化指数
      iAs_pct: number          // 无机砷百分比
      MMA_pct: number          // 一甲基砷百分比
      DMA_pct: number          // 二甲基砷百分比
    }
    shap_values: {
      tAs: number              // SHAP值
      SMI: number
      MMA_per: number
      DMA_per: number
      CT_drug: number
    }
    major_risk_factor: string  // 主要风险因素
    suggestions: Array<{
      key: string              // 建议键（用于多语言）
      risk_factor: string      // 风险因素描述
      suggestion: string       // 临床建议
    }>
  }
}
```

### LocalStorage实际存储示例

```json
{
  "ato-predictions": {
    "version": "1.0.0",
    "lastModified": "2026-08-20T14:30:15.000Z",
    "pinned": [
      {
        "id": "1692534615000",
        "reportNumber": "ATO-20260820-483972",
        "nickname": "患者A-重点关注",
        "timestamp": "2026-08-20T14:30:15.000Z",
        "isPinned": true,
        "pinnedAt": "2026-08-20T14:30:15.000Z",
        "input": {
          "iAs": 14,
          "MMA": 16,
          "DMA": 12,
          "CT_drug": "No"
        },
        "result": {
          "prediction": {
            "class": "No",
            "probability": 0.2585,
            "risk_level": "medium"
          },
          "metabolism": {
            "tAs": 42.0,
            "PMI": 1.143,
            "SMI": 0.750,
            "iAs_pct": 33.3,
            "MMA_pct": 38.1,
            "DMA_pct": 28.6
          },
          "shap_values": {
            "tAs": 0.0053,
            "SMI": -0.0627,
            "MMA_per": -0.0094,
            "DMA_per": -0.0104,
            "CT_drug": -0.1059
          },
          "major_risk_factor": "CT_drug",
          "suggestions": [...]
        }
      }
    ],
    "normal": [
      {
        "id": "1692448215000",
        "reportNumber": "ATO-20260819-582910",
        "nickname": "患者D-第3次随访",
        "timestamp": "2026-08-19T16:45:20.000Z",
        "isPinned": false,
        "input": { ... },
        "result": { ... }
      }
    ]
  }
}
```

### 存储空间估算

- **单条记录大小**: 约2KB（包含完整的input、result、shap_values、suggestions）
- **200条普通记录**: 约400KB
- **50条置顶记录**: 约100KB
- **总计**: 约500KB（远低于LocalStorage的5MB限制）

---

## 核心功能逻辑

### 1. 报告编号生成

```typescript
/**
 * 生成唯一的报告编号
 * 格式: ATO-YYYYMMDD-XXXXXX
 * 示例: ATO-20260820-483972
 */
function generateReportNumber(): string {
  const date = new Date()
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 900000) + 100000 // 6位随机数 100000-999999
  return `ATO-${yyyymmdd}-${random}`
}
```

### 2. 默认名称生成

```typescript
/**
 * 生成默认记录名称
 * 格式: YYYY-MM-DD HH:mm 预测
 * 示例: 2026-08-20 14:30 预测
 */
function generateDefaultNickname(): string {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  
  return `${yyyy}-${mm}-${dd} ${hh}:${min} 预测`
}
```

### 3. 保存记录逻辑（带200条限制检查）

```typescript
/**
 * 保存记录（带上限检查）
 * 返回保存状态和需要删除的记录列表
 */
function saveRecordWithLimitCheck(record: SavedPrediction): {
  success: boolean
  needsConfirmation: boolean
  recordsToDelete?: SavedPrediction[]
} {
  const data = getStorageData()
  
  // 置顶记录：无限制，直接保存
  if (record.isPinned) {
    data.pinned.unshift(record)
    data.lastModified = new Date().toISOString()
    saveStorageData(data)
    return { success: true, needsConfirmation: false }
  }
  
  // 普通记录：检查是否超过200条
  if (data.normal.length >= 200) {
    const toDeleteCount = data.normal.length - 200 + 1 // +1是为新记录腾出空间
    const recordsToDelete = data.normal.slice(-toDeleteCount) // 最旧的N条
    
    return {
      success: false,
      needsConfirmation: true,
      recordsToDelete
    }
  }
  
  // 未超限，直接保存
  data.normal.unshift(record)
  data.lastModified = new Date().toISOString()
  saveStorageData(data)
  return { success: true, needsConfirmation: false }
}

/**
 * 用户确认后，删除旧记录并保存新记录
 */
function confirmSaveWithDelete(record: SavedPrediction, deleteCount: number): void {
  const data = getStorageData()
  
  // 删除最旧的N条
  data.normal = data.normal.slice(0, 200 - 1)
  
  // 保存新记录
  data.normal.unshift(record)
  data.lastModified = new Date().toISOString()
  
  saveStorageData(data)
  
  showNotification(
    `已保存记录，自动删除了${deleteCount}条最旧的记录`,
    'warning'
  )
}
```

### 4. 搜索逻辑

```typescript
/**
 * 搜索记录（名称或编号）
 * 不搜索数值型字段，避免精度问题
 */
function searchRecords(query: string, records: SavedPrediction[]): SavedPrediction[] {
  const lowerQuery = query.toLowerCase().trim()
  
  if (!lowerQuery) return records
  
  return records.filter(record => 
    record.nickname.toLowerCase().includes(lowerQuery) ||
    record.reportNumber.toLowerCase().includes(lowerQuery)
  )
}
```

### 5. 筛选逻辑

```typescript
interface FilterOptions {
  riskLevels: ('low' | 'medium' | 'high')[]  // 风险等级（多选）
  dateRange: {
    start?: string           // 开始日期（YYYY-MM-DD）
    end?: string             // 结束日期（YYYY-MM-DD）
    preset?: 'today' | '7days' | '30days'  // 预设快捷选项
  }
  probabilityRange: {
    min: number              // 最小概率（0-100）
    max: number              // 最大概率（0-100）
  }
  pinnedOnly?: boolean       // 仅显示置顶记录
}

/**
 * 筛选记录
 */
function filterRecords(
  records: SavedPrediction[],
  filters: FilterOptions
): SavedPrediction[] {
  return records.filter(record => {
    // 1. 风险等级筛选
    if (filters.riskLevels.length > 0 && 
        !filters.riskLevels.includes(record.result.prediction.risk_level)) {
      return false
    }
    
    // 2. 日期范围筛选
    if (filters.dateRange.preset) {
      const recordDate = new Date(record.timestamp)
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
      const recordDate = new Date(record.timestamp)
      if (filters.dateRange.start && recordDate < new Date(filters.dateRange.start)) return false
      if (filters.dateRange.end && recordDate > new Date(filters.dateRange.end)) return false
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
```

### 6. 排序逻辑

```typescript
type SortOption = 
  | 'date-newest'    // 日期最新
  | 'date-oldest'    // 日期最旧
  | 'risk-asc'       // 风险升序
  | 'risk-desc'      // 风险降序
  | 'prob-asc'       // 概率升序
  | 'prob-desc'      // 概率降序

/**
 * 排序记录
 * 置顶记录始终在前，不受排序规则影响
 */
function sortRecords(
  records: SavedPrediction[],
  sortBy: SortOption
): SavedPrediction[] {
  const sorted = [...records]
  
  // 分离置顶和普通记录
  const pinned = sorted.filter(r => r.isPinned)
  const normal = sorted.filter(r => !r.isPinned)
  
  // 置顶记录按置顶时间降序排列
  pinned.sort((a, b) => 
    new Date(b.pinnedAt!).getTime() - new Date(a.pinnedAt!).getTime()
  )
  
  // 普通记录应用排序规则
  switch (sortBy) {
    case 'date-newest':
      normal.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      break
      
    case 'date-oldest':
      normal.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      break
      
    case 'risk-asc':
      normal.sort((a, b) => 
        getRiskScore(a.result.prediction.risk_level) - 
        getRiskScore(b.result.prediction.risk_level)
      )
      break
      
    case 'risk-desc':
      normal.sort((a, b) => 
        getRiskScore(b.result.prediction.risk_level) - 
        getRiskScore(a.result.prediction.risk_level)
      )
      break
      
    case 'prob-asc':
      normal.sort((a, b) => 
        a.result.prediction.probability - b.result.prediction.probability
      )
      break
      
    case 'prob-desc':
      normal.sort((a, b) => 
        b.result.prediction.probability - a.result.prediction.probability
      )
      break
  }
  
  // 返回：置顶记录 + 排序后的普通记录
  return [...pinned, ...normal]
}

/**
 * 风险等级转数值（用于排序）
 */
function getRiskScore(level: 'low' | 'medium' | 'high'): number {
  return level === 'low' ? 1 : level === 'medium' ? 2 : 3
}
```

### 7. 分页逻辑

```typescript
interface PaginationState {
  currentPage: number     // 当前页码（从1开始）
  pageSize: number        // 每页条数（固定20）
  totalPages: number      // 总页数
  totalRecords: number    // 普通记录总数（不含置顶）
}

/**
 * 分页处理
 * 置顶记录仅在第一页显示，不计入分页
 */
function paginateRecords(
  pinnedRecords: SavedPrediction[],
  normalRecords: SavedPrediction[],
  page: number,
  pageSize: number = 20
): {
  pinnedRecords: SavedPrediction[]
  normalRecords: SavedPrediction[]
  pagination: PaginationState
} {
  const totalPages = Math.ceil(normalRecords.length / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    // 第一页显示置顶，其他页不显示
    pinnedRecords: page === 1 ? pinnedRecords : [],
    normalRecords: normalRecords.slice(start, end),
    pagination: {
      currentPage: page,
      pageSize,
      totalPages,
      totalRecords: normalRecords.length
    }
  }
}
```

### 8. 置顶功能

```typescript
/**
 * 切换置顶状态
 */
function togglePin(recordId: string): void {
  const data = getStorageData()
  
  // 在置顶和普通列表中查找记录
  let record = data.pinned.find(r => r.id === recordId)
  let isPinned = true
  
  if (!record) {
    record = data.normal.find(r => r.id === recordId)
    isPinned = false
  }
  
  if (!record) return
  
  if (isPinned) {
    // 取消置顶：从pinned移到normal
    data.pinned = data.pinned.filter(r => r.id !== recordId)
    record.isPinned = false
    delete record.pinnedAt
    data.normal.unshift(record)
  } else {
    // 置顶：从normal移到pinned
    data.normal = data.normal.filter(r => r.id !== recordId)
    record.isPinned = true
    record.pinnedAt = new Date().toISOString()
    data.pinned.unshift(record)
  }
  
  data.lastModified = new Date().toISOString()
  saveStorageData(data)
}
```

### 9. Excel导出功能

```typescript
import * as XLSX from 'xlsx'

/**
 * 导出所有记录为Excel文件
 */
function exportToExcel(): void {
  const data = getStorageData()
  const allRecords = [...data.pinned, ...data.normal]
  
  // Sheet 1: 详细记录表
  const mainData = allRecords.map((record, index) => ({
    '序号': index + 1,
    '报告编号': record.reportNumber,
    '记录名称': record.nickname,
    '是否置顶': record.isPinned ? '是' : '否',
    '预测时间': new Date(record.timestamp).toLocaleString('zh-CN'),
    'iAs': record.input.iAs,
    'MMA': record.input.MMA,
    'DMA': record.input.DMA,
    'CT_drug': record.input.CT_drug,
    '风险等级': 
      record.result.prediction.risk_level === 'high' ? '高风险' :
      record.result.prediction.risk_level === 'medium' ? '中风险' : '低风险',
    '风险概率': `${(record.result.prediction.probability * 100).toFixed(2)}%`,
    'tAs': record.result.metabolism.tAs.toFixed(2),
    'PMI': record.result.metabolism.PMI.toFixed(3),
    'SMI': record.result.metabolism.SMI.toFixed(3),
    'iAs%': `${record.result.metabolism.iAs_pct.toFixed(1)}%`,
    'MMA%': `${record.result.metabolism.MMA_pct.toFixed(1)}%`,
    'DMA%': `${record.result.metabolism.DMA_pct.toFixed(1)}%`,
    '主要风险因素': record.result.major_risk_factor
  }))
  
  // Sheet 2: 统计摘要
  const riskCount = {
    high: allRecords.filter(r => r.result.prediction.risk_level === 'high').length,
    medium: allRecords.filter(r => r.result.prediction.risk_level === 'medium').length,
    low: allRecords.filter(r => r.result.prediction.risk_level === 'low').length
  }
  
  const avgProb = allRecords.reduce((sum, r) => 
    sum + r.result.prediction.probability, 0) / allRecords.length
  const avgTAs = allRecords.reduce((sum, r) => 
    sum + r.result.metabolism.tAs, 0) / allRecords.length
  
  const summaryData = [
    { '统计项': '总记录数', '数值': allRecords.length },
    { '统计项': '置顶记录', '数值': data.pinned.length },
    { '统计项': '普通记录', '数值': data.normal.length },
    { '统计项': '', '数值': '' },
    { '统计项': '高风险记录', '数值': 
      `${riskCount.high} (${(riskCount.high / allRecords.length * 100).toFixed(1)}%)` },
    { '统计项': '中风险记录', '数值': 
      `${riskCount.medium} (${(riskCount.medium / allRecords.length * 100).toFixed(1)}%)` },
    { '统计项': '低风险记录', '数值': 
      `${riskCount.low} (${(riskCount.low / allRecords.length * 100).toFixed(1)}%)` },
    { '统计项': '', '数值': '' },
    { '统计项': '平均风险概率', '数值': `${(avgProb * 100).toFixed(2)}%` },
    { '统计项': '平均tAs浓度', '数值': `${avgTAs.toFixed(2)} ng/mL` }
  ]
  
  // 创建工作簿
  const wb = XLSX.utils.book_new()
  const ws1 = XLSX.utils.json_to_sheet(mainData)
  const ws2 = XLSX.utils.json_to_sheet(summaryData)
  
  XLSX.utils.book_append_sheet(wb, ws1, '预测记录')
  XLSX.utils.book_append_sheet(wb, ws2, '统计摘要')
  
  // 导出文件
  const filename = `ATO预测记录_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, filename)
  
  showNotification(`已导出 ${allRecords.length} 条记录到 ${filename}`, 'success')
}
```

### 10. JSON备份导出/导入

```typescript
/**
 * 导出JSON备份
 */
function exportJSONBackup(): void {
  const data = getStorageData()
  const allRecords = [...data.pinned, ...data.normal]
  
  const exportData = {
    version: data.version,
    exportTime: new Date().toISOString(),
    totalRecords: allRecords.length,
    records: allRecords
  }
  
  const json = JSON.stringify(exportData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `ato-history-backup-${Date.now()}.json`
  a.click()
  
  URL.revokeObjectURL(url)
}

/**
 * 导入JSON备份
 */
function importJSONBackup(file: File): void {
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result as string)
      
      // 验证格式
      if (!imported.records || !Array.isArray(imported.records)) {
        throw new Error('Invalid backup file format')
      }
      
      // 合并到现有数据（避免覆盖）
      const current = getStorageData()
      const merged = {
        version: current.version,
        pinned: [
          ...current.pinned, 
          ...imported.records.filter(r => r.isPinned)
        ],
        normal: [
          ...current.normal, 
          ...imported.records.filter(r => !r.isPinned)
        ],
        lastModified: new Date().toISOString()
      }
      
      // 去重（按reportNumber）
      merged.pinned = deduplicateByReportNumber(merged.pinned)
      merged.normal = deduplicateByReportNumber(merged.normal).slice(0, 200)
      
      saveStorageData(merged)
      
      showNotification(`成功导入${imported.records.length}条记录`, 'success')
    } catch (error) {
      showNotification('导入失败：文件格式错误', 'error')
    }
  }
  
  reader.readAsText(file)
}

/**
 * 根据报告编号去重
 */
function deduplicateByReportNumber(records: SavedPrediction[]): SavedPrediction[] {
  const seen = new Set<string>()
  return records.filter(record => {
    if (seen.has(record.reportNumber)) return false
    seen.add(record.reportNumber)
    return true
  })
}
```

### 11. LocalStorage工具函数

```typescript
const STORAGE_KEY = 'ato-predictions'

/**
 * 获取存储数据
 */
function getStorageData(): StorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return {
        version: '1.0.0',
        pinned: [],
        normal: [],
        lastModified: new Date().toISOString()
      }
    }
    return JSON.parse(data)
  } catch {
    return {
      version: '1.0.0',
      pinned: [],
      normal: [],
      lastModified: new Date().toISOString()
    }
  }
}

/**
 * 保存存储数据
 */
function saveStorageData(data: StorageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * 删除单条记录
 */
function deleteRecord(recordId: string): void {
  const data = getStorageData()
  
  data.pinned = data.pinned.filter(r => r.id !== recordId)
  data.normal = data.normal.filter(r => r.id !== recordId)
  data.lastModified = new Date().toISOString()
  
  saveStorageData(data)
}

/**
 * 批量删除记录
 */
function deleteRecords(recordIds: string[]): void {
  const data = getStorageData()
  const idSet = new Set(recordIds)
  
  data.pinned = data.pinned.filter(r => !idSet.has(r.id))
  data.normal = data.normal.filter(r => !idSet.has(r.id))
  data.lastModified = new Date().toISOString()
  
  saveStorageData(data)
}

/**
 * 清空所有记录
 */
function clearAllRecords(): void {
  const data: StorageData = {
    version: '1.0.0',
    pinned: [],
    normal: [],
    lastModified: new Date().toISOString()
  }
  saveStorageData(data)
}

/**
 * 重命名记录
 */
function renameRecord(recordId: string, newNickname: string): void {
  const data = getStorageData()
  
  let record = data.pinned.find(r => r.id === recordId)
  if (!record) {
    record = data.normal.find(r => r.id === recordId)
  }
  
  if (record) {
    record.nickname = newNickname
    data.lastModified = new Date().toISOString()
    saveStorageData(data)
  }
}
```

---

## 技术实现细节

### 1. 目录结构

```
ato-predictor/
├── app/
│   └── [locale]/
│       ├── history/
│       │   └── page.tsx                    # 历史记录页面主组件
│       └── predict/
│           └── page.tsx                    # 预测页面（已有）
├── components/
│   ├── predict/
│   │   ├── PredictionSuggestions.tsx       # 建议Tab（已有，需添加按钮）
│   │   ├── SaveRecordDialog.tsx            # 保存记录对话框（新增）
│   │   └── NewPredictionButton.tsx         # 新建预测按钮（新增）
│   └── history/
│       ├── HistoryHeader.tsx               # 页面头部（导出按钮等）
│       ├── SearchBar.tsx                   # 搜索栏
│       ├── QuickFilterTags.tsx             # 快速筛选标签
│       ├── FilterPanel.tsx                 # 筛选面板
│       ├── SortPanel.tsx                   # 排序面板
│       ├── BatchOperations.tsx             # 批量操作面板
│       ├── RecordCard.tsx                  # 记录卡片
│       ├── PaginationNav.tsx               # 分页导航
│       ├── DeleteConfirmDialog.tsx         # 删除确认对话框
│       ├── LimitWarningDialog.tsx          # 200条上限警告
│       └── RenameInput.tsx                 # 内联重命名输入框
├── lib/
│   ├── storage.ts                          # LocalStorage工具函数（新增）
│   ├── history-utils.ts                    # 历史记录工具函数（新增）
│   └── store.ts                            # Zustand状态管理（已有）
├── public/
│   └── locales/
│       ├── zh.json                         # 中文翻译（需扩展）
│       └── en.json                         # 英文翻译（需扩展）
└── types/
    └── history.ts                          # 历史记录类型定义（新增）
```

### 2. 依赖安装

```bash
# Excel导出库
npm install xlsx

# 类型定义
npm install --save-dev @types/node
```

### 3. 组件实现要点

#### A. SaveRecordDialog.tsx

**状态管理**:
```typescript
const [isOpen, setIsOpen] = useState(false)
const [nickname, setNickname] = useState('')
const [reportNumber] = useState(generateReportNumber())
const [saved, setSaved] = useState(false)
const [showLimitWarning, setShowLimitWarning] = useState(false)
const [recordsToDelete, setRecordsToDelete] = useState<SavedPrediction[]>([])
```

**保存流程**:
1. 用户点击"确认保存"
2. 调用 `saveRecordWithLimitCheck()`
3. 如果 `needsConfirmation === true`，显示上限警告对话框
4. 用户确认后调用 `confirmSaveWithDelete()`
5. 显示成功提示，1.5秒后关闭对话框

#### B. RecordCard.tsx

**Props**:
```typescript
interface RecordCardProps {
  record: SavedPrediction
  isSelected: boolean
  onSelect: (id: string) => void
  onViewDetail: (record: SavedPrediction) => void
  onDownloadPDF: (record: SavedPrediction) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
  onRename: (id: string, newName: string) => void
}
```

**重命名实现**:
```typescript
const [isRenaming, setIsRenaming] = useState(false)
const [tempName, setTempName] = useState(record.nickname)

const handleRename = () => {
  if (tempName.trim() && tempName !== record.nickname) {
    onRename(record.id, tempName.trim())
  }
  setIsRenaming(false)
}
```

#### C. HistoryPage主组件状态

```typescript
const [records, setRecords] = useState<SavedPrediction[]>([])
const [searchQuery, setSearchQuery] = useState('')
const [filters, setFilters] = useState<FilterOptions>({
  riskLevels: [],
  dateRange: {},
  probabilityRange: { min: 0, max: 100 }
})
const [sortBy, setSortBy] = useState<SortOption>('date-newest')
const [currentPage, setCurrentPage] = useState(1)
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
```

**数据处理流程**:
```
原始数据 → 搜索过滤 → 条件筛选 → 排序 → 分页 → 渲染
```

### 4. 国际化（i18n）翻译键

#### zh.json 新增部分

```json
{
  "history": {
    "title": "历史记录",
    "exportExcel": "导出Excel",
    "exportBackup": "导出备份",
    "clearAll": "清空全部",
    "search": "搜索名称或编号",
    "quickFilters": {
      "high": "高风险",
      "medium": "中风险",
      "low": "低风险",
      "pinned": "置顶",
      "today": "今天",
      "thisWeek": "本周"
    },
    "filter": {
      "title": "筛选",
      "allRisks": "全部风险",
      "dateRange": "日期范围",
      "all": "全部",
      "today": "今天",
      "last7Days": "近7天",
      "last30Days": "近30天",
      "custom": "自定义",
      "probRange": "概率区间"
    },
    "sort": {
      "title": "排序",
      "dateNewest": "日期最新",
      "dateOldest": "日期最旧",
      "riskAsc": "风险升序",
      "riskDesc": "风险降序",
      "probAsc": "概率升序",
      "probDesc": "概率降序"
    },
    "batch": {
      "selectAll": "全选",
      "deleteSelected": "删除选中"
    },
    "card": {
      "viewDetail": "查看详情",
      "downloadPDF": "下载PDF",
      "delete": "删除",
      "pin": "置顶",
      "unpin": "取消置顶",
      "rename": "重命名"
    },
    "pagination": {
      "prev": "上一页",
      "next": "下一页",
      "page": "第 {current} 页 / 共 {total} 页",
      "records": "共 {normal} 条普通记录 + {pinned} 条置顶记录"
    },
    "warnings": {
      "privacy": "数据仅保存在本浏览器，不会上传服务器",
      "dataLoss": "清除浏览器缓存、更换设备或浏览器会丢失所有记录",
      "limit": "最多保存200条普通记录（置顶记录不计入限制）",
      "backup": "建议定期导出Excel或PDF备份",
      "public": "如在公共电脑使用，请使用后点击"清空全部""
    }
  },
  "saveRecord": {
    "title": "保存预测记录",
    "reportNumber": "记录编号",
    "predictTime": "预测时间",
    "nicknamePlaceholder": "例如：患者A-第1次随访",
    "nicknameHint": "留空则使用默认名称",
    "privacyWarning": "隐私提醒",
    "privacyNote1": "请勿在名称中填写患者真实姓名、身份证号等敏感信息",
    "privacyNote2": "如在公共电脑使用，建议使用后清除所有记录",
    "dataProtection": "数据保护",
    "dataNote1": "数据仅保存在本浏览器，不会上传到服务器",
    "dataNote2": "清除浏览器数据或更换设备后，记录会丢失",
    "dataNote3": "建议定期下载PDF报告作为永久存档",
    "dataNote4": "上限200条，超过后自动删除最旧记录（置顶除外）",
    "viewHint": "保存后可在【导航栏 - 历史记录】中查看",
    "cancel": "取消",
    "confirm": "确认保存",
    "saved": "保存成功！"
  }
}
```

### 5. 响应式设计

**断点**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile适配**:
- 筛选/排序面板改为抽屉式弹出
- 记录卡片堆叠显示
- 操作按钮改为图标按钮
- 分页导航简化为"上一页/下一页"

**Tablet适配**:
- 筛选面板收起，点击展开
- 记录卡片保持完整布局
- 分页导航显示5个页码

**Desktop适配**:
- 完整三列布局（筛选+内容+排序）
- 记录卡片水平排列信息
- 分页导航完整显示

---

## 实施计划

### 第一阶段：核心功能（4小时）

**目标**: 基础保存和列表功能

#### 任务清单:
1. ✅ 创建数据类型定义 `types/history.ts`
2. ✅ 实现LocalStorage工具函数 `lib/storage.ts`
3. ✅ 实现保存记录对话框 `SaveRecordDialog.tsx`
4. ✅ 修改建议Tab，添加三个按钮
5. ✅ 创建历史记录页面基础布局 `app/[locale]/history/page.tsx`
6. ✅ 实现记录卡片组件 `RecordCard.tsx`
7. ✅ 实现基础分页功能 `PaginationNav.tsx`
8. ✅ 实现置顶功能
9. ✅ 添加导航栏入口

**验收标准**:
- 用户可以保存预测记录
- 历史记录页面能显示已保存的记录
- 置顶记录显示在第一页顶部
- 分页正确显示（每页20条）
- 可以删除单条记录

### 第二阶段：增强功能（2.5小时）

**目标**: 搜索、筛选、排序、批量操作

#### 任务清单:
1. ✅ 实现搜索栏 `SearchBar.tsx`
2. ✅ 实现快速筛选标签 `QuickFilterTags.tsx`
3. ✅ 实现筛选面板 `FilterPanel.tsx`
4. ✅ 实现排序面板 `SortPanel.tsx`
5. ✅ 实现批量操作 `BatchOperations.tsx`
6. ✅ 实现批量删除确认对话框 `DeleteConfirmDialog.tsx`
7. ✅ 集成所有筛选和排序逻辑

**验收标准**:
- 搜索功能正常工作
- 快速筛选标签一键应用筛选
- 多条件筛选正确组合
- 6种排序规则正确执行
- 批量删除有二次确认

### 第三阶段：导出功能（2小时）

**目标**: Excel和JSON导出/导入

#### 任务清单:
1. ✅ 安装xlsx依赖
2. ✅ 实现Excel导出功能
3. ✅ 实现JSON备份导出
4. ✅ 实现JSON备份导入
5. ✅ 实现页面头部导出按钮
6. ✅ 测试导出文件格式正确性

**验收标准**:
- Excel导出包含两个Sheet
- Excel格式符合设计要求
- JSON备份可导入恢复
- 导入去重逻辑正确

### 第四阶段：优化细节（1.5小时）

**目标**: 200条限制、重命名、提示优化

#### 任务清单:
1. ✅ 实现200条上限检查和确认对话框 `LimitWarningDialog.tsx`
2. ✅ 实现内联重命名功能 `RenameInput.tsx`
3. ✅ 添加所有隐私和数据保护提示
4. ✅ 实现"新建预测"按钮
5. ✅ 优化所有用户提示文案
6. ✅ 响应式适配（Mobile/Tablet）
7. ✅ 完整测试所有功能

**验收标准**:
- 超过200条时弹出确认对话框
- 重命名交互流畅
- 所有提示文案到位
- 移动端布局正常

---

## 测试清单

### 功能测试

#### 保存记录
- [ ] 保存记录对话框正确显示报告编号和时间
- [ ] 默认名称自动生成
- [ ] 自定义名称可保存
- [ ] 隐私提醒和数据保护说明正确显示
- [ ] 保存成功后显示提示并跳转到历史记录页

#### 200条上限
- [ ] 普通记录达到200条时触发警告
- [ ] 警告对话框显示将被删除的记录列表
- [ ] 用户确认后正确删除最旧的记录
- [ ] 置顶记录不计入200条限制
- [ ] 置顶记录不会被自动删除

#### 历史记录页面
- [ ] 第一页正确显示置顶记录和前20条普通记录
- [ ] 置顶记录和普通记录用横线分隔
- [ ] 第二页及以后不显示置顶记录
- [ ] 分页导航正确计算总页数
- [ ] 页码跳转正确

#### 搜索功能
- [ ] 搜索名称正确匹配
- [ ] 搜索编号正确匹配
- [ ] 部分匹配正确工作
- [ ] 不区分大小写
- [ ] 清空搜索框恢复全部记录

#### 筛选功能
- [ ] 风险等级筛选（多选）正确工作
- [ ] 日期快捷选项（今天/近7天/近30天）正确
- [ ] 自定义日期范围筛选正确
- [ ] 概率区间筛选正确
- [ ] 多条件组合筛选正确

#### 快速筛选标签
- [ ] 所有标签显示正确的计数
- [ ] 点击标签正确应用筛选
- [ ] 标签计数实时更新

#### 排序功能
- [ ] 日期最新/最旧排序正确
- [ ] 风险升序/降序排序正确
- [ ] 概率升序/降序排序正确
- [ ] 置顶记录始终在前且不受排序影响

#### 置顶功能
- [ ] 点击"置顶"正确将记录移到置顶区
- [ ] 点击"取消置顶"正确将记录移回普通区
- [ ] 置顶记录按置顶时间降序排列
- [ ] 置顶记录在第一页顶部显示

#### 批量操作
- [ ] 全选正确选中当前页所有普通记录
- [ ] 批量删除弹出确认对话框
- [ ] 确认对话框显示将被删除的记录列表
- [ ] 批量删除成功后刷新列表

#### 单条操作
- [ ] 查看详情正确跳转到结果页面
- [ ] 下载PDF正确生成PDF文件
- [ ] 删除记录弹出确认对话框
- [ ] 删除成功后刷新列表

#### 重命名功能
- [ ] 点击✏️图标进入编辑模式
- [ ] 输入框显示当前名称
- [ ] 按Enter保存新名称
- [ ] 按Esc取消编辑
- [ ] 失焦时保存新名称
- [ ] 空名称不保存

#### 导出功能
- [ ] Excel导出包含两个Sheet
- [ ] Sheet1包含所有字段且格式正确
- [ ] Sheet2统计数据正确
- [ ] JSON备份文件格式正确
- [ ] JSON导入功能正确恢复数据
- [ ] 导入去重逻辑正确

#### 新建预测
- [ ] 点击"新建预测"弹出确认对话框
- [ ] 确认后清空当前预测数据
- [ ] 跳转到输入Tab

### 数据持久化测试
- [ ] 保存记录后刷新页面，数据仍然存在
- [ ] 关闭浏览器重新打开，数据仍然存在
- [ ] 清除LocalStorage后，数据被清空
- [ ] 数据结构符合StorageData定义

### 边界测试
- [ ] 0条记录时显示空状态提示
- [ ] 1条记录时分页正确
- [ ] 刚好20条记录时分页正确
- [ ] 200条记录上限正确触发
- [ ] 记录名称最多50字符
- [ ] 搜索空字符串返回全部
- [ ] 筛选条件全部清空返回全部

### 性能测试
- [ ] 200条记录加载时间 < 1秒
- [ ] 搜索响应时间 < 100ms
- [ ] 筛选响应时间 < 100ms
- [ ] 排序响应时间 < 100ms
- [ ] 分页切换即时响应
- [ ] Excel导出200条记录 < 2秒

### 兼容性测试
- [ ] Chrome浏览器正常
- [ ] Edge浏览器正常
- [ ] Firefox浏览器正常
- [ ] Safari浏览器正常（Mac）
- [ ] Mobile Chrome正常
- [ ] Mobile Safari正常

### 响应式测试
- [ ] Desktop (>1024px) 三列布局正常
- [ ] Tablet (768-1024px) 收起式布局正常
- [ ] Mobile (<768px) 抽屉式布局正常

---

## 注意事项

### 安全和隐私
1. **敏感信息提醒**: 保存对话框必须醒目提示不要填写患者真实姓名和身份证号
2. **公共电脑提醒**: 多处提示公共电脑使用后需清空
3. **数据不上传**: 明确说明数据仅保存在本地浏览器
4. **无跨设备同步**: 明确说明更换设备后数据丢失

### 用户体验
1. **操作确认**: 所有删除操作必须有二次确认
2. **即时反馈**: 所有操作后立即显示成功/失败提示
3. **加载状态**: 导出等耗时操作显示Loading状态
4. **空状态**: 0条记录时显示友好的空状态提示

### 数据完整性
1. **上限检查**: 严格执行200条上限，超限必须用户确认
2. **去重逻辑**: 导入时按reportNumber去重
3. **数据验证**: 导入JSON时验证数据格式
4. **错误恢复**: 存储失败时不破坏现有数据

### 性能优化
1. **虚拟滚动**: 如果记录卡片过多，考虑虚拟滚动
2. **防抖搜索**: 搜索输入防抖300ms
3. **懒加载**: 分页数据按需加载
4. **缓存筛选**: 相同筛选条件不重复计算

---

## 未来扩展方向

### 短期（可选）
1. **导出PDF汇总报告**: 将多条记录合并为一份PDF
2. **记录对比功能**: 选择2-3条记录进行对比分析
3. **风险趋势图**: 如果同一患者有多条记录，绘制趋势曲线

### 中期（需评估）
1. **云端备份**: 提供可选的云端加密备份
2. **多设备同步**: 通过账号系统同步数据
3. **团队协作**: 医生之间分享记录（需权限控制）

### 长期（需讨论）
1. **AI建议**: 根据历史记录提供治疗建议
2. **统计分析**: 批量分析多条记录的统计规律
3. **随访提醒**: 根据记录时间自动提醒随访

---

## 附录

### A. 风险等级颜色规范

```typescript
const RISK_COLORS = {
  low: {
    text: 'text-green-600',      // #10B981
    bg: 'bg-green-100',           // #D1FAE5
    border: 'border-green-500',   // #22C55E
    hex: '#10B981'
  },
  medium: {
    text: 'text-yellow-600',     // #F59E0B
    bg: 'bg-yellow-100',          // #FEF3C7
    border: 'border-yellow-500',  // #EAB308
    hex: '#F59E0B'
  },
  high: {
    text: 'text-red-600',        // #EF4444
    bg: 'bg-red-100',             // #FEE2E2
    border: 'border-red-500',     // #F87171
    hex: '#EF4444'
  }
}
```

### B. 日期格式规范

- **显示格式**: `YYYY-MM-DD HH:mm:ss` (2026-08-20 14:30:15)
- **存储格式**: ISO 8601 (2026-08-20T14:30:15.000Z)
- **文件名格式**: `YYYY-MM-DD` (2026-08-20)

### C. 文件命名规范

- **Excel导出**: `ATO预测记录_YYYY-MM-DD.xlsx`
- **JSON备份**: `ato-history-backup-{timestamp}.json`
- **PDF报告**: `ATO-YYYYMMDD-XXXXXX.pdf` (已有)

### D. 错误处理规范

1. **LocalStorage写入失败**: 提示"存储空间不足，请清理浏览器缓存"
2. **JSON解析失败**: 提示"备份文件格式错误"
3. **导出失败**: 提示"导出失败，请重试"
4. **删除失败**: 提示"删除失败，请刷新页面后重试"

---

## 总结

本文档详细描述了ATO心脏毒性预测系统的历史记录功能设计方案，包括：

✅ **核心需求**: 保存记录、历史列表、搜索筛选、批量操作  
✅ **数据管理**: 200条上限、置顶功能、分页显示  
✅ **导出功能**: Excel导出、JSON备份  
✅ **用户体验**: 隐私保护、操作确认、即时反馈  
✅ **技术实现**: 数据结构、核心逻辑、组件设计  
✅ **实施计划**: 4阶段开发，共8小时  
✅ **测试清单**: 功能、性能、兼容性全面测试

**关键决策记录**:
1. ✅ 使用LocalStorage而非服务器存储（隐私优先）
2. ✅ 置顶记录不计入200条限制（重要记录保护）
3. ✅ 分页每页20条，置顶仅第一页显示（清晰布局）
4. ✅ 超过200条需用户确认删除（避免数据丢失）
5. ✅ 导出Excel+JSON双格式（统计分析+备份恢复）
6. ❌ 不实现悬停预览（避免性能负担）
7. ❌ 不实现趋势图表（降低复杂度）

**预期效果**:
- 医生可以便捷保存和查看历史预测记录
- 支持快速筛选和对比患者风险变化
- 数据隐私安全，符合医疗规范
- 用户体验流畅，操作符合直觉

---

**文档版本**: v1.0  
**创建时间**: 2026-08-21  
**最后更新**: 2026-08-21  
**状态**: ✅ 已确认，待实施
