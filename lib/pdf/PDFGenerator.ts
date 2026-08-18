import PDFDocument from 'pdfkit'
import type { TOptions } from 'pdfkit'
import { ChartGenerator, type SHAPValue, type ArsenicMetabolismData } from './ChartGenerator'

/**
 * PDF 报告数据接口
 */
export interface PredictionData {
  inputs: {
    dose: number
    K: number
    Mg: number
    Ca: number
    CCr: number
    cardiotoxicDrug: 'yes' | 'no'
    iAs?: number
    MMA?: number
    DMA?: number
  }
  results: {
    probability: number
    riskLevel: 'low' | 'medium' | 'high'
  }
  shapValues: {
    [key: string]: number
  }
  arsMetabolism?: {
    PMI: number
    SMI: number
    iAsPercent: number
    MMAPercent: number
    DMAPercent: number
  }
  timestamp: string
}

/**
 * PDF 生成配置
 */
export interface PDFConfig {
  language: 'zh' | 'en'
  reportNumber: string
  generatedAt: string
}

/**
 * ATO CardiTox PDF 报告生成器
 *
 * 医学检验报告风格，A4竖向，三线表，中英文双语支持
 */
export class PDFGenerator {
  private doc: PDFKit.PDFDocument
  private config: PDFConfig
  private data: PredictionData
  private currentPage: number = 1
  private chartGenerator: ChartGenerator

  // 页面布局常量
  private readonly PAGE_WIDTH = 595.28  // A4宽度（点）
  private readonly PAGE_HEIGHT = 841.89 // A4高度（点）
  private readonly MARGIN_TOP = 70
  private readonly MARGIN_BOTTOM = 60
  private readonly MARGIN_LEFT = 42
  private readonly MARGIN_RIGHT = 42
  private readonly CONTENT_WIDTH = 511.28 // PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

  // 颜色定义
  private readonly COLORS = {
    primary: '#005EB8',
    textDark: '#212121',
    textMedium: '#424242',
    textLight: '#757575',
    lowRisk: '#28a745',
    mediumRisk: '#fd7e14',
    highRisk: '#dc3545',
    border: '#000000',
    background: '#F5F5F5',
  }

  constructor(config: PDFConfig, data: PredictionData) {
    this.config = config
    this.data = data

    // 创建 PDF 文档
    const options: TOptions = {
      size: 'A4',
      margins: {
        top: this.MARGIN_TOP,
        bottom: this.MARGIN_BOTTOM,
        left: this.MARGIN_LEFT,
        right: this.MARGIN_RIGHT,
      },
      info: {
        Title: this.t('reportTitle'),
        Author: 'ATO CardiTox Risk Predictor',
        Subject: 'Cardiotoxicity Risk Assessment',
        Creator: 'www.atocarditox.com',
        CreationDate: new Date(config.generatedAt),
      },
    }

    this.doc = new PDFDocument(options)
    this.chartGenerator = new ChartGenerator(this.doc)
  }

  /**
   * 生成完整的 PDF 报告
   */
  public async generate(): Promise<PDFKit.PDFDocument> {
    // 第1页：封面
    this.addCoverPage()

    // 第2页：预测输入数据
    this.doc.addPage()
    this.currentPage++
    this.addHeader()
    this.addInputDataPage()
    this.addFooter()

    // 第3页：风险预测结果
    this.doc.addPage()
    this.currentPage++
    this.addHeader()
    this.addResultPage()
    this.addFooter()

    // 第4页：砷代谢参数
    if (this.data.arsMetabolism) {
      this.doc.addPage()
      this.currentPage++
      this.addHeader()
      this.addMetabolismPage()
      this.addFooter()
    }

    // 第5-6页：SHAP图表
    this.doc.addPage()
    this.currentPage++
    this.addHeader()
    this.addSHAPPage()
    this.addFooter()

    // 第7页：临床建议和注意事项
    this.doc.addPage()
    this.currentPage++
    this.addHeader()
    this.addRecommendationsPage()
    this.addFooter()

    // 第8页：参考文献
    this.doc.addPage()
    this.currentPage++
    this.addHeader()
    this.addReferencesPage()
    this.addFooter()

    // 结束文档
    this.doc.end()

    return this.doc
  }

