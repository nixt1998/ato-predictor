'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, CheckCircle, X, FileText, Download, Info,
  ChevronDown, AlertCircle, Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

// ─── 类型 ──────────────────────────────────────────────────────────────────
interface FormState {
  subjectId: string; center: string
  sex: string; age: string; height: string; weight: string; contactInfo: string
  class: string; dose: string; cardiotoxicDrug: string; cardiotoxicDrugName: string
  nonCardiotoxicDrug: string; nonCardiotoxicDrugName: string
  smoking: string; alcohol: string; diabetes: string; hyperlipidemia: string; hypertension: string
  K: string; Mg: string; Ca: string; BUN: string
  ALT: string; AST: string; GGT: string; UA: string; Cr: string
  CK: string; CKMB: string; LDH: string; HBDH: string
  iAs: string; MMA: string; DMA: string
  cardiotoxicity: string; cardiotoxicitySymptoms: string; notes: string
}

const INITIAL: FormState = {
  subjectId: '', center: '',
  sex: 'NA', age: '', height: '', weight: '', contactInfo: '',
  class: 'NA', dose: '', cardiotoxicDrug: 'NA', cardiotoxicDrugName: '',
  nonCardiotoxicDrug: 'NA', nonCardiotoxicDrugName: '',
  smoking: 'NA', alcohol: 'NA', diabetes: 'NA', hyperlipidemia: 'NA', hypertension: 'NA',
  K: '', Mg: '', Ca: '', BUN: '',
  ALT: '', AST: '', GGT: '', UA: '', Cr: '',
  CK: '', CKMB: '', LDH: '', HBDH: '',
  iAs: '', MMA: '', DMA: '',
  cardiotoxicity: 'NA', cardiotoxicitySymptoms: '', notes: '',
}

