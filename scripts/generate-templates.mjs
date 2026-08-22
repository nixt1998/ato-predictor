/**
 * 生成 ATO 心脏毒性研究数据采集 Excel 模板
 * 输出：public/templates/template-zh.xlsx 和 template-en.xlsx
 *
 * 结构：Sheet1 说明 | Sheet2 数据(一行一患者,含1示例行) | Sheet3 数据字典
 * 设计：全字段选填、去标识、分类下拉可自定义、中英各一份、双语模块/范围/示例
 * 字体：英文 Times New Roman，中文 宋体
 */
import ExcelJS from 'exceljs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.resolve(__dirname, '../public/templates')

// 取双语值：字符串则通用，{zh,en} 则按语言取
const L = (v, zh) => (v && typeof v === 'object' && !Array.isArray(v)) ? (zh ? v.zh : v.en) : v

// ── 分类选项（数组按语言分；性别用国际标准英文编码，两版一致）──────
const YESNO = { zh: ['是', '否'], en: ['Yes', 'No'] }
const SEX = { zh: ['男', '女', '间性', '不愿透露', '未知'], en: ['Male', 'Female', 'Intersex', 'Prefer not to say', 'Unknown'] }

// ── 模块名（双语）────────────────────────────────────────────────
const MOD = {
  a: { zh: '①标识与元数据', en: '① ID & Metadata' },
  b: { zh: '②核心输入', en: '② Core Inputs' },
  c: { zh: '③结局', en: '③ Outcomes' },
  d: { zh: '④人口学', en: '④ Demographics' },
  e: { zh: '⑤生活方式', en: '⑤ Lifestyle' },
  f: { zh: '⑥原发病与ATO治疗', en: '⑥ Primary Disease & ATO Therapy' },
  g: { zh: '⑦合并用药', en: '⑦ Concomitant Medications' },
  h: { zh: '⑧既往史与合并症', en: '⑧ History & Comorbidities' },
  i: { zh: '⑨心脏基线', en: '⑨ Cardiac Baseline' },
  j: { zh: '⑩心电监测', en: '⑩ ECG Monitoring' },
  k: { zh: '⑪电解质', en: '⑪ Electrolytes' },
  l: { zh: '⑫肝肾功能', en: '⑫ Liver & Renal Function' },
  m: { zh: '⑬心肌标志物', en: '⑬ Cardiac Biomarkers' },
  n: { zh: '⑭血常规', en: '⑭ Complete Blood Count' },
  o: { zh: '⑮凝血', en: '⑮ Coagulation' },
  p: { zh: '⑯血砷采样与备注', en: '⑯ Arsenic Sampling & Notes' },
}

// F(mod, key, zh标签, en标签, unit, type, range, ex, opt)
// range / ex 可为字符串(通用)或 {zh,en}
const F = (mod, key, zh, en, unit, type, range, ex, opt) => ({ mod, key, zh, en, unit, type, range, ex, opt })