  /**
   * 第1页：封面
   */
  private addCoverPage(): void {
    // 居中布局
    const centerX = this.PAGE_WIDTH / 2
    let y = 150

    // TODO: Logo（需要图片文件）
    // this.doc.image('public/images/logo.png', centerX - 100, y, { width: 200 })
    y += 100

    // 标题
    this.doc
      .font('Helvetica-Bold')
      .fontSize(24)
      .fillColor(this.COLORS.primary)
      .text('ATO CardiToxicity Risk Predictor', 0, y, {
        align: 'center',
        width: this.PAGE_WIDTH,
      })

    y += 40

    this.doc
      .fontSize(20)
      .fillColor(this.COLORS.textDark)
      .text(this.t('reportTitle'), 0, y, {
        align: 'center',
        width: this.PAGE_WIDTH,
      })

    y += 80

    // 分隔线
    this.doc
      .strokeColor(this.COLORS.border)
      .lineWidth(1)
      .moveTo(centerX - 150, y)
      .lineTo(centerX + 150, y)
      .stroke()

    y += 40

    // 网址
    this.doc
      .fontSize(14)
      .fillColor(this.COLORS.primary)
      .text('www.atocarditox.com', 0, y, {
        align: 'center',
        width: this.PAGE_WIDTH,
      })

    y += 60

    // 报告编号
    this.doc
      .fontSize(12)
      .fillColor(this.COLORS.textMedium)
      .text(`${this.t('reportNumber')}: ${this.config.reportNumber}`, 0, y, {
        align: 'center',
        width: this.PAGE_WIDTH,
      })

    y += 30

    // 生成时间
    this.doc
      .text(`${this.t('generatedAt')}: ${this.formatDateTime(this.config.generatedAt)}`, 0, y, {
        align: 'center',
        width: this.PAGE_WIDTH,
      })

    y += 80

    // 双分隔线
    this.doc
      .lineWidth(2)
      .moveTo(centerX - 200, y)
      .lineTo(centerX + 200, y)
      .stroke()

    y += 40

    // 免责声明标题
    this.doc
      .fontSize(14)
      .fillColor(this.COLORS.textDark)
      .font('Helvetica-Bold')
      .text(this.t('disclaimerTitle'), 0, y, {
        align: 'center',
        width: this.PAGE_WIDTH,
      })

    y += 30

    // 免责声明内容
    const disclaimer = this.t('disclaimerContent')
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(this.COLORS.textMedium)
      .text(disclaimer, this.MARGIN_LEFT + 50, y, {
        width: this.CONTENT_WIDTH - 100,
        align: 'justify',
        lineGap: 5,
      })

    // 版本信息（底部）
    this.doc
      .fontSize(9)
      .fillColor(this.COLORS.textLight)
      .text(`${this.t('version')}: v2.10.3`, 0, this.PAGE_HEIGHT - 80, {
        align: 'center',
        width: this.PAGE_WIDTH,
      })

    this.doc
      .text(`${this.t('disclaimerUpdated')}: 2026-08-01`, 0, this.PAGE_HEIGHT - 60, {
        align: 'center',
        width: this.PAGE_WIDTH,
      })
  }

  /**
   * 页眉（第2页起）
   */
  private addHeader(): void {
    const y = 30

    // TODO: 小Logo
    // this.doc.image('public/images/logo.png', this.MARGIN_LEFT, y, { height: 20 })

    // 网站名称和网址
    this.doc
      .fontSize(9)
      .fillColor(this.COLORS.textMedium)
      .text('ATO CardiTox', this.MARGIN_LEFT + 30, y + 5)

    this.doc
      .fillColor(this.COLORS.primary)
      .text('www.atocarditox.com', this.PAGE_WIDTH - this.MARGIN_RIGHT - 150, y + 5, {
        width: 150,
        align: 'right',
        underline: true,
      })

    // 分隔线
    this.doc
      .strokeColor(this.COLORS.border)
      .lineWidth(0.5)
      .moveTo(this.MARGIN_LEFT, y + 25)
      .lineTo(this.PAGE_WIDTH - this.MARGIN_RIGHT, y + 25)
      .stroke()
  }

