/**
 * PDF 报告生成器 - 使用 jsPDF
 *
 * 替代 PDFKit，避免文件系统路径问题
 */

import jsPDF from 'jspdf'

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

const COLORS = {
  primary: '#005EB8',
  danger: '#DA291C',
  warning: '#ED8B00',
  success: '#007F3B',
  text: '#212121',
  lightGray: '#F5F5F5',
  border: '#E0E0E0',
}

export class jsPDFGenerator {
  private doc: jsPDF
  private config: PDFConfig
  private data: PredictionData
  private currentY: number = 20
  private pageWidth: number
  private pageHeight: number
  private margin: number = 20

  constructor(config: PDFConfig, data: PredictionData) {
    this.config = config
    this.data = data
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
  }

  /**
   * 生成完整报告
   */
  generate(): jsPDF {
    this.addHeader()
    this.addReportInfo()
    this.addPredictionResult()
    this.addMetabolismData()
    this.addSHAPValues()
    this.addClinicalSuggestions()
    this.addFooter()
    return this.doc
  }

  /**
   * 添加页眉
   */
  private addHeader() {
    const title = this.config.language === 'zh'
      ? 'ATO 心脏毒性风险预测报告'
      : 'ATO CardiTox Risk Prediction Report'

    this.doc.setFontSize(20)
    this.doc.setTextColor(COLORS.primary)
    this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' })

    this.currentY += 15

    // 分隔线
    this.doc.setDrawColor(COLORS.border)
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)

