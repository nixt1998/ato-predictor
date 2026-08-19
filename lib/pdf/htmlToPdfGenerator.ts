/**
 * HTML 模板 PDF 生成器 - 使用 Puppeteer
 */

import puppeteer from 'puppeteer'
import * as fs from 'fs/promises'
import * as path from 'path'

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

    // 获取 Logo 路径
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png')
    let logoDataUrl = ''

    try {
      const logoBuffer = await fs.readFile(logoPath)
      const logoBase64 = logoBuffer.toString('base64')
      logoDataUrl = `data:image/png;base64,${logoBase64}`
    } catch (error) {
      console.warn('Logo file not found, using placeholder')
      // 使用 SVG 占位符
      logoDataUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60'%3E%3Ctext x='100' y='35' font-family='Arial' font-size='20' font-weight='bold' text-anchor='middle' fill='%23005EB8'%3EATO CardiTox%3C/text%3E%3C/svg%3E"
    }

    // 替换占位符
    htmlTemplate = this.fillTemplate(htmlTemplate, this.data, logoDataUrl)

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
   * 填充模板数据
   */
  private fillTemplate(template: string, data: PredictionData, logoDataUrl: string): string {
    const { input, result } = data
    const { prediction, metabolism, shap_values, major_risk_factor, suggestions } = result

    // 生成报告编号
    const reportNumber = this.config.reportNumber

    // 格式化时间
    const date = new Date(this.config.generatedAt)
    const formattedTime = this.config.language === 'zh'
      ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
      : date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })

    // 风险等级类名
    let riskClass = ''
    if (prediction.risk_level === 'high') riskClass = 'risk-high'
    else if (prediction.risk_level === 'medium') riskClass = 'risk-medium'
    else riskClass = 'risk-low'

    // 风险等级文本
    const riskText = this.config.language === 'zh'
      ? (prediction.class === 'Yes' ? '阳性（有毒性）' : '阴性（无毒性）')
      : (prediction.class === 'Yes' ? 'Positive (Toxic)' : 'Negative (Non-toxic)')

    const riskLevelText = this.config.language === 'zh'
      ? (prediction.risk_level === 'high' ? '高风险' : prediction.risk_level === 'medium' ? '中等风险' : '低风险')
      : (prediction.risk_level === 'high' ? 'High Risk' : prediction.risk_level === 'medium' ? 'Medium Risk' : 'Low Risk')

    // 风险解读
    const riskInterpretation = this.config.language === 'zh'
      ? (prediction.risk_level === 'high'
          ? '该患者发生ATO心脏毒性的风险较高，建议密切监测心电图，必要时调整治疗方案。'
          : prediction.risk_level === 'medium'
          ? '该患者发生ATO心脏毒性的风险为中等水平，建议定期复查心电图，加强观察。'
          : '该患者发生ATO心脏毒性的风险较低，但仍需常规监测。')
      : (prediction.risk_level === 'high'
          ? 'This patient has a high risk of ATO cardiotoxicity. Close ECG monitoring and treatment adjustment are recommended.'
          : prediction.risk_level === 'medium'
          ? 'This patient has a moderate risk of ATO cardiotoxicity. Regular ECG follow-up is recommended.'
          : 'This patient has a low risk of ATO cardiotoxicity, but routine monitoring is still needed.')

    // SHAP 影响方向
    const getDirection = (value: number) => {
      if (this.config.language === 'zh') {
        return value > 0 ? '增加风险' : value < 0 ? '降低风险' : '无影响'
      } else {
        return value > 0 ? 'Increase Risk' : value < 0 ? 'Decrease Risk' : 'No Effect'
      }
    }

    // CT_drug 文本
    const ctDrugText = this.config.language === 'zh'
      ? (input.CT_drug === 'Yes' ? '是' : '否')
      : input.CT_drug

    // 填充建议列表
    const suggestionsList = suggestions.map((s) => {
      return `<li>${s.risk_factor}：${s.suggestion}</li>`
    }).join('\n      ')

    // 替换所有占位符
    return template
      .replace(/{{REPORT_NUMBER}}/g, reportNumber)
      .replace(/{{GENERATE_TIME}}/g, formattedTime)
      .replace(/{{IAS}}/g, input.iAs.toFixed(2))
      .replace(/{{MMA}}/g, input.MMA.toFixed(2))
      .replace(/{{DMA}}/g, input.DMA.toFixed(2))
      .replace(/{{CT_DRUG}}/g, ctDrugText)
      .replace(/{{TAS}}/g, metabolism.tAs.toFixed(2))
      .replace(/{{PMI}}/g, metabolism.PMI.toFixed(3))
      .replace(/{{SMI}}/g, metabolism.SMI.toFixed(3))
      .replace(/{{IAS_PCT}}/g, metabolism.iAs_pct.toFixed(1))
      .replace(/{{MMA_PCT}}/g, metabolism.MMA_pct.toFixed(1))
      .replace(/{{DMA_PCT}}/g, metabolism.DMA_pct.toFixed(1))
      .replace(/{{RISK_CLASS}}/g, riskClass)
      .replace(/{{RISK_TEXT}}/g, riskText)
      .replace(/{{RISK_LEVEL_TEXT}}/g, riskLevelText)
      .replace(/{{RISK_INTERPRETATION}}/g, riskInterpretation)
      .replace(/{{PROBABILITY}}/g, (prediction.probability * 100).toFixed(1))
      .replace(/{{SHAP_TAS}}/g, shap_values.tAs.toFixed(4))
      .replace(/{{SHAP_SMI}}/g, shap_values.SMI.toFixed(4))
      .replace(/{{SHAP_MMA_PER}}/g, shap_values.MMA_per.toFixed(4))
      .replace(/{{SHAP_DMA_PER}}/g, shap_values.DMA_per.toFixed(4))
      .replace(/{{SHAP_CT_DRUG}}/g, shap_values.CT_drug.toFixed(4))
      .replace(/{{SHAP_TAS_DIRECTION}}/g, getDirection(shap_values.tAs))
      .replace(/{{SHAP_SMI_DIRECTION}}/g, getDirection(shap_values.SMI))
      .replace(/{{SHAP_MMA_PER_DIRECTION}}/g, getDirection(shap_values.MMA_per))
      .replace(/{{SHAP_DMA_PER_DIRECTION}}/g, getDirection(shap_values.DMA_per))
      .replace(/{{SHAP_CT_DRUG_DIRECTION}}/g, getDirection(shap_values.CT_drug))
      .replace(/{{MAJOR_RISK_FACTOR}}/g, major_risk_factor)
      .replace(/{{SUGGESTIONS_LIST}}/g, suggestionsList)
      .replace(/{{LOGO_PATH}}/g, logoDataUrl)
      // 模板中用相对路径 ../public/images/logo.png 便于浏览器双击预览；
      // 生成 PDF 时用 setContent 无法解析相对路径，故替换为 base64 data URL
      .replace(/\.\.\/public\/images\/logo\.png/g, logoDataUrl)
  }
}
