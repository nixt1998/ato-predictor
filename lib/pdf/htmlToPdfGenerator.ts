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

    // 建议词典（根据PDF语言决定）
    const suggestionDict = {
      zh: {
        high_tAs:    ['总砷浓度偏高',       '建议适当调整砷剂给药剂量或延长治疗间隔以降低体内砷总暴露量，同时加强肾功能监测。'],
        low_SMI:     ['二级甲基化能力低下', '检测到砷甲基化能力下降，建议适量补充叶酸、维生素B12等甲基供体，并监测同型半胱氨酸水平。'],
        high_MMA:    ['一甲基砷酸百分比升高','心血管风险增高，建议增加心脏监测频率：每周心电图、每月超声心动图及心脏标志物检测（肌钙蛋白、BNP）。'],
        mod_MMA:     ['一甲基砷酸百分比偏高','建议密切监测心功能，每两周进行心电图检查，每月检测心脏生物标志物。'],
        ct_drug:     ['合并使用心毒性药物', '需仔细权衡合并用药的风险/获益比，必要时考虑替代治疗方案，或实施加强型心脏监测方案。'],
        risk_high:   ['综合评估：高风险',   '建议立即进行心脏科会诊，评估是否需要调整砷剂剂量或暂停治疗，并实施每日症状评估的强化监测方案。'],
        risk_medium: ['综合评估：中等风险', '建议加强监测：每周临床评估，每两周心脏专项评估，并向患者充分说明需要报告的心脏相关症状。'],
        risk_low:    ['综合评估：低风险',   '继续执行常规监测方案，按治疗计划定期随访，进行标准化心脏功能评估。'],
      } as Record<string, [string, string]>,
      en: {
        high_tAs:    ['High Total Arsenic',                   'Consider adjusting ATO dosage or extending treatment intervals to reduce total arsenic exposure; monitor renal function regularly.'],
        low_SMI:     ['Low Secondary Methylation Index (SMI)','Low methylation capacity detected; consider methyl donor supplementation (folate, vitamin B12) and monitor homocysteine levels.'],
        high_MMA:    ['Elevated MMA%',                        'Elevated cardiovascular risk; enhance cardiac monitoring: weekly ECG, monthly echocardiography and cardiac biomarkers (troponin, BNP).'],
        mod_MMA:     ['Moderately Elevated MMA%',             'Monitor cardiac function closely; consider bi-weekly ECG and monthly cardiac biomarker assessment.'],
        ct_drug:     ['Concurrent Cardiotoxic Drug',          'Carefully evaluate the benefit-risk ratio of concomitant cardiotoxic medication; consider alternative therapies or an intensive cardiac surveillance protocol.'],
        risk_high:   ['High Risk',                            'Immediate cardiology consultation is recommended; evaluate the need for dose reduction or treatment interruption and implement an intensive daily symptom-monitoring protocol.'],
        risk_medium: ['Medium Risk',                          'Enhanced monitoring is recommended: weekly clinical assessment, bi-weekly cardiac evaluation; educate the patient on cardiac symptoms that should prompt immediate reporting.'],
        risk_low:    ['Low Risk',                             'Continue routine monitoring; maintain regular follow-up appointments and standard cardiac function assessments as per the treatment protocol.'],
      } as Record<string, [string, string]>,
    }
    const sDict = this.config.language === 'en' ? suggestionDict.en : suggestionDict.zh
    // 填充建议列表（根据PDF语言重新翻译）
    const suggestionsList = suggestions.map((s: any) => {
      const key = (s as any).key as string | undefined
      const entry = key && sDict[key]
      const rf = entry ? entry[0] : s.risk_factor
      const sg = entry ? entry[1] : s.suggestion
      return `<li>${rf}：${sg}</li>`
    }).join('\n      ')

    // 生成内联 SVG 图表，替换模板中的 chart-placeholder 占位符
    const { iAs_pct, MMA_pct, DMA_pct, tAs } = metabolism
    const { tAs: shapTas, SMI: shapSmi, MMA_per: shapMma, DMA_per: shapDma, CT_drug: shapCt } = shap_values

    // 图表1 - 砷形态饼图 (SVG)
    const pieSvg = this.generatePieChart(iAs_pct, MMA_pct, DMA_pct, tAs)
    // 图表2 - SHAP 瀑布图 (SVG)
    const waterfallSvg = this.generateShapWaterfall(shapTas, shapSmi, shapMma, shapDma, shapCt, prediction.probability)
    // 图表3 - SHAP 条形图 (SVG)
    const shapBarSvg = this.generateShapBarChart(shapTas, shapSmi, shapMma, shapDma, shapCt)

    // 将图表替换到模板中（匹配含有对应关键词的 .chart-placeholder div）
    // 第2页饼图空间充足用 54mm；第3页 SHAP 两图较挤，用 42mm 避免整页溢出
    const toImgTag = (svg: string, maxH = 54) => `<img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" style="width:100%;max-height:${maxH}mm;display:block;" />`

    let filledTemplate = template
    // 替换砷形态饼图占位符
    filledTemplate = filledTemplate.replace(
      /<div[^>]*class="chart-placeholder"[^>]*>[\s\S]*?(?:砷形态|Arsenic Speciation|Speciation Pie)[\s\S]*?<\/div>/,
      toImgTag(pieSvg, 54)
    )
    // 替换 SHAP 瀑布图占位符
    filledTemplate = filledTemplate.replace(
      /<div[^>]*class="chart-placeholder"[^>]*>[\s\S]*?(?:SHAP 瀑布|SHAP Waterfall|Waterfall)[\s\S]*?<\/div>/,
      toImgTag(waterfallSvg, 38)
    )
    // 替换 SHAP 条形图占位符
    filledTemplate = filledTemplate.replace(
      /<div[^>]*class="chart-placeholder"[^>]*>[\s\S]*?(?:SHAP 条形|SHAP Bar|Feature Importance)[\s\S]*?<\/div>/,
      toImgTag(shapBarSvg, 38)
    )

    // 替换所有占位符
    filledTemplate = filledTemplate
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
    return filledTemplate
  }

  /**
   * 生成砷形态分布饼图 SVG
   */
  private generatePieChart(iAs_pct: number, MMA_pct: number, DMA_pct: number, tAs: number): string {
    const cx = 130, cy = 110, r = 90
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const slices = [
      { pct: iAs_pct, color: '#dc3545', label: 'iAs' },
      { pct: MMA_pct, color: '#fd7e14', label: 'MMA' },
      { pct: DMA_pct, color: '#28a745', label: 'DMA' },
    ]
    let startAngle = -90
    let paths = ''
    slices.forEach(({ pct, color }) => {
      const angle = (pct / 100) * 360
      const endAngle = startAngle + angle
      const x1 = cx + r * Math.cos(toRad(startAngle))
      const y1 = cy + r * Math.sin(toRad(startAngle))
      const x2 = cx + r * Math.cos(toRad(endAngle))
      const y2 = cy + r * Math.sin(toRad(endAngle))
      const largeArc = angle > 180 ? 1 : 0
      if (pct > 0.1) {
        paths += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${largeArc},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${color}" stroke="white" stroke-width="2"/>`
      }
      startAngle = endAngle
    })
    const legend = slices.map(({ pct, color, label }, i) => {
      const ly = 60 + i * 30
      return `<rect x="280" y="${ly}" width="14" height="14" fill="${color}"/><text x="300" y="${ly + 11}" font-size="13" fill="#333">${label}: ${pct.toFixed(1)}%</text>`
    }).join('')
    // tAs 总量放在图例下方（不再压在饼图中心）
    const tAsLabel = `<text x="280" y="${60 + slices.length * 30 + 14}" font-size="13" fill="#333">tAs: ${tAs.toFixed(1)} ng/mL</text>`
    return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="220" viewBox="0 0 500 220">
  <rect width="500" height="220" fill="white"/>
  ${paths}
  ${legend}
  ${tAsLabel}
</svg>`
  }

  /**
   * 生成 SHAP 瀑布图 SVG
   */
  private generateShapWaterfall(tAs: number, SMI: number, MMA_per: number, DMA_per: number, CT_drug: number, finalProb: number): string {
    const baseValue = finalProb - tAs - SMI - MMA_per - DMA_per - CT_drug
    const features = [
      { name: 'tAs', value: tAs },
      { name: 'SMI', value: SMI },
      { name: 'MMA%', value: MMA_per },
      { name: 'DMA%', value: DMA_per },
      { name: 'CT_drug', value: CT_drug },
    ]
    const barH = 22, leftPad = 80, topPad = 20, gap = 6
    const allVals = [baseValue, ...features.map(f => f.value), finalProb]
    const minV = Math.min(...allVals)
    const maxV = Math.max(...allVals)
    const range = maxV - minV || 1
    const chartW = 340, chartX = leftPad
    const toX = (v: number) => chartX + ((v - minV) / range) * chartW
    let rows = ''
    let running = baseValue
    features.forEach(({ name, value }, i) => {
      const y = topPad + i * (barH + gap)
      const x1 = toX(Math.min(running, running + value))
      const x2 = toX(Math.max(running, running + value))
      const color = value >= 0 ? '#dc3545' : '#4a90d9'
      rows += `<rect x="${x1.toFixed(1)}" y="${y}" width="${(x2 - x1).toFixed(1)}" height="${barH}" fill="${color}" rx="2"/>`
      rows += `<text x="${leftPad - 5}" y="${y + barH / 2 + 5}" text-anchor="end" font-size="12" fill="#333">${name}</text>`
      rows += `<text x="${(x2 + 4).toFixed(1)}" y="${y + barH / 2 + 5}" font-size="12" fill="${color}">${value >= 0 ? '+' : ''}${value.toFixed(3)}</text>`
      running += value
    })
    const baseX = toX(baseValue)
    const finalY = topPad + features.length * (barH + gap)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="220" viewBox="0 0 500 220">
  <rect width="500" height="220" fill="white"/>
  <line x1="${baseX.toFixed(1)}" y1="${topPad - 5}" x2="${baseX.toFixed(1)}" y2="${finalY + barH}" stroke="#888" stroke-width="1" stroke-dasharray="3,3"/>
  <text x="${baseX.toFixed(1)}" y="${topPad - 8}" text-anchor="middle" font-size="11" fill="#888">base ${baseValue.toFixed(3)}</text>
  ${rows}
  <rect x="${toX(Math.min(baseValue, finalProb)).toFixed(1)}" y="${finalY}" width="${Math.abs(toX(finalProb) - toX(baseValue)).toFixed(1)}" height="${barH}" fill="#6c757d" rx="2"/>
  <text x="${leftPad - 5}" y="${finalY + barH / 2 + 5}" text-anchor="end" font-size="12" fill="#333">f(x)</text>
  <text x="${(toX(finalProb) + 4).toFixed(1)}" y="${finalY + barH / 2 + 5}" font-size="12" fill="#6c757d">${finalProb.toFixed(3)}</text>
</svg>`
  }

  /**
   * 生成 SHAP 条形图 SVG（按绝对值排序）
   */
  private generateShapBarChart(tAs: number, SMI: number, MMA_per: number, DMA_per: number, CT_drug: number): string {
    const features = [
      { name: 'tAs', value: tAs },
      { name: 'SMI', value: SMI },
      { name: 'MMA%', value: MMA_per },
      { name: 'DMA%', value: DMA_per },
      { name: 'CT_drug', value: CT_drug },
    ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    const maxAbs = Math.max(...features.map(f => Math.abs(f.value)), 0.001)
    const barH = 28, leftPad = 80, topPad = 20, gap = 8, maxBarW = 280
    let rows = ''
    features.forEach(({ name, value }, i) => {
      const y = topPad + i * (barH + gap)
      const bw = (Math.abs(value) / maxAbs) * maxBarW
      const color = value >= 0 ? '#dc3545' : '#4a90d9'
      rows += `<rect x="${leftPad}" y="${y}" width="${bw.toFixed(1)}" height="${barH}" fill="${color}" rx="2"/>`
      rows += `<text x="${leftPad - 5}" y="${y + barH / 2 + 5}" text-anchor="end" font-size="12" fill="#333">${name}</text>`
      rows += `<text x="${(leftPad + bw + 5).toFixed(1)}" y="${y + barH / 2 + 5}" font-size="12" fill="${color}">${value >= 0 ? '+' : ''}${value.toFixed(3)}</text>`
    })
    return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="220" viewBox="0 0 500 220">
  <rect width="500" height="220" fill="white"/>
  ${rows}
</svg>`
  }
}