    this.currentY += 10
  }

  /**
   * 添加报告信息
   */
  private addReportInfo() {
    this.doc.setFontSize(10)
    this.doc.setTextColor(COLORS.text)

    const reportNumLabel = this.config.language === 'zh' ? '报告编号:' : 'Report Number:'
    const dateLabel = this.config.language === 'zh' ? '生成时间:' : 'Generated:'

    this.doc.text(`${reportNumLabel} ${this.config.reportNumber}`, this.margin, this.currentY)
    this.currentY += 6

    const date = new Date(this.config.generatedAt).toLocaleString(
      this.config.language === 'zh' ? 'zh-CN' : 'en-US'
    )
    this.doc.text(`${dateLabel} ${date}`, this.margin, this.currentY)

    this.currentY += 12
  }

  /**
   * 添加预测结果
   */
  private addPredictionResult() {
    this.addSectionTitle(
      this.config.language === 'zh' ? '预测结果' : 'Prediction Result'
    )

    const { prediction } = this.data.result

    // 风险等级框
    const boxHeight = 25
    const boxY = this.currentY

    // 背景色
    const riskColor = prediction.risk_level === 'HIGH' ? COLORS.danger :
                     prediction.risk_level === 'MODERATE' ? COLORS.warning :
                     COLORS.success

    this.doc.setFillColor(riskColor)
    this.doc.rect(this.margin, boxY, this.pageWidth - 2 * this.margin, boxHeight, 'F')

    // 文字
    this.doc.setFontSize(16)
    this.doc.setTextColor(255, 255, 255)

    const riskLabel = this.config.language === 'zh'
      ? prediction.risk_level === 'HIGH' ? '高风险' :
        prediction.risk_level === 'MODERATE' ? '中等风险' : '低风险'
      : prediction.risk_level

    this.doc.text(riskLabel, this.pageWidth / 2, boxY + 10, { align: 'center' })

    this.doc.setFontSize(12)
    const probText = `${this.config.language === 'zh' ? '毒性概率' : 'Probability'}: ${(prediction.probability * 100).toFixed(1)}%`
    this.doc.text(probText, this.pageWidth / 2, boxY + 18, { align: 'center' })

    this.currentY += boxHeight + 10
  }

  /**
   * 添加代谢数据
   */
  private addMetabolismData() {
    this.addSectionTitle(
      this.config.language === 'zh' ? '砷代谢指标' : 'Arsenic Metabolism'
    )

    const { metabolism } = this.data.result
    const { input } = this.data

    const data = [
      ['iAs', input.iAs.toFixed(2), metabolism.iAs_pct.toFixed(1) + '%'],
      ['MMA', input.MMA.toFixed(2), metabolism.MMA_pct.toFixed(1) + '%'],
      ['DMA', input.DMA.toFixed(2), metabolism.DMA_pct.toFixed(1) + '%'],
      ['tAs', metabolism.tAs.toFixed(2), '100.0%'],
      ['PMI', metabolism.PMI.toFixed(3), '-'],
      ['SMI', metabolism.SMI.toFixed(3), '-'],
    ]

    this.addTable(
      [
        this.config.language === 'zh' ? '指标' : 'Metric',
        this.config.language === 'zh' ? '数值' : 'Value',
        this.config.language === 'zh' ? '百分比' : 'Percentage'
      ],
      data
    )
  }

  /**
   * 添加 SHAP 值
   */
  private addSHAPValues() {
    this.addSectionTitle(
      this.config.language === 'zh' ? '特征重要性 (SHAP值)' : 'Feature Importance (SHAP)'
    )

    const { shap_values, major_risk_factor } = this.data.result

    const data = [
      ['tAs', shap_values.tAs.toFixed(4)],
      ['SMI', shap_values.SMI.toFixed(4)],
      ['MMA%', shap_values.MMA_per.toFixed(4)],
      ['DMA%', shap_values.DMA_per.toFixed(4)],
      ['CT_drug', shap_values.CT_drug.toFixed(4)],
    ]

    this.addTable(
      [
        this.config.language === 'zh' ? '特征' : 'Feature',
        this.config.language === 'zh' ? 'SHAP值' : 'SHAP Value'
      ],
      data
    )

    this.doc.setFontSize(10)
    this.doc.setTextColor(COLORS.text)
    const majorLabel = this.config.language === 'zh' ? '主要风险因素:' : 'Major Risk Factor:'
    this.doc.text(`${majorLabel} ${major_risk_factor}`, this.margin, this.currentY)
    this.currentY += 10
  }

  /**
   * 添加临床建议
   */
  private addClinicalSuggestions() {
    this.addSectionTitle(
      this.config.language === 'zh' ? '临床建议' : 'Clinical Suggestions'
    )

    this.doc.setFontSize(10)
    this.doc.setTextColor(COLORS.text)

    const suggestions = this.data.result.suggestions || []

    suggestions.forEach((suggestion, index) => {
      const bullet = `${index + 1}. `
      const text = `${suggestion.risk_factor}: ${suggestion.suggestion}`
      const lines = this.doc.splitTextToSize(
        text,
        this.pageWidth - 2 * this.margin - 10
      )

      this.doc.text(bullet, this.margin, this.currentY)
      this.doc.text(lines, this.margin + 10, this.currentY)

      this.currentY += lines.length * 5 + 3

      if (this.currentY > this.pageHeight - 30) {
        this.doc.addPage()
        this.currentY = 20
      }
    })

    this.currentY += 5
  }

  /**
   * 添加页脚
   */
  private addFooter() {
    const footerY = this.pageHeight - 15

    this.doc.setFontSize(8)
    this.doc.setTextColor(100, 100, 100)

    const disclaimer = this.config.language === 'zh'
      ? '* 本报告仅供临床参考,不作为最终诊断依据'
      : '* This report is for clinical reference only'

    this.doc.text(disclaimer, this.pageWidth / 2, footerY, { align: 'center' })
  }

  /**
   * 添加章节标题
   */
  private addSectionTitle(title: string) {
    this.doc.setFontSize(14)
    this.doc.setTextColor(COLORS.primary)
    this.doc.text(title, this.margin, this.currentY)
    this.currentY += 8
  }

  /**
   * 添加表格
   */
  private addTable(headers: string[], data: string[][]) {
    const colWidth = (this.pageWidth - 2 * this.margin) / headers.length
    const rowHeight = 8

    // 表头
    this.doc.setFillColor(COLORS.lightGray)
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, rowHeight, 'F')

    this.doc.setFontSize(10)
    this.doc.setTextColor(COLORS.text)

    headers.forEach((header, i) => {
      this.doc.text(
        header,
        this.margin + i * colWidth + colWidth / 2,
        this.currentY + 5.5,
        { align: 'center' }
      )
    })

    this.currentY += rowHeight

    // 数据行
    data.forEach((row) => {
      row.forEach((cell, i) => {
        this.doc.text(
          cell,
          this.margin + i * colWidth + colWidth / 2,
          this.currentY + 5.5,
          { align: 'center' }
        )
      })

      this.currentY += rowHeight
    })

    // 表格边框
    this.doc.setDrawColor(COLORS.border)
    this.doc.rect(this.margin, this.currentY - data.length * rowHeight - rowHeight, this.pageWidth - 2 * this.margin, (data.length + 1) * rowHeight)

    this.currentY += 10
  }
}
