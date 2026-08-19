/**
 * HTML 模板 PDF 生成器 - 使用 Puppeteer
 *
 * 解决 jsPDF 中文乱码问题
 */

import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'

export interface PredictionData {
  input: {
    iAs: number
    MMA: number
    DMA: number
    CT_drug: string
  }
  result: {
    prediction: {
      class: string
      probability: number
      risk_level: string
    }
    metabolism: {
      tAs: number
      PMI: number
      SMI: number
      iAs_pct: number
      MMA_pct: number
      DMA_pct: number
    }
    shap_values: {
      tAs: number
      SMI: number
      MMA_per: number
      DMA_per: number
      CT_drug: number
    }
    major_risk_factor: string
    suggestions: Array<{
      key?: string
      risk_factor: string
      suggestion: string
    }>
  }
  timestamp: string
}

export interface PDFConfig {
  language: 'zh' | 'en'
  reportNumber: string
  generatedAt: string
}

/**
 * HTML 模板 PDF 生成器
 */
export class HtmlToPdfGenerator {
  private config: PDFConfig
  private data: PredictionData

  constructor(config: PDFConfig, data: PredictionData) {
    this.config = config
    this.data = data
  }

  /**
   * 生成 PDF
   */
  async generate(): Promise<Buffer> {
    // 读取 HTML 模板
    const templatePath = path.join(
      process.cwd(),
      'templates',
      `report-template-${this.config.language}.html`
    )

    let htmlTemplate = await fs.readFile(templatePath, 'utf-8')

    // 替换占位符
    htmlTemplate = this.fillTemplate(htmlTemplate)

    // 使用 Puppeteer 生成 PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
      const page = await browser.newPage()
      await page.setContent(htmlTemplate, {
        waitUntil: 'load'
      })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        }
      })

      return Buffer.from(pdfBuffer)
    } finally {
      await browser.close()
    }
  }

  /**
   * 填充 HTML 模板数据
   */
  private fillTemplate(html: string): string {
    const { prediction, metabolism, shap_values, major_risk_factor, suggestions } = this.data.result
    const { input } = this.data

    // 替换报告编号和时间
    html = html.replace(/ATO-\d{8}-\d{6}/g, this.config.reportNumber)
    html = html.replace(
      /生成时间:.*?<\/div>|Generated:.*?<\/div>/,
      `${this.config.language === 'zh' ? '生成时间' : 'Generated'}: ${this.formatDate(this.config.generatedAt)}</div>`
    )

    // 替换风险等级和概率
    const riskClass = this.getRiskClass(prediction.risk_level)
    html = html.replace(/class="result-box"/g, `class="result-box ${riskClass}"`)

    const riskLabel = this.getRiskLabel(prediction.risk_level)
    html = html.replace(/>高风险<|>High Risk</g, `>${riskLabel}<`)
    html = html.replace(/>90\.8%<</g, `>${(prediction.probability * 100).toFixed(1)}%<`)

    // 替换代谢数据表格
    html = this.replaceMetabolismTable(html, input, metabolism)

    // 替换 SHAP 值表格
    html = this.replaceShapTable(html, shap_values, major_risk_factor)

    // 替换临床建议
    html = this.replaceSuggestions(html, suggestions)

    return html
  }

  /**
   * 替换代谢数据表格
   */
  private replaceMetabolismTable(
    html: string,
    input: PredictionData['input'],
    metabolism: PredictionData['result']['metabolism']
  ): string {
    const rows = [
      ['iAs', input.iAs.toFixed(2), metabolism.iAs_pct.toFixed(1)],
      ['MMA', input.MMA.toFixed(2), metabolism.MMA_pct.toFixed(1)],
      ['DMA', input.DMA.toFixed(2), metabolism.DMA_pct.toFixed(1)],
      ['tAs', metabolism.tAs.toFixed(2), '100.0'],
      ['PMI', metabolism.PMI.toFixed(3), '-'],
      ['SMI', metabolism.SMI.toFixed(3), '-']
    ]

    let tableHtml = ''
    rows.forEach(([name, value, pct]) => {
      tableHtml += `
        <tr>
          <td>${name}</td>
          <td>${value}</td>
          <td>${pct === '-' ? '-' : pct + '%'}</td>
        </tr>`
    })

    // 查找并替换表格内容（从第一个 <tr> 到最后一个 </tr>）
    html = html.replace(
      /(<tbody>)([\s\S]*?)(<\/tbody>)/,
      (match, open, content, close) => {
        if (match.includes('iAs') && match.includes('50.00')) {
          return open + tableHtml + close
        }
        return match
      }
    )

    return html
  }

  /**
   * 替换 SHAP 值表格
   */
  private replaceShapTable(
    html: string,
    shap: PredictionData['result']['shap_values'],
    majorFactor: string
  ): string {
    const rows = [
      ['tAs', shap.tAs.toFixed(4)],
      ['SMI', shap.SMI.toFixed(4)],
      ['MMA%', shap.MMA_per.toFixed(4)],
      ['DMA%', shap.DMA_per.toFixed(4)],
      ['CT_drug', shap.CT_drug.toFixed(4)]
    ]

    let tableHtml = ''
    rows.forEach(([feature, value]) => {
      tableHtml += `
        <tr>
          <td>${feature}</td>
          <td>${value}</td>
        </tr>`
    })

    // 替换 SHAP 表格
    html = html.replace(
      /(<tbody>)([\s\S]*?)(<\/tbody>)/g,
      (match, open, content, close) => {
        if (match.includes('0.4089') || match.includes('0.0540')) {
          return open + tableHtml + close
        }
        return match
      }
    )

    // 替换主要风险因素
    html = html.replace(
      /主要风险因素:.*?<\/p>|Major Risk Factor:.*?<\/p>/,
      `${this.config.language === 'zh' ? '主要风险因素' : 'Major Risk Factor'}: ${majorFactor}</p>`
    )

    return html
  }

  /**
   * 替换临床建议
   */
  private replaceSuggestions(
    html: string,
    suggestions: PredictionData['result']['suggestions']
  ): string {
    let suggestionsHtml = ''

    suggestions.forEach((sug, index) => {
      suggestionsHtml += `
      <li>
        <span class="risk-factor">${index + 1}. ${sug.risk_factor}:</span>
        ${sug.suggestion}
      </li>`
    })

    // 替换建议列表
    html = html.replace(
      /(<ul class="suggestion-list">)([\s\S]*?)(<\/ul>)/,
      (match, open, content, close) => {
        return open + suggestionsHtml + close
      }
    )

    return html
  }

  /**
   * 获取风险等级 CSS 类名
   */
  private getRiskClass(riskLevel: string): string {
    const level = riskLevel.toLowerCase()
    if (level === 'high') return ''
    if (level === 'medium' || level === 'moderate') return 'medium'
    return 'low'
  }

  /**
   * 获取风险等级标签
   */
  private getRiskLabel(riskLevel: string): string {
    const level = riskLevel.toLowerCase()
    if (this.config.language === 'zh') {
      if (level === 'high') return '高风险'
      if (level === 'medium' || level === 'moderate') return '中等风险'
      return '低风险'
    } else {
      if (level === 'high') return 'High Risk'
      if (level === 'medium' || level === 'moderate') return 'Moderate Risk'
      return 'Low Risk'
    }
  }

  /**
   * 格式化日期
   */
  private formatDate(isoString: string): string {
    const date = new Date(isoString)

    if (this.config.language === 'zh') {
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    } else {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }
}
