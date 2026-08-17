'use client'

import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { Download, Printer, AlertCircle, CheckCircle, Info } from 'lucide-react'

// 语言字典：key -> [risk_factor, suggestion]
const SUGGESTION_DICT: Record<string, Record<string, [string, string]>> = {
  zh: {
    high_tAs:    ['总砷浓度偏高',       '建议适当调整砷剂给药剂量或延长治疗间隔以降低体内砷总暴露量，同时加强肾功能监测。'],
    low_SMI:     ['二级甲基化能力低下', '检测到砷甲基化能力下降，建议适量补充叶酸、维生素B12等甲基供体，并监测同型半胱氨酸水平。'],
    high_MMA:    ['一甲基砷酸百分比升高','心血管风险增高，建议增加心脏监测频率：每周心电图、每月超声心动图及心脏标志物检测（肌钙蛋白、BNP）。'],
    mod_MMA:     ['一甲基砷酸百分比偏高','建议密切监测心功能，每两周进行心电图检查，每月检测心脏生物标志物。'],
    ct_drug:     ['合并使用心毒性药物', '需仔细权衡合并用药的风险/获益比，必要时考虑替代治疗方案，或实施加强型心脏监测方案。'],
    risk_high:   ['综合评估：高风险',   '建议立即进行心脏科会诊，评估是否需要调整砷剂剂量或暂停治疗，并实施每日症状评估的强化监测方案。'],
    risk_medium: ['综合评估：中等风险', '建议加强监测：每周临床评估，每两周心脏专项评估，并向患者充分说明需要报告的心脏相关症状。'],
    risk_low:    ['综合评估：低风险',   '继续执行常规监测方案，按治疗计划定期随访，进行标准化心脏功能评估。'],
  },
  en: {
    high_tAs:    ['High Total Arsenic',                   'Consider adjusting ATO dosage or extending treatment intervals to reduce total arsenic exposure; monitor renal function regularly.'],
    low_SMI:     ['Low Secondary Methylation Index (SMI)','Low methylation capacity detected; consider methyl donor supplementation (folate, vitamin B12) and monitor homocysteine levels.'],
    high_MMA:    ['Elevated MMA%',                        'Elevated cardiovascular risk; enhance cardiac monitoring: weekly ECG, monthly echocardiography and cardiac biomarkers (troponin, BNP).'],
    mod_MMA:     ['Moderately Elevated MMA%',             'Monitor cardiac function closely; consider bi-weekly ECG and monthly cardiac biomarker assessment.'],
    ct_drug:     ['Concurrent Cardiotoxic Drug',          'Carefully evaluate the benefit-risk ratio of concomitant cardiotoxic medication; consider alternative therapies or an intensive cardiac surveillance protocol.'],
    risk_high:   ['High Risk',                            'Immediate cardiology consultation is recommended; evaluate the need for dose reduction or treatment interruption and implement an intensive daily symptom-monitoring protocol.'],
    risk_medium: ['Medium Risk',                          'Enhanced monitoring is recommended: weekly clinical assessment, bi-weekly cardiac evaluation; educate the patient on cardiac symptoms that should prompt immediate reporting.'],
    risk_low:    ['Low Risk',                             'Continue routine monitoring; maintain regular follow-up appointments and standard cardiac function assessments as per the treatment protocol.'],
  },
}

export default function PredictionSuggestions() {
  const t = useTranslations('predict.suggestions')
  const locale = useLocale()
  const { result } = useAppStore()

  if (!result) return null

  const { suggestions, prediction } = result
  const riskLevel = prediction.risk_level

  const dict = SUGGESTION_DICT[locale] ?? SUGGESTION_DICT['zh']

  // 根据当前语言重新翻译建议（忽略 store 中存储时的语言）
  const localizedSuggestions = suggestions.map((s) => {
    const key = (s as any).key as string | undefined
    if (key && dict[key]) {
      return { risk_factor: dict[key][0], suggestion: dict[key][1] }
    }
    // 无 key（旧数据）直接使用原文
    return s
  })

  const RiskIcon =
    riskLevel === 'high' ? AlertCircle :
    riskLevel === 'medium' ? Info :
    CheckCircle

  const handleDownloadPDF = () => {
    console.log('Download PDF')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* 建议列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiskIcon className="w-6 h-6 text-[#005EB8]" />
              {t('clinicalSuggestions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {localizedSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gradient-to-r from-[#F0F7FF] to-white rounded-lg p-4 border-l-4 border-[#005EB8]"
                >
                  <div className="mb-2">
                    <span className="inline-block bg-[#005EB8] text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {suggestion.risk_factor}
                    </span>
                  </div>
                  <p className="text-[#212121] leading-relaxed">
                    {suggestion.suggestion}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 免责声明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="bg-[#FFF9E6] border-[#ED8B00]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#ED8B00]" />
              <div className="space-y-2 text-sm text-[#757575]">
                <p className="font-semibold text-[#ED8B00]">
                  {t('disclaimer.title')}
                </p>
                <p>
                  {t('disclaimer.content')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 操作按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleDownloadPDF}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                <Download className="w-5 h-5 mr-2" />
                {t('downloadReport')}
              </Button>
              <Button
                onClick={handlePrint}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                <Printer className="w-5 h-5 mr-2" />
                {t('printReport')}
              </Button>
            </div>
            <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
              <p className="text-sm text-[#757575] text-center">
                {t('reportInfo')}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