const FIELDS = [
  // ① 标识与元数据
  F(MOD.a, 'subject_id', '受试者去标识编号', 'De-identified Subject ID', '', 'text', { zh: '自行编号，如 S001', en: 'e.g. S001' }, 'S001'),
  F(MOD.a, 'center', '来源中心/医院代码', 'Center / Hospital Code', '', 'text', { zh: '中心代码，如 H01', en: 'e.g. H01' }, 'H01'),
  F(MOD.a, 'record_date', '数据记录日期', 'Record Date', '', 'date', 'YYYY-MM-DD', '2026-03-15'),
  F(MOD.a, 'admission_date', '入院日期', 'Admission Date', '', 'date', 'YYYY-MM-DD', '2026-03-10'),
  F(MOD.a, 'discharge_date', '出院日期', 'Discharge Date', '', 'date', 'YYYY-MM-DD', '2026-04-05'),

  // ② 核心输入变量（模型必需）
  F(MOD.b, 'iAs', '无机砷', 'Inorganic Arsenic (iAs)', 'ng/mL', 'number', '≥0', '14'),
  F(MOD.b, 'MMA', '一甲基砷酸', 'Monomethylarsonic Acid (MMA)', 'ng/mL', 'number', '≥0', '16'),
  F(MOD.b, 'DMA', '二甲基砷酸', 'Dimethylarsinic Acid (DMA)', 'ng/mL', 'number', '≥0', '12'),
  F(MOD.b, 'CT_drug', '合并心毒性药物', 'Concomitant Cardiotoxic Drug', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),

  // ③ 结局（放在核心输入后）
  F(MOD.c, 'cardiotoxicity', '心毒性结局', 'Cardiotoxicity Outcome', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.c, 'cardiotox_type', '心毒性结局类型', 'Cardiotoxicity Type', '', 'cat', { zh: '可自定义', en: 'Editable' }, { zh: 'QT延长', en: 'QT prolongation' }, { zh: ['QT延长', '心律失常', '心力衰竭', '心肌损伤', '其他'], en: ['QT prolongation', 'Arrhythmia', 'Heart failure', 'Myocardial injury', 'Other'] }),
  F(MOD.c, 'onset_day', '心毒性发生时点', 'Onset Day', { zh: '天', en: 'days' }, 'number', '≥0', '14'),
  F(MOD.c, 'CTCAE_grade', '严重程度分级(CTCAE v6.0)', 'Severity Grade (CTCAE v6.0)', '', 'cat', '1-5', '2', { zh: ['1', '2', '3', '4', '5'], en: ['1', '2', '3', '4', '5'] }),
  F(MOD.c, 'outcome', '心毒性结局转归', 'Cardiotoxicity Outcome Status', '', 'cat', { zh: '恢复/持续/死亡/未知', en: 'Recovered/Persistent/Death/Unknown' }, { zh: '恢复', en: 'Recovered' }, { zh: ['恢复', '持续', '死亡', '未知'], en: ['Recovered', 'Persistent', 'Death', 'Unknown'] }),
  F(MOD.c, 'treatment_interrupted', '是否因心毒性中断治疗', 'Treatment Interrupted', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),

  // ④ 人口学
  F(MOD.d, 'sex', '性别 (NIH标准)', 'Sex (NIH standard)', '', 'cat', { zh: '男/女/间性/不愿透露/未知', en: 'Male/Female/Intersex/Prefer not to say/Unknown' }, { zh: '男', en: 'Male' }, SEX),
  F(MOD.d, 'age', '年龄', 'Age', { zh: '岁', en: 'years' }, 'number', '0-120', '45'),
  F(MOD.d, 'ethnicity', '民族', 'Ethnicity', '', 'text', { zh: '开放文本', en: 'Free text' }, { zh: '汉族', en: 'Han' }),
  F(MOD.d, 'height', '身高', 'Height', 'cm', 'number', '30-250', '170'),
  F(MOD.d, 'weight', '体重', 'Weight', 'kg', 'number', '2-300', '65'),

  // ⑤ 生活方式
  F(MOD.e, 'smoking', '吸烟史', 'Smoking History', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.e, 'smoking_pack_years', '吸烟包年', 'Smoking Pack-years', { zh: '包年', en: 'pack-years' }, 'number', '≥0', '20'),
  F(MOD.e, 'alcohol', '饮酒史', 'Alcohol History', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.e, 'alcohol_years', '饮酒年数', 'Alcohol Years', { zh: '年', en: 'years' }, 'number', '≥0', '10'),

  // ⑥ 原发病与ATO治疗
  F(MOD.f, 'diagnosis', '原发疾病诊断', 'Primary Diagnosis', '', 'text', { zh: '开放文本，如 APL', en: 'Free text, e.g. APL' }, 'APL'),
  F(MOD.f, 'disease_class', '危险度分型', 'Risk Stratification', '', 'cat', { zh: '高危/低危', en: 'High/Low' }, { zh: '高危', en: 'High' }, { zh: ['高危', '低危'], en: ['High', 'Low'] }),
  F(MOD.f, 'ATO_dose', 'ATO剂量', 'ATO Dose', 'mg/d', 'number', '≥0', '10'),
  F(MOD.f, 'ATO_regimen', '治疗阶段', 'Treatment Phase', '', 'cat', { zh: '诱导/巩固/维持', en: 'Induction/Consolidation/Maintenance' }, { zh: '诱导', en: 'Induction' }, { zh: ['诱导', '巩固', '维持'], en: ['Induction', 'Consolidation', 'Maintenance'] }),
  F(MOD.f, 'treatment_days', '疗程天数', 'Treatment Days', { zh: '天', en: 'days' }, 'number', '≥0', '28'),
  F(MOD.f, 'cumulative_dose', '累积剂量', 'Cumulative Dose', 'mg', 'number', '≥0', '280'),
  F(MOD.f, 'ATRA_combo', '联用全反式维甲酸', 'Combined with ATRA', '', 'cat', 'Yes / No', { zh: '是', en: 'Yes' }, YESNO),

  // ⑦ 合并用药
  F(MOD.g, 'ctdrug_name', '心毒性药物名称', 'Cardiotoxic Drug Name', '', 'text', { zh: 'CT_drug=Yes 时填写', en: 'Fill if CT_drug=Yes' }, { zh: '柔红霉素', en: 'Daunorubicin' }),
  F(MOD.g, 'noncardiotoxic_drug', '合并非心毒性药物', 'Concomitant Non-cardiotoxic Drug', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.g, 'noncardiotoxic_drug_name', '非心毒性药物名称', 'Non-cardiotoxic Drug Name', '', 'text', { zh: '开放文本', en: 'Free text' }, { zh: '维生素C', en: 'Vitamin C' }),
  F(MOD.g, 'qt_drug', '合并QT延长药物', 'Concomitant QT-prolonging Drug', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.g, 'azole_antifungal', '唑类抗真菌药', 'Azole Antifungal', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.g, 'diuretic', '利尿剂', 'Diuretic', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),

  // ⑧ 既往史与合并症
  F(MOD.h, 'diabetes', '糖尿病', 'Diabetes', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.h, 'hypertension', '高血压', 'Hypertension', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.h, 'hyperlipidemia', '高血脂', 'Hyperlipidemia', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.h, 'CHD', '冠心病', 'Coronary Heart Disease', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.h, 'heart_failure', '心力衰竭史', 'Heart Failure History', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.h, 'arrhythmia_history', '心律失常史', 'Arrhythmia History', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.h, 'prior_anthracycline', '既往蒽环类/胸部放疗', 'Prior Anthracycline / Chest RT', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.h, 'family_sudden_death', '心脏病/猝死家族史', 'Family History of SCD', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.h, 'renal_disease', '肾病史', 'Renal Disease', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.h, 'liver_disease', '肝病史', 'Liver Disease', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),
  F(MOD.h, 'thyroid_disease', '甲状腺疾病', 'Thyroid Disease', '', 'cat', 'Yes / No', { zh: '否', en: 'No' }, YESNO),

  // ⑨ 心脏基线
  F(MOD.i, 'baseline_QTc', '基线QTc', 'Baseline QTc', 'ms', 'number', '250-600', '420'),
  F(MOD.i, 'baseline_LVEF', '左室射血分数', 'Baseline LVEF', '%', 'number', '20-80', '60'),
  F(MOD.i, 'heart_rate', '心率', 'Heart Rate', 'bpm', 'number', '30-200', '70'),
  F(MOD.i, 'SBP', '收缩压', 'Systolic BP', 'mmHg', 'number', '60-250', '120'),
  F(MOD.i, 'DBP', '舒张压', 'Diastolic BP', 'mmHg', 'number', '30-150', '80'),
  F(MOD.i, 'NYHA', 'NYHA分级', 'NYHA Class', '', 'cat', 'I-IV', 'I', { zh: ['I', 'II', 'III', 'IV'], en: ['I', 'II', 'III', 'IV'] }),

  // ⑩ 心电监测
  F(MOD.j, 'QTc_peak', '峰值QTc', 'QTc Peak', 'ms', 'number', '250-600', '450'),
  F(MOD.j, 'QTc_change', 'QTc变化', 'QTc Change', 'ms', 'number', '±200', '30'),
  F(MOD.j, 'QRS', 'QRS时限', 'QRS Duration', 'ms', 'number', '60-200', '90'),
  F(MOD.j, 'PR', 'PR间期', 'PR Interval', 'ms', 'number', '100-300', '160'),
  F(MOD.j, 'arrhythmia_event', '心律失常事件', 'Arrhythmia Event', '', 'cat', { zh: '可自定义', en: 'Editable' }, { zh: '房颤', en: 'AF' }, { zh: ['房颤', '室早', '室速', '传导阻滞', '其他'], en: ['AF', 'PVC', 'VT', 'Block', 'Other'] }),

  // ⑪ 电解质
  F(MOD.k, 'K', '钾', 'Potassium', 'mmol/L', 'number', '1.5-8.0', '4.0'),
  F(MOD.k, 'Na', '钠', 'Sodium', 'mmol/L', 'number', '100-180', '140'),
  F(MOD.k, 'Mg', '镁', 'Magnesium', 'mmol/L', 'number', '0.5-3.5', '1.8'),
  F(MOD.k, 'Ca', '钙', 'Calcium', 'mmol/L', 'number', '1.0-3.5', '2.3'),
  F(MOD.k, 'P', '磷', 'Phosphate', 'mmol/L', 'number', '0.5-3.0', '1.2'),
  F(MOD.k, 'Cl', '氯', 'Chloride', 'mmol/L', 'number', '70-120', '102'),

  // ⑫ 肝肾功能
  F(MOD.l, 'ALT', '谷丙转氨酶', 'ALT', 'U/L', 'number', '5-100', '30'),
  F(MOD.l, 'AST', '谷草转氨酶', 'AST', 'U/L', 'number', '5-100', '30'),
  F(MOD.l, 'GGT', '谷氨酰转肽酶', 'GGT', 'U/L', 'number', '5-100', '30'),
  F(MOD.l, 'ALP', '碱性磷酸酶', 'ALP', 'U/L', 'number', '30-300', '90'),
  F(MOD.l, 'TBil', '总胆红素', 'Total Bilirubin', 'μmol/L', 'number', '0-100', '15'),
  F(MOD.l, 'Alb', '白蛋白', 'Albumin', 'g/L', 'number', '20-60', '45'),
  F(MOD.l, 'BUN', '尿素氮', 'BUN', 'mmol/L', 'number', '1-30', '5.5'),
  F(MOD.l, 'Cr', '肌酐', 'Creatinine', 'μmol/L', 'number', '20-120', '75'),
  F(MOD.l, 'UA', '尿酸', 'Uric Acid', 'μmol/L', 'number', '100-600', '320'),

  // ⑬ 心肌标志物
  F(MOD.m, 'CK', '肌酸激酶', 'Creatine Kinase', 'U/L', 'number', '10-500', '100'),
  F(MOD.m, 'CKMB', '肌酸激酶MB', 'CK-MB', 'U/L', 'number', '0-50', '5'),
  F(MOD.m, 'LDH', '乳酸脱氢酶', 'LDH', 'U/L', 'number', '100-500', '200'),
  F(MOD.m, 'HBDH', 'α-羟丁酸脱氢酶', 'HBDH', 'U/L', 'number', '70-300', '150'),
  F(MOD.m, 'cTn', '肌钙蛋白', 'Troponin', 'ng/mL', 'number', '0-10', '0.01'),
  F(MOD.m, 'BNP', '脑钠肽/NT-proBNP', 'BNP / NT-proBNP', 'pg/mL', 'number', '0-1000', '50'),
  F(MOD.m, 'Myo', '肌红蛋白', 'Myoglobin', 'ng/mL', 'number', '0-100', '30'),

  // ⑭ 血常规
  F(MOD.n, 'WBC', '白细胞', 'WBC', '×10⁹/L', 'number', '0.5-50', '7.0'),
  F(MOD.n, 'Hb', '血红蛋白', 'Hemoglobin', 'g/L', 'number', '50-250', '130'),
  F(MOD.n, 'PLT', '血小板', 'Platelet', '×10⁹/L', 'number', '10-1000', '200'),
  F(MOD.n, 'NEUT', '中性粒细胞', 'Neutrophils', '×10⁹/L', 'number', '0-30', '4.5'),

  // ⑮ 凝血
  F(MOD.o, 'PT', '凝血酶原时间', 'Prothrombin Time', 's', 'number', '8-30', '13'),
  F(MOD.o, 'APTT', '活化部分凝血活酶时间', 'APTT', 's', 'number', '20-80', '30'),
  F(MOD.o, 'Fbg', '纤维蛋白原', 'Fibrinogen', 'g/L', 'number', '0.5-8', '3.0'),
  F(MOD.o, 'D_dimer', 'D-二聚体', 'D-dimer', 'mg/L', 'number', '0-20', '0.5'),

  // ⑯ 血砷采样与备注
  F(MOD.p, 'sample_type', '样本类型', 'Sample Type', '', 'cat', { zh: '血/尿', en: 'Blood/Urine' }, { zh: '血', en: 'Blood' }, { zh: ['血', '尿'], en: ['Blood', 'Urine'] }),
  F(MOD.p, 'sample_timepoint', '采样时点', 'Sampling Timepoint', '', 'cat', { zh: '可自定义', en: 'Editable' }, { zh: '治疗前', en: 'Pre-treatment' }, { zh: ['治疗前', '治疗中', '治疗后'], en: ['Pre-treatment', 'During treatment', 'Post-treatment'] }),
  F(MOD.p, 'notes', '补充说明', 'Notes', '', 'text', { zh: '自由填写', en: 'Free text' }, ''),
]