  /**
   * 页脚
   */
  private addFooter(): void {
    const y = this.PAGE_HEIGHT - 40

    // 分隔线
    this.doc
      .strokeColor(this.COLORS.border)
      .lineWidth(0.5)
      .moveTo(this.MARGIN_LEFT, y)
      .lineTo(this.PAGE_WIDTH - this.MARGIN_RIGHT, y)
      .stroke()

    // 免责声明简短版
    this.doc
      .fontSize(8)
      .fillColor(this.COLORS.textLight)
      .text(this.t('footerDisclaimer'), this.MARGIN_LEFT, y + 10, {
        width: this.CONTENT_WIDTH - 80,
      })

    // 页码
    this.doc
      .text(`${this.t('page')} ${this.currentPage}`, this.PAGE_WIDTH - this.MARGIN_RIGHT - 80, y + 10, {
        width: 80,
        align: 'right',
      })
  }

  /**
   * 第2页：预测输入数据
   */
  private addInputDataPage(): void {
    let y = this.MARGIN_TOP + 40

    // 页面标题
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(this.COLORS.textDark)
      .text(this.t('inputDataTitle'), this.MARGIN_LEFT, y)

    y += 40

    // 表1：患者用药与检测信息
    this.addTableTitle(this.t('table1Title'), y)
    y += 30

    const tableData = [
      { label: this.t('dose'), value: this.formatNumber(this.data.inputs.dose, 2), unit: 'mg' },
      { label: this.t('potassium'), value: this.formatNumber(this.data.inputs.K, 3), unit: 'mmol/L' },
      { label: this.t('magnesium'), value: this.formatNumber(this.data.inputs.Mg, 3), unit: 'mmol/L' },
      { label: this.t('calcium'), value: this.formatNumber(this.data.inputs.Ca, 3), unit: 'mmol/L' },
      { label: this.t('creatinineClearance'), value: this.formatNumber(this.data.inputs.CCr, 1), unit: 'mL/min' },
      { label: this.t('cardiotoxicDrug'), value: this.data.inputs.cardiotoxicDrug === 'yes' ? this.t('yes') : this.t('no'), unit: '-' },
    ]

    this.addThreeLineTable(tableData, y)

    y += (tableData.length + 2) * 25 + 20

    // 注释
    this.doc
      .fontSize(9)
      .fillColor(this.COLORS.textLight)
      .font('Helvetica')
      .text(this.t('table1Note'), this.MARGIN_LEFT, y, {
        width: this.CONTENT_WIDTH,
      })
  }

  /**
   * 第3页：风险预测结果
   */
  private addResultPage(): void {
    let y = this.MARGIN_TOP + 40

    // 页面标题
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(this.COLORS.textDark)
      .text(this.t('resultTitle'), this.MARGIN_LEFT, y)

    y += 60

    // 主要结果框
    const boxY = y
    const boxHeight = 200

    // 绘制背景框
    this.doc
      .rect(this.MARGIN_LEFT + 50, boxY, this.CONTENT_WIDTH - 100, boxHeight)
      .lineWidth(2)
      .strokeColor(this.getRiskColor(this.data.results.riskLevel))
      .fillColor('#FFFFFF')
      .fillAndStroke()

    // 小标题
    y = boxY + 30
    this.doc
      .fontSize(14)
      .fillColor(this.COLORS.textDark)
      .text(this.t('riskPredictionResult'), 0, y, {
        align: 'center',
        width: this.PAGE_WIDTH,
      })

    // 概率（大字）
    y += 40
    const probability = (this.data.results.probability * 100).toFixed(1)
    this.doc
      .fontSize(36)
      .font('Helvetica-Bold')
      .fillColor(this.getRiskColor(this.data.results.riskLevel))
      .text(`${probability}%`, 0, y, {
        align: 'center',
        width: this.PAGE_WIDTH,
      })

    // 风险等级
    y += 50
    this.doc
      .fontSize(18)
      .text(this.t(`riskLevel.${this.data.results.riskLevel}`), 0, y, {
        align: 'center',
        width: this.PAGE_WIDTH,
      })

    y += boxHeight + 40

    // 说明文字
    this.doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor(this.COLORS.textDark)
      .text(this.t('riskExplanation', { probability }), this.MARGIN_LEFT + 50, y, {
        width: this.CONTENT_WIDTH - 100,
        align: 'justify',
        lineGap: 3,
      })

    y += 100

    // 风险分级说明
    this.addRiskThresholdExplanation(y)
  }

