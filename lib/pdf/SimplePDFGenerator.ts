import jsPDF from 'jspdf'
import type { PredictionData, PDFConfig } from './PDFGenerator'

/**
 * 简化版 PDF 生成器（使用 jsPDF）
 * 适用于 Next.js Turbopack 环境
 */
export class SimplePDFGenerator {
  private doc: jsPDF
  private config: PDFConfig
  private data: PredictionData
  private currentY: number = 20

  // 页面配置
  private readonly PAGE_WIDTH = 210 // A4 宽度 (mm)
  private readonly PAGE_HEIGHT = 297 // A4 高度 (mm)
  private readonly MARGIN = 20

  // 颜色
  private readonly COLORS = {
    primary: [0, 94, 184],
    low: [40, 167, 69],
    medium: [253, 126, 20],
    high: [220, 53, 69],
    text: [33, 33, 33],
    textLight: [117, 117, 117],
  }

  constructor(config: PDFConfig, data: PredictionData) {
    this.config = config
    this.data = data
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })
  }

  public generate(): jsPDF {
    // 第1页：封面
    this.addCoverPage()

    // 第2页：输入数据和结果
    this.doc.addPage()
    this.currentY = 20
    this.addInputDataPage()
    this.addResultSection()

    // 第3页：代谢参数和建议
    if (this.data.arsMetabolism) {
      this.doc.addPage()
      this.currentY = 20
      this.addMetabolismPage()
    }

    this.addRecommendations()

    return this.doc
  }

  private addCoverPage(): void {
    const centerX = this.PAGE_WIDTH / 2

    // 标题
    this.doc.setFontSize(24)
    this.doc.setTextColor(...this.COLORS.primary)
    this.doc.text('ATO CardiTox', centerX, 80, { align: 'center' })

    this.doc.setFontSize(20)
    this.doc.text(this.t('reportTitle'), centerX, 95, { align: 'center' })

    // 分隔线
    this.doc.setDrawColor(...this.COLORS.primary)
    this.doc.setLineWidth(1)
    this.doc.line(55, 105, 155, 105)

    // 报告编号
    this.doc.setFontSize(12)
    this.doc.setTextColor(...this.COLORS.text)
    this.doc.text(`${this.t('reportNumber')}: ${this.config.reportNumber}`, centerX, 120, { align: 'center' })

    // 生成时间
    this.doc.setFontSize(10)
    this.doc.text(`${this.t('generatedAt')}: ${this.formatDateTime(this.config.generatedAt)}`, centerX, 130, { align: 'center' })

    // 免责声明
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.COLORS.textLight)
    const disclaimer = this.t('disclaimerShort')
    const lines = this.doc.splitTextToSize(disclaimer, 150)
    this.doc.text(lines, centerX, 160, { align: 'center' })

    // 版本号
    this.doc.setFontSize(8)
    this.doc.text('v2.10.3', centerX, 280, { align: 'center' })
  }

  private addInputDataPage(): void {
    this.doc.setFontSize(16)
    this.doc.setTextColor(...this.COLORS.text)
    this.doc.text(this.t('inputDataTitle'), this.MARGIN, this.currentY)
    this.currentY += 15

    const data = [
      ['三氧化二砷剂量', `${this.data.inputs.dose.toFixed(2)} mg`],
      ['血钾 (K⁺)', `${this.data.inputs.K.toFixed(2)} mmol/L`],
      ['血镁 (Mg²⁺)', `${this.data.inputs.Mg.toFixed(2)} mmol/L`],
      ['血钙 (Ca²⁺)', `${this.data.inputs.Ca.toFixed(2)} mmol/L`],
      ['肌酐清除率', `${this.data.inputs.CCr.toFixed(1)} mL/min`],
      ['合并心毒性药物', this.data.inputs.cardiotoxicDrug === 'yes' ? '是' : '否'],
    ]

    this.doc.setFontSize(10)
    data.forEach(([label, value]) => {
      this.doc.setTextColor(...this.COLORS.text)
      this.doc.text(label, this.MARGIN, this.currentY)
      this.doc.text(value, 120, this.currentY)
      this.currentY += 8
    })

    this.currentY += 10
  }

  private addResultSection(): void {
    this.doc.setFontSize(16)
    this.doc.setTextColor(...this.COLORS.text)
    this.doc.text(this.t('resultTitle'), this.MARGIN, this.currentY)
    this.currentY += 15

    // 风险概率
    const probability = (this.data.results.probability * 100).toFixed(1)
    const color = this.getRiskColor(this.data.results.riskLevel)

    this.doc.setFontSize(36)
    this.doc.setTextColor(...color)
    this.doc.text(`${probability}%`, this.PAGE_WIDTH / 2, this.currentY, { align: 'center' })
    this.currentY += 15

    // 风险等级
    this.doc.setFontSize(18)
    this.doc.text(this.t(`riskLevel.${this.data.results.riskLevel}`), this.PAGE_WIDTH / 2, this.currentY, { align: 'center' })
    this.currentY += 20

    // 风险说明
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.COLORS.textLight)
    const explanation = this.t('riskExplanation')
    const lines = this.doc.splitTextToSize(explanation, 150)
    this.doc.text(lines, this.PAGE_WIDTH / 2, this.currentY, { align: 'center' })
    this.currentY += 20
  }

  private addMetabolismPage(): void {
    if (!this.data.arsMetabolism) return

    this.doc.setFontSize(16)
    this.doc.setTextColor(...this.COLORS.text)
    this.doc.text(this.t('metabolismTitle'), this.MARGIN, this.currentY)
    this.currentY += 15

    const m = this.data.arsMetabolism
    const data = [
      ['iAs (%)', m.iAsPercent.toFixed(1), '< 20'],
      ['MMA (%)', m.MMAPercent.toFixed(1), '10 - 20'],
      ['DMA (%)', m.DMAPercent.toFixed(1), '> 60'],
      ['PMI', m.PMI.toFixed(3), '> 0.7'],
      ['SMI', m.SMI.toFixed(3), '> 4.0'],
    ]

    this.doc.setFontSize(10)
    this.doc.text('参数', this.MARGIN, this.currentY)
    this.doc.text('检测值', 80, this.currentY)
    this.doc.text('参考范围', 130, this.currentY)
    this.currentY += 8

    data.forEach(([label, value, reference]) => {
      this.doc.setTextColor(...this.COLORS.text)
      this.doc.text(label, this.MARGIN, this.currentY)
      this.doc.text(value, 80, this.currentY)
      this.doc.setTextColor(...this.COLORS.textLight)
      this.doc.text(reference, 130, this.currentY)
      this.currentY += 8
    })

    this.currentY += 10
  }

  private addRecommendations(): void {
    if (this.currentY > 240) {
      this.doc.addPage()
      this.currentY = 20
    }

    this.doc.setFontSize(16)
    this.doc.setTextColor(...this.COLORS.text)
    this.doc.text(this.t('recommendationsTitle'), this.MARGIN, this.currentY)
    this.currentY += 15

    const recommendations = this.getRecommendations()

    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.COLORS.text)
    recommendations.forEach((rec) => {
      const lines = this.doc.splitTextToSize(`• ${rec}`, 160)
      this.doc.text(lines, this.MARGIN, this.currentY)
      this.currentY += lines.length * 6 + 3
    })
  }

  private getRecommendations(): string[] {
    const level = this.data.results.riskLevel
    const recs = [
      level === 'low' ? '每周监测心电图和电解质' :
      level === 'medium' ? '每周2次心电图，每3-4天监测电解质' :
      '每日心电图和电解质监测，考虑ICU监护',
      '维持血钾 ≥ 4.0 mmol/L，血镁 ≥ 0.8 mmol/L，血钙 ≥ 2.1 mmol/L',
      '避免合并使用延长QT间期的药物',
    ]

    if (level !== 'low') {
      recs.push('密切关注QT间期延长（QTc > 450 ms）')
    }

    return recs
  }

  private getRiskColor(level: string): [number, number, number] {
    return level === 'low' ? this.COLORS.low :
           level === 'medium' ? this.COLORS.medium :
           this.COLORS.high
  }

  private formatDateTime(iso: string): string {
    const date = new Date(iso)
    if (this.config.language === 'zh') {
      return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  private t(key: string): string {
    const translations: Record<string, Record<string, string>> = {
      zh: {
        reportTitle: '砷剂心脏毒性风险预测报告',
        reportNumber: '报告编号',
        generatedAt: '生成时间',
        disclaimerShort: '本报告基于AI模型生成，仅供临床参考，不能替代医生的专业判断。',
        inputDataTitle: '预测输入数据',
        resultTitle: '风险预测结果',
        'riskLevel.low': '低风险',
        'riskLevel.medium': '中风险',
        'riskLevel.high': '高风险',
        riskExplanation: '该模型预测患者在三氧化二砷治疗期间发生心脏毒性的概率。',
        metabolismTitle: '砷代谢参数',
        recommendationsTitle: '临床建议',
      },
      en: {
        reportTitle: 'Arsenic Cardiotoxicity Risk Report',
        reportNumber: 'Report Number',
        generatedAt: 'Generated At',
        disclaimerShort: 'This report is AI-generated for clinical reference only.',
        inputDataTitle: 'Prediction Input Data',
        resultTitle: 'Risk Prediction Result',
        'riskLevel.low': 'Low Risk',
        'riskLevel.medium': 'Moderate Risk',
        'riskLevel.high': 'High Risk',
        riskExplanation: 'Predicted cardiotoxicity probability during ATO treatment.',
        metabolismTitle: 'Arsenic Metabolism',
        recommendationsTitle: 'Clinical Recommendations',
      },
    }

    return translations[this.config.language]?.[key] || key
  }
}
