# ATO 心毒性风险预测工具 - 开发进度

**最后更新：** 2026-08-16 14:30  
**当前阶段：** Phase 1 - 项目初始化 ✅ 完成  

---

## ✅ 已完成的工作

### Phase 1: 项目初始化（已完成 100%）

#### 1. 项目创建 ✅
- [x] 创建 Next.js 14 项目（TypeScript + TailwindCSS + App Router）
- [x] Node.js 版本：v24.15.0
- [x] npm 版本：11.12.1

#### 2. 依赖安装 ✅
- [x] 基础依赖（Next.js, React, TypeScript）
- [x] UI 组件库依赖
  - recharts（图表）
  - framer-motion（动画）
- [x] 表单处理
  - react-hook-form
  - zod
  - @hookform/resolvers
- [x] 状态管理
  - zustand
- [x] PDF 生成
  - jspdf
  - html2canvas
- [x] 多语言
  - next-intl
- [x] 工具库
  - clsx
  - tailwind-merge
  - class-variance-authority
  - lucide-react

#### 3. 目录结构创建 ✅
```
ato-predictor/
├── app/                      ✅ 已创建
├── components/
│   ├── layout/              ✅ 已创建
│   ├── home/                ✅ 已创建
│   ├── predict/             ✅ 已创建
│   ├── upload/              ✅ 已创建
│   └── ui/                  ✅ 已创建（3个组件完成）
├── lib/                      ✅ 已创建
├── types/                    ✅ 已创建
├── public/
│   ├── images/              ✅ 已创建（8个占位符）
│   └── locales/             ✅ 已创建（中英文）
└── ...
```

#### 4. 配置文件 ✅
- [x] `globals.css` - 自定义 CSS 变量和颜色
- [x] `next.config.ts` - Next.js 配置（集成 next-intl）
- [x] `i18n.ts` - 国际化配置
- [x] `middleware.ts` - 国际化中间件

#### 5. 工具文件 ✅
- [x] `lib/utils.ts` - 通用工具函数
- [x] `lib/store.ts` - Zustand 状态管理
- [x] `types/prediction.ts` - TypeScript 类型定义

#### 6. UI 组件 ✅
- [x] `Button.tsx` - 按钮组件（4种变体）
- [x] `Card.tsx` - 卡片组件
- [x] `Input.tsx` - 输入框组件

#### 7. 占位符资源 ✅
- [x] `logo.svg` - 主 Logo（200x80）
- [x] `logo-white.svg` - 白色 Logo
- [x] `placeholder-avatar.svg` - 头像占位符（200x200）
- [x] `placeholder-team.svg` - 团队合照占位符（1200x300）
- [x] `hospital-logo.svg` - 医院 Logo（150x60）
- [x] `university-logo.svg` - 大学 Logo（150x60）
- [x] `lab-logo.svg` - 实验室 Logo（150x60）
- [x] `beian-icon.svg` - 公安备案图标（16x16）

#### 8. 多语言文件 ✅
- [x] `zh.json` - 中文翻译（完整）
- [x] `en.json` - 英文翻译（完整）

---

## 🎯 下一步工作：Phase 2 - 布局组件开发

### 任务清单

#### 1. Header 组件（30 分钟）
- [ ] 创建 `components/layout/Header.tsx`
  - [ ] Logo 展示
  - [ ] 导航菜单（首页|关于|算法|隐私|免责|联系）
  - [ ] 语言切换按钮
  - [ ] 响应式设计

#### 2. Footer 组件（30 分钟）
- [ ] 创建 `components/layout/Footer.tsx`
  - [ ] 深色背景（#1A1A1A）
  - [ ] 左侧：Logo + 简介文字
  - [ ] 右侧：快速链接
  - [ ] 机构 Logo 展示区
  - [ ] Copyright 信息
  - [ ] ICP 备案号
  - [ ] 公安备案号（带图标）

