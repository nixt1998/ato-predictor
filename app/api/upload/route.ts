/**
 * POST /api/upload
 * 处理数据上传：保存 Excel + 文件到服务器，并发送邮件通知
 */
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import ExcelJS from 'exceljs'
import nodemailer from 'nodemailer'

// ─── 路径配置 ─────────────────────────────────────────────────────────────────
// 生产环境请在 .env 中将 UPLOAD_DATA_DIR 设为绝对路径，如 /data/uploads
const UPLOAD_BASE = process.env.UPLOAD_DATA_DIR
  ? path.resolve(process.env.UPLOAD_DATA_DIR)
  : path.resolve('./data/uploads')
const SUBMISSIONS_DIR = path.join(UPLOAD_BASE, 'submissions')
const COUNTER_FILE    = path.join(UPLOAD_BASE, 'counter.json')

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

/** 读取并自增计数器，返回新ID（整数） */
function getNextId(): number {
  ensureDir(UPLOAD_BASE)
  let counter = { lastId: 0 }
  if (fs.existsSync(COUNTER_FILE)) {
    try { counter = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf-8')) }
    catch { counter = { lastId: 0 } }
  }
  counter.lastId += 1
  fs.writeFileSync(COUNTER_FILE, JSON.stringify(counter), 'utf-8')
  return counter.lastId
}

/** 格式化为4位补零的提交编号，如 ID-0001 */
function formatId(id: number): string {
  return `ID-${String(id).padStart(4, '0')}`
}

// ─── 主处理函数 ───────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // 分离文本字段与文件
    const fields: Record<string, string> = {}
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        files.push(value)
      } else if (!(value instanceof File)) {
        fields[key] = value as string
      }
    }

    // 验证文件数量与大小
    if (files.length > 10) {
      return NextResponse.json({ error: '最多上传10个文件' }, { status: 400 })
    }
    const oversized = files.filter(f => f.size > 25 * 1024 * 1024)
    if (oversized.length > 0) {
      return NextResponse.json(
        { error: `文件超过25MB限制: ${oversized.map(f => f.name).join(', ')}` },
        { status: 400 }
      )
    }

    // 生成提交ID 和时间戳
    const id           = getNextId()
    const submissionId = formatId(id)
    const now          = new Date()
    const datePart     = now.toLocaleDateString('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit' })
      .replace(/\//g, '-')  // "2026-08-17"
    const timePart     = now.toTimeString().slice(0, 8).replace(/:/g, '-')  // "14-30-25"
    const dateTimeStr  = `${datePart} ${now.toTimeString().slice(0, 8)}`   // "2026-08-17 14:30:25"

    // 创建提交目录
    const dirName      = `${submissionId} | ${datePart} | ${timePart}`
    const submissionDir = path.join(SUBMISSIONS_DIR, dirName)
    ensureDir(submissionDir)

    // 保存上传文件到 files/ 子目录
    if (files.length > 0) {
      const filesDir = path.join(submissionDir, 'files')
      ensureDir(filesDir)
      for (const file of files) {
        const safeName = file.name.replace(/[<>:"/\\|?*]/g, '_')
        const buf = Buffer.from(await file.arrayBuffer())
        fs.writeFileSync(path.join(filesDir, safeName), buf)
      }
    }

    // 保存补充说明到 notes.txt
    const notes = (fields.notes || '').trim()
    if (notes.length > 0) {
      fs.writeFileSync(
        path.join(submissionDir, 'notes.txt'),
        `提交编号: ${submissionId}\n提交时间: ${dateTimeStr}\n\n补充说明:\n${notes}`,
        'utf-8'
      )
    }

    // 生成 formdata.xlsx
    await createExcel(submissionDir, submissionId, dateTimeStr, fields, files)

    // 发送邮件通知（失败不影响提交成功）
    try {
      await sendEmail(submissionId, dateTimeStr, fields, files)
    } catch (emailErr) {
      console.warn('[Upload] 邮件发送失败（数据已保存至服务器）:', emailErr)
    }

    return NextResponse.json({ success: true, submissionId, timestamp: dateTimeStr })

  } catch (err) {
    console.error('[Upload] 处理失败:', err)
    return NextResponse.json({ error: '提交失败，服务器内部错误' }, { status: 500 })
  }
}

// ─── Excel 生成 ───────────────────────────────────────────────────────────────
async function createExcel(
  dir: string,
  submissionId: string,
  dateTimeStr: string,
  fields: Record<string, string>,
  files: File[]
) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'ATO CardiTox Risk Predictor'
  wb.created = new Date()

  // Sheet 1 — 提交信息
  const infoSheet = wb.addWorksheet('提交信息')
  infoSheet.columns = [
    { header: '字段', key: 'field', width: 30 },
    { header: '值',   key: 'value', width: 50 },
  ]
  infoSheet.addRow({ field: '提交编号',     value: submissionId })
  infoSheet.addRow({ field: '提交时间',     value: dateTimeStr  })
  infoSheet.addRow({ field: '上传文件数量', value: files.length })
  if (files.length > 0) {
    infoSheet.addRow({ field: '上传文件列表', value: files.map(f => f.name).join('、') })
  }

  // Sheet 2 — 患者数据
  const dataSheet = wb.addWorksheet('患者数据')
  dataSheet.columns = [
    { header: '字段 (Field)',  key: 'field', width: 40 },
    { header: '值 (Value)',    key: 'value', width: 35 },
  ]
  const rows: [string, string][] = [
    ['性别 Sex',                      fields.sex            || ''],
    ['年龄 Age (岁)',                  fields.age            || ''],
    ['身高 Height (cm)',               fields.height         || ''],
    ['体重 Weight (kg)',               fields.weight         || ''],
    ['联系方式 Contact',               fields.contactInfo    || ''],
    ['疾病分型 Class',                 fields.class          || ''],
    ['ATO剂量 Dose (μg/kg)',           fields.dose           || ''],
    ['合并非心毒性药物 CP_drug',       fields.cpDrug         || ''],
    ['合并心毒性药物 CT_drug',         fields.ctDrug         || ''],
    ['吸烟史 Smoking',                 fields.smoking        || ''],
    ['饮酒史 Alcohol',                 fields.alcohol        || ''],
    ['糖尿病 Diabetes',               fields.diabetes       || ''],
    ['高血脂症 Hyperlipidemia',        fields.hyperlipidemia || ''],
    ['高血压 Hypertension',            fields.hypertension   || ''],
    ['钾 K (mmol/L)',                  fields.K              || ''],
    ['镁 Mg (mmol/L)',                 fields.Mg             || ''],
    ['钙 Ca (mmol/L)',                 fields.Ca             || ''],
    ['ALT (U/L)',                      fields.ALT            || ''],
    ['AST (U/L)',                      fields.AST            || ''],
    ['GGT (U/L)',                      fields.GGT            || ''],
    ['尿酸 UA (μmol/L)',               fields.UA             || ''],
    ['肌酐 Cr (μmol/L)',               fields.Cr             || ''],
    ['肌酸激酶 CK (U/L)',              fields.CK             || ''],
    ['CK-MB (U/L)',                    fields.CKMB           || ''],
    ['乳酸脱氢酶 LDH (U/L)',          fields.LDH            || ''],
    ['羟丁酸脱氢酶 HBDH (U/L)',       fields.HBDH           || ''],
    ['无机砷 iAs (ng/mL)',             fields.iAs            || ''],
    ['一甲基砷酸 MMA (ng/mL)',         fields.MMA            || ''],
    ['二甲基砷酸 DMA (ng/mL)',         fields.DMA            || ''],
    ['心毒性结局 Cardiotoxicity',      fields.cardiotoxicity || ''],
    ['补充说明 Notes',                 fields.notes          || ''],
  ]
  rows.forEach(([field, value]) => dataSheet.addRow({ field, value }))

  // 表头样式
  for (const sheet of [infoSheet, dataSheet]) {
    const hRow = sheet.getRow(1)
    hRow.font = { bold: true }
    hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6E8FF' } }
    hRow.border = {
      bottom: { style: 'medium', color: { argb: 'FF005EB8' } },
    }
  }

  await wb.xlsx.writeFile(path.join(dir, 'formdata.xlsx'))
}

