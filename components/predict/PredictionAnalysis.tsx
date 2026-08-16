'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAppStore } from '@/lib/store'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

export default function PredictionAnalysis() {
  const t = useTranslations('predict.analysis')
  const { result } = useAppStore()

  if (!result) return null

  const { shap_values, metabolism } = result

  // SHAP 值数据
  const shapData = [
    { name: t('riskFactor.tAs'), value: Math.abs(shap_values.tAs), raw: shap_values.tAs },
    { name: t('riskFactor.SMI'), value: Math.abs(shap_values.SMI), raw: shap_values.SMI },
    { name: t('riskFactor.MMA_per'), value: Math.abs(shap_values.MMA_per), raw: shap_values.MMA_per },
    { name: t('riskFactor.DMA_per'), value: Math.abs(shap_values.DMA_per), raw: shap_values.DMA_per },
    { name: t('riskFactor.CT_drug'), value: Math.abs(shap_values.CT_drug), raw: shap_values.CT_drug },
  ].sort((a, b) => b.value - a.value)

  // 砷代谢分布数据
  const metabolismData = [
    { name: 'iAs', value: metabolism.iAs_pct },
    { name: 'MMA', value: metabolism.MMA_pct },
    { name: 'DMA', value: metabolism.DMA_pct },
  ]

  // 颜色定义
  const colors = {
    positive: '#DA291C',
    negative: '#007F3B',
    neutral: '#757575',
  }

  return (
    <div className="space-y-6">
      {/* SHAP 值分析 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('shapTitle')}</CardTitle>
            <p className="text-sm text-[#757575] mt-2">
              {t('shapDescription')}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis type="number" stroke="#757575" />
                <YAxis type="category" dataKey="name" stroke="#757575" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${props.payload.raw > 0 ? '+' : ''}${props.payload.raw.toFixed(3)}`,
                    'SHAP Value'
                  ]}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {shapData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.raw > 0 ? colors.positive : colors.negative}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* 图例说明 */}
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.positive }} />
                <span className="text-[#757575]">{t('increasesRisk')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.negative }} />
                <span className="text-[#757575]">{t('decreasesRisk')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 砷代谢分布 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('metabolismDistribution')}</CardTitle>
            <p className="text-sm text-[#757575] mt-2">
              {t('metabolismDescription')}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metabolismData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="name" stroke="#757575" />
                <YAxis stroke="#757575" label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Percentage']}
                />
                <Bar dataKey="value" fill="#005EB8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* 正常范围参考 */}
            <div className="mt-4 bg-[#F0F7FF] rounded-lg p-4">
              <p className="text-sm font-medium text-[#005EB8] mb-2">
                {t('referenceRanges')}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm text-[#757575]">
                <div>
                  <span className="font-medium text-[#212121]">iAs:</span> 10-30%
                </div>
                <div>
                  <span className="font-medium text-[#212121]">MMA:</span> 10-20%
                </div>
                <div>
                  <span className="font-medium text-[#212121]">DMA:</span> 60-80%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
