# ATO 心毒性风险预测工具 - 技能选择与开发指南

**项目名称：** 砷剂心脏毒性风险预测工具  
**技术方案：** Next.js 14 + R Plumber API + SQLite  
**开发周期：** 12 天  
**创建日期：** 2026-08-15  

---

## 🎯 技能安装清单

基于项目需求，推荐安装以下 Claude Code Skills：

### ✅ 必装技能（核心开发）

#### 1. **anthropics/skills@frontend-design** - 779K 安装
```bash
npx skills add anthropics/skills@frontend-design -g -y
```
**用途：**
- 首页 Hero 区域设计
- 卡片组件设计
- 整体 UI 美化
- 响应式布局

#### 2. **leonxlnx/taste-skill@redesign-existing-projects** - 268K 安装
```bash
npx skills add leonxlnx/taste-skill@redesign-existing-projects -g -y
```
**用途：**
- 从 Shiny 迁移到 Next.js
- 保留功能，优化界面
- 视觉风格升级

#### 3. **vercel-labs/agent-skills@web-design-guidelines** - 543K 安装
```bash
npx skills add vercel-labs/agent-skills@web-design-guidelines -g -y
```
**用途：**
- 遵循 Web 设计最佳实践
- 可访问性优化
- 性能优化建议

#### 4. **anthropics/knowledge-work-plugins@data-visualization** - 11.2K 安装
```bash
npx skills add anthropics/knowledge-work-plugins@data-visualization -g -y
```
**用途：**
- SHAP 柱状图设计
- 风险饼图设计
- 仪表盘图表设计
- Recharts 代码生成

### 🌟 推荐技能（增强体验）

#### 5. **leonxlnx/taste-skill@high-end-visual-design** - 272K 安装
```bash
npx skills add leonxlnx/taste-skill@high-end-visual-design -g -y
```
**用途：**
- 提升视觉品质
- 动画效果设计
- 高端 UI 打磨

#### 6. **wshobson/agents@kpi-dashboard-design** - 12.7K 安装
```bash
npx skills add wshobson/agents@kpi-dashboard-design -g -y
```
**用途：**
- 仪表板布局优化
- 数据展示设计
- KPI 卡片设计

### 📝 已安装技能（无需重复安装）

你已经安装了以下有用的技能：

1. **light-frontend-design** - 前端设计（已有）
2. **docx** - Word 文档生成（用于 PDF 模板设计）
3. **pptx** - PowerPoint（用于设计演示）

---

## 📦 一键安装脚本

```bash
# 切换到 Claude 技能目录
cd ~/.claude

# 安装所有推荐技能
echo "安装必装技能..."
npx skills add anthropics/skills@frontend-design -g -y
npx skills add leonxlnx/taste-skill@redesign-existing-projects -g -y
npx skills add vercel-labs/agent-skills@web-design-guidelines -g -y
npx skills add anthropics/knowledge-work-plugins@data-visualization -g -y

echo "安装推荐技能..."
npx skills add leonxlnx/taste-skill@high-end-visual-design -g -y
npx skills add wshobson/agents@kpi-dashboard-design -g -y

echo "技能安装完成！"
npx skills list
```

---

## 🗓️ 12 天开发路线图

### **第 1-2 天：设计阶段** 📐

**目标：** 完成完整的 UI 设计稿

**使用技能：**
- `frontend-design` - 整体布局设计
- `redesign-existing-projects` - 从 Shiny 迁移指导
- `high-end-visual-design` - 视觉打磨

**任务清单：**
- [x] 阅读 `DESIGN_SPEC.md`
- [ ] 使用 Figma 创建设计稿
- [ ] 设计首页（Hero + 三个卡片 + 简介 + 团队）
- [ ] 设计计算界面（4 个 Tab）
- [ ] 设计数据上传界面
- [ ] 设计静态页面模板
- [ ] 设计组件库（按钮、输入框、卡片等）
- [ ] 准备素材（Logo、照片、文案）
- [ ] 客户审核确认设计

**交付物：**
- Figma 设计文件（12 个画板 + 组件库）
- 导出的 PNG 预览图
- 素材文件夹

---

### **第 3-4 天：前端框架搭建** 🏗️

**目标：** 搭建 Next.js 项目基础架构

**使用技能：**
- `frontend-design` - 组件架构指导
- `web-design-guidelines` - 最佳实践

**任务清单：**

**Day 3：项目初始化**
```bash
# 创建 Next.js 项目
npx create-next-app@latest ato-predictor --typescript --tailwind --app
cd ato-predictor

# 安装依赖
npm install @radix-ui/react-tabs @radix-ui/react-select
npm install recharts framer-motion
npm install react-hook-form zod @hookform/resolvers
npm install zustand
npm install jspdf html2canvas
npm install next-intl

# 安装 shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card tabs input select
```