// ─── 邮件发送 ─────────────────────────────────────────────────────────────────
async function sendEmail(
  submissionId: string,
  dateTimeStr: string,
  fields: Record<string, string>,
  files: File[]
) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_TO } = process.env

  if (!SMTP_HOST || !SMTP_PASS || SMTP_PASS === 'your_smtp_auth_code_here') {
    console.log('[Upload] 邮件SMTP未配置，跳过发送')
    return
  }

  const transporter = nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   parseInt(SMTP_PORT || '465'),
    secure: parseInt(SMTP_PORT || '465') === 465,
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  })

  // 只列出非空字段
  const fieldMap: [string, string][] = [
    ['性别 Sex',             fields.sex],
    ['年龄 Age',             fields.age    ? `${fields.age} 岁`     : ''],
    ['身高 Height',          fields.height ? `${fields.height} cm`  : ''],
    ['体重 Weight',          fields.weight ? `${fields.weight} kg`  : ''],
    ['疾病分型 Class',       fields.class],
    ['ATO剂量 Dose',         fields.dose   ? `${fields.dose} μg/kg` : ''],
    ['合并心毒性药物',       fields.ctDrug],
    ['合并非心毒性药物',     fields.cpDrug],
    ['吸烟史',               fields.smoking],
    ['饮酒史',               fields.alcohol],
    ['糖尿病',               fields.diabetes],
    ['高血压',               fields.hypertension],
    ['高血脂症',             fields.hyperlipidemia],
    ['K (mmol/L)',           fields.K],
    ['Mg (mmol/L)',          fields.Mg],
    ['Ca (mmol/L)',          fields.Ca],
    ['ALT (U/L)',            fields.ALT],
    ['AST (U/L)',            fields.AST],
    ['GGT (U/L)',            fields.GGT],
    ['UA (μmol/L)',          fields.UA],
    ['Cr (μmol/L)',          fields.Cr],
    ['CK (U/L)',             fields.CK],
    ['CK-MB (U/L)',          fields.CKMB],
    ['LDH (U/L)',            fields.LDH],
    ['HBDH (U/L)',           fields.HBDH],
    ['iAs (ng/mL)',          fields.iAs],
    ['MMA (ng/mL)',          fields.MMA],
    ['DMA (ng/mL)',          fields.DMA],
    ['心毒性结局',           fields.cardiotoxicity],
    ['联系方式',             fields.contactInfo],
  ]

  const tableRows = fieldMap
    .filter(([, v]) => v && v.trim() && v !== 'NA' && v !== '未知 / 未填')
    .map(([k, v]) =>
      `<tr><td style="padding:5px 12px;background:#f0f7ff;font-weight:bold;border:1px solid #dde">${k}</td>` +
      `<td style="padding:5px 12px;border:1px solid #dde">${v}</td></tr>`
    ).join('')

  const html = `
<div style="font-family:'PingFang SC',sans-serif;max-width:620px;margin:0 auto;color:#333">
  <h2 style="color:#005EB8;border-bottom:2px solid #005EB8;padding-bottom:8px;margin-top:0">
    📋 ATO CardiTox — 新数据提交通知
  </h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
    <tr><td style="padding:6px 12px;background:#e6f0ff;font-weight:bold;border:1px solid #dde;width:120px">提交编号</td>
        <td style="padding:6px 12px;border:1px solid #dde;font-size:18px;font-weight:bold;color:#005EB8">${submissionId}</td></tr>
    <tr><td style="padding:6px 12px;background:#e6f0ff;font-weight:bold;border:1px solid #dde">提交时间</td>
        <td style="padding:6px 12px;border:1px solid #dde">${dateTimeStr}</td></tr>
    <tr><td style="padding:6px 12px;background:#e6f0ff;font-weight:bold;border:1px solid #dde">上传文件</td>
        <td style="padding:6px 12px;border:1px solid #dde">${files.length > 0 ? files.map(f => f.name).join('、') : '无'}</td></tr>
  </table>
  <h3 style="color:#333;margin-bottom:8px">患者数据（已填字段）</h3>
  <table style="width:100%;border-collapse:collapse">
    ${tableRows || '<tr><td colspan="2" style="padding:8px 12px;color:#999;border:1px solid #dde">所有字段均为空</td></tr>'}
  </table>
  ${fields.notes ? `<h3 style="color:#333;margin-top:20px">补充说明</h3>
  <p style="background:#f5f5f5;padding:12px;border-radius:4px;line-height:1.6">${fields.notes.replace(/\n/g, '<br>')}</p>` : ''}
  <p style="color:#999;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">
    ⚡ 此邮件由 ATO CardiTox 服务器自动发送<br>
    📁 数据已保存至服务器：uploads/submissions/${submissionId} | ...
  </p>
</div>`

  await transporter.sendMail({
    from:    `"ATO CardiTox" <${SMTP_USER}>`,
    to:      EMAIL_TO,
    subject: `[ATO CardiTox] 新数据提交 | ${submissionId} | ${dateTimeStr.split(' ')[0]}`,
    html,
  })
  console.log(`[Upload] 邮件已发送至 ${EMAIL_TO}`)
}
