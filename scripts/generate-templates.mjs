/**
 * 生成 ATO 心脏毒性研究数据采集 Excel 模板
 * 输出：public/templates/template-zh.xlsx 和 template-en.xlsx
 *
 * 结构：Sheet1 Instructions/填写说明 | Sheet2 Data/数据(88列,含1示例行) | Sheet3 Dictionary/数据字典
 * 设计原则：所有字段选填、一行一患者、去标识、分类下拉可自定义、中英各一份
 */
import ExcelJS from 'exceljs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '../public/templates')

// ── 分类选项常量（中/英）──────────────────────────────────────────
const YESNO = { zh: ['Yes', 'No'], en: ['Yes', 'No'] }
const SEX = { zh: ['Male', 'Female'], en: ['Male', 'Female'] }

// ── 字段定义（按确认的列顺序）────────────────────────────────────
const F = (mod, key, zh, en, unit, type, range, ex, opt) => ({ mod, key, zh, en, unit, type, range, ex, opt })

const FIELDS = [
  // ① 标识与元数据
  F('①标识与元数据', 'subject_id', '受试者去标识编号', 'De-identified Subject ID', '', 'text', '自行编号，如 S001', 'S001'),
  F('①标识与元数据', 'center', '来源中心/医院代码', 'Center / Hospital Code', '', 'text', '中心代码，如 H01', 'H01'),
  F('①标识与元数据', 'record_date', '数据记录日期', 'Record Date', '', 'date', 'YYYY-MM-DD', '2026-03-15'),

  // ② 核心输入变量（模型必需）
  F('②核心输入', 'iAs', '无机砷', 'Inorganic Arsenic (iAs)', 'ng/mL', 'number', '≥0', '14'),
  F('②核心输入', 'MMA', '一甲基砷酸', 'Monomethylarsonic Acid (MMA)', 'ng/mL', 'number', '≥0', '16'),
  F('②核心输入', 'DMA', '二甲基砷酸', 'Dimethylarsinic Acid (DMA)', 'ng/mL', 'number', '≥0', '12'),
  F('②核心输入', 'CT_drug', '合并心毒性药物', 'Concomitant Cardiotoxic Drug', '', 'cat', 'Yes / No', 'No', YESNO),

  // ③ 结局（放在核心输入后）
  F('③结局', 'cardiotoxicity', '心毒性结局', 'Cardiotoxicity Outcome', '', 'cat', 'Yes / No', 'No', YESNO),
  F('③结局', 'cardiotox_type', '心毒性类型', 'Cardiotoxicity Type', '', 'cat', '可自定义', '', { zh: ['QT延长', '心律失常', '心力衰竭', '心肌损伤', '其他'], en: ['QT prolongation', 'Arrhythmia', 'Heart failure', 'Myocardial injury', 'Other'] }),
  F('③结局', 'onset_day', '发生时点', 'Onset Day', '天', 'number', '≥0', ''),
  F('③结局', 'CTCAE_grade', '严重程度分级(CTCAE)', 'Severity Grade (CTCAE)', '', 'cat', '1-5', '', { zh: ['1', '2', '3', '4', '5'], en: ['1', '2', '3', '4', '5'] }),
  F('③结局', 'outcome', '转归', 'Outcome', '', 'cat', '恢复/持续/死亡/未知', '', { zh: ['恢复', '持续', '死亡', '未知'], en: ['Recovered', 'Persistent', 'Death', 'Unknown'] }),
  F('③结局', 'treatment_interrupted', '是否中断治疗', 'Treatment Interrupted', '', 'cat', 'Yes / No', 'No', YESNO),

  // ④ 人口学
  F('④人口学', 'sex', '性别', 'Sex', '', 'cat', 'Male / Female', 'Male', SEX),
  F('④人口学', 'age', '年龄', 'Age', '岁', 'number', '0-120', '45'),
  F('④人口学', 'ethnicity', '民族', 'Ethnicity', '', 'text', '开放文本', '汉族'),
  F('④人口学', 'height', '身高', 'Height', 'cm', 'number', '30-250', '170'),
  F('④人口学', 'weight', '体重', 'Weight', 'kg', 'number', '2-300', '65'),

  // ⑤ 生活方式
  F('⑤生活方式', 'smoking', '吸烟史', 'Smoking History', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑤生活方式', 'smoking_pack_years', '吸烟包年', 'Smoking Pack-years', '包年', 'number', '≥0', ''),
  F('⑤生活方式', 'alcohol', '饮酒史', 'Alcohol History', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑤生活方式', 'alcohol_years', '饮酒年数', 'Alcohol Years', '年', 'number', '≥0', ''),

  // ⑥ 原发病与ATO治疗
  F('⑥原发病与ATO治疗', 'diagnosis', '原发疾病诊断', 'Primary Diagnosis', '', 'text', '开放文本，如 APL', 'APL'),
  F('⑥原发病与ATO治疗', 'disease_class', '危险度分型', 'Risk Stratification', '', 'cat', '高危/低危', '', { zh: ['高危', '低危'], en: ['High', 'Low'] }),
  F('⑥原发病与ATO治疗', 'ATO_dose', 'ATO剂量', 'ATO Dose', 'mg/d', 'number', '≥0', '10'),
  F('⑥原发病与ATO治疗', 'ATO_regimen', '治疗阶段', 'Treatment Phase', '', 'cat', '诱导/巩固/维持', '', { zh: ['诱导', '巩固', '维持'], en: ['Induction', 'Consolidation', 'Maintenance'] }),
  F('⑥原发病与ATO治疗', 'treatment_days', '疗程天数', 'Treatment Days', '天', 'number', '≥0', '28'),
  F('⑥原发病与ATO治疗', 'cumulative_dose', '累积剂量', 'Cumulative Dose', 'mg', 'number', '≥0', ''),
  F('⑥原发病与ATO治疗', 'ATRA_combo', '联用全反式维甲酸', 'Combined with ATRA', '', 'cat', 'Yes / No', 'Yes', YESNO),

  // ⑦ 合并用药
  F('⑦合并用药', 'ctdrug_name', '心毒性药物名称', 'Cardiotoxic Drug Name', '', 'text', 'CT_drug=Yes 时填写', ''),
  F('⑦合并用药', 'noncardiotoxic_drug', '合并非心毒性药物', 'Concomitant Non-cardiotoxic Drug', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑦合并用药', 'noncardiotoxic_drug_name', '非心毒性药物名称', 'Non-cardiotoxic Drug Name', '', 'text', '', ''),
  F('⑦合并用药', 'qt_drug', '合并QT延长药物', 'Concomitant QT-prolonging Drug', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑦合并用药', 'azole_antifungal', '唑类抗真菌药', 'Azole Antifungal', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑦合并用药', 'diuretic', '利尿剂', 'Diuretic', '', 'cat', 'Yes / No', 'No', YESNO),

  // ⑧ 既往史与合并症
  F('⑧既往史与合并症', 'diabetes', '糖尿病', 'Diabetes', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑧既往史与合并症', 'hypertension', '高血压', 'Hypertension', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑧既往史与合并症', 'hyperlipidemia', '高血脂', 'Hyperlipidemia', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑧既往史与合并症', 'CHD', '冠心病', 'Coronary Heart Disease', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑧既往史与合并症', 'heart_failure', '心力衰竭史', 'Heart Failure History', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑧既往史与合并症', 'arrhythmia_history', '心律失常史', 'Arrhythmia History', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑧既往史与合并症', 'prior_anthracycline', '既往蒽环类/胸部放疗', 'Prior Anthracycline / Chest RT', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑧既往史与合并症', 'family_sudden_death', '心脏病/猝死家族史', 'Family History of SCD', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑧既往史与合并症', 'renal_disease', '肾病史', 'Renal Disease', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑧既往史与合并症', 'liver_disease', '肝病史', 'Liver Disease', '', 'cat', 'Yes / No', 'No', YESNO),
  F('⑧既往史与合并症', 'thyroid_disease', '甲状腺疾病', 'Thyroid Disease', '', 'cat', 'Yes / No', 'No', YESNO),

  // ⑨ 心脏基线
  F('⑨心脏基线', 'baseline_QTc', '基线QTc', 'Baseline QTc', 'ms', 'number', '250-600', ''),
  F('⑨心脏基线', 'baseline_LVEF', '左室射血分数', 'Baseline LVEF', '%', 'number', '20-80', ''),
  F('⑨心脏基线', 'heart_rate', '心率', 'Heart Rate', 'bpm', 'number', '30-200', '70'),
  F('⑨心脏基线', 'SBP', '收缩压', 'Systolic BP', 'mmHg', 'number', '60-250', '120'),
  F('⑨心脏基线', 'DBP', '舒张压', 'Diastolic BP', 'mmHg', 'number', '30-150', '80'),
  F('⑨心脏基线', 'NYHA', 'NYHA分级', 'NYHA Class', '', 'cat', 'I-IV', '', { zh: ['I', 'II', 'III', 'IV'], en: ['I', 'II', 'III', 'IV'] }),

  // ⑩ 心电监测
  F('⑩心电监测', 'QTc_peak', '峰值QTc', 'QTc Peak', 'ms', 'number', '250-600', ''),
  F('⑩心电监测', 'QTc_change', 'QTc变化', 'QTc Change', 'ms', 'number', '±200', ''),
  F('⑩心电监测', 'QRS', 'QRS时限', 'QRS Duration', 'ms', 'number', '60-200', ''),
  F('⑩心电监测', 'PR', 'PR间期', 'PR Interval', 'ms', 'number', '100-300', ''),
  F('⑩心电监测', 'arrhythmia_event', '心律失常事件', 'Arrhythmia Event', '', 'cat', '可自定义', '', { zh: ['房颤', '室早', '室速', '传导阻滞', '其他'], en: ['AF', 'PVC', 'VT', 'Block', 'Other'] }),

  // ⑪ 电解质
  F('⑪电解质', 'K', '钾', 'Potassium', 'mmol/L', 'number', '1.5-8.0', '4.0'),
  F('⑪电解质', 'Na', '钠', 'Sodium', 'mmol/L', 'number', '100-180', '140'),
  F('⑪电解质', 'Mg', '镁', 'Magnesium', 'mmol/L', 'number', '0.5-3.5', '1.8'),
  F('⑪电解质', 'Ca', '钙', 'Calcium', 'mmol/L', 'number', '1.0-3.5', '2.3'),
  F('⑪电解质', 'P', '磷', 'Phosphate', 'mmol/L', 'number', '0.5-3.0', '1.2'),
  F('⑪电解质', 'Cl', '氯', 'Chloride', 'mmol/L', 'number', '70-120', '102'),

  // ⑫ 肝肾功能
  F('⑫肝肾功能', 'ALT', '谷丙转氨酶', 'ALT', 'U/L', 'number', '5-100', '30'),
  F('⑫肝肾功能', 'AST', '谷草转氨酶', 'AST', 'U/L', 'number', '5-100', '30'),
  F('⑫肝肾功能', 'GGT', '谷氨酰转肽酶', 'GGT', 'U/L', 'number', '5-100', '30'),
  F('⑫肝肾功能', 'ALP', '碱性磷酸酶', 'ALP', 'U/L', 'number', '30-300', '90'),
  F('⑫肝肾功能', 'TBil', '总胆红素', 'Total Bilirubin', 'μmol/L', 'number', '0-100', '15'),
  F('⑫肝肾功能', 'Alb', '白蛋白', 'Albumin', 'g/L', 'number', '20-60', '45'),
  F('⑫肝肾功能', 'BUN', '尿素氮', 'BUN', 'mmol/L', 'number', '1-30', '5.5'),
  F('⑫肝肾功能', 'Cr', '肌酐', 'Creatinine', 'μmol/L', 'number', '20-120', '75'),
  F('⑫肝肾功能', 'UA', '尿酸', 'Uric Acid', 'μmol/L', 'number', '100-600', '320'),

  // ⑬ 心肌标志物
  F('⑬心肌标志物', 'CK', '肌酸激酶', 'Creatine Kinase', 'U/L', 'number', '10-500', '100'),
  F('⑬心肌标志物', 'CKMB', '肌酸激酶MB', 'CK-MB', 'U/L', 'number', '0-50', '5'),
  F('⑬心肌标志物', 'LDH', '乳酸脱氢酶', 'LDH', 'U/L', 'number', '100-500', '200'),
  F('⑬心肌标志物', 'HBDH', 'α-羟丁酸脱氢酶', 'HBDH', 'U/L', 'number', '70-300', '150'),
  F('⑬心肌标志物', 'cTn', '肌钙蛋白', 'Troponin', 'ng/mL', 'number', '0-10', '0.01'),
  F('⑬心肌标志物', 'BNP', '脑钠肽', 'BNP', 'pg/mL', 'number', '0-1000', '50'),
  F('⑬心肌标志物', 'Myo', '肌红蛋白', 'Myoglobin', 'ng/mL', 'number', '0-100', '30'),

  // ⑭ 血常规
  F('⑭血常规', 'WBC', '白细胞', 'WBC', '×10⁹/L', 'number', '0.5-50', '7.0'),
  F('⑭血常规', 'Hb', '血红蛋白', 'Hemoglobin', 'g/L', 'number', '50-250', '130'),
  F('⑭血常规', 'PLT', '血小板', 'Platelet', '��10⁹/L', 'number', '10-1000', '200'),
  F('⑭血常规', 'NEUT', '中性粒细胞', 'Neutrophils', '×10⁹/L', 'number', '0-30', '4.5'),

  // ⑮ 凝血
  F('⑮凝血', 'PT', '凝血酶原时间', 'Prothrombin Time', 's', 'number', '8-30', '13'),
  F('⑮凝血', 'APTT', '活化部分凝血活酶时间', 'APTT', 's', 'number', '20-80', '30'),
  F('⑮凝血', 'Fbg', '纤维蛋白原', 'Fibrinogen', 'g/L', 'number', '0.5-8', '3.0'),
  F('⑮凝血', 'D_dimer', 'D-二聚体', 'D-dimer', 'mg/L', 'number', '0-20', '0.5'),

  // ⑯ 血砷补充与备注
  F('⑯血砷补充与备注', 'sample_type', '样本类型', 'Sample Type', '', 'cat', '血/尿', '', { zh: ['血', '尿'], en: ['Blood', 'Urine'] }),
  F('⑯血砷补充与备注', 'sample_timepoint', '采样时点', 'Sampling Timepoint', '', 'cat', '可自定义', '', { zh: ['治疗前', '治疗中', '治疗后'], en: ['Pre-treatment', 'During treatment', 'Post-treatment'] }),
  F('⑯血砷补充与备注', 'notes', '补充说明', 'Notes', '', 'text', '自由填写', ''),
]

// ── 颜色 ──────────────────────────────────────────────────────────
const C_HEADER = 'FF005EB8'
const C_HEADER_TXT = 'FFFFFFFF'
const C_CORE = 'FFFFF2CC'
const C_OUTCOME = 'FFE2EFDA'
const C_LABEL = 'FFF0F7FF'
const C_EXAMPLE = 'FFF2F2F2'

function colFill(mod) {
  if (mod.startsWith('②')) return C_CORE
  if (mod.startsWith('③')) return C_OUTCOME
  return null
}

// ── 生成单个语言的工作簿 ──────────────────────────────────────────
async function build(lang) {
  const zh = lang === 'zh'
  const wb = new ExcelJS.Workbook()
  wb.creator = 'ATO CardiTox Risk Predictor'
  wb.created = new Date(2026, 2, 15)

  // ===== Sheet1 说明 =====
  const s1 = wb.addWorksheet(zh ? '填写说明' : 'Instructions')
  s1.columns = [{ width: 4 }, { width: 100 }]
  const put = (text, opt = {}) => {
    const row = s1.addRow(['', text])
    const cell = row.getCell(2)
    cell.alignment = { wrapText: true, vertical: 'middle' }
    if (opt.bold) cell.font = { bold: true, size: opt.size || 11, color: { argb: opt.color || 'FF212121' } }
    if (opt.fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opt.fill } }
    if (opt.h) row.height = opt.h
    return row
  }
  put(zh ? 'ATO 心脏毒性研究 · 数据采集模板' : 'ATO Cardiotoxicity Research · Data Collection Template', { bold: true, size: 16, color: 'FF005EB8', h: 26 })
  put('')
  if (zh) {
    put('一、填写规则', { bold: true, size: 13, color: 'FF005EB8' })
    put('1. 本表用于科研数据采集，所有字段均为选填；请尽量填写，以提高数据分析价值。')
    put('2. 一行对应一位患者。请在「数据」工作表中，从第 4 行开始录入（第 3 行为示例，提交前请删除）。')
    put('3. 无数据或未检测的项目，请留空或填写 NA。')
    put('4. 数值请只填阿拉伯数字，不要带单位（单位已在列标题中标注）。')
    put('5. 分类字段可从下拉菜单选择，也允许手动输入下拉以外的值（不会被拒绝）。')
    put('6. 派生指标（如 tAs 总砷、BMI 等）无需填写，系统将自动计算。')
    put('')
    put('二、隐私与伦理声明', { bold: true, size: 13, color: 'FF005EB8' })
    put('• 请勿填写姓名、身份证号、住院号、住址、电话等任何可识别患者身份的信息。', { color: 'FFDA291C' })
    put('• subject_id 请使用去标识化编号（如 S001），对照表由您自行保管，不要上传。')
    put('• 本数据仅用于三氧化二砷（ATO）心脏毒性风险模型研究，不作其他用途。')
    put('')
    put('三、提交者联系方式（可选，仅用于数据回访/质疑核对，非必填）', { bold: true, size: 13, color: 'FF005EB8' })
    put('姓名 / 单位：__________________________', { fill: 'FFF0F7FF', h: 22 })
    put('邮箱 / 电话：__________________________', { fill: 'FFF0F7FF', h: 22 })
    put('')
    put('四、字段详细定义（含单位、取值范围、示例）请见「数据字典」工作表。', { bold: true })
    put('')
    put('联系研究团队：Haixin@hrmu.edu.cn', { color: 'FF757575' })
  } else {
    put('1. Instructions', { bold: true, size: 13, color: 'FF005EB8' })
    put('1. This template collects research data. All fields are OPTIONAL; please fill in as much as possible.')
    put('2. One row = one patient. In the "Data" sheet, start entering from row 4 (row 3 is an example — delete before submitting).')
    put('3. For missing items, leave blank or enter NA.')
    put('4. For numeric fields, enter numbers only (units shown in column headers).')
    put('5. Categorical fields offer a dropdown, but values outside the list are accepted (not rejected).')
    put('6. Derived metrics (e.g. tAs, BMI) need NOT be filled — the system computes them automatically.')
    put('')
    put('2. Privacy & Ethics', { bold: true, size: 13, color: 'FF005EB8' })
    put('• Do NOT enter names, IDs, addresses, phones, or any patient-identifiable information.', { color: 'FFDA291C' })
    put('• Use de-identified subject_id (e.g. S001); keep the mapping table yourself.')
    put('• Data is used solely for ATO cardiotoxicity risk-model research.')
    put('')
    put('3. Submitter Contact (optional — for data follow-up only)', { bold: true, size: 13, color: 'FF005EB8' })
    put('Name / Institution: __________________________', { fill: 'FFF0F7FF', h: 22 })
    put('Email / Phone: __________________________', { fill: 'FFF0F7FF', h: 22 })
    put('')
    put('4. See "Dictionary" sheet for full field definitions.', { bold: true })
    put('')
    put('Contact: Haixin@hrmu.edu.cn', { color: 'FF757575' })
  }

  // ===== Sheet2 数据 =====
  const s2 = wb.addWorksheet(zh ? '数据' : 'Data')
  const keyRow = s2.getRow(1)
  const labelRow = s2.getRow(2)
  const exRow = s2.getRow(3)

  FIELDS.forEach((f, i) => {
    const col = i + 1
    s2.getColumn(col).width = Math.max(12, Math.min(22, (f.en.length + (f.unit ? f.unit.length : 0)) * 0.9 + 6))

    // 行1：变量名
    const kc = keyRow.getCell(col)
    kc.value = f.key
    kc.font = { bold: true, color: { argb: C_HEADER_TXT }, size: 10 }
    kc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HEADER } }
    kc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }

    // 行2：标签+单位
    const lc = labelRow.getCell(col)
    const label = zh ? f.zh : f.en
    lc.value = f.unit ? `${label}\n(${f.unit})` : label
    lc.font = { size: 10, color: { argb: 'FF212121' } }
    lc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    const cf = colFill(f.mod)
    lc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cf || C_LABEL } }

    // 行3：示例
    const ec = exRow.getCell(col)
    ec.value = f.ex || ''
    ec.font = { italic: true, size: 10, color: { argb: 'FF757575' } }
    ec.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_EXAMPLE } }
    ec.alignment = { horizontal: 'center', vertical: 'middle' }

    // 分类字段：行4~行500 加下拉（允许自定义）
    if (f.type === 'cat' && f.opt) {
      const opts = zh ? f.opt.zh : f.opt.en
      const formula = `"${opts.join(',')}"`
      for (let r = 4; r <= 500; r++) {
        s2.getCell(r, col).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [formula],
          showErrorMessage: false,
        }
      }
    }
  })

  keyRow.height = 20
  labelRow.height = 34
  exRow.height = 18
  exRow.getCell(1).note = zh ? '这是示例行，提交前请整行删���' : 'Example row — delete before submitting'
  s2.views = [{ state: 'frozen', xSplit: 1, ySplit: 3 }]

  // ===== Sheet3 数据字典 =====
  const s3 = wb.addWorksheet(zh ? '数据字典' : 'Dictionary')
  const dictCols = zh
    ? [
        { header: '模块', key: 'mod', width: 20 },
        { header: '变量名', key: 'key', width: 24 },
        { header: '中文标签', key: 'label', width: 26 },
        { header: '单位', key: 'unit', width: 12 },
        { header: '类型', key: 'type', width: 10 },
        { header: '取值范围', key: 'range', width: 30 },
        { header: '示例', key: 'ex', width: 14 },
      ]
    : [
        { header: 'Module', key: 'mod', width: 24 },
        { header: 'Variable', key: 'key', width: 24 },
        { header: 'Label', key: 'label', width: 30 },
        { header: 'Unit', key: 'unit', width: 12 },
        { header: 'Type', key: 'type', width: 10 },
        { header: 'Range', key: 'range', width: 32 },
        { header: 'Example', key: 'ex', width: 14 },
      ]
  s3.columns = dictCols
  const typeLabel = (t) => zh
    ? ({ number: '数值', text: '文本', date: '日期', cat: '分类' }[t])
    : ({ number: 'Number', text: 'Text', date: 'Date', cat: 'Category' }[t])
  FIELDS.forEach((f) => {
    let range = f.range || ''
    if (f.type === 'cat' && f.opt) range = (zh ? f.opt.zh : f.opt.en).join(' / ')
    s3.addRow({
      mod: f.mod,
      key: f.key,
      label: zh ? f.zh : f.en,
      unit: f.unit || '—',
      type: typeLabel(f.type),
      range,
      ex: f.ex || '',
    })
  })
  const h3 = s3.getRow(1)
  h3.font = { bold: true, color: { argb: C_HEADER_TXT } }
  h3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HEADER } }
  h3.height = 20
  s3.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: dictCols.length } }
  s3.views = [{ state: 'frozen', ySplit: 1 }]

  const outPath = path.join(OUT_DIR, `template-${lang}.xlsx`)
  await wb.xlsx.writeFile(outPath)
  console.log(`✓ 已生成: ${outPath} (${FIELDS.length} 列)`)
}

await build('zh')
await build('en')
console.log('全部完成。')