**Day 4：基础架构**
- [ ] 配置 TailwindCSS（色彩、字体、间距）
- [ ] 配置多语言（next-intl）
- [ ] 创建目录结构（参考 `PROJECT_HANDOVER.md` 4.3.1）
- [ ] 创建布局组件（Header、Footer）
- [ ] 创建路由结构
- [ ] 设置 Zustand 状态管理

**交付物：**
- 可运行的 Next.js 项目
- 基础组件库
- 导航和路由正常工作

---

### **第 5-6 天：首页开发** 🏠

**目标：** 完成首页所有模块

**使用技能：**
- `frontend-design` - 页面布局
- `high-end-visual-design` - 动画效果

**任务清单：**

**Day 5：Hero 区域 + 卡片**
- [ ] 实现 Hero 区域（标题 + 副标题）
- [ ] 创建三个入口卡片组件
  - [ ] 项目简介卡片（普通样式）
  - [ ] 开始计算卡片（大号、渐变、动画）
  - [ ] 数据上传卡片（普通样式）
- [ ] 添加 Framer Motion 动画
  - [ ] 页面加载淡入
  - [ ] 卡片悬停效果
  - [ ] 按钮脉冲动画

**Day 6：简介 + 团队 + 底部**
- [ ] 项目简介区域
  - [ ] 文字排版
  - [ ] "开始预测"按钮
- [ ] 团队介绍卡片
  - [ ] 负责人照片和介绍
  - [ ] 团队合照展示
- [ ] 深色底部区域
  - [ ] Logo + 文案
  - [ ] 快速链接
  - [ ] 机构 Logo 展示
  - [ ] Copyright + 备案信息
- [ ] 中英文切换功能

**交付物：**
- 完整的首页
- 所有动画效果正常
- 中英文切换无误

---

### **第 7-8 天：计算界面开发** 🧮

**目标：** 完成核心计算功能

**使用技能：**
- `frontend-design` - Tab 导航设计
- `data-visualization` - 图表实现
- `kpi-dashboard-design` - 仪表板布局

**任务清单：**

**Day 7：输入 Tab + 结果 Tab**
- [ ] Tab 导航组件（4 个 Tab）
- [ ] 输入表单（React Hook Form）
  - [ ] iAs 输入框 + 验证
  - [ ] MMA 输入框 + 验证
  - [ ] DMA 输入框 + 验证
  - [ ] CT_drug 下拉选择
  - [ ] 心毒性药物说明
- [ ] 计算按钮 + 进度条
- [ ] 计算完成 Toast 提示
- [ ] 结果 Tab
  - [ ] 风险百分比显示
  - [ ] 风险等级标签（低/中/高）
  - [ ] 心脏动画 GIF
  - [ ] 风险仪表盘（Recharts）
  - [ ] 砷代谢参数展示

**Day 8：分析 Tab + 建议 Tab**
- [ ] 详细分析 Tab
  - [ ] 风险因素饼图（Recharts）
  - [ ] SHAP 柱状图（Recharts）
  - [ ] 主要风险因素标注
  - [ ] 砷代谢参数图示
- [ ] 建议 Tab
  - [ ] 个性化建议列表
  - [ ] 心毒性药物表格（可搜索）
  - [ ] 建议表格
- [ ] 计算历史侧边栏
  - [ ] 历史记录列表
  - [ ] 查看/删除功能
  - [ ] LocalStorage 存储

**交付物：**
- 完整的计算界面（4 个 Tab）
- 所有图表正常渲染
- 表单验证正常
- 历史记录功能正常

---

### **第 9 天：R API 开发** 🔧

**目标：** 搭建后端 API 服务

**使用技能：**
- 无需特定技能（R 开发）

**任务清单：**

- [ ] 创建 R Plumber API 项目结构
- [ ] 编写 `/predict` 端点
  - [ ] 接收输入参数
  - [ ] 计算代谢参数
  - [ ] 调用模型预测
  - [ ] 计算 SHAP 值
  - [ ] 返回 JSON 结果
- [ ] 实现 memoise 缓存
- [ ] 编写 `/upload` 端点
  - [ ] 接收文件上传
  - [ ] 读取 Excel/CSV
  - [ ] 数据验证
  - [ ] 插入 SQLite
- [ ] 编写 `/history` 端点（可选）
- [ ] SQLite 数据库初始化
- [ ] 测试所有端点