// ── 颜色 ──────────────────────────────────────────────────────────
const C_HEADER = 'FF005EB8'      // 蓝 表头
const C_HEADER_TXT = 'FFFFFFFF'  // 白 表头字
const C_CORE = 'FFFFF2CC'        // 浅黄 核心输入
const C_OUTCOME = 'FFE2EFDA'     // 浅绿 结局
const C_LABEL = 'FFF0F7FF'       // 浅蓝 标签行
const C_EXAMPLE = 'FFFDECEA'     // 浅红底 示例行
const C_RED = 'FFDA291C'         // 红 强调/示例字
const C_BLUE = 'FF005EB8'        // 蓝 小节标题
const C_GREY = 'FF757575'        // 灰 次要说明

// 字体名：英文 Times New Roman，中文 宋体
const FONT = (zh) => (zh ? 'SimSun' : 'Times New Roman')

function colFill(modEn) {
  if (modEn.startsWith('②')) return C_CORE
  if (modEn.startsWith('③')) return C_OUTCOME
  return null
}

// ── 生成单个语言的工作簿 ──────────────────────────────────────────
async function build(lang) {
  const zh = lang === 'zh'
  const fontName = FONT(zh)
  const wb = new ExcelJS.Workbook()
  wb.creator = 'ATO CardiTox Risk Predictor'
  wb.created = new Date(2026, 2, 15)

  // ===== Sheet1 说明 =====
  const s1 = wb.addWorksheet(zh ? '说明' : 'Instructions')
  s1.columns = [{ width: 4 }, { width: 104 }]
  // put(text, {bold,size,color,fill,h,red}) — 段落写入器
  const put = (text, opt = {}) => {
    const row = s1.addRow(['', text])
    const cell = row.getCell(2)
    cell.alignment = { wrapText: true, vertical: 'middle' }
    cell.font = {
      name: fontName,
      bold: !!opt.bold,
      size: opt.size || 11,
      color: { argb: opt.color || 'FF212121' },
    }
    if (opt.fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opt.fill } }
    if (opt.h) row.height = opt.h
    return row
  }
  // 富文本写入器：segs=[{t,color,bold}] 用于一行内局部红字
  const putRich = (segs, opt = {}) => {
    const row = s1.addRow(['', null])
    const cell = row.getCell(2)
    cell.value = {
      richText: segs.map((s) => ({
        text: s.t,
        font: { name: fontName, size: opt.size || 11, bold: !!s.bold, color: { argb: s.color || 'FF212121' } },
      })),
    }
    cell.alignment = { wrapText: true, vertical: 'middle' }
    if (opt.fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opt.fill } }
    if (opt.h) row.height = opt.h
    return row
  }

  buildInstructions({ zh, put, putRich })

  // ===== Sheet2 数据 =====
  const s2 = wb.addWorksheet(zh ? '数据' : 'Data')
  const keyRow = s2.getRow(1)
  const labelRow = s2.getRow(2)
  const exRow = s2.getRow(3)

  FIELDS.forEach((f, i) => {
    const col = i + 1
    const enLabel = f.en
    s2.getColumn(col).width = Math.max(12, Math.min(22, enLabel.length * 0.9 + 6))

    // 行1：变量名（英文短码，两版一致）
    const kc = keyRow.getCell(col)
    kc.value = f.key
    kc.font = { name: fontName, bold: true, color: { argb: C_HEADER_TXT }, size: 10 }
    kc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HEADER } }
    kc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }

    // 行2：标签+单位（按语言）
    const lc = labelRow.getCell(col)
    const label = zh ? f.zh : f.en
    const unit = L(f.unit, zh)
    lc.value = unit ? `${label}\n(${unit})` : label
    lc.font = { name: fontName, size: 10, color: { argb: 'FF212121' } }
    lc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    const cf = colFill(f.mod.en)
    lc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cf || C_LABEL } }

    // 行3：示例（红字，红底；备注列除外留空）
    const ec = exRow.getCell(col)
    ec.value = L(f.ex, zh) || ''
    ec.font = { name: fontName, italic: true, size: 10, color: { argb: C_RED } }
    ec.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_EXAMPLE } }
    ec.alignment = { horizontal: 'center', vertical: 'middle' }

    // 分类字段：行4~500 加下拉（allowBlank，且不拒绝自定义值）
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
    // 数据行统一字体
    for (let r = 4; r <= 500; r++) {
      s2.getCell(r, col).font = { name: fontName, size: 10 }
    }
  })

  keyRow.height = 20
  labelRow.height = 34
  exRow.height = 18
  exRow.getCell(1).note = zh ? '这是示例行（红色斜体），提交前请整行删除' : 'Example row (red italic) — delete before submitting'
  s2.views = [{ state: 'frozen', xSplit: 1, ySplit: 3 }]

  // ===== Sheet3 数据字典 =====
  const s3 = wb.addWorksheet(zh ? '数据字典' : 'Dictionary')
  const heads = zh
    ? ['模块', '变量名', '标签', '单位', '类型', '参考范围', '示例']
    : ['Module', 'Variable', 'Label', 'Unit', 'Type', 'Reference / Plausible Range', 'Example']
  const widths = zh ? [22, 24, 26, 12, 10, 34, 14] : [30, 24, 30, 12, 10, 40, 14]
  s3.columns = widths.map((w) => ({ width: w }))
  const hr = s3.addRow(heads)
  hr.height = 20
  hr.eachCell((c) => {
    c.font = { name: fontName, bold: true, color: { argb: C_HEADER_TXT } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HEADER } }
    c.alignment = { vertical: 'middle', horizontal: 'center' }
  })
  // 表头下方：参考范围为合理性提示、非强制限制
  const noteRow = s3.addRow([
    zh
      ? '说明：「参考范围」仅为数据合理性提示，用于协助识别可能的录入误差，并非强制限制；临床真实值超出该范围时仍可如实填写。'
      : 'Note: "Reference / Plausible Range" is a data-plausibility hint to help catch entry errors. It is NOT a hard limit; enter the true clinical value even if it falls outside this range.',
  ])
  s3.mergeCells(noteRow.number, 1, noteRow.number, heads.length)
  noteRow.getCell(1).font = { name: fontName, italic: true, size: 9, color: { argb: C_GREY } }
  noteRow.getCell(1).alignment = { wrapText: true, vertical: 'middle' }
  noteRow.height = 26
  const typeLabel = (t) => zh
    ? ({ number: '数值', text: '文本', date: '日期', cat: '分类' }[t])
    : ({ number: 'Number', text: 'Text', date: 'Date', cat: 'Category' }[t])
  FIELDS.forEach((f) => {
    let range = L(f.range, zh) || ''
    if (f.type === 'cat' && f.opt) range = (zh ? f.opt.zh : f.opt.en).join(' / ')
    const row = s3.addRow([
      zh ? f.mod.zh : f.mod.en,
      f.key,
      zh ? f.zh : f.en,
      L(f.unit, zh) || '—',
      typeLabel(f.type),
      range,
      L(f.ex, zh) || '',
    ])
    row.eachCell((c) => { c.font = { name: fontName, size: 10 } })
  })
  s3.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: heads.length } }
  s3.views = [{ state: 'frozen', ySplit: 2 }]

  const outPath = path.join(OUT_DIR, `template-${lang}.xlsx`)
  await wb.xlsx.writeFile(outPath)
  console.log(`✓ 已生成: ${outPath} (${FIELDS.length} 列, 字体 ${fontName})`)
}