#### 3. 语言切换组件（15 分钟）
- [ ] 创建 `components/layout/LanguageSwitcher.tsx`
  - [ ] 中/EN 切换按钮
  - [ ] 使用 next-intl 切换语言
  - [ ] 保存用户偏好

#### 4. 根布局（15 分钟）
- [ ] 创建 `app/[locale]/layout.tsx`
  - [ ] 集成 Header
  - [ ] 集成 Footer
  - [ ] 设置字体和元数据

---

## 📂 项目文件统计

**总文件数：** 26 个

**代码文件：**
- TypeScript/TSX: 9 个
- JSON: 2 个
- CSS: 1 个
- SVG: 8 个
- Markdown: 6 个

**代码行数（估算）：**
- TypeScript: ~600 行
- JSON: ~200 行
- CSS: ~80 行

---

## 🛠️ 技术栈确认

### 前端
- ✅ Next.js 14（App Router）
- ✅ React 18
- ✅ TypeScript
- ✅ TailwindCSS（v4 配置方式）
- ✅ next-intl（多语言）
- ✅ Zustand（状态管理）
- ✅ Framer Motion（动画，待使用）
- ✅ Recharts（图表，待使用）

### 开发工具
- ✅ ESLint
- ✅ Git

### 设计系统
- ✅ 色彩：NHS 蓝（#005EB8）
- ✅ 字体：PingFang SC / Inter
- ✅ 组件库：自定义 UI 组件

---

## 🎨 设计规范实现

### 色彩变量（已配置）
```css
--primary: #005EB8          ✅
--primary-dark: #003D7A     ✅
--primary-light: #41B6E6    ✅
--success: #007F3B          ✅
--warning: #ED8B00          ✅
--danger: #DA291C           ✅
--info: #41B6E6             ✅
```

### 组件状态
- Button: 4 种变体（primary, secondary, danger, ghost） ✅
- Card: 悬停动画 ✅
- Input: 错误状态 ✅

---

## 🚀 启动项目

```bash
cd "C:/Users/DELL/OneDrive/桌面/20250730_ATO心毒性临床预警模型/Shiny框架/ato-predictor"

# 开发模式
npm run dev

# 浏览器访问
http://localhost:3000
```

---

## 📝 重要说明

### 关于占位符
1. **图片占位符**
   - 所有图片使用 SVG 格式创建
   - 可直接替换为真实图片（PNG/JPG）
   - 路径保持不变：`/images/xxx.svg` → `/images/xxx.png`

2. **文案占位符**
   - 标记为 `[占位符: XXX]` 的内容
   - 在语言文件中搜索 "占位符" 即可找到所有需要替换的位置

3. **备案号占位符**
   - ICP备案号：`黑ICP备XXXXX号`
   - 公安备案号：`黑公网安备 XXXXX号`
   - 在 `zh.json` 和 `en.json` 中替换

### 关于图片本地化
- ✅ 所有图片存储在 `public/images/`
- ✅ 不依赖任何外部 CDN
- ✅ 国内外均可访问
- ✅ 使用 Next.js Image 组件优化

### 关于公安备案
- ✅ 备案图标位于 `/images/beian-icon.svg`
- ✅ 图标显示在公安备案号左侧
- ✅ Footer 组件中实现

---

## ⏰ 预计时间安排

**Phase 1（已完成）：** 1.5 小时  
**Phase 2（下一步）：** 1.5 小时  
**Phase 3（首页）：** 2 小时  
**Phase 4（计算界面）：** 3 小时  
**Phase 5（R API）：** 2 小时  
**Phase 6（集成测试）：** 1 小时  

**总计：** 约 11 小时

---

## 🎯 立即开始 Phase 2

准备好开始开发布局组件了吗？

**下一个任务：** 创建 Header 组件

**预计用时：** 30 分钟

**需要的文件：**
1. `components/layout/Header.tsx`
2. `components/layout/LanguageSwitcher.tsx`

**开始命令：**
```bash
npm run dev
```

---

**项目状态：** 🟢 进展顺利  
**准备就绪：** ✅ 可以开始 Phase 2