// ─── 子组件：文本输入框 ─────────────────────────────────────────────────────
function FieldInput({
  label, name, placeholder, value, onChange, type = 'text', note, className,
}: {
  label: string; name: string; placeholder?: string
  value: string; onChange: (v: string) => void; type?: string; note?: string; className?: string
}) {
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <label className="block text-sm font-medium text-[#212121]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] bg-white text-sm
          text-[#212121] placeholder:text-[#BDBDBD] focus:outline-none
          focus:ring-2 focus:ring-[#005EB8]/40 focus:border-[#005EB8] transition"
      />
      {note && <p className="text-xs text-[#757575]">{note}</p>}
    </div>
  )
}

// ─── 子组件：下拉选择框 ─────────────────────────────────────────────────────
function FieldSelect({
  label, value, onChange, options, note,
}: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; note?: string
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-[#212121]">{label}</label>
      {note && (
        <p className="text-xs text-[#ED8B00] flex items-center gap-1">
          <Info className="w-3 h-3 flex-shrink-0" />{note}
        </p>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-10 pl-3 pr-8 rounded-lg border border-[#E0E0E0] bg-white
            text-sm text-[#212121] appearance-none focus:outline-none
            focus:ring-2 focus:ring-[#005EB8]/40 focus:border-[#005EB8] transition cursor-pointer"
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575] pointer-events-none" />
      </div>
    </div>
  )
}

// ─── 子组件：分区标题 ──────────────────────────────────────────────────────
function SectionCard({
  title, children,
}: {
  title: string; children: React.ReactNode
}) {
  return (
    <Card className="overflow-visible">
      <CardHeader className="pb-3 border-b border-[#F0F7FF]">
        <CardTitle className="text-base font-semibold text-[#005EB8]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── 子组件：数据使用说明弹窗 ────────────────────────────────────────────────
function DataPolicyModal({
  onClose, onAgree, t,
}: {
  onClose: () => void; onAgree: () => void
  t: ReturnType<typeof useTranslations>
}) {
  const [countdown, setCountdown] = useState(10)
  const [canAgree, setCanAgree] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanAgree(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
      >
        {/* 标题 */}
        <div className="bg-gradient-to-r from-[#005EB8] to-[#0073D1] px-6 py-4">
          <h2 className="text-xl font-bold text-white">{t('dataPolicy.title')}</h2>
        </div>

        {/* 内容区域（可滚动） */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(80vh-160px)] space-y-5 text-sm">
          {/* 研究目的 */}
          <div>
            <h3 className="font-semibold text-[#005EB8] mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F0F7FF] flex items-center justify-center text-xs">1</span>
              {t('dataPolicy.purpose.title')}
            </h3>
            <p className="text-[#212121] leading-relaxed">{t('dataPolicy.purpose.content')}</p>
          </div>

          {/* 数据用途 */}
          <div>
            <h3 className="font-semibold text-[#005EB8] mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F0F7FF] flex items-center justify-center text-xs">2</span>
              {t('dataPolicy.usage.title')}
            </h3>
            <ul className="space-y-2 text-[#212121]">
              {['item1', 'item2', 'item3', 'item4'].map(key => (
                <li key={key} className="flex items-start gap-2">
                  <span className="text-[#005EB8] flex-shrink-0 mt-0.5">•</span>
                  <span>{t(`dataPolicy.usage.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 隐私保护 */}
          <div>
            <h3 className="font-semibold text-[#005EB8] mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F0F7FF] flex items-center justify-center text-xs">3</span>
              {t('dataPolicy.protection.title')}
            </h3>
            <ul className="space-y-2 text-[#212121]">
              {['item1', 'item2', 'item3', 'item4'].map(key => (
                <li key={key} className="flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                  <span>{t(`dataPolicy.protection.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 您的权利 */}
          <div>
            <h3 className="font-semibold text-[#005EB8] mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F0F7FF] flex items-center justify-center text-xs">4</span>
              {t('dataPolicy.rights.title')}
            </h3>
            <ul className="space-y-2 text-[#212121]">
              {['item1', 'item2', 'item3'].map(key => (
                <li key={key} className="flex items-start gap-2">
                  <span className="text-[#005EB8] flex-shrink-0 mt-0.5">→</span>
                  <span>{t(`dataPolicy.rights.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 知情同意 */}
          <div className="bg-[#FFF9E6] border border-[#ED8B00]/30 rounded-lg p-4">
            <h3 className="font-semibold text-[#ED8B00] mb-2">{t('dataPolicy.consent.title')}</h3>
            <p className="text-[#212121] text-sm leading-relaxed">{t('dataPolicy.consent.content')}</p>
          </div>

          {/* 联系方式 */}
          <div className="text-xs text-[#757575] border-t border-[#E0E0E0] pt-3">
            <strong className="text-[#212121]">{t('dataPolicy.contact.title')}：</strong>
            {t('dataPolicy.contact.content')}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 bg-[#F5F5F5] border-t border-[#E0E0E0] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-lg border border-[#E0E0E0] bg-white text-[#757575] font-medium hover:bg-[#F5F5F5] transition"
          >
            {t('dataPolicy.buttons.cancel')}
          </button>
          <button
            onClick={onAgree}
            disabled={!canAgree}
            className="flex-[2] h-11 rounded-lg bg-gradient-to-r from-[#005EB8] to-[#0073D1] text-white font-semibold
              hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canAgree
              ? t('dataPolicy.buttons.agree')
              : t('dataPolicy.buttons.countdown', { seconds: countdown })
            }
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── 子组件：成功弹窗 ──────────────────────────────────────────────────────
function SuccessModal({
  submissionId, onClose, onNew, t,
}: {
  submissionId: string; onClose: () => void; onNew: () => void
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#212121] mb-2">{t('success.title')}</h2>
        <p className="text-[#757575] text-sm mb-3">{t('success.message')}</p>

        {/* 感谢语 */}
        <div className="bg-gradient-to-br from-[#F0F7FF] to-white border border-[#005EB8]/20 rounded-xl p-4 mb-5">
          <p className="text-sm text-[#212121] leading-relaxed">{t('success.thanks')}</p>
        </div>

        {/* 提交编号 */}
        <div className="bg-[#F5F5F5] rounded-xl p-4 mb-5">
          <p className="text-xs text-[#757575] mb-1">{t('success.idLabel')}</p>
          <p className="text-2xl font-bold text-[#005EB8] tracking-widest">{submissionId}</p>
        </div>

        <p className="text-xs text-[#ED8B00] flex items-start gap-1.5 text-left mb-6">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          {t('success.saveNote')}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-[#E0E0E0] text-sm text-[#757575] hover:bg-[#F5F5F5] transition"
          >
            {t('success.close')}
          </button>
          <button
            onClick={onNew}
            className="flex-1 h-10 rounded-lg bg-gradient-to-r from-[#005EB8] to-[#0073D1] text-white text-sm font-semibold hover:opacity-90 transition"
          >
            {t('success.newSubmit')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── 子组件：重置确认弹窗 ──────────────────────────────────────────────────
function ResetConfirmModal({
  onClose, t,
}: {
  onClose: () => void
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full text-center"
      >
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Info className="w-6 h-6 text-[#005EB8]" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-[#212121] mb-2">{t('resetConfirm.title')}</h2>
        <p className="text-sm text-[#757575] mb-5">{t('resetConfirm.message')}</p>
        <button
          onClick={onClose}
          className="w-full h-10 rounded-lg bg-[#005EB8] text-white font-semibold hover:bg-[#0073D1] transition"
        >
          {t('resetConfirm.close')}
        </button>
      </motion.div>
    </div>
  )
}

// ─── 主页面组件 ────────────────────────────────────────────────────────────
export default function UploadPage() {
  const t = useTranslations('upload')
  const locale = useLocale()
  const [form, setForm]             = useState<FormState>(INITIAL)
  const [files, setFiles]           = useState<File[]>([])
  const [consent, setConsent]       = useState(false)
  const [showPolicy, setShowPolicy] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [fileError, setFileError]   = useState('')
  const [success, setSuccess]       = useState<{ submissionId: string } | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const fileInputRef                = useRef<HTMLInputElement>(null)
  const dropZoneRef                 = useRef<HTMLDivElement>(null)
  const MAX_FILES = 10
  const MAX_SIZE  = 25 * 1024 * 1024

  const set = useCallback((k: keyof FormState, v: string) =>
    setForm(prev => ({ ...prev, [k]: v })), [])

  // 选项数组（依赖翻译）
  const yesNoOpts = [
    { value: 'NA',  label: t('options.na')  },
    { value: 'Yes', label: t('options.yes') },
    { value: 'No',  label: t('options.no')  },
  ]
  const sexOpts = [
    { value: 'NA',     label: t('options.na')     },
    { value: 'Male',   label: t('options.male')   },
    { value: 'Female', label: t('options.female') },
  ]
  const classOpts = [
    { value: 'NA',   label: t('options.na')        },
    { value: 'High', label: t('options.classHigh') },
    { value: 'Low',  label: t('options.classLow')  },
  ]

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const incoming = Array.from(e.dataTransfer.files)
    processFiles(incoming)
  }

  // 文件选择处理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || [])
    processFiles(incoming)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const processFiles = (incoming: File[]) => {
    setFileError('')
    const merged = [...files]
    for (const f of incoming) {
      if (merged.length >= MAX_FILES) { setFileError(t('fileUpload.errorTooMany')); break }
      if (f.size > MAX_SIZE) { setFileError(t('fileUpload.errorTooLarge').replace('{name}', f.name)); continue }
      if (!merged.find(x => x.name === f.name && x.size === f.size)) merged.push(f)
    }
    setFiles(merged)
  }

  const removeFile = (idx: number) =>
    setFiles(prev => prev.filter((_, i) => i !== idx))

  // 提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) { setSubmitError(t('errors.consentRequired')); return }
    if (submitting) return // 防止重复提交

    setSubmitting(true)
    setSubmitError('')

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    files.forEach(f => fd.append('files', f, f.name))

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2分钟超时

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSuccess({ submissionId: data.submissionId })
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setSubmitError(t('errors.timeout') || 'Request timeout')
      } else {
        setSubmitError(err.message || t('errors.submitFailed'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  // 重置
  const handleReset = () => {
    setForm(INITIAL); setFiles([]); setConsent(false)
    setSubmitError(''); setFileError('')
    setShowResetConfirm(true)
  }

  const handleNewSubmit = () => {
    setSuccess(null); handleReset()
  }

  // 文件大小显示
  const fmtSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  // 文件图标颜色（按扩展名）
  const fileColor = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || ''
    if (['jpg','jpeg','png','tif','tiff'].includes(ext)) return 'text-green-500'
    if (['pdf'].includes(ext))                           return 'text-red-500'
    if (['xls','xlsx'].includes(ext))                   return 'text-emerald-600'
    if (['doc','docx'].includes(ext))                   return 'text-blue-600'
    return 'text-[#757575]'
  }

  // 模板下载
  const handleDownloadTemplate = () => {
    const templatePath = locale === 'zh' ? '/templates/template-zh.xlsx' : '/templates/template-en.xlsx'
    const link = document.createElement('a')
    link.href = templatePath
    link.download = `ATO-CardioTox-Template-${locale}.xlsx`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F7FF] to-white py-12">
      <div className="container mx-auto px-6 max-w-5xl">

        {/* 页面标题 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#212121] mb-2">{t('title')}</h1>
          <p className="text-[#757575] text-lg">{t('subtitle')}</p>
        </div>

        {/* 模板下载卡片 */}
        <Card className="mb-6 border-[#005EB8]/20 bg-[#F0F7FF]">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[#005EB8] flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {t('template.title')}
                </p>
                <p className="text-sm text-[#757575] mt-0.5">{t('template.description')}</p>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="flex-shrink-0 inline-flex items-center gap-2 h-10 px-5 rounded-lg
                  bg-[#005EB8] text-white text-sm font-semibold hover:bg-[#0073D1] transition"
              >
                <Download className="w-4 h-4" />
                {t('template.download')}
              </button>
            </div>
            <p className="text-xs text-[#757575] mt-3 border-t border-[#005EB8]/10 pt-3">
              ─── {t('template.orText')} ───
            </p>
          </CardContent>
        </Card>

        {/* 提示：所有字段选填 */}
        <div className="mb-6 flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl p-3.5">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-0.5">
            <p>{t('notes.allOptional')}</p>
            <p>{t('notes.professional')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 0. 标识与元数据（选填） */}
          <SectionCard title={t('sections.identity')}>
            <FieldInput
              label={t('fields.subjectId')}
              name="subjectId"
              placeholder={t('placeholders.subjectId')}
              value={form.subjectId}
              onChange={v => set('subjectId', v)}
              note={t('fields.subjectIdNote')}
              className="lg:col-span-2"
            />
            <FieldInput
              label={t('fields.center')}
              name="center"
              placeholder={t('placeholders.center')}
              value={form.center}
              onChange={v => set('center', v)}
              note={t('fields.centerNote')}
              className="lg:col-span-2"
            />
          </SectionCard>

          {/* 1. 患者基础信息 */}
          <SectionCard title={t('sections.basicInfo')}>
            <FieldSelect label={t('fields.sex')} value={form.sex} onChange={v => set('sex', v)} options={sexOpts} />
            <FieldInput  label={t('fields.age')}    name="age"    placeholder={t('placeholders.age')}    value={form.age}    onChange={v => set('age', v)}    type="number" />
            <FieldInput  label={t('fields.height')} name="height" placeholder={t('placeholders.height')} value={form.height} onChange={v => set('height', v)} type="number" />
            <FieldInput  label={t('fields.weight')} name="weight" placeholder={t('placeholders.weight')} value={form.weight} onChange={v => set('weight', v)} type="number" />
          </SectionCard>

          {/* 2. 临床分型与用药 */}
          <SectionCard title={t('sections.clinical')}>
            <div className="lg:col-span-2">
              <FieldSelect label={t('fields.class')} value={form.class} onChange={v => set('class', v)} options={classOpts} />
              <p className="text-xs text-[#757575] mt-1">{t('classNote')}</p>
            </div>
            <div className="lg:col-span-2">
              <FieldInput label={t('fields.dose')} name="dose" placeholder={t('placeholders.dose')} value={form.dose} onChange={v => set('dose', v)} type="number" />
            </div>
            <FieldSelect
              label={t('fields.cardiotoxicDrug')}
              value={form.cardiotoxicDrug}
              onChange={v => set('cardiotoxicDrug', v)}
              options={yesNoOpts}
            />
            {form.cardiotoxicDrug === 'Yes' && (
              <div className="lg:col-span-2">
                <FieldInput
                  label={t('fields.cardiotoxicDrugName')}
                  name="cardiotoxicDrugName"
                  placeholder={t('placeholders.cardiotoxicDrugName')}
                  value={form.cardiotoxicDrugName}
                  onChange={v => set('cardiotoxicDrugName', v)}
                />
                <p className="text-xs text-[#757575] mt-1">{t('fields.cardiotoxicDrugNote')}</p>
              </div>
            )}
            <FieldSelect
              label={t('fields.nonCardiotoxicDrug')}
              value={form.nonCardiotoxicDrug}
              onChange={v => set('nonCardiotoxicDrug', v)}
              options={yesNoOpts}
            />
            {form.nonCardiotoxicDrug === 'Yes' && (
              <div className="lg:col-span-2">
                <FieldInput
                  label={t('fields.nonCardiotoxicDrugName')}
                  name="nonCardiotoxicDrugName"
                  placeholder={t('placeholders.nonCardiotoxicDrugName')}
                  value={form.nonCardiotoxicDrugName}
                  onChange={v => set('nonCardiotoxicDrugName', v)}
                />
                <p className="text-xs text-[#757575] mt-1">{t('fields.nonCardiotoxicDrugNote')}</p>
              </div>
            )}
          </SectionCard>

          {/* 3. 既往史与合并症 */}
          <SectionCard title={t('sections.comorbidities')}>
            <FieldSelect label={t('fields.smoking')}        value={form.smoking}        onChange={v => set('smoking', v)}        options={yesNoOpts} />
            <FieldSelect label={t('fields.alcohol')}        value={form.alcohol}        onChange={v => set('alcohol', v)}        options={yesNoOpts} />
            <FieldSelect label={t('fields.diabetes')}       value={form.diabetes}       onChange={v => set('diabetes', v)}       options={yesNoOpts} />
            <FieldSelect label={t('fields.hyperlipidemia')} value={form.hyperlipidemia} onChange={v => set('hyperlipidemia', v)} options={yesNoOpts} />
            <FieldSelect label={t('fields.hypertension')}   value={form.hypertension}   onChange={v => set('hypertension', v)}   options={yesNoOpts} />
          </SectionCard>

          {/* 4. 血清电解质 */}
          <SectionCard title={t('sections.electrolytes')}>
            <FieldInput label={t('fields.K')}   name="K"   placeholder={t('placeholders.K')}   value={form.K}   onChange={v => set('K', v)}   type="number" />
            <FieldInput label={t('fields.Mg')}  name="Mg"  placeholder={t('placeholders.Mg')}  value={form.Mg}  onChange={v => set('Mg', v)}  type="number" />
            <FieldInput label={t('fields.Ca')}  name="Ca"  placeholder={t('placeholders.Ca')}  value={form.Ca}  onChange={v => set('Ca', v)}  type="number" />
            <FieldInput label={t('fields.BUN')} name="BUN" placeholder={t('placeholders.BUN')} value={form.BUN} onChange={v => set('BUN', v)} type="number" />
          </SectionCard>

          {/* 5. 肝肾功能 */}
          <SectionCard title={t('sections.liverKidney')}>
            <FieldInput label={t('fields.ALT')} name="ALT" placeholder={t('placeholders.ALT')} value={form.ALT} onChange={v => set('ALT', v)} type="number" />
            <FieldInput label={t('fields.AST')} name="AST" placeholder={t('placeholders.AST')} value={form.AST} onChange={v => set('AST', v)} type="number" />
            <FieldInput label={t('fields.GGT')} name="GGT" placeholder={t('placeholders.GGT')} value={form.GGT} onChange={v => set('GGT', v)} type="number" />
            <FieldInput label={t('fields.UA')}  name="UA"  placeholder={t('placeholders.UA')}  value={form.UA}  onChange={v => set('UA', v)}  type="number" />
            <FieldInput label={t('fields.Cr')}  name="Cr"  placeholder={t('placeholders.Cr')}  value={form.Cr}  onChange={v => set('Cr', v)}  type="number" />
          </SectionCard>

          {/* 6. 心肌酶 */}
          <SectionCard title={t('sections.cardiacEnzymes')}>
            <FieldInput label={t('fields.CK')}   name="CK"   placeholder={t('placeholders.CK')}   value={form.CK}   onChange={v => set('CK', v)}   type="number" />
            <FieldInput label={t('fields.CKMB')} name="CKMB" placeholder={t('placeholders.CKMB')} value={form.CKMB} onChange={v => set('CKMB', v)} type="number" />
            <FieldInput label={t('fields.LDH')}  name="LDH"  placeholder={t('placeholders.LDH')}  value={form.LDH}  onChange={v => set('LDH', v)}  type="number" />
            <FieldInput label={t('fields.HBDH')} name="HBDH" placeholder={t('placeholders.HBDH')} value={form.HBDH} onChange={v => set('HBDH', v)} type="number" />
          </SectionCard>

          {/* 7. 血砷检测结果 */}
          <SectionCard title={t('sections.arsenic')}>
            <FieldInput label={t('fields.iAs')} name="iAs" placeholder={t('placeholders.iAs')} value={form.iAs} onChange={v => set('iAs', v)} type="number" />
            <FieldInput label={t('fields.MMA')} name="MMA" placeholder={t('placeholders.MMA')} value={form.MMA} onChange={v => set('MMA', v)} type="number" />
            <FieldInput label={t('fields.DMA')} name="DMA" placeholder={t('placeholders.DMA')} value={form.DMA} onChange={v => set('DMA', v)} type="number" />
          </SectionCard>

          {/* 8. 临床结局 */}
          <SectionCard title={t('sections.outcome')}>
            <FieldSelect
              label={t('fields.cardiotoxicity')}
              value={form.cardiotoxicity}
              onChange={v => set('cardiotoxicity', v)}
              options={yesNoOpts}
            />
            {form.cardiotoxicity === 'Yes' && (
              <div className="lg:col-span-3">
                <FieldInput
                  label={t('fields.cardiotoxicitySymptoms')}
                  name="cardiotoxicitySymptoms"
                  placeholder={t('placeholders.cardiotoxicitySymptoms')}
                  value={form.cardiotoxicitySymptoms}
                  onChange={v => set('cardiotoxicitySymptoms', v)}
                />
                <p className="text-xs text-[#757575] mt-1">{t('fields.cardiotoxicityNote')}</p>
              </div>
            )}
          </SectionCard>

          {/* 9. 联系方式 */}
          <Card>
            <CardHeader className="pb-3 border-b border-[#F0F7FF]">
              <CardTitle className="text-base font-semibold text-[#005EB8]">{t('sections.contactInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <FieldInput
                label={t('fields.contactInfo')}
                name="contactInfo"
                placeholder={t('placeholders.contactInfo')}
                value={form.contactInfo}
                onChange={v => set('contactInfo', v)}
              />
            </CardContent>
          </Card>

          {/* 10. 文件上传 */}
          <Card>
            <CardHeader className="pb-3 border-b border-[#F0F7FF]">
              <CardTitle className="text-base font-semibold text-[#005EB8]">{t('sections.files')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {/* 拖拽 / 点击上传区域 */}
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#005EB8]/30 rounded-xl p-6 flex flex-col items-center
                  justify-center gap-2 cursor-pointer hover:border-[#005EB8]/60 hover:bg-[#F0F7FF]/50 transition"
              >
                <Upload className="w-8 h-8 text-[#005EB8]/60" />
                <p className="text-sm text-[#757575]">
                  {t('fileUpload.dragDrop')}{' '}
                  <span className="text-[#005EB8] font-medium">{t('fileUpload.browse')}</span>
                </p>
                <p className="text-xs text-[#BDBDBD]">{t('fileUpload.formats')}</p>
                <div className="flex gap-4 text-xs text-[#BDBDBD] mt-1">
                  <span>{t('fileUpload.limitFiles')}</span>
                  <span>·</span>
                  <span>{t('fileUpload.limitSize')}</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".doc,.docx,.xls,.xlsx,.pdf,.txt,.jpg,.jpeg,.png,.tif,.tiff"
                onChange={handleFileChange}
              />
              {fileError && (
                <p className="text-sm text-[#DA291C] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{fileError}
                </p>
              )}
              {/* 已选文件列表 */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#757575]">
                    {t('fileUpload.selectedFiles')} ({files.length}/{MAX_FILES})
                  </p>
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#F5F5F5] rounded-lg px-3 py-2">
                      <FileText className={`w-4 h-4 flex-shrink-0 ${fileColor(f.name)}`} />
                      <span className="flex-1 text-sm text-[#212121] truncate">{f.name}</span>
                      <span className="text-xs text-[#757575] flex-shrink-0">{fmtSize(f.size)}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="flex-shrink-0 p-0.5 rounded hover:bg-[#E0E0E0] transition text-[#757575]"
                        title={t('fileUpload.remove')}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 11. 补充说明 */}
          <Card>
            <CardHeader className="pb-3 border-b border-[#F0F7FF]">
              <CardTitle className="text-base font-semibold text-[#005EB8]">{t('sections.notes')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder={t('placeholders.notes')}
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E0E0E0] bg-white text-sm
                  text-[#212121] placeholder:text-[#BDBDBD] focus:outline-none resize-none
                  focus:ring-2 focus:ring-[#005EB8]/40 focus:border-[#005EB8] transition"
              />
            </CardContent>
          </Card>

          {/* 12. 知情同意 */}
          <div className="flex items-start gap-3 bg-[#F5F5F5] rounded-xl p-4">
            <input
              id="consent"
              type="checkbox"
              checked={consent}
              onChange={() => {
                // 如果未勾选，打开弹窗要求阅读并同意
                if (!consent) {
                  setShowPolicy(true)
                } else {
                  // 如果已勾选，可以取消
                  setConsent(false)
                  setSubmitError('')
                }
              }}
              className="mt-0.5 w-4 h-4 rounded border-[#BDBDBD] text-[#005EB8] cursor-pointer
                focus:ring-2 focus:ring-[#005EB8]/40 flex-shrink-0"
            />
            <label
              htmlFor="consent"
              className="text-sm text-[#757575] cursor-pointer leading-relaxed"
              onClick={(e) => {
                e.preventDefault()
                if (!consent) {
                  setShowPolicy(true)
                }
              }}
            >
              {t('consent.label')}{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowPolicy(true)
                }}
                className="text-[#005EB8] font-medium underline hover:text-[#0073D1]"
              >
                {t('consent.linkText')}
              </button>
            </label>
          </div>

          {/* 错误提示 */}
          {submitError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError}
            </div>
          )}

          {/* 提交 / 重置按钮 */}
          <div className="flex gap-4 pt-2 pb-8">
            <button
              type="button"
              onClick={handleReset}
              disabled={submitting}
              className="h-12 px-6 rounded-xl border-2 border-[#E0E0E0] text-[#757575] font-medium
                text-sm hover:border-[#BDBDBD] hover:bg-[#F5F5F5] transition disabled:opacity-50"
            >
              {t('buttons.reset')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#005EB8] to-[#0073D1] text-white
                font-bold text-lg shadow-lg hover:shadow-xl hover:opacity-95 transition
                disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('buttons.submitting')}
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  {t('buttons.submit')}
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* 数据使用说明弹窗 */}
      <AnimatePresence>
        {showPolicy && (
          <DataPolicyModal
            onClose={() => setShowPolicy(false)}
            onAgree={() => { setShowPolicy(false); setConsent(true) }}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* 成功弹窗 */}
      <AnimatePresence>
        {success && (
          <SuccessModal
            submissionId={success.submissionId}
            onClose={() => setSuccess(null)}
            onNew={handleNewSubmit}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* 重置确认弹窗 */}
      <AnimatePresence>
        {showResetConfirm && (
          <ResetConfirmModal
            onClose={() => setShowResetConfirm(false)}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