  /**
   * 第4页：砷代谢参数
   */
  private addMetabolismPage(): void {
    if (!this.data.arsMetabolism) return

    let y = this.MARGIN_TOP + 40

    // 页面标题
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(this.COLORS.textDark)
      .text(this.t('metabolismTitle'), this.MARGIN_LEFT, y)

    y += 40

    // 表2：砷代谢参数
    this.addTableTitle(this.t('table2Title'), y)
    y += 30

    const m = this.data.arsMetabolism
    const tableData = [
      { label: 'iAs (%)', value: this.formatNumber(m.iAsPercent, 1), unit: '< 20' },
      { label: 'MMA (%)', value: this.formatNumber(m.MMAPercent, 1), unit: '10 - 20' },
      { label: 'DMA (%)', value: this.formatNumber(m.DMAPercent, 1), unit: '> 60' },
      { label: 'PMI', value: this.formatNumber(m.PMI, 3), unit: '> 0.7' },
      { label: 'SMI', value: this.formatNumber(m.SMI, 3), unit: '> 4.0' },
    ]

    const headers = [this.t('parameter'), this.t('measuredValue'), this.t('referenceRange')]
    this.addThreeLineTable(tableData, y, headers)

    y += (tableData.length + 2) * 25 + 20

    // 注释
    this.doc
      .fontSize(9)
      .fillColor(this.COLORS.textLight)
      .font('Helvetica')
      .text(this.t('table2Note'), this.MARGIN_LEFT, y, {
        width: this.CONTENT_WIDTH,
        lineGap: 2,
      })

    // TODO: 砷代谢饼图和柱状图（后续实现）
  }

  /**
   * 第5-6页：SHAP解释图表
   */
  private addSHAPPage(): void {
    let y = this.MARGIN_TOP + 40

    // 页面标题
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(this.COLORS.textDark)
      .text(this.t('shapTitle'), this.MARGIN_LEFT, y)

    y += 30

    // 说明文字
    this.doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.COLORS.textMedium)
      .text(this.t('shapExplanation'), this.MARGIN_LEFT, y, {
        width: this.CONTENT_WIDTH,
        lineGap: 2,
      })

    y += 50

    // 转换 SHAP 数据
    const shapValues: SHAPValue[] = Object.entries(this.data.shapValues).map(([key, value]) => ({
      featureName: this.t(`shap.${key}`),
      value,
    }))

