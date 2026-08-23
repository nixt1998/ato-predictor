import PDFDocument from 'pdfkit'

/**
 * SHAP 值数据接口
 */
export interface SHAPValue {
  featureName: string
  value: number // SHAP值，正数增加风险，负数降低风险
}

/**
 * 砷代谢数据接口
 */
export interface ArsenicMetabolismData {
  iAsPercent: number
  MMAPercent: number
  DMAPercent: number
  PMI: number
  SMI: number
}

/**
 * 图表生成器
 *
 * 使用 PDFKit 原生绘图功能生成高质量矢量图
 */
export class ChartGenerator {
  private doc: PDFKit.PDFDocument

  // 颜色定义
  private readonly COLORS = {
    positive: '#dc3545',    // 增加风险（红色）
    negative: '#28a745',    // 降低风险（绿色）
    baseline: '#757575',    // 基线（灰色）
    border: '#E0E0E0',
    text: '#212121',
    textLight: '#757575',
    iAs: '#dc3545',         // 无机砷（深红）
    MMA: '#fd7e14',         // 一甲基砷（橙色）
    DMA: '#28a745',         // 二甲基砷（绿色）
    primary: '#005EB8',
  }

  constructor(doc: PDFKit.PDFDocument) {
    this.doc = doc
  }

  /**
   * 绘制 SHAP Waterfall 图
   *
   * @param shapValues SHAP值数组（已排序，从大到小）
   * @param baseValue 模型基准值
   * @param x 起始X坐标
   * @param y 起始Y坐标
   * @param width 图表宽度
   * @param height 图表高度
   */
  public drawSHAPWaterfall(
    shapValues: SHAPValue[],
    baseValue: number,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const barHeight = 20
    const barSpacing = 8
    const labelWidth = 120
    const chartWidth = width - labelWidth - 80 // 80 for value labels
    const chartX = x + labelWidth

    // 找到最大绝对值用于缩放
    const maxAbsValue = Math.max(...shapValues.map(s => Math.abs(s.value)))
    const scale = chartWidth / (2 * maxAbsValue * 1.2) // 1.2 for padding

    // 绘制标题
    this.doc
      .fontSize(12)
      .fillColor(this.COLORS.text)
      .font('Helvetica-Bold')
      .text('SHAP Waterfall Plot', x, y)

    y += 25

    // 绘制中心线（零线）
    const centerX = chartX + chartWidth / 2
    this.doc
      .strokeColor(this.COLORS.baseline)
      .lineWidth(1)
      .moveTo(centerX, y)
      .lineTo(centerX, y + (barHeight + barSpacing) * shapValues.length)
      .stroke()

    // 绘制每个特征的条形
    let currentY = y
    shapValues.forEach((item) => {
      const barWidth = Math.abs(item.value) * scale
      const barX = item.value > 0 ? centerX : centerX - barWidth

      // 绘制条形
      this.doc
        .rect(barX, currentY, barWidth, barHeight)
        .fillColor(item.value > 0 ? this.COLORS.positive : this.COLORS.negative)
        .fill()

      // 特征名称（左侧）
      this.doc
        .fontSize(9)
        .fillColor(this.COLORS.text)
        .font('Helvetica')
        .text(item.featureName, x, currentY + 5, {
          width: labelWidth - 5,
          align: 'right',
        })

      // SHAP值（右侧）
      const valueText = item.value >= 0 ? `+${item.value.toFixed(3)}` : item.value.toFixed(3)
      this.doc
        .text(valueText, chartX + chartWidth + 5, currentY + 5)

      currentY += barHeight + barSpacing
    })

    // 绘制图例
    const legendY = currentY + 20
    const legendItemWidth = 100

    // 红色（增加风险）
    this.doc
      .rect(x, legendY, 15, 10)
      .fillColor(this.COLORS.positive)
      .fill()
    this.doc
      .fontSize(8)
      .fillColor(this.COLORS.text)
      .text('Increases Risk', x + 20, legendY + 1)

    // 绿色（降低风险）
    this.doc
      .rect(x + legendItemWidth + 20, legendY, 15, 10)
      .fillColor(this.COLORS.negative)
      .fill()
    this.doc
      .text('Decreases Risk', x + legendItemWidth + 40, legendY + 1)

    // 基准值说明
    currentY = legendY + 20
    this.doc
      .fontSize(8)
      .fillColor(this.COLORS.textLight)
      .text(`Base value: ${baseValue.toFixed(3)}`, x, currentY)
  }

