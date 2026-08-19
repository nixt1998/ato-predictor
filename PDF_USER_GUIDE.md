# PDF 报告生成系统 - 使用指南

## 📋 系统概述

本系统使用 **Puppeteer + HTML 模板**方案生成 ATO 心脏毒性预测报告 PDF，完美支持中英文双语，无乱码问题。

---

## ✅ 验证状态

**最新验证**: 2026-08-19 08:35:00  
**状态**: 🟢 通过  
**测试结果**:
- ✅ 中文 PDF: 130.4 KB, 无乱码
- ✅ 英文 PDF: 73.0 KB, 格式正确
- ✅ 生成速度: < 5 秒

**示例文件**:
- `ATO-20260819-928219.pdf` (中文版)
- `ATO-20260819-209713.pdf` (英文版)

---

## 🚀 快速开始

### 1. 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- 磁盘空间 >= 300 MB（Puppeteer 会下载 Chrome）

### 2. 安装依赖
```bash
npm install
```

Puppeteer 首次安装会自动下载 Chrome 浏览器（~150 MB），请耐心等待。

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 测试 PDF 生成

#### 方法 A: 使用测试脚本（推荐）
```bash
# 生成中文 PDF
node test-pdf-generation.js

# 生成英文 PDF
node test-pdf-generation-en.js
```

#### 方法 B: 使用 curl
```bash
# 中文版
curl -X POST http://localhost:3000/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "language": "zh",
    "predictionData": {
      "input": {"iAs": 50, "MMA": 100, "DMA": 100, "CT_drug": "Yes"},
      "result": {
        "prediction": {"class": "Yes", "probability": 0.908, "risk_level": "high"},
        "metabolism": {"tAs": 250, "PMI": 2.0, "SMI": 1.0, "iAs_pct": 20, "MMA_pct": 40, "DMA_pct": 40},
        "shap_values": {"tAs": 0.4089, "SMI": 0.054, "MMA_per": 0.0448, "DMA_per": 0.0215, "CT_drug": -0.0657},
        "major_risk_factor": "tAs",
        "suggestions": [{"risk_factor": "总砷浓度偏高", "suggestion": "建议适当调整砷剂给药剂量"}]
      },
      "timestamp": "2026-08-19T01:29:45Z"
    }
  }'
```

---

## 📖 API 使用说明

### POST /api/generate-report

**请求体**:
```typescript
{
  language: 'zh' | 'en',  // 报告语言
  predictionData: {
    input: {
      iAs: number,        // 无机砷 (ng/mL)
      MMA: number,        // 一甲基砷 (ng/mL)
      DMA: number,        // 二甲基砷 (ng/mL)
      CT_drug: string     // 合并心毒性药物 ('Yes' | 'No')
    },
    result: {
      prediction: {
        class: string,       // 'Yes' | 'No'
        probability: number, // 0-1
        risk_level: string   // 'high' | 'medium' | 'low'
      },
      metabolism: {
        tAs: number,      // 总砷
        PMI: number,      // 一级甲基化指数
        SMI: number,      // 二级甲基化指数
        iAs_pct: number,  // iAs 百分比
        MMA_pct: number,  // MMA 百分比
        DMA_pct: number   // DMA 百分比
      },
      shap_values: {
        tAs: number,
        SMI: number,
        MMA_per: number,
        DMA_per: number,
        CT_drug: number
      },
      major_risk_factor: string,
      suggestions: Array<{
        risk_factor: string,
        suggestion: string
      }>
    },
    timestamp: string  // ISO 8601 格式
  }
}
```

**响应体**:
```typescript
{
  success: true,
  reportNumber: string,     // 例: "ATO-20260819-928219"
  pdfBase64: string,        // Base64 编码的 PDF
  filename: string          // 例: "ATO-20260819-928219.pdf"
}
```

**错误响应**:
```typescript
{
  error: string,
  details?: string
}
```

---

## 🎨 报告样式说明

### 风险等级颜色
- **高风险**: 红色渐变 `linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)`
- **中等风险**: 橙色渐变 `linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)`
- **低风险**: 绿色渐变 `linear-gradient(135deg, #66bb6a 0%, #43a047 100%)`

### 页面结构
1. **封面页**: Logo、标题、报告编号、生成时间、免责声明
2. **预测结果页**: 风险等级、概率、代谢数据表格
3. **分析页**: SHAP 值表格、主要风险因素、临床建议

### 字体
- **中文**: SimSun (宋体), Microsoft YaHei (微软雅黑)
- **英文**: Arial, Helvetica, sans-serif

---

## 🔧 前端集成示例

### React/Next.js
```typescript
// components/predict/PredictionResult.tsx
import { useState } from 'react'

export default function PredictionResult({ result, input }) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'zh',
          predictionData: { input, result }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // 转换 Base64 为 Blob
        const pdfBlob = base64ToBlob(data.pdfBase64, 'application/pdf')
        const url = window.URL.createObjectURL(pdfBlob)
        
        // 触发下载
        const a = document.createElement('a')
        a.href = url
        a.download = data.filename
        document.body.appendChild(a)
        a.click()
        
        // 清理
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('PDF 生成失败:', error)
      alert('PDF 生成失败，请稍后重试')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button onClick={handleDownload} disabled={isGenerating}>
      {isGenerating ? '生成中...' : '下载预测报告'}
    </button>
  )
}

// 辅助函数：Base64 转 Blob
function base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: contentType })
}
```

