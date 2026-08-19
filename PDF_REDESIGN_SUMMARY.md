# PDF 报告重新设计总结

## 📋 更新日期
2026年8月19日

## 🎯 设计目标
根据用户反馈，重新设计 PDF 报告，满足以下要求：
1. ✅ **内容充实** - 增加背景说明、详细参数解释、注意事项、参考文献
2. ✅ **三线表** - 表格仅保留顶部、表头底部、表尾底部三条线
3. ✅ **黑白主色调** - 去除大面积彩色渐变背景，仅用红/橙/绿标注风险等级
4. ✅ **简洁结果展示** - 不使用大色块，采用轻量级边框和背景

---

## 📄 新版报告结构

### 封面页
- 报告标题：ATO 心脏毒性预测报告
- 报告编号：ATO-YYYYMMDD-XXXXXX
- 生成时间：完整日期时间
- 页脚免责声明

### 第 1 页：背景与数据
**I. 研究背景**
- ATO 治疗 APL 的临床意义
- 心脏毒性风险说明
- 砷代谢机制简介
- 本报告的预测方法

**II. 检测数据**
- 2.1 输入参数表（三线表）
  - iAs、MMA、DMA 浓度
  - 合并用药情况
  - 每行含单位和说明
  
- 2.2 计算参数表（三线表）
  - tAs（总砷）
  - iAs%、MMA%、DMA%（百分比）
  - PMI（一级甲基化指数）
  - SMI（二级甲基化指数）
  - 每行含计算公式说明

### 第 2 页：预测结果与特征分析
**III. 预测结果**
- 分类结果：阳性/阴性
- 毒性概率：百分比
- 风险等级：高/中/低（用颜色标注）
- 结果解读：根据风险等级给出不同的临床解释

**IV. 特征重要性分析（SHAP值）**
- SHAP 方法说明段落
- 特征重要性表（三线表）
  - 特征名称
  - SHAP 值
  - 影响方向（增加/降低风险）
  - 重要性排名
- 主要风险因素标注

### 第 3 页：建议与参考文献
**V. 临床建议**
- 根据 SHAP 分析动态生成的个性化建议
- 列表格式，清晰易读

**VI. 注意事项**
- 模型准确率说明
- 结合临床综合判断的建议
- 不同风险等级的监测频率
- 合并用药的风险提示

**VII. 参考文献**
- 4 篇经典 ATO 心脏毒性相关文献
- 标准格式引用

---

## 🎨 设计规范

### 颜色方案
```
主色调：黑白
- 正文：#000（纯黑）
- 次要文字：#333、#666
- 边框：#ddd、#000
- 背景：白色、#fafafa（浅灰）

风险等级强调色：
- 高风险：#d32f2f（红色）
- 中等风险：#f57c00（橙色）
- 低风险：#388e3c（绿色）
```

### 字体规范
**中文版**：
- 主字体：SimSun（宋体）, Microsoft YaHei（微软雅黑）
- 标题：加粗
- 正文：10-12pt
- 行距：1.8-2.0

**英文版**：
- 主字体：Arial, Helvetica
- 标题：加粗
- 正文：10-12pt
- 行距：1.8-2.0

### 表格规范（三线表）
```css
/* 表头顶部 */
thead th {
  border-top: 2px solid #000;
  border-bottom: 1px solid #000;
}

/* 数据行无边框 */
tbody td {
  border: none;
}

/* 表格底部 */
tbody tr:last-child td {
  border-bottom: 2px solid #000;
}
```

### 布局规范
- 页面尺寸：A4（210mm × 297mm）
- 页边距：上下 25mm，左右 20mm
- 段落首行缩进：2em
- 段落间距：10-15px
- 章节标题间距：20px

---

## 🔧 技术实现

### 文件更新
1. **templates/report-template-zh.html** - 中文模板（完全重写）
2. **templates/report-template-en.html** - 英文模板（完全重写）
3. **lib/pdf/htmlToPdfGenerator.ts** - 数据填充逻辑（增强）

### 新增占位符
```
{{REPORT_NUMBER}} - 报告编号
{{GENERATE_TIME}} - 生成时间
{{IAS}}, {{MMA}}, {{DMA}} - 输入浓度
{{CT_DRUG}} - 合并用药（是/否）
{{TAS}}, {{PMI}}, {{SMI}} - 计算参数
{{IAS_PCT}}, {{MMA_PCT}}, {{DMA_PCT}} - 百分比
{{RISK_CLASS}} - 风险等级 CSS 类名
{{RISK_TEXT}} - 阳性/阴性
{{RISK_LEVEL_TEXT}} - 高/中/低风险
{{RISK_INTERPRETATION}} - 风险解读文字
{{PROBABILITY}} - 毒性概率
{{SHAP_*}} - 各特征的 SHAP 值
{{SHAP_*_DIRECTION}} - SHAP 值影响方向
{{MAJOR_RISK_FACTOR}} - 主要风险因素
{{SUGGESTIONS_LIST}} - 建议列表
```

