# ATO Cardiotoxicity Risk Predictor - 项目交接文档

**项目名称：** 砷剂心脏毒性风险预测工具  
**英文名称：** ATO Cardiotoxicity Risk Predictor  
**版本：** 2.0 (Next.js 重构版)  
**创建日期：** 2026-08-15  
**最后更新：** 2026-08-15  

---

## 📑 文档导航

1. [项目概述](#1-项目概述)
2. [核心需求](#2-核心需求)
3. [技术栈](#3-技术栈)
4. [系统架构](#4-系统架构)
5. [设计规范](#5-设计规范)
6. [功能模块](#6-功能模块)
7. [数据库设计](#7-数据库设计)
8. [部署方案](#8-部署方案)
9. [性能优化](#9-性能优化)
10. [开发计划](#10-开发计划)

---

## 1. 项目概述

### 1.1 项目背景

**临床问题：**
- 砷剂（ATO）是治疗急性早幼粒细胞白血病（APL）的有效药物
- 但可能引发心脏毒性副作用
- 需要通过砷代谢参数和临床指标预测心毒性风险

**项目目标：**
- 为医生、研究者提供在线风险评估工具
- 输入患者的砷代谢数据（iAs、MMA、DMA）和合并用药信息
- 输出心毒性发生概率、风险因素分析、个性化建议

**用户群体：**
- 主要：临床医生（在诊室使用桌面电脑）
- 次要：研究者、患者
- 预期同时在线：100 人左右

### 1.2 项目现状

**当前版本（V1.0）：**
- 框架：R Shiny + shinydashboard
- 部署：阿里云
- 问题：
  - ❌ UI 过时、不够现代
  - ❌ 首次加载慢（30 秒）
  - ❌ 每次计算慢（5-15 秒）
  - ❌ 缺乏首页门户
  - ❌ 缺乏多语言支持

**升级目标（V2.0）：**
- ✅ 现代化 UI（参考 MDCalc、PREDICT、ASCVD）
- ✅ 性能优化（缓存机制）
- ✅ 门户式首页
- ✅ 中英文切换
- ✅ 下载 PDF、计算历史等功能

---

## 2. 核心需求

### 2.1 功能需求

#### 2.1.1 首页（Landing Page）

**参考网站：** MDCalc (https://www.mdcalc.com/)

**布局要求：**
```
┌────────────────────────────────────────────────────┐
│ [Logo] 标题             [导航栏]      [语言: 中|EN] │
├────────────────────────────────────────────────────┤
│                                                    │
│         Welcome to ATO Cardiotoxicity              │
│              Risk Predictor                        │
│                                                    │
│   (小字) Arsenic predict cardiotoxicity risk...    │
│                                                    │
│  ┌──────────┐  ┌─────────────────┐  ┌─────────┐  │
│  │  ℹ️ 项目  │  │  🎯 开始计算     │  │ 📤 数据 │  │
│  │   简介   │  │  (大号动画按钮)  │  │  上传   │  │
│  └──────────┘  └─────────────────┘  └─────────┘  │
│                                                    │
├────────────────────────────────────────────────────┤
│  【项目简介区】                                     │
│  项目背景、意义、使用方法等...                      │
│                    [开始预测 →]                    │
├────────────────────────────────────────────────────┤
│  【团队介绍卡片】                                   │
│  左：负责人头像                                     │
│  右上：姓名、职称、介绍                             │
│  右下：团队合照（长条形）                           │
├────────────────────────────────────────────────────┤
│  【深色底部】                                       │
│  左：Logo + 简介文字                               │
│  右：快速链接（关于、算法、Contact）               │
│                                                    │
│  [医院Logo] [学校Logo] [实验室Logo]                │
│                                                    │
│  Copyright © 2026 | ICP备案号 [备案图标]           │
└────────────────────────────────────────────────────┘
```

**核心元素：**
1. ✅ Logo 在左上角（可点击返回首页）
2. ✅ 导航栏：首页 | 关于 | 算法 | 隐私政策 | 免责声明 | Contact Us
3. ✅ 语言切换按钮（中/EN）
4. ✅ 三个入口按钮（计算最突出，蓝色/绿色，大号，带动画）
5. ✅ 项目简介区（可展开/收起）
6. ✅ 团队介绍卡片
7. ✅ 深色底部区（Logo、快速链接、机构 Logo、备案信息）

#### 2.1.2 计算界面（Prediction Tool）

**参考网站：** ASCVD Risk Estimator + PREDICT

**布局方式：** Tab 导航 + 实时反馈

**Tab 结构：**
```
[💊 输入] | [📊 结果] | [🔍 详细分析] | [💡 建议]
```

**输入 Tab：**
- 表单字段：
  - iAs (ng/mL) - 无机砷
  - MMA (ng/mL) - 一甲基砷酸
  - DMA (ng/mL) - 二甲基砷酸
  - 合并心毒性药物：Yes/No（下拉选择）
- 心毒性药物列表（参考表格）
- [计算心毒性风险] 按钮（大号、蓝色）
- 点击后：
  - 显示进度条（"计算中... 请稍候"）
  - 后端调用 R 模型（通过 API）
  - 计算完成后：右下角弹窗提示 "✓ 计算完成"（3秒消失）
  - 自动跳转到"结果" Tab

**结果 Tab：**
- 风险百分比（大号数字 + 心脏动画）
- 风险等级：
  - 低风险（<20%）：绿色
  - 中风险（20-50%）：橙色
  - 高风险（>50%）：红色
- 砷代谢参数：
  - tAs（总砷）
  - PMI（一级甲基化指数）
  - SMI（二级甲基化指数）
  - iAs%、MMA%、DMA%

**详细分析 Tab：**
- 主要风险因素饼图（Donut Chart）
  - 显示各风险因素的相对贡献度
  - 因素：CT_drug、tAs、MMA%、SMI、DMA%
  - 标注主要风险因素
- SHAP 值柱状图（横向柱状图）
  - 正值（粉色）：促进心毒性
  - 负值（蓝色）：抑制心毒性
  - 按 SHAP 值大小排序
- 砷代谢参数定义图示
  - 化学式和代谢路径图
  - 参数计算公式说明

**建议 Tab：**
- 心毒性药物列表（DataTable）
  - 药物名称
  - 药物分类
  - 可搜索、可排序
- 针对性建议表格
  - 主要风险因素 → 对应建议
  - 例如：CT_drug → 药物调整建议
  - 例如：tAs 高 → 咨询医生调整砷剂剂量

**通用功能：**
- ✅ [下载 PDF 报告] 按钮（每个 Tab 右上角）
- ✅ [返回首页] 按钮
- ✅ 计算历史记录（侧边栏，最近 5 条）

#### 2.1.3 数据上传界面（Data Upload）

**目标用户：** 医生、研究者

**功能：**
- 批量上传患者数据（Excel/CSV 模板）
- 提供模板下载
- 数据验证（格式、范围检查）
- 保存到 SQLite 数据库用于研究
- 上传记录表（时间、文件名、记录数）

**布局：**
```
┌──────────────────────────────────────┐
│  [返回首页]  数据上传                 │
├──────────────────────────────────────┤
│  说明：上传的数据将用于科研目的...    │
│                                      │
│  [下载模板文件]                       │
│                                      │
│  [选择文件] 或 拖拽文件到此处          │
│                                      │
│  患者信息表单（可选）：               │
│  - 性别、年龄、吸烟史、饮酒史...      │
│  - iAs、MMA、DMA                    │
│  - 心毒性结局（Yes/No/NA）           │
│                                      │
│  附加说明（文本框，可选）              │
│                                      │
│  [提交] [清空]                        │
│                                      │
│  上传历史（最近 10 条）：              │
│  时间 | 文件名 | 记录数               │
└──────────────────────────────────────┘
```

#### 2.1.4 静态页面

**关于页面（About）：**
- 项目背景
- 研究团队
- 参考文献
- 联系方式

**算法页面（Algorithm）：**
- 模型介绍（AORSF - Accelerated Oblique Random Survival Forest）
- 特征选择方法
- 模型性能指标
- 验证结果

**隐私政策（Privacy Policy）：**
- 数据收集说明
- 数据使用目的
- 数据安全保障
- 用户权利

**免责声明（Disclaimer）：**
- 工具用途声明
- 临床决策警告（需医生指导）
- 责任限制

**联系我们（Contact Us）：**
- 邮箱
- 地址（哈尔滨医科大学附属第一医院）
- 表单提交（可选）

**页面模板（参考 PREDICT Contact）：**
```
┌──────────────────────────────────────┐
│  [Logo]           [导航]   [语言]    │
├──────────────────────────────────────┤
│                                      │
│         【页面标题】                  │
│                                      │
│    （内容区域，最大宽度 800px）       │
│                                      │
├──────────────────────────────────────┤
│  [医院Logo] [学校Logo] [实验室Logo]  │
│                                      │
│  Copyright © 2026 | ICP备案号        │
└──────────────────────────────────────┘
```

### 2.2 非功能需求

#### 2.2.1 性能要求

**加载时间：**
- 首页首次加载：< 3 秒
- 页面切换：< 1 秒
- 模型计算：5-15 秒（不可避免，因 R 模型）

**优化策略：**
1. ✅ 模型预加载（服务器启动时加载 .rds 文件）
2. ✅ 结果缓存（相同输入直接返回缓存结果）
3. ✅ 图片懒加载
4. ✅ 代码分割（Next.js 自动）
5. ✅ CDN 加速（静态资源）

**并发支持：**
- 目标：100 人同时在线
- 策略：
  - 异步处理 R 计算请求
  - 队列机制（避免服务器过载）
  - 计算进度提示

#### 2.2.2 兼容性要求

**浏览器：**
- Chrome 90+（主要）
- Edge 90+
- Firefox 88+
- Safari 14+

**设备：**
- 主要：桌面电脑（1920x1080）
- 次要：笔记本（1366x768）
- 不考虑：手机、平板

**语言：**
- 中文（简体）
- 英文（English）
- 切换按钮在导航栏右侧

#### 2.2.3 安全要求

**数据安全：**
- HTTPS 加密传输
- 敏感数据不在前端存储
- 上传数据隔离存储（仅研究用）

**输入验证：**
- 前端：字段类型、范围检查
- 后端：二次验证、SQL 注入防护

**备案合规：**
- ICP 备案号展示
- 备案图标链接
- 隐私政策完整

---

## 3. 技术栈

### 3.1 前端技术栈

**核心框架：**
```
Next.js 14 (App Router)
├── React 18
├── TypeScript
└── TailwindCSS 3
```

**UI 组件库：**
```
shadcn/ui (推荐)
├── Radix UI (底层)
├── class-variance-authority
└── tailwind-merge
```

**图表库：**
```
Recharts (推荐)
├── 响应式
├── 易于定制
└── 与 React 集成良好
```

**动画库：**
```
Framer Motion
├── 页面过渡动画
├── 按钮悬停效果
└── Tab 切换动画
```

**国际化：**
```
next-intl
├── 路由级多语言
├── 服务端渲染支持
└── 静态生成支持
```

**状态管理：**
```
Zustand (轻量级)
├── 计算结果缓存
├── 语言切换状态
└── 用户偏好设置
```

**表单处理：**
```
React Hook Form
├── 性能优化
├── 验证集成
└── TypeScript 支持
```

**PDF 生成：**
```
jsPDF + html2canvas
├── 客户端生成
├── 自定义模板
└── 图表支持
```

### 3.2 后端技术栈

**API 框架：**
```
R Plumber
├── RESTful API
├── 与 R 生态无缝集成
└── 简单部署
```

**模型调用：**
```
现有 R 代码
├── optim_wflow_last_fit.rds（已训练模型）
├── tidymodels 生态
├── aorsf (AORSF 算法)
├── kernelshap (SHAP 值计算)
└── ggplot2 (图表生成，可选)
```

**数据库：**
```
SQLite
├── 轻量级
├── 零配置
├── 文件型数据库
└── 足够支持 100 并发
```

**缓存：**
```
R memoise 包
├── 函数级缓存
├── 相同输入返回缓存结果
└── 显著提升响应速度
```

### 3.3 部署技术栈

**服务器：**
```
阿里云 ECS
├── 操作系统：Ubuntu 22.04 LTS
├── CPU：4 核（推荐）
├── 内存：8GB（推荐，R 计算占用高）
└── 存储：40GB SSD
```

**Web 服务器：**
```
Nginx
├── 反向代理（Next.js + R Plumber）
├── SSL 终止
├── 静态资源服务
└── Gzip 压缩
```

**进程管理：**
```
PM2 (Node.js)
Systemd (R Plumber)
├── 自动重启
├── 日志管理
└── 负载均衡（可选）
```

**域名与证书：**
```
域名：（待定）
SSL：Let's Encrypt (免费)
CDN：阿里云 CDN（可选）
```

---

## 4. 系统架构

### 4.1 整体架构图

```
┌─────────────────────────────────────────────────────┐
│                    用户浏览器                        │
│              (Chrome/Edge/Firefox/Safari)           │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS
                   ↓
┌─────────────────────────────────────────────────────┐
│                  Nginx (80/443)                     │
│  ├── SSL 终止                                       │
│  ├── 反向代理                                       │
│  └── 静态资源服务                                   │
└──────────┬─────────────────┬────────────────────────┘
           │                 │
           ↓                 ↓
┌──────────────────┐  ┌─────────────────────────┐
│   Next.js App    │  │    R Plumber API        │
│   (Port 3000)    │  │    (Port 8000)          │
│                  │  │                         │
│  - 页面渲染      │  │  - 模型预测 API         │
│  - 路由管理      │  │  - SHAP 计算 API        │
│  - 状态管理      │  │  - 图表生成 API         │
│  - PDF 生成      │  │  - 数据上传 API         │
└────────┬─────────┘  └───────────┬─────────────┘
         │                        │
         │                        ↓
         │              ┌──────────────────┐
         │              │   R 模型服务      │
         │              │                  │
         │              │  - .rds 文件加载 │
         │              │  - memoise 缓存  │
         │              │  - tidymodels    │
         │              │  - kernelshap    │
         │              └──────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│         SQLite 数据库                    │
│  ├── uploaded_data (上传数据)           │
│  ├── calculation_history (计算历史)     │
│  └── logs (访问日志，可选)              │
└─────────────────────────────────────────┘
```

### 4.2 请求流程

#### 4.2.1 首页访问

```
用户 → Nginx → Next.js → 渲染 HTML → 返回给用户
                ↓
         加载静态资源 (CSS/JS/Images)
```

#### 4.2.2 风险计算流程

```
1. 用户输入数据 (iAs, MMA, DMA, CT_drug)
   ↓
2. 前端验证 (React Hook Form)
   ↓
3. 提交到 Next.js API Route
   ↓
4. Next.js → R Plumber API (POST /predict)
   ↓
5. R Plumber:
   - 数据验证
   - 检查缓存 (memoise)
   - 如果缓存存在 → 直接返回
   - 如果缓存不存在:
     ├── 计算砷代谢参数 (tAs, PMI, SMI, %)
     ├── 构造预测数据
     ├── 调用模型预测 (.pred_class, .pred_Yes)
     ├── 计算 SHAP 值 (kernelshap)
     └── 缓存结果
   ↓
6. 返回 JSON 结果
   ↓
7. Next.js 解析并返回给前端
   ↓
8. 前端:
   - 更新状态 (Zustand)
   - 显示结果 Tab
   - 渲染图表 (Recharts)
   - 右下角弹窗提示 "✓ 计算完成"
```

#### 4.2.3 数据上传流程

```
1. 用户上传文件 (Excel/CSV)
   ↓
2. 前端验证 (文件类型、大小)
   ↓
3. 提交到 Next.js API Route
   ↓
4. Next.js → R Plumber API (POST /upload)
   ↓
5. R Plumber:
   - 读取文件 (readxl/readr)
   - 数据验证 (字段、类型、范围)
   - 写入 SQLite
   ↓
6. 返回上传成功消息
   ↓
7. 前端显示成功提示
```

### 4.3 目录结构

#### 4.3.1 Next.js 前端目录

```
ato-cardiotox-predictor/
├── app/                          # Next.js 14 App Router
│   ├── [locale]/                 # 国际化路由
│   │   ├── layout.tsx            # 根布局（导航、Footer）
│   │   ├── page.tsx              # 首页
│   │   ├── about/                # 关于页面
│   │   │   └── page.tsx
│   │   ├── algorithm/            # 算法页面
│   │   │   └── page.tsx
│   │   ├── privacy/              # 隐私政策
│   │   │   └── page.tsx
│   │   ├── disclaimer/           # 免责声明
│   │   │   └── page.tsx
│   │   ├── contact/              # 联系我们
│   │   │   └── page.tsx
│   │   ├── predict/              # 计算界面
│   │   │   └── page.tsx
│   │   └── upload/               # 数据上传
│   │       └── page.tsx
│   └── api/                      # API Routes (代理到 R)
│       ├── predict/route.ts      # 风险计算 API
│       ├── upload/route.ts       # 数据上传 API
│       └── history/route.ts      # 计算历史 API
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/                   # 布局组件
│   │   ├── Header.tsx            # 顶部导航
│   │   ├── Footer.tsx            # 底部区域
│   │   └── LanguageSwitcher.tsx  # 语言切换
│   ├── home/                     # 首页组件
│   │   ├── Hero.tsx              # 欢迎区域
│   │   ├── FeatureCards.tsx      # 三个入口卡片
│   │   ├── Introduction.tsx      # 项目简介
│   │   ├── Team.tsx              # 团队介绍
│   │   └── QuickLinks.tsx        # 快速链接
│   ├── predict/                  # 计算界面组件
│   │   ├── InputForm.tsx         # 输入表单
│   │   ├── ResultCard.tsx        # 结果卡片
│   │   ├── RiskGauge.tsx         # 风险仪表盘
│   │   ├── MetabolismParams.tsx  # 代谢参数
│   │   ├── RiskDonutChart.tsx    # 风险因素饼图
│   │   ├── ShapBarChart.tsx      # SHAP 柱状图
│   │   ├── DrugTable.tsx         # 心毒性药物表
│   │   └── SuggestionTable.tsx   # 建议表格
│   └── upload/                   # 上传组件
│       ├── FileUploader.tsx      # 文件上传
│       └── UploadHistory.tsx     # 上传历史
├── lib/                          # 工具库
│   ├── api.ts                    # API 调用封装
│   ├── utils.ts                  # 通用工具函数
│   └── store.ts                  # Zustand 状态管理
├── public/                       # 静态资源
│   ├── images/                   # 图片
│   │   ├── logo.png
│   │   ├── team-leader.jpg
│   │   ├── team-photo.jpg
│   │   ├── hospital-logo.png
│   │   ├── university-logo.png
│   │   └── lab-logo.png
│   └── locales/                  # 国际化文件
│       ├── zh.json               # 中文
│       └── en.json               # 英文
├── styles/                       # 样式文件
│   └── globals.css               # 全局样式 + Tailwind
├── types/                        # TypeScript 类型定义
│   ├── prediction.ts             # 预测相关类型
│   └── upload.ts                 # 上传相关类型
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

#### 4.3.2 R 后端目录

```
ato-api/
├── plumber.R                     # Plumber API 主文件
├── api/                          # API 端点
│   ├── predict.R                 # 预测端点
│   ├── upload.R                  # 上传端点
│   └── history.R                 # 历史端点
├── models/                       # 模型文件
│   ├── optim_wflow_last_fit.rds  # 训练好的模型
│   ├── non_select_features_data.rds
│   └── train_data.rds
├── utils/                        # 工具函数
│   ├── calculate_metabolism.R    # 代谢参数计算
│   ├── shap_calculation.R        # SHAP 值计算
│   └── data_validation.R         # 数据验证
├── database/                     # 数据库
│   ├── init_db.R                 # 初始化数据库
│   ├── queries.R                 # SQL 查询
│   └── ato_data.db              # SQLite 数据库文件
└── config/
    └── config.R                  # 配置文件
```

---

## 5. 设计规范

### 5.1 色彩方案（NHS 蓝 - 方案 A）

**主色系：**
```
Primary (主蓝色):   #005EB8  - 按钮、链接、强调
Primary Dark:       #003D7A  - 按钮悬停
Primary Light:      #41B6E6  - 次要元素
```

**状态色：**
```
Success (成功):     #007F3B  - 低风险、成功提示
Warning (警告):     #ED8B00  - 中风险、警告提示
Danger (危险):      #DA291C  - 高风险、错误提示
Info (信息):        #41B6E6  - 信息提示
```

**中性色：**
```
Background:         #FFFFFF  - 页面背景
Surface:            #F5F5F5  - 卡片背景
Border:             #E0E0E0  - 边框
Text Primary:       #212121  - 主要文字
Text Secondary:     #757575  - 次要文字
Text Disabled:      #BDBDBD  - 禁用文字
```

**深色底部区域：**
```
Footer Background:  #1A1A1A  - 底部背景
Footer Text:        #FFFFFF  - 底部文字
Footer Link:        #41B6E6  - 底部链接
```

### 5.2 字体规范

**中文字体：**
```css
font-family: 
  'PingFang SC',        /* macOS */
  'Microsoft YaHei',    /* Windows */
  'Noto Sans SC',       /* 跨平台 */
  sans-serif;
```

**英文字体：**
```css
font-family: 
  'Inter',              /* 现代无衬线 */
  'Helvetica Neue',
  'Arial',
  sans-serif;
```

**字号：**
```
Heading 1 (h1):    48px / 3rem    - 首页大标题
Heading 2 (h2):    36px / 2.25rem - 页面标题
Heading 3 (h3):    24px / 1.5rem  - 卡片标题
Heading 4 (h4):    20px / 1.25rem - 子标题
Body Large:        18px / 1.125rem- 重要正文
Body:              16px / 1rem    - 正文
Body Small:        14px / 0.875rem- 辅助文字
Caption:           12px / 0.75rem - 说明文字
```

**行高：**
```
标题:  1.2 - 1.3
正文:  1.5 - 1.6
```

### 5.3 间距规范

**基础间距单位：**
```
4px (0.25rem)   - 最小间距
8px (0.5rem)    - 小间距
12px (0.75rem)  - 紧凑间距
16px (1rem)     - 标准间距
24px (1.5rem)   - 中等间距
32px (2rem)     - 大间距
48px (3rem)     - 特大间距
64px (4rem)     - 区块间距
```

**卡片内边距：**
```
小卡片:  16px
中卡片:  24px
大卡片:  32px
```

### 5.4 圆角规范

```
Small (按钮):     6px
Medium (卡片):    12px
Large (大卡片):   16px
Pill (药丸形):    9999px
Circle (圆形):    50%
```

### 5.5 阴影规范

```css
/* 小阴影 - 按钮、输入框 */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* 中阴影 - 卡片 */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

/* 大阴影 - 模态框、下拉菜单 */
box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);

/* 悬停阴影 */
box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
```

### 5.6 按钮规范

**主要按钮（Primary）：**
```
背景: #005EB8
文字: #FFFFFF
圆角: 6px
内边距: 12px 24px
**主要按钮（Primary）：**
```
背景: #005EB8
文字: #FFFFFF
圆角: 6px
内边距: 12px 24px
悬停: 背景 #003D7A + 轻微上浮 2px
动画: transform 0.2s ease
```

**次要按钮（Secondary）：**
```
背景: 透明
边框: 2px solid #005EB8
文字: #005EB8
悬停: 背景 #F0F7FF
```

**危险按钮（Danger）：**
```
背景: #DA291C
文字: #FFFFFF
悬停: 背景 #B02116
```

**大号按钮（首页"开始计算"）：**
```
尺寸: 更大 (padding: 16px 48px)
字号: 18px
添加图标: 🎯
动画: 脉冲效果 + 悬停放大 1.05 倍
```

### 5.7 动画效果

**页面过渡：**
```css
/* Framer Motion 配置 */
transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
```

**按钮悬停：**
```css
transition: all 0.2s ease;
transform: translateY(-2px);
box-shadow: 0 6px 12px rgba(0, 94, 184, 0.3);
```

**卡片悬停：**
```css
transition: transform 0.3s ease, box-shadow 0.3s ease;
transform: translateY(-4px);
box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
```

**加载动画：**
```
使用 Spinner 组件
颜色: #005EB8
大小: 32px
```

**计算完成提示：**
```
位置: 右下角（fixed）
背景: #007F3B
文字: #FFFFFF
图标: ✓
动画: 从右侧滑入 → 停留 3 秒 → 淡出
```

---

## 6. 功能模块

### 6.1 模型预测模块

#### 6.1.1 输入参数

**必填参数：**
```typescript
interface PredictionInput {
  iAs: number;      // 无机砷 (ng/mL), 范围: 0-1000
  MMA: number;      // 一甲基砷酸 (ng/mL), 范围: 0-1000
  DMA: number;      // 二甲基砷酸 (ng/mL), 范围: 0-1000
  CT_drug: 'Yes' | 'No';  // 合并心毒性药物
}
```

**计算参数（自动计算）：**
```typescript
interface MetabolismParams {
  tAs: number;      // 总砷 = iAs + MMA + DMA
  PMI: number;      // 一级甲基化指数 = MMA / iAs
  SMI: number;      // 二级甲基化指数 = DMA / MMA
  iAs_pct: number;  // 无机砷百分比 = (iAs / tAs) * 100
  MMA_pct: number;  // MMA 百分比 = (MMA / tAs) * 100
  DMA_pct: number;  // DMA 百分比 = (DMA / tAs) * 100
}
```

#### 6.1.2 输出结果

```typescript
interface PredictionResult {
  // 基础预测
  prediction: {
    class: 'No' | 'Yes';        // 预测类别（是否发生心毒性）
    probability: number;         // 发生概率 (0-1)
    risk_level: 'low' | 'medium' | 'high';  // 风险等级
  };
  
  // 代谢参数
  metabolism: MetabolismParams;
  
  // SHAP 值
  shap_values: {
    tAs: number;
    SMI: number;
    MMA_per: number;
    DMA_per: number;
    CT_drug: number;
  };
  
  // 主要风险因素
  major_risk_factor: string;
  
  // 建议
  suggestions: {
    risk_factor: string;
    suggestion: string;
  }[];
  
  // 计算时间戳
  timestamp: string;
}
```

### 6.2 计算历史模块

**位置：** 计算界面右侧边栏（可折叠）

**样式：**
```
┌──────────────────────┐
│  计算历史 [展开/收起] │
├──────────────────────┤
│  2026-08-15 14:30    │
│  风险: 25% (中风险)   │
│  [查看] [删除]        │
├──────────────────────┤
│  2026-08-15 10:15    │
│  风险: 15% (低风险)   │
│  [查看] [删除]        │
├──────────────────────┤
│  ... (最多显示 5 条)  │
└──────────────────────┘
```

---

## 7. 数据库设计

### 7.1 表结构

#### 表 1: uploaded_data（上传数据表）

```sql
CREATE TABLE uploaded_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_name TEXT,
  sex TEXT,
  age INTEGER,
  smoke TEXT,
  alcohol TEXT,
  class TEXT,
  dose REAL,
  weight REAL,
  CP_drug TEXT,
  CT_drug TEXT,
  diabete TEXT,
  hyperlipidemia TEXT,
  hypertension TEXT,
  K REAL,
  Mg REAL,
  Ca REAL,
  ALT REAL,
  AST REAL,
  GGT REAL,
  UA REAL,
  Cr REAL,
  CK REAL,
  CKMB REAL,
  LDH REAL,
  HBDH REAL,
  iAs REAL NOT NULL,
  MMA REAL NOT NULL,
  DMA REAL NOT NULL,
  outcome TEXT,
  additional_statement TEXT
);
```

#### 表 2: upload_records（上传记录表）

```sql
CREATE TABLE upload_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_name TEXT NOT NULL,
  record_count INTEGER NOT NULL,
  success BOOLEAN DEFAULT TRUE
);
```

### 7.2 索引

```sql
CREATE INDEX idx_upload_time ON uploaded_data(upload_time);
CREATE INDEX idx_outcome ON uploaded_data(outcome);
CREATE INDEX idx_CT_drug ON uploaded_data(CT_drug);
```

---

## 8. 部署方案

### 8.1 服务器配置（阿里云 ECS）

**推荐配置：**
```
CPU: 4 核
内存: 8GB
存储: 40GB SSD
操作系统: Ubuntu 22.04 LTS
带宽: 5Mbps（按需升级）
```

### 8.2 软件安装

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 R 4.3+
sudo apt install -y software-properties-common
sudo add-apt-repository -y 'deb https://cloud.r-project.org/bin/linux/ubuntu jammy-cran40/'
sudo apt update
sudo apt install -y r-base r-base-dev

# 4. 安装 R 包
sudo R -e "install.packages(c('plumber', 'tidyverse', 'tidymodels', 'aorsf', 'bonsai', 'kernelshap', 'memoise', 'DBI', 'RSQLite'))"

# 5. 安装 Nginx
sudo apt install -y nginx

# 6. 安装 PM2
sudo npm install -g pm2

# 7. 安装 SQLite
sudo apt install -y sqlite3
```

### 8.3 部署步骤

#### 步骤 1: 部署 Next.js 前端

```bash
# 克隆或上传代码
cd /var/www
git clone <your-repo> ato-predictor
cd ato-predictor

# 安装依赖
npm install

# 构建生产版本
npm run build

# 启动（使用 PM2）
pm2 start npm --name "ato-frontend" -- start
pm2 save
pm2 startup
```

#### 步骤 2: 部署 R Plumber API

```bash
# 创建 API 目录
cd /var/www
mkdir ato-api
cd ato-api

# 上传 R 代码和模型文件
# 结构如 4.3.2 节所述

# 创建 Systemd 服务文件
sudo nano /etc/systemd/system/ato-api.service
```

**服务文件内容：**
```ini
[Unit]
Description=ATO Cardiotoxicity Risk Predictor API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ato-api
ExecStart=/usr/bin/Rscript -e "library(plumber); pr('plumber.R') %>% pr_run(port=8000, host='127.0.0.1')"
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable ato-api
sudo systemctl start ato-api
sudo systemctl status ato-api
```

#### 步骤 3: 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/ato-predictor
```

**Nginx 配置：**
```nginx
# HTTP → HTTPS 重定向
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL 证书（Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Next.js 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # R Plumber API
    location /api/r/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/ato-predictor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 步骤 4: 安装 SSL 证书

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期（已自动配置）
sudo certbot renew --dry-run
```

### 8.4 性能优化配置

#### Nginx 优化

```nginx
# /etc/nginx/nginx.conf
http {
    # 增加上传限制
    client_max_body_size 20M;
    
    # 连接优化
    keepalive_timeout 65;
    keepalive_requests 100;
    
    # 缓存配置
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
}
```

#### PM2 优化

```bash
# 集群模式（利用多核）
pm2 start npm --name "ato-frontend" -i max -- start

# 内存限制
pm2 start npm --name "ato-frontend" --max-memory-restart 1G -- start
```

---

## 9. 性能优化

### 9.1 前端优化

**1. 代码分割（Next.js 自动）**
```typescript
// 动态导入大组件
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Spinner />,
  ssr: false
});
```

**2. 图片优化**
```typescript
import Image from 'next/image';

<Image
  src="/images/logo.png"
  alt="Logo"
  width={200}
  height={80}
  priority // 首屏图片
/>
```

**3. 字体优化**
```typescript
// next.config.js
module.exports = {
  optimizeFonts: true,
  experimental: {
    optimizeCss: true
  }
};
```

### 9.2 后端优化

**1. 模型预加载**
```r
# plumber.R
# 在服务器启动时加载模型（只加载一次）
optim_wflow_last_fit <- readRDS('models/optim_wflow_last_fit.rds')
optim_wflow <- extract_workflow(optim_wflow_last_fit)

# 全局变量，API 端点可直接使用
```

**2. 结果缓存**
```r
library(memoise)

# 缓存预测函数（相同输入直接返回缓存）
predict_cached <- memoise(function(input_hash, input_data) {
  # 计算逻辑
})

# 清除过期缓存（定时任务）
forget(predict_cached)
```

**3. 数据库连接池**
```r
library(pool)

db_pool <- dbPool(
  drv = RSQLite::SQLite(),
  dbname = "database/ato_data.db",
  maxSize = 10
)
```

### 9.3 监控与日志

**1. PM2 监控**
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs ato-frontend

# 监控仪表盘
pm2 monit
```

**2. Nginx 日志**
```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

**3. R API 日志**
```bash
# Systemd 日志
journalctl -u ato-api -f
```

---

## 10. 开发计划

### 10.1 时间线（12 天）

**第 1-2 天：设计与准备**
- [ ] 完成详细 UI 设计稿（Figma）
- [ ] 准备素材（Logo、照片、文案）
- [ ] 确定最终色彩方案
- [ ] 设置开发环境

**第 3-4 天：前端框架搭建**
- [ ] 初始化 Next.js 项目
- [ ] 配置 TailwindCSS + shadcn/ui
- [ ] 实现路由结构
- [ ] 创建通用组件（Header、Footer、Button 等）
- [ ] 实现多语言系统（中英文切换）

**第 5-6 天：首页开发**
- [ ] 实现 Hero 区域（欢迎标题 + 三个入口卡片）
- [ ] 项目简介区域
- [ ] 团队介绍卡片
- [ ] 深色底部区域
- [ ] 添加动画效果
- [ ] 响应式适配

**第 7-8 天：计算界面开发**
- [ ] Tab 导航实现
- [ ] 输入表单（React Hook Form + 验证）
- [ ] 结果展示卡片
- [ ] 图表组件（Recharts）
  - 风险仪表盘
  - 饼图
  - SHAP 柱状图
- [ ] 计算完成提示
- [ ] 计算历史侧边栏

**第 9 天：R API 开发**
- [ ] 编写 Plumber API 端点
  - `/predict` - 预测
  - `/upload` - 上传
  - `/history` - 历史
- [ ] 实现缓存机制
- [ ] 数据验证
- [ ] 错误处理

**第 10 天：数据上传 + PDF 导出**
- [ ] 文件上传组件
- [ ] 数据预览
- [ ] SQLite 集成
- [ ] PDF 生成功能
- [ ] 下载历史记录

**第 11 天：静态页面 + 打磨**
- [ ] 关于页面
- [ ] 算法页面
- [ ] 隐私政策
- [ ] 免责声明
- [ ] Contact Us
- [ ] 细节打磨（动画、间距、文案）

**第 12 天：测试 + 部署**
- [ ] 功能测试
- [ ] 性能测试
- [ ] 浏览器兼容性测试
- [ ] 部署到阿里云
- [ ] 配置域名和 SSL
- [ ] 验收测试

### 10.2 里程碑

**里程碑 1（第 2 天）：设计完成**
- 交付：完整 UI 设计稿
- 验收：客户确认设计方案

**里程碑 2（第 6 天）：首页完成**
- 交付：可访问的首页原型
- 验收：视觉效果、动画、多语言

**里程碑 3（第 10 天）：核心功能完成**
- 交付：完整的计算功能 + 数据上传
- 验收：准确性、性能

**里程碑 4（第 12 天）：项目上线**
- 交付：生产环境部署
- 验收：稳定运行、备案完成

---

## 11. 风险与应对

### 11.1 技术风险

**风险 1：R 模型计算慢（5-15 秒）**
- 影响：用户体验差
- 应对：
  - ✅ 实现缓存机制（memoise）
  - ✅ 显示进度条和等待提示
  - ✅ 优化 SHAP 计算（减少背景数据集大小）
  - ✅ 考虑异步队列处理

**风险 2：并发支持不足**
- 影响：100 人同时在线时服务器崩溃
- 应对：
  - ✅ 压力测试（使用 Apache Bench）
  - ✅ 增加服务器配置（必要时）
  - ✅ 实现请求队列
  - ✅ PM2 集群模式

**风险 3：R 与 Next.js 集成复杂**
- 影响：开发时间延长
- 应对：
  - ✅ 使用成熟的 Plumber 框架
  - ✅ API 接口明确定义
  - ✅ 充分测试

### 11.2 内容风险

**风险 1：素材不齐全**
- 影响：无法完成视觉设计
- 应对：
  - ✅ 先用占位符开发
  - ✅ 与客户持续沟通
  - ✅ 准备备选方案

**风险 2：文案不准确**
- 影响：医学内容有误
- 应对：
  - ✅ 客户提供官方文案
  - ✅ 医学术语由客户审核
  - ✅ 免责声明清晰

### 11.3 部署风险

**风险 1：备案未完成**
- 影响：网站无法上线
- 应对：
  - ✅ 提前确认备案状态
  - ✅ 准备备选域名
  - ✅ 先部署到内网测试

**风险 2：SSL 证书问题**
- 影响：HTTPS 无法启用
- 应对：
  - ✅ 使用 Let's Encrypt（免费且稳定）
  - ✅ 准备备用证书方案

---

## 12. 附录

### 12.1 参考资料

**参考网站：**
1. MDCalc: https://www.mdcalc.com/
2. PREDICT: https://breast.predict.cam/
3. ASCVD Risk Estimator: http://tools.acc.org/CVD-Risk-Estimator-Plus/

**技术文档：**
1. Next.js: https://nextjs.org/docs
2. TailwindCSS: https://tailwindcss.com/docs
3. shadcn/ui: https://ui.shadcn.com/
4. R Plumber: https://www.rplumber.io/
5. Recharts: https://recharts.org/

### 12.2 联系人

**项目负责人：**
- 姓名：（待填写）
- 职位：（待填写）
- 邮箱：haixin@hrmu.edu.cn
- 单位：哈尔滨医科大学附属第一医院

**技术支持：**
- Claude Code AI Assistant

### 12.3 版本历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-08-15 | AI | 初始版本，完整项目规划 |

---

## 📝 使用说明

**如何使用本文档：**

1. **项目启动时**：阅读"项目概述"和"核心需求"，了解项目全貌
2. **开发时**：参考"技术栈"、"系统架构"、"功能模块"
3. **设计时**：参考"设计规范"
4. **部署时**：参考"部署方案"
5. **遇到问题时**：查看"风险与应对"
6. **项目交接时**：完整阅读本文档

**更新本文档：**
- 每次重大变更后更新对应章节
- 更新版本历史表
- 保持与实际代码同步

**文档位置：**
```
项目根目录/PROJECT_HANDOVER.md
```

---

**文档结束**

本文档涵盖了项目的所有关键信息。如有疑问，请参考相关章节或联系项目负责人。