  /**
   * 绘制 SHAP Bar 图（特征重要性）
   *
   * @param shapValues SHAP值数组（按绝对值排序）
   * @param x 起始X坐标
   * @param y 起始Y坐标
   * @param width 图表宽度
   * @param height 图表高度
   */
  public drawSHAPBar(
    shapValues: SHAPValue[],
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const barHeight = 18
    const barSpacing = 6
    const labelWidth = 120
    const chartWidth = width - labelWidth - 60
    const chartX = x + labelWidth

    // 找到最大绝对值用于缩放
    const maxAbsValue = Math.max(...shapValues.map(s => Math.abs(s.value)))
    const scale = chartWidth / (maxAbsValue * 1.1) // 1.1 for padding

    // 绘制标题
    this.doc
      .fontSize(12)
      .fillColor(this.COLORS.text)
      .font('Helvetica-Bold')
      .text('SHAP Feature Importance', x, y)

    y += 25

    // 绘制每个特征的条形
    let currentY = y
    shapValues.forEach((item) => {
      const barWidth = Math.abs(item.value) * scale

      // 绘制条形
      this.doc
        .rect(chartX, currentY, barWidth, barHeight)
        .fillColor(this.COLORS.primary)
        .fill()

      // 特征名称（左侧）
      this.doc
        .fontSize(9)
        .fillColor(this.COLORS.text)
        .font('Helvetica')
        .text(item.featureName, x, currentY + 4, {
          width: labelWidth - 5,
          align: 'right',
        })

      // 绝对值（右侧）
      this.doc
        .text(Math.abs(item.value).toFixed(3), chartX + barWidth + 5, currentY + 4)

      currentY += barHeight + barSpacing
    })
  }

  /**
   * 绘制砷代谢分布饼图
   *
   * @param data 砷代谢数据
   * @param x 中心X坐标
   * @param y 中心Y坐标
   * @param radius 半径
   */
  public drawArsenicMetabolismPie(
    data: ArsenicMetabolismData,
    x: number,
    y: number,
    radius: number
  ): void {
    const total = data.iAsPercent + data.MMAPercent + data.DMAPercent

    // 数据归一化（确保总和为100）
    const iAsPercent = (data.iAsPercent / total) * 100
    const MMAPercent = (data.MMAPercent / total) * 100
    const DMAPercent = (data.DMAPercent / total) * 100

    // 转换为弧度
    const iAsAngle = (iAsPercent / 100) * 2 * Math.PI
    const MMAAngle = (MMAPercent / 100) * 2 * Math.PI
    const DMAAngle = (DMAPercent / 100) * 2 * Math.PI

    let startAngle = -Math.PI / 2 // 从12点钟方向开始

    // 绘制 iAs 扇形（红色）
    this.drawPieSlice(x, y, radius, startAngle, startAngle + iAsAngle, this.COLORS.iAs)
    startAngle += iAsAngle

    // 绘制 MMA 扇形（橙色）
    this.drawPieSlice(x, y, radius, startAngle, startAngle + MMAAngle, this.COLORS.MMA)
    startAngle += MMAAngle

    // 绘制 DMA 扇形（绿色）
    this.drawPieSlice(x, y, radius, startAngle, startAngle + DMAAngle, this.COLORS.DMA)

    // 绘制图例
    const legendX = x + radius + 30
    const legendY = y - radius
    const legendSpacing = 25

    this.drawLegendItem(legendX, legendY, this.COLORS.iAs, `iAs (${iAsPercent.toFixed(1)}%)`)
    this.drawLegendItem(legendX, legendY + legendSpacing, this.COLORS.MMA, `MMA (${MMAPercent.toFixed(1)}%)`)
    this.drawLegendItem(legendX, legendY + legendSpacing * 2, this.COLORS.DMA, `DMA (${DMAPercent.toFixed(1)}%)`)

    // 标题
    this.doc
      .fontSize(11)
      .fillColor(this.COLORS.text)
      .font('Helvetica-Bold')
      .text('Arsenic Metabolism Distribution', x - radius, y - radius - 30, {
        width: radius * 2,
        align: 'center',
      })
  }