### 数据填充增强
- 自动根据风险等级生成不同的解读文字
- 自动判断 SHAP 值正负，生成"增加风险"或"降低风险"标签
- CT_drug 自动转换为"是/否"或"Yes/No"
- 时间格式化：中文"2026年8月19日"，英文"August 19, 2026"

---

## 📊 测试结果

### 中文报告
- **文件名**：ATO-20260819-947513.pdf
- **文件大小**：252.2 KB
- **页数**：4 页（封面 + 3 页内容）
- **生成时间**：~3 秒
- **字体渲染**：✅ 中文显示正常，无乱码

### 英文报告
- **文件名**：ATO-20260819-682685-EN.pdf
- **文件大小**：102.8 KB
- **页数**：4 页（封面 + 3 页内容）
- **生成时间**：~3 秒
- **字体渲染**：✅ 英文显示正常

### 内容完整性检查
- ✅ 背景说明详细完整
- ✅ 输入参数表包含单位和说明
- ✅ 计算参数表包含公式说明
- ✅ 预测结果含详细解读
- ✅ SHAP 分析表包含影响方向和排名
- ✅ 临床建议个性化生成
- ✅ 注意事项全面
- ✅ 参考文献格式规范

### 样式检查
- ✅ 表格使用三线表样式
- ✅ 黑白主色调
- ✅ 无大面积彩色背景
- ✅ 风险等级仅用文字颜色标注
- ✅ 整体简洁专业

---

## 🚀 使用方法

### 1. 前端调用（保持不变）
```typescript
const response = await fetch('/api/generate-report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    language: 'zh', // 或 'en'
    predictionData: {
      input: { iAs, MMA, DMA, CT_drug },
      result: { prediction, metabolism, shap_values, major_risk_factor, suggestions },
      timestamp: new Date().toISOString()
    }
  })
})

const { pdfBase64, reportNumber, filename } = await response.json()
```

### 2. 独立测试
```bash
# 测试中文报告
node test-pdf-v2.js

# 测试英文报告
node test-pdf-v2-en.js
```

---

## 📌 注意事项

### 生产部署前检查
1. ✅ Puppeteer 依赖已安装
2. ✅ 模板文件路径正确
3. ✅ 字体文件可访问（系统自带宋体、微软雅黑）
4. ⚠️ Puppeteer 在 Docker 中需要额外配置（见下文）

### Docker 部署配置
如果在 Docker 容器中部署，需要：
```dockerfile
# Dockerfile 示例
FROM node:18-slim

# 安装 Puppeteer 依赖
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-wqy-zenhei \
    fonts-wqy-microhei \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 设置环境变量
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# ... 其他配置
```

### 性能优化建议
- 考虑实现 Puppeteer 浏览器实例池（避免每次启动）
- 大批量生成时使用队列机制
- 监控 PDF 生成时间和失败率

---

## ✅ 验收清单

### 内容完整性
- [x] 封面包含报告编号和时间
- [x] 第1页包含背景和两个数据表
- [x] 第2页包含预测结果和SHAP分析
- [x] 第3页包含建议、注意事项、参考文献
- [x] 所有数据正确填充
- [x] 中英文版本内容一致

### 样式规范
- [x] 表格使用三线表
- [x] 黑白主色调
- [x] 无大色块背景
- [x] 风险等级颜色标注清晰
- [x] 中文字体无乱码
- [x] 英文字体显示正常

### 技术实现
- [x] API 接口正常工作
- [x] 中文报告生成成功
- [x] 英文报告生成成功
- [x] PDF 大小合理（< 500KB）
- [x] 生成速度快（< 5秒）

---

## 🎉 总结

本次更新完全重写了 PDF 报告模板和生成逻辑，从最初的"彩色卡片"风格转变为"专业学术报告"风格，完全满足用户的所有要求：

1. **内容充实** - 从 3 个小表格扩展到 4 页完整报告
2. **样式专业** - 三线表 + 黑白主色调 + 简洁布局
3. **信息完整** - 背景、数据、结果、建议、注意事项、参考文献一应俱全
4. **技术可靠** - 中英文字体正常，无乱码，生成稳定

**生产就绪状态：✅ 可以部署**

---

**测试文件**：
- `ATO-20260819-947513.pdf` - 中文测试报告
- `ATO-20260819-682685-EN.pdf` - 英文测试报告

请打开这两个 PDF 文件进行最终人工验收！