**测试命令：**
```bash
# 启动 R API
Rscript -e "library(plumber); pr('plumber.R') %>% pr_run(port=8000)"

# 测试预测端点
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"iAs":10,"MMA":20,"DMA":15,"CT_drug":"No"}'
```

**交付物：**
- 可运行的 R Plumber API
- 所有端点正常工作
- 缓存机制生效

---

### **第 10 天：数据上传 + PDF 导出** 📤

**目标：** 完成辅助功能

**使用技能：**
- `frontend-design` - 上传界面设计

**任务清单：**

**上午：数据上传**
- [ ] 文件上传组件
  - [ ] 拖拽上传区域
  - [ ] 文件选择按钮
  - [ ] 文件类型验证
- [ ] 数据预览表格（前 10 行）
- [ ] 提交和清空按钮
- [ ] 上传历史表格
- [ ] 模板文件下载
- [ ] 连接到 R API `/upload`

**下午：PDF 导出**
- [ ] PDF 生成函数（jsPDF + html2canvas）
- [ ] PDF 模板设计
  - [ ] 标题和 Logo
  - [ ] 患者信息
  - [ ] 风险评估结果
  - [ ] 图表截图
  - [ ] 建议列表
  - [ ] 页脚信息
- [ ] 下载 PDF 按钮（每个 Tab）
- [ ] 测试 PDF 生成

**交付物：**
- 完整的数据上传功能
- PDF 导出功能正常
- 上传历史正常显示

---

### **第 11 天：静态页面 + 细节打磨** ✨

**目标：** 完成所有静态页面并优化细节

**使用技能：**
- `frontend-design` - 页面布局
- `web-design-guidelines` - 可访问性优化

**任务清单：**

**上午：静态页面**
- [ ] 关于页面（About）
  - [ ] 页面标题
  - [ ] 内容区域（文案填充）
  - [ ] 底部 Logo 和备案
- [ ] 算法页面（Algorithm）
  - [ ] 模型介绍
  - [ ] AORSF 算法说明
  - [ ] 特征解释
- [ ] 隐私政策（Privacy Policy）
- [ ] 免责声明（Disclaimer）
- [ ] 联系我们（Contact Us）
  - [ ] 联系信息
  - [ ] 地图（可选）

**下午：细节打磨**
- [ ] 检查所有动画效果
- [ ] 检查所有悬停状态
- [ ] 检查所有错误状态
- [ ] 优化加载性能
- [ ] 优化图片（压缩、懒加载）
- [ ] 检查文案（中英文对照）
- [ ] 检查间距和对齐
- [ ] 修复 Bug

**交付物：**
- 所有静态页面完成
- 所有细节优化完成
- 无明显 Bug

---

### **第 12 天：测试 + 部署** 🚀

**目标：** 上线生产环境

**使用技能：**
- 无需特定技能（运维部署）

**任务清单：**

**上午：测试**
- [ ] 功能测试
  - [ ] 所有页面可访问
  - [ ] 计算功能正确
  - [ ] 数据上传成功
  - [ ] PDF 导出正常
  - [ ] 中英文切换正常
- [ ] 性能测试
  - [ ] Lighthouse 评分 > 90
  - [ ] 首页加载 < 3 秒
  - [ ] 计算响应 < 15 秒
- [ ] 浏览器兼容性测试
  - [ ] Chrome
  - [ ] Edge
  - [ ] Firefox
  - [ ] Safari（可选）
- [ ] 不同分辨率测试
  - [ ] 1920x1080
  - [ ] 1366x768

**下午：部署**
- [ ] 前端部署
  - [ ] 构建生产版本 `npm run build`
  - [ ] 上传到阿里云 ECS
  - [ ] 配置 PM2
- [ ] 后端部署
  - [ ] 上传 R API 代码和模型
  - [ ] 配置 Systemd 服务
  - [ ] 启动 R API
- [ ] Nginx 配置
  - [ ] 配置反向代理
  - [ ] 配置 SSL 证书（Let's Encrypt）
  - [ ] 配置 Gzip 压缩
- [ ] 域名配置
  - [ ] DNS 解析
  - [ ] SSL 证书验证
- [ ] 最终验收
  - [ ] 生产环境访问测试
  - [ ] 所有功能正常
  - [ ] 性能达标

**交付物：**
- 上线的生产网站
- 域名可访问
- HTTPS 正常
- 所有功能正常

---

## 🎓 技能使用指南

### 如何调用已安装的技能

在 Claude Code 中，使用 `/` 命令调用技能：