// ── Sheet1 说明页内容（学术、正式、严谨）────────────────────────
function buildInstructions({ zh, put, putRich }) {
  if (zh) {
    put('ATO Cardiotoxicity Research · Data Collection Template', { bold: true, size: 16, color: 'FF000000', h: 28 })
    put('三氧化二砷（ATO）心脏毒性研究 · 数据采集模板', { bold: true, size: 12, color: C_GREY, h: 20 })
    put('')
    put('一、研究目的', { bold: true, size: 13, color: C_BLUE })
    put('本模板用于系统性采集接受三氧化二砷治疗患者的临床、实验室及结局数据，以支持 ATO 相关心脏毒性风险预测模型的开发、验证与迭代优化。所填数据仅用于科学研究，不用于任何临床诊疗决策。')
    put('')
    put('二、工作表结构（本文件含三张工作表）', { bold: true, size: 13, color: C_BLUE })
    put('1）说明：本页。阐明研究目的、填写规范、隐私与知情同意声明。', { fill: C_LABEL })
    put('2）数据：数据录入主表。一行对应一位患者；第 1 行为英文变量名，第 2 行为中文标签与单位，第 3 行为示例（红色斜体）。', { fill: C_LABEL })
    put('3）数据字典：各变量的完整定义，含所属模块、变量名、标签、单位、数据类型、参考范围与示例，供填写时对照查阅。其中"参考范围"仅为合理性提示，并非强制限制。', { fill: C_LABEL })
    put('')
    put('三、填写规范', { bold: true, size: 13, color: C_BLUE })
    put('1. 所有字段均为选填。请在能力范围内尽量完整填写，缺失数据将降低该记录的分析价值。')
    put('2. 一行对应一位患者。请于「数据」工作表第 4 行起录入；第 3 行为示例行（红色斜体），提交前请整行删除。')
    put('3. 无数据或未检测项，请留空或填写 NA，不要填写 0 或臆测值。')
    put('4. 数值字段仅填阿拉伯数字，不要携带单位（单位已在列标题标注），并统一采用中国临床常用单位制。')
    put('5. 分类字段提供下拉菜单；如候选项含"其他/Other"，可将其删除后手动输入所需内容，系统不拒绝下拉以外的取值。')
    put('6. 日期统一采用 YYYY-MM-DD 格式（如 2026-03-15）。')
    put('7. 吸烟包年（pack-years）为累积暴露量标准单位，= 每日吸烟包数 × 吸烟年数。')
    put('')
    put('四、隐私与知情同意声明', { bold: true, size: 13, color: C_BLUE })
    putRich([
      { t: '• 本研究严格遵循《赫尔辛基宣言》与相关数据保护法规。' },
    ])
    putRich([
      { t: '• 严禁填写姓名、身份证号、住院号、联系电话、详细住址等任何可识别患者身份的信息；', color: 'FF212121' },
      { t: '一定不能有患者隐私泄露', color: C_RED, bold: true },
      { t: '。', color: 'FF212121' },
    ], { fill: C_EXAMPLE, h: 22 })
    put('• subject_id 请使用去标识化编号（如 S001）；受试者编号与真实身份的对照表须由数据提交方自行保管，切勿随本表上传。')
    put('• 数据提交前，应已获得所在机构伦理委员会批准及受试者知情同意（或符合豁免条件）。')
    put('• 本数据仅用于 ATO 心脏毒性风险模型研究，不作其他用途，并依规安全存储。')
    put('')
    put('五、提交者联系方式（可选，仅用于数据回访与质疑核对，非必填）', { bold: true, size: 13, color: C_BLUE })
    put('姓名 / 单位：__________________________', { fill: C_LABEL, h: 22 })
    put('邮箱 / 电话：__________________________', { fill: C_LABEL, h: 22 })
    put('')
    put('联系研究团队：Haixin@hrmu.edu.cn', { color: C_GREY })
  } else {
    put('ATO Cardiotoxicity Research · Data Collection Template', { bold: true, size: 16, color: 'FF000000', h: 28 })
    put('')
    put('1. Study Objective', { bold: true, size: 13, color: C_BLUE })
    put('This template is designed for the systematic collection of clinical, laboratory, and outcome data from patients receiving arsenic trioxide (ATO) therapy, in order to support the development, validation, and iterative refinement of a predictive model for ATO-associated cardiotoxicity. All data are used exclusively for scientific research and not for any clinical decision-making.')
    put('')
    put('2. Workbook Structure (this file contains three worksheets)', { bold: true, size: 13, color: C_BLUE })
    put('1) Instructions: this sheet, describing the study objective, completion guidelines, and privacy/informed-consent statement.', { fill: C_LABEL })
    put('2) Data: the main data-entry sheet. Each row represents one patient; Row 1 gives English variable names, Row 2 gives labels with units, and Row 3 provides an example (red italic).', { fill: C_LABEL })
    put('3) Dictionary: the complete definition of each variable, including its module, variable name, label, unit, data type, reference range, and example. The "Reference / Plausible Range" is a plausibility hint only, not a hard limit.', { fill: C_LABEL })
    put('')
    put('3. Completion Guidelines', { bold: true, size: 13, color: C_BLUE })
    put('1. All fields are OPTIONAL. Please complete as thoroughly as possible; missing data reduce the analytical value of the record.')
    put('2. One row = one patient. Begin data entry at Row 4 of the "Data" sheet; Row 3 is the example row (red italic) and must be deleted before submission.')
    put('3. For unavailable or untested items, leave blank or enter NA; do not enter 0 or presumed values.')
    put('4. For numeric fields, enter numbers only, without units (units are shown in the column headers).')
    put('5. Categorical fields provide a dropdown menu. If an "Other" option is present, it may be deleted and replaced with free text; values outside the dropdown list are not rejected.')
    put('6. Use the YYYY-MM-DD date format (e.g. 2026-03-15).')
    put('7. Smoking pack-years is the standard unit of cumulative exposure = packs smoked per day × years of smoking.')
    put('')
    put('4. Privacy & Informed-Consent Statement', { bold: true, size: 13, color: C_BLUE })
    put('• This study strictly adheres to the Declaration of Helsinki and applicable data-protection regulations.')
    putRich([
      { t: '• Do NOT enter names, national ID numbers, hospital record numbers, telephone numbers, detailed addresses, or any other patient-identifiable information; ', color: 'FF212121' },
      { t: 'under no circumstances may patient privacy be disclosed', color: C_RED, bold: true },
      { t: '.', color: 'FF212121' },
    ], { fill: C_EXAMPLE, h: 22 })
    put('• Use a de-identified subject_id (e.g. S001). The mapping between subject IDs and real identities must be kept by the submitting party and never uploaded with this file.')
    put('• Prior to submission, institutional ethics-committee approval and participant informed consent (or a valid waiver) must have been obtained.')
    put('• Data are used solely for ATO cardiotoxicity risk-model research, for no other purpose, and are stored securely in compliance with regulations.')
    put('')
    put('5. Submitter Contact (optional — for data follow-up and query verification only)', { bold: true, size: 13, color: C_BLUE })
    put('Name / Institution: __________________________', { fill: C_LABEL, h: 22 })
    put('Email / Phone: __________________________', { fill: C_LABEL, h: 22 })
    put('')
    put('Contact: Haixin@hrmu.edu.cn', { color: C_GREY })
  }
}

await build('zh')
await build('en')
console.log('全部完成。')