  /**
   * 绘制砷代谢指标柱状图（PMI和SMI）
   *
   * @param data 砷代谢数据
   * @param x 起始X坐标
   * @param y 起始Y坐标
   * @param width 图表宽度
   * @param height 图表高度
   */
  public drawArsenicMetabolismBar(
    data: ArsenicMetabolismData,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const chartHeight = height - 40 // 预留标题和坐标轴空间
    const barWidth = 60
    const barSpacing = 80
    const chartBottom = y + chartHeight

    // 标题
    this.doc
      .fontSize(11)
      .fillColor(this.COLORS.text)
      .font('Helvetica-Bold')
      .text('Arsenic Methylation Indices', x, y)

    y += 25

    // 找到最大值用于缩放
    const maxValue = Math.max(data.PMI, data.SMI, 0.7, 4.0) * 1.2
    const scale = chartHeight / maxValue

    // 绘制 Y 轴
    this.doc
      .strokeColor(this.COLORS.border)
      .lineWidth(1)
      .moveTo(x, y)
      .lineTo(x, chartBottom)
      .stroke()

    // 绘制 X 轴
    this.doc
      .moveTo(x, chartBottom)
      .lineTo(x + width, chartBottom)
      .stroke()

    // PMI 柱状图
    const pmiBarX = x + 40
    const pmiBarHeight = data.PMI * scale
    this.doc
      .rect(pmiBarX, chartBottom - pmiBarHeight, barWidth, pmiBarHeight)
      .fillColor(this.COLORS.primary)
      .fill()

    // PMI 数值标签
    this.doc
      .fontSize(9)
      .fillColor(this.COLORS.text)
      .text(data.PMI.toFixed(3), pmiBarX, chartBottom - pmiBarHeight - 15, {
        width: barWidth,
        align: 'center',
      })

    // PMI 名称
    this.doc
      .fontSize(10)
      .text('PMI', pmiBarX, chartBottom + 5, {
        width: barWidth,
        align: 'center',
      })

    // PMI 参考线（0.7）
    const pmiRefY = chartBottom - 0.7 * scale
    this.doc
      .strokeColor(this.COLORS.textLight)
      .lineWidth(0.5)
      .dash(5, { space: 3 })
      .moveTo(pmiBarX, pmiRefY)
      .lineTo(pmiBarX + barWidth, pmiRefY)
      .stroke()
      .undash()

    this.doc
      .fontSize(7)
      .fillColor(this.COLORS.textLight)
      .text('> 0.7', pmiBarX - 30, pmiRefY - 3)

    // SMI 柱状图
    const smiBarX = pmiBarX + barWidth + barSpacing
    const smiBarHeight = data.SMI * scale
    this.doc
      .rect(smiBarX, chartBottom - smiBarHeight, barWidth, smiBarHeight)
      .fillColor(this.COLORS.primary)
      .fill()

    // SMI 数值标签
    this.doc
      .fontSize(9)
      .fillColor(this.COLORS.text)
      .text(data.SMI.toFixed(3), smiBarX, chartBottom - smiBarHeight - 15, {
        width: barWidth,
        align: 'center',
      })

    // SMI 名称
    this.doc
      .fontSize(10)
      .text('SMI', smiBarX, chartBottom + 5, {
        width: barWidth,
        align: 'center',
      })

    // SMI 参考线（4.0）
    const smiRefY = chartBottom - 4.0 * scale
    this.doc
      .strokeColor(this.COLORS.textLight)
      .lineWidth(0.5)
      .dash(5, { space: 3 })
      .moveTo(smiBarX, smiRefY)
      .lineTo(smiBarX + barWidth, smiRefY)
      .stroke()
      .undash()

    this.doc
      .fontSize(7)
      .fillColor(this.COLORS.textLight)
      .text('> 4.0', smiBarX - 30, smiRefY - 3)
  }

  /**
   * 绘制饼图扇形
   */
  private drawPieSlice(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    color: string
  ): void {
    const startX = cx + radius * Math.cos(startAngle)
    const startY = cy + radius * Math.sin(startAngle)
    const endX = cx + radius * Math.cos(endAngle)
    const endY = cy + radius * Math.sin(endAngle)

    // 判断是否为大弧
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

    // 使用 bezierCurveTo 绘制扇形（PDFDocument 没有 arc 方法）
    this.doc
      .moveTo(cx, cy)
      .lineTo(startX, startY)
      .lineTo(endX, endY)
      .lineTo(cx, cy)
      .fillColor(color)
      .fill()

    // 绘制边框
    this.doc
      .moveTo(cx, cy)
      .lineTo(startX, startY)
      .lineTo(endX, endY)
      .lineTo(cx, cy)
      .strokeColor('#FFFFFF')
      .lineWidth(2)
      .stroke()
  }

  /**
   * 绘制图例项
   */
  private drawLegendItem(x: number, y: number, color: string, label: string): void {
    // 颜色方块
    this.doc
      .rect(x, y, 12, 12)
      .fillColor(color)
      .fill()

    // 文字标签
    this.doc
      .fontSize(9)
      .fillColor(this.COLORS.text)
      .font('Helvetica')
      .text(label, x + 18, y + 2)
  }
}