**示例 1：设计首页**
```
/frontend-design

我需要为医疗风险预测工具设计首页，参考 MDCalc 的门户式设计。
要求：
1. 欢迎标题 + 说明文字
2. 三个入口卡片（中间的"开始计算"最突出）
3. 项目简介区域
4. 团队介绍卡片
5. 深色底部

色彩方案：NHS 蓝 (#005EB8)
参考：详见 DESIGN_SPEC.md
```

**示例 2：优化现有组件**
```
/redesign-existing-projects

我有一个 Shiny 的计算界面，需要迁移到 Next.js 并优化 UI。
现有功能：输入表单 + 结果展示 + 图表
目标：Tab 导航 + 现代化设计
参考：详见 PROJECT_HANDOVER.md 第 6.1 节
```

**示例 3：创建图表**
```
/data-visualization

需要用 Recharts 创建以下图表：
1. SHAP 值横向柱状图（正值粉色，负值蓝色）
2. 风险因素饼图（5 个因素，不同颜色）
3. 风险仪表盘（0-100%，三个区域：绿/橙/红）

数据格式：见 TypeScript 接口定义
参考：DESIGN_SPEC.md 图表设计规范
```

---

## 📚 相关文档索引

在开发过程中，你需要频繁参考以下文档：

1. **PROJECT_HANDOVER.md** - 项目交接文档（完整规划）
2. **QUICK_REFERENCE.md** - 快速参考（速查表）
3. **DESIGN_SPEC.md** - UI 设计稿说明（当前文档）
4. **本文档** - 技能选择和开发路线图

**建议工作流程：**
```
开始任务
  ↓
查看 PROJECT_HANDOVER.md 了解全貌
  ↓
查看 DESIGN_SPEC.md 了解设计细节
  ↓
选择合适的技能
  ↓
开始开发
  ↓
遇到问题查看 QUICK_REFERENCE.md
```

---

## ✅ 质量检查清单

### 设计阶段（Day 1-2）

- [ ] 设计稿符合色彩规范（NHS 蓝 #005EB8）
- [ ] 字体使用规范（中文 PingFang SC，英文 Inter）
- [ ] 所有页面设计齐全（8 个页面）
- [ ] 所有交互状态标注清晰（悬停、点击、错误）
- [ ] 中英文双语版本设计完整
- [ ] 客户确认设计方案

### 开发阶段（Day 3-11）

- [ ] 所有页面可访问且功能正常
- [ ] 计算结果准确（对比原 Shiny 应用）
- [ ] 所有图表正常渲染
- [ ] 中英文切换无误
- [ ] 表单验证完整
- [ ] 错误处理完善
- [ ] 动画效果流畅
- [ ] 代码符合规范（ESLint、Prettier）

### 部署阶段（Day 12）

- [ ] 所有功能在生产环境正常
- [ ] HTTPS 正常
- [ ] 性能达标（Lighthouse > 90）
- [ ] 浏览器兼容性良好
- [ ] 备案信息显示正确
- [ ] 域名解析正常

---

## 🆘 常见问题解决

### 问题 1：技能安装失败

**现象：** `npx skills add` 报错

**解决：**
```bash
# 清除缓存
npm cache clean --force

# 使用 npx 最新版本
npx clear-npx-cache
npx skills@latest add <skill-name> -g -y
```

### 问题 2：设计与需求不符

**现象：** 设计出来的效果与预期不同

**解决：**
1. 重新阅读 `DESIGN_SPEC.md`
2. 向技能提供更详细的上下文
3. 附上参考图片或链接
4. 明确指出需要调整的部分

### 问题 3：R API 连接失败

**现象：** 前端无法调用后端 API

**解决：**
```bash
# 检查 R API 是否运行
curl http://localhost:8000/__docs__/

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### 问题 4：计算速度太慢

**现象：** 模型计算超过 15 秒

**解决：**
1. 确认 memoise 缓存已启用
2. 减少 SHAP 计算的背景数据集大小
3. 优化 R 代码（使用 profvis 分析）
4. 考虑升级服务器配置

---

## 🎉 项目完成标志

当以下所有条件满足时，项目视为完成：

✅ 所有 12 天任务完成  
✅ 所有质量检查通过  
✅ 客户验收通过  
✅ 生产环境稳定运行  
✅ 文档齐全（4 个文档）  
✅ 代码已提交 Git  
✅ 备份已完成  

**恭喜！项目成功上线！** 🎊

---

**文档结束**

现在你已经拥有完整的：
1. 项目交接文档（PROJECT_HANDOVER.md）
2. 快速参考（QUICK_REFERENCE.md）
3. 设计稿说明（DESIGN_SPEC.md）
4. 技能选择和开发路线图（本文档）

**下一步：** 安装推荐的技能，然后开始第 1 天的设计工作！