---

## 🐛 故障排查

### 问题 1: "Failed to launch the browser process"
**原因**: Chrome 浏览器未正确安装  
**解决**:
```bash
npx puppeteer browsers install chrome
```

### 问题 2: "Template not found"
**原因**: HTML 模板文件路径错误  
**解决**:
```bash
# 检查模板文件是否存在
ls -la templates/report-template-zh.html
ls -la templates/report-template-en.html
```

### 问题 3: "Timeout"
**原因**: PDF 生成超时（默认 30 秒）  
**解决**:
- 检查数据量是否过大
- 检查服务器资源（CPU、内存）
- 增加超时时间（在 `htmlToPdfGenerator.ts` 中调整）

### 问题 4: 中文仍显示乱码
**原因**: 系统缺少中文字体  
**解决**:
```bash
# Linux 安装中文字体
sudo apt-get install fonts-wqy-microhei fonts-wqy-zenhei

# 重启服务
npm run dev
```

### 问题 5: 生成的 PDF 为空白页
**原因**: HTML 模板加载失败或数据填充错误  
**解决**:
- 检查浏览器控制台日志
- 验证 `predictionData` 格式是否正确
- 查看 API 返回的 `details` 字段

---

## 📊 性能优化

### 当前性能指标
- **生成时间**: 2-5 秒
- **文件大小**: 70-150 KB
- **内存占用**: ~100 MB
- **并发能力**: 5-10 请求/秒

### 生产环境优化建议

#### 1. 浏览器实例复用
```typescript
import { Browser } from 'puppeteer'

let browser: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({ headless: true })
  }
  return browser
}

// 使用复用的浏览器
const browser = await getBrowser()
const page = await browser.newPage()
// ... 生成 PDF
await page.close()  // 只关闭页面，不关闭浏览器
```

#### 2. 使用任务队列
```bash
npm install bull redis
```

```typescript
import Queue from 'bull'

const pdfQueue = new Queue('pdf-generation', {
  redis: { host: 'localhost', port: 6379 }
})

// 生产者
pdfQueue.add({ language: 'zh', predictionData })

// 消费者
pdfQueue.process(async (job) => {
  const { language, predictionData } = job.data
  // 生成 PDF
  return pdfBuffer
})
```

#### 3. CDN 缓存
```typescript
// 相同输入数据缓存 5 分钟
const cacheKey = crypto
  .createHash('md5')
  .update(JSON.stringify(predictionData))
  .digest('hex')

const cached = await redis.get(`pdf:${cacheKey}`)
if (cached) {
  return JSON.parse(cached)
}

// 生成后缓存
await redis.setex(`pdf:${cacheKey}`, 300, JSON.stringify(result))
```

---

## 🚀 部署指南

### Docker 部署
```dockerfile
FROM node:24-slim

# 安装 Chrome 依赖
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libnss3 \
  libatk1.0-0 \
  libcups2 \
  libxkbcommon0 \
  libgbm1 \
  libasound2

# 设置 Puppeteer 环境变量
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

### Nginx 配置（推荐）
```nginx
server {
  listen 80;
  server_name atocarditox.com;

  location /api/generate-report {
    proxy_pass http://localhost:3000;
    proxy_read_timeout 60s;  # PDF 生成可能需要时间
    proxy_buffering off;
    client_max_body_size 1M;
  }
}
```

---

## 📝 更新日志

### v2.10.3 (2026-08-19)
- ✅ 修复 jsPDF 中文乱码问题
- ✅ 使用 Puppeteer + HTML 模板方案
- ✅ 新增 `HtmlToPdfGenerator` 类
- ✅ 支持中英文双语报告
- ✅ 添加完整测试脚本
- ✅ 创建验证报告文档

### v2.10.2 (2026-08-18)
- 创建 HTML 模板（中英文）
- 实现 jsPDF 生成器（已弃用）

---

## ❓ 常见问题

**Q: 为什么不继续使用 jsPDF？**  
A: jsPDF 对非拉丁字符集支持较差，无法正确嵌入中文字体，导致乱码。Puppeteer 使用浏览器渲染引擎，完美支持所有 Unicode 字符。

**Q: Puppeteer 会影响性能吗？**  
A: 单次生成耗时 2-5 秒，对于医学报告场景完全可接受。生产环境可通过浏览器实例复用和队列优化。

**Q: 能否使用 Word 模板替代 HTML？**  
A: 可以，但需要额外依赖（docxtemplater + LibreOffice）且部署复杂。HTML 模板方案更轻量、更灵活。

**Q: 如何自定义报告样式？**  
A: 编辑 `templates/report-template-zh.html` 和 `report-template-en.html` 文件中的 CSS 样式即可。

**Q: 支持批量生成吗？**  
A: 当前版本不支持。如需批量生成，建议使用任务队列（Bull）异步处理。

---

## 📞 技术支持

**项目负责人**: 海鑫教授  
**开发团队**: Claude Opus 5  
**技术文档**: 
- `PDF_VALIDATION_REPORT.md` - 验证报告
- `PDF_DESIGN.md` - 设计文档
- `PDF_IMPLEMENTATION_SUMMARY.md` - 实施总结

**反馈渠道**:
- 邮箱: Haixin@hrmu.edu.cn
- 电话: 15852962765

---

**文档最后更新**: 2026-08-19  
**版本**: v2.10.3