    // 按绝对值排序
    const sortedByAbs = [...shapValues].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))

    // 绘制 SHAP Waterfall 图
    this.chartGenerator.drawSHAPWaterfall(
      sortedByAbs.slice(0, 6), // 只显示前6个最重要的特征
      0.5, // 基准值（示例）
      this.MARGIN_LEFT,
      y,
      this.CONTENT_WIDTH,
      180
    )

    y += 230

    // 绘制 SHAP Bar 图（特征重要性）
    this.chartGenerator.drawSHAPBar(
      sortedByAbs.slice(0, 6),
      this.MARGIN_LEFT,
      y,
      this.CONTENT_WIDTH,
      160
    )

    // 如果有砷代谢数据，添加第6页的图表
    if (this.data.arsMetabolism) {
      this.doc.addPage()
      this.currentPage++
      this.addHeader()

      y = this.MARGIN_TOP + 40

      // 砷代谢分布饼图
      this.chartGenerator.drawArsenicMetabolismPie(
        this.data.arsMetabolism,
        this.MARGIN_LEFT + 120,
        y + 100,
        80
      )

      y += 220

      // PMI和SMI柱状图
      this.chartGenerator.drawArsenicMetabolismBar(
        this.data.arsMetabolism,
        this.MARGIN_LEFT,
        y,
        this.CONTENT_WIDTH,
        180
      )

      this.addFooter()
    }
  }

  /**
   * 第7页：临床建议和注意事项
   */
  private addRecommendationsPage(): void {
    let y = this.MARGIN_TOP + 40

    // 页面标题
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(this.COLORS.textDark)
      .text(this.t('recommendationsTitle'), this.MARGIN_LEFT, y)

    y += 40

    // 根据风险等级给出个性化建议
    const riskLevel = this.data.results.riskLevel

    // 1. 监测建议
    this.addSectionTitle(this.t('monitoringTitle'), y)
    y += 25

    const monitoringRec = this.getMonitoringRecommendation(riskLevel)
    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(this.COLORS.textDark)
      .text(monitoringRec, this.MARGIN_LEFT + 15, y, {
        width: this.CONTENT_WIDTH - 15,
        lineGap: 3,
      })

    y += this.doc.heightOfString(monitoringRec, {
      width: this.CONTENT_WIDTH - 15,
      lineGap: 3,
    }) + 25

    // 2. 预防措施
    this.addSectionTitle(this.t('preventionTitle'), y)
    y += 25

    const preventionItems = this.getPreventionItems(riskLevel)
    preventionItems.forEach((item) => {
      this.doc
        .fontSize(10)
        .text(`• ${item}`, this.MARGIN_LEFT + 15, y, {
          width: this.CONTENT_WIDTH - 15,
          lineGap: 2,
        })
      y += this.doc.heightOfString(`• ${item}`, {
        width: this.CONTENT_WIDTH - 15,
        lineGap: 2,
      }) + 8
    })

    y += 15

    // 3. 电解质管理
    if (this.needsElectrolyteWarning()) {
      this.addSectionTitle(this.t('electrolyteTitle'), y)
      y += 25

      const electrolyteWarning = this.t('electrolyteWarning')
      this.doc
        .fontSize(10)
        .fillColor(this.COLORS.textDark)
        .text(electrolyteWarning, this.MARGIN_LEFT + 15, y, {
          width: this.CONTENT_WIDTH - 15,
          lineGap: 3,
        })

      y += this.doc.heightOfString(electrolyteWarning, {
        width: this.CONTENT_WIDTH - 15,
        lineGap: 3,
      }) + 25
    }

    // 4. 重要提示框
    this.addImportantNotice(y)
  }

  /**
   * 第8页：参考文献
   */
  private addReferencesPage(): void {
    let y = this.MARGIN_TOP + 40

    // 页面标题
    this.doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(this.COLORS.textDark)
      .text(this.t('referencesTitle'), this.MARGIN_LEFT, y)

    y += 40

    // 参考文献列表
    const references = [
      '1. Platzbecker U, Avvisati G, Cicconi L, et al. Improved Outcomes With Retinoic Acid and Arsenic Trioxide Compared With Retinoic Acid and Chemotherapy in Non-High-Risk Acute Promyelocytic Leukemia: Final Results of the Randomized Italian-German APL0406 Trial. J Clin Oncol. 2017;35(6):605-612.',
      '2. Lo-Coco F, Avvisati G, Vignetti M, et al. Retinoic acid and arsenic trioxide for acute promyelocytic leukemia. N Engl J Med. 2013;369(2):111-121.',
      '3. Burnett AK, Russell NH, Hills RK, et al. Arsenic trioxide and all-trans retinoic acid treatment for acute promyelocytic leukaemia in all risk groups (AML17): results of a randomised, controlled, phase 3 trial. Lancet Oncol. 2015;16(13):1295-1305.',
      '4. Zhu HH, Huang XJ. Oral arsenic and retinoic acid for non-high-risk acute promyelocytic leukemia. N Engl J Med. 2014;371(23):2239-2241.',
      '5. Shen ZX, Shi ZZ, Fang J, et al. All-trans retinoic acid/As2O3 combination yields a high quality remission and survival in newly diagnosed acute promyelocytic leukemia. Proc Natl Acad Sci U S A. 2004;101(15):5328-5335.',
      '6. Unnikrishnan D, Dutcher JP, Varshneya N, et al. Torsades de pointes in 3 patients with leukemia treated with arsenic trioxide. Blood. 2001;97(5):1514-1516.',
      '7. Barbey JT, Pezzullo JC, Soignet SL. Effect of arsenic trioxide on QT interval in patients with advanced malignancies. J Clin Oncol. 2003;21(19):3609-3615.',
    ]

    references.forEach((ref, index) => {
      // 绘制参考文献
      this.doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(this.COLORS.textDark)
        .text(ref, this.MARGIN_LEFT, y, {
          width: this.CONTENT_WIDTH,
          align: 'justify',
          lineGap: 2,
        })

      y += this.doc.heightOfString(ref, {
        width: this.CONTENT_WIDTH,
        align: 'justify',
        lineGap: 2,
      }) + 12
    })

    y += 30

    // 模型来源说明
    this.doc
      .fontSize(9)
      .fillColor(this.COLORS.textLight)
      .text(this.t('modelSource'), this.MARGIN_LEFT, y, {
        width: this.CONTENT_WIDTH,
        lineGap: 2,
      })
  }

  /**
   * 添加小节标题
   */
  private addSectionTitle(title: string, y: number): void {
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(this.COLORS.primary)
      .text(title, this.MARGIN_LEFT, y)
  }

  /**
   * 根据风险等级获取监测建议
   */
  private getMonitoringRecommendation(level: 'low' | 'medium' | 'high'): string {
    const recommendations = {
      low: this.t('monitoring.low'),
      medium: this.t('monitoring.medium'),
      high: this.t('monitoring.high'),
    }
    return recommendations[level]
  }

  /**
   * 根据风险等级获取预防措施
   */
  private getPreventionItems(level: 'low' | 'medium' | 'high'): string[] {
    const baseItems = [
      this.t('prevention.electrolyte'),
      this.t('prevention.drugInteraction'),
      this.t('prevention.baseline'),
    ]

    if (level === 'medium' || level === 'high') {
      baseItems.push(this.t('prevention.prophylactic'))
    }

    if (level === 'high') {
      baseItems.push(this.t('prevention.intensive'))
    }

    return baseItems
  }

  /**
   * 判断是否需要电解质警告
   */
  private needsElectrolyteWarning(): boolean {
    const { K, Mg, Ca } = this.data.inputs
    return K < 3.5 || Mg < 0.7 || Ca < 2.0
  }

  /**
   * 添加重要提示框
   */
  private addImportantNotice(y: number): void {
    const boxHeight = 80

    // 绘制黄色背景框
    this.doc
      .rect(this.MARGIN_LEFT, y, this.CONTENT_WIDTH, boxHeight)
      .fillColor('#FFF9E6')
      .fill()

    // 绘制左侧橙色边框
    this.doc
      .rect(this.MARGIN_LEFT, y, 4, boxHeight)
      .fillColor('#ED8B00')
      .fill()

    // 标题
    this.doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#ED8B00')
      .text(this.t('importantNotice.title'), this.MARGIN_LEFT + 15, y + 12)

    // 内容
    this.doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.COLORS.textDark)
      .text(this.t('importantNotice.content'), this.MARGIN_LEFT + 15, y + 32, {
        width: this.CONTENT_WIDTH - 25,
        lineGap: 2,
      })
  }

  /**
   * 绘制三线表
   */
  private addThreeLineTable(
    data: Array<{ label: string; value: string; unit: string }>,
    startY: number,
    headers: string[] = [this.t('parameterName'), this.t('inputValue'), this.t('unit')]
  ): void {
    const rowHeight = 25
    const colWidths = [250, 150, 111.28] // 总宽511.28
    let y = startY

    // 顶部粗线
    this.doc
      .strokeColor(this.COLORS.border)
      .lineWidth(1.5)
      .moveTo(this.MARGIN_LEFT, y)
      .lineTo(this.PAGE_WIDTH - this.MARGIN_RIGHT, y)
      .stroke()

    y += 8

    // 表头
    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(this.COLORS.textDark)

    let x = this.MARGIN_LEFT
    headers.forEach((header, i) => {
      this.doc.text(header, x, y, {
        width: colWidths[i],
        align: i === 0 ? 'left' : 'center',
      })
      x += colWidths[i]
    })

    y += rowHeight - 8

    // 表头下方细线
    this.doc
      .lineWidth(0.5)
      .moveTo(this.MARGIN_LEFT, y)
      .lineTo(this.PAGE_WIDTH - this.MARGIN_RIGHT, y)
      .stroke()

    y += 8

    // 数据行
    this.doc
      .fontSize(9)
      .font('Helvetica')

    data.forEach((row) => {
      x = this.MARGIN_LEFT

      // 参数名
      this.doc.fillColor(this.COLORS.textDark).text(row.label, x, y, {
        width: colWidths[0],
        align: 'left',
      })
      x += colWidths[0]

      // 数值
      this.doc.text(row.value, x, y, {
        width: colWidths[1],
        align: 'right',
      })
      x += colWidths[1]

      // 单位
      this.doc.fillColor(this.COLORS.textMedium).text(row.unit, x, y, {
        width: colWidths[2],
        align: 'center',
      })

      y += rowHeight
    })

    // 底部粗线
    this.doc
      .lineWidth(1.5)
      .moveTo(this.MARGIN_LEFT, y)
      .lineTo(this.PAGE_WIDTH - this.MARGIN_RIGHT, y)
      .stroke()
  }

  /**
   * 添加表格标题
   */
  private addTableTitle(title: string, y: number): void {
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(this.COLORS.textDark)
      .text(title, this.MARGIN_LEFT, y)
  }

  /**
   * 添加风险阈值说明
   */
  private addRiskThresholdExplanation(y: number): void {
    this.doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(this.COLORS.textDark)
      .text(this.t('riskThresholdTitle'), this.MARGIN_LEFT, y)

    y += 20

    this.doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.COLORS.textMedium)
      .text(`• ${this.t('lowRiskThreshold')}`, this.MARGIN_LEFT + 20, y)

    y += 20
    this.doc.text(`• ${this.t('mediumRiskThreshold')}`, this.MARGIN_LEFT + 20, y)

    y += 20
    this.doc.text(`• ${this.t('highRiskThreshold')}`, this.MARGIN_LEFT + 20, y)

    y += 30

    this.doc
      .fontSize(8)
      .fillColor(this.COLORS.textLight)
      .text(this.t('thresholdNote'), this.MARGIN_LEFT, y, {
        width: this.CONTENT_WIDTH,
      })
  }

  /**
   * 获取风险等级颜色
   */
  private getRiskColor(level: 'low' | 'medium' | 'high'): string {
    return {
      low: this.COLORS.lowRisk,
      medium: this.COLORS.mediumRisk,
      high: this.COLORS.highRisk,
    }[level]
  }

  /**
   * 格式化数字（保留有效数字）
   */
  private formatNumber(num: number, significantDigits: number): string {
    if (num === 0) return '0'

    // 如果前三位都是0，顺延到第一个非零有效数字
    if (Math.abs(num) < 0.001) {
      return num.toExponential(significantDigits - 1)
    }

    return num.toPrecision(significantDigits)
  }

  /**
   * 格式化日期时间
   */
  private formatDateTime(isoString: string): string {
    const date = new Date(isoString)
    if (this.config.language === 'zh') {
      return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    } else {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    }
  }

  /**
   * 翻译辅助函数（简化版，实际应使用完整的i18n）
   */
  private t(key: string, vars?: Record<string, any>): string {
    // TODO: 实现完整的翻译逻辑
    // 当前仅作为占位符
    const translations: Record<string, Record<string, string>> = {
      zh: {
        reportTitle: '砷剂心脏毒性风险预测报告',
        reportNumber: '报告编号',
        generatedAt: '生成时间',
        disclaimerTitle: '【免责声明】',
        disclaimerContent: '本预测报告基于人工智能统计模型和已发表的临床研究数据生成，仅供临床参考使用，不能作为最终诊断依据，不能替代医师的专业判断和治疗决策。模型预测结果受训练数据集、样本量、特征选择等因素影响，存在一定误差。实际心脏毒性风险因个体差异、合并用药、基础疾病等因素而异，模型无法完全预测所有临床情况。本系统不对使用本报告产生的任何医疗决策、临床后果或不良事件承担法律责任。建议医师结合患者具体情况、实验室检查、影像学资料及临床经验综合判断，必要时请多学科会诊。患者及家属应充分理解预测的局限性，如有疑问请咨询主治医师。',
        version: '系统版本',
        disclaimerUpdated: '免责声明最后更新',
        footerDisclaimer: '本报告仅供临床参考，不能替代医生的专业诊断',
        page: '第',
        inputDataTitle: '预测输入数据',
        table1Title: '表1 患者用药与检测信息',
        parameterName: '参数名称',
        inputValue: '输入值',
        unit: '单位',
        dose: '三氧化二砷剂量',
        potassium: '血钾 (K⁺)',
        magnesium: '血镁 (Mg²⁺)',
        calcium: '血钙 (Ca²⁺)',
        creatinineClearance: '肌酐清除率 (CCr)',
        cardiotoxicDrug: '合并心毒性药物',
        yes: '是',
        no: '否',
        table1Note: '注：K⁺ = 钾离子，Mg²⁺ = 镁离子，Ca²⁺ = 钙离子，CCr = 肌酐清除率',
        resultTitle: '风险预测结果',
        riskPredictionResult: '心脏毒性风险预测结果',
        'riskLevel.low': '低风险 (Low Risk)',
        'riskLevel.medium': '中风险 (Moderate Risk)',
        'riskLevel.high': '高风险 (High Risk)',
        riskExplanation: '该模型预测患者在三氧化二砷治疗期间发生心脏毒性的概率为 {probability}%。',
        riskThresholdTitle: '风险等级判定标准：',
        lowRiskThreshold: '低风险（0-20%）：发生心脏毒性概率较低，按标准方案治疗',
        mediumRiskThreshold: '中风险（20-50%）：需警惕，建议每周监测心电图和电解质',
        highRiskThreshold: '高风险（>50%）：发生概率高，建议每日心电图监测并预防性干预',
        thresholdNote: '注：本分级标准基于中国急性早幼粒细胞白血病诊疗指南及相关临床研究设定，详见参考文献。',
        metabolismTitle: '砷代谢参数',
        table2Title: '表2 砷代谢参数',
        parameter: '参数',
        measuredValue: '检测值',
        referenceRange: '参考范围',
        table2Note: '注释：\niAs = 无机砷，MMA = 一甲基砷，DMA = 二甲基砷\nPMI = 一次甲基化指数 = MMA / iAs\nSMI = 二次甲基化指数 = DMA / MMA',
      },
      en: {
        reportTitle: 'Arsenic Cardiotoxicity Risk Prediction Report',
        reportNumber: 'Report Number',
        generatedAt: 'Generated At',
        disclaimerTitle: '【DISCLAIMER】',
        disclaimerContent: 'This prediction report is generated based on artificial intelligence statistical models and published clinical research data. It is for clinical reference only and cannot serve as a final diagnosis or replace professional medical judgment and treatment decisions. Model predictions are subject to limitations including training dataset characteristics, sample size, and feature selection. Actual cardiotoxicity risk varies due to individual differences, concomitant medications, and underlying conditions that the model cannot fully predict. This system assumes no liability for any medical decisions, clinical outcomes, or adverse events resulting from the use of this report. Physicians should integrate patient-specific information, laboratory tests, imaging studies, and clinical experience when making decisions; multidisciplinary consultation is recommended when necessary. Patients and families should fully understand the limitations of predictions and consult their treating physician with any questions.',
        version: 'System Version',
        disclaimerUpdated: 'Disclaimer Last Updated',
        footerDisclaimer: 'This report is for clinical reference only and cannot replace professional medical diagnosis',
        page: 'Page',
        inputDataTitle: 'Prediction Input Data',
        table1Title: 'Table 1 Patient Medication and Laboratory Information',
        parameterName: 'Parameter Name',
        inputValue: 'Input Value',
        unit: 'Unit',
        dose: 'Arsenic Trioxide Dose',
        potassium: 'Serum Potassium (K⁺)',
        magnesium: 'Serum Magnesium (Mg²⁺)',
        calcium: 'Serum Calcium (Ca²⁺)',
        creatinineClearance: 'Creatinine Clearance (CCr)',
        cardiotoxicDrug: 'Cardiotoxic Drug',
        yes: 'Yes',
        no: 'No',
        table1Note: 'Note: K⁺ = Potassium ion, Mg²⁺ = Magnesium ion, Ca²⁺ = Calcium ion, CCr = Creatinine Clearance',
        resultTitle: 'Risk Prediction Result',
        riskPredictionResult: 'Cardiotoxicity Risk Prediction Result',
        'riskLevel.low': 'Low Risk',
        'riskLevel.medium': 'Moderate Risk',
        'riskLevel.high': 'High Risk',
        riskExplanation: 'The model predicts a {probability}% probability of cardiotoxicity during arsenic trioxide treatment.',
        riskThresholdTitle: 'Risk Stratification Criteria:',
        lowRiskThreshold: 'Low Risk (0-20%): Low cardiotoxicity probability, standard treatment protocol',
        mediumRiskThreshold: 'Moderate Risk (20-50%): Vigilance required, weekly ECG and electrolyte monitoring recommended',
        highRiskThreshold: 'High Risk (>50%): High probability, daily ECG monitoring and preventive intervention recommended',
        thresholdNote: 'Note: Thresholds based on Chinese APL guidelines and related clinical studies. See references for details.',
        metabolismTitle: 'Arsenic Metabolism Parameters',
        table2Title: 'Table 2 Arsenic Metabolism Parameters',
        parameter: 'Parameter',
        measuredValue: 'Measured Value',
        referenceRange: 'Reference Range',
        table2Note: 'Note:\niAs = Inorganic Arsenic, MMA = Monomethylarsonic Acid, DMA = Dimethylarsinic Acid\nPMI = Primary Methylation Index = MMA / iAs\nSMI = Secondary Methylation Index = DMA / MMA',
      },
    }

    let text = translations[this.config.language]?.[key] || key

    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v))
      })
    }

    return text
  }
}
