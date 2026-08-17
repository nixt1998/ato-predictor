'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { AlertCircle, Info } from 'lucide-react'
import { PredictionInput as PredictionInputType } from '@/types/prediction'

// 表单验证 schema
const predictionSchema = z.object({
  iAs: z.number().min(0, 'Must be positive').max(10000, 'Value too large'),
  MMA: z.number().min(0, 'Must be positive').max(10000, 'Value too large'),
  DMA: z.number().min(0, 'Must be positive').max(10000, 'Value too large'),
  CT_drug: z.enum(['Yes', 'No']),
})

export default function PredictionInput() {
  const t = useTranslations('predict.input')
  const locale = useLocale()
  const { setInput, setResult, setActiveTab, setIsCalculating, isCalculating } = useAppStore()
  const [showDrugList, setShowDrugList] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PredictionInputType>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      iAs: 0,
      MMA: 0,
      DMA: 0,
      CT_drug: 'No',
    },
  })

  const onSubmit = async (data: PredictionInputType) => {
    setIsCalculating(true)
    setInput(data)

    try {
      // 调用 API 进行预测
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale }),
      })

      if (!response.ok) throw new Error('Prediction failed')

      const result = await response.json()
      setResult(result)
      setActiveTab('result')
    } catch (error) {
      console.error('Prediction error:', error)
      // TODO: 显示错误提示
    } finally {
      setIsCalculating(false)
    }
  }

  const ctDrugValue = watch('CT_drug')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('patientInfo')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 砷代谢指标 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#212121] flex items-center gap-2">
              <Info className="w-5 h-5 text-[#005EB8]" />
              Arsenic Metabolism Parameters
            </h3>

            {/* iAs */}
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">
                {t('iAs')}
              </label>
              <Input
                type="number"
                step="0.01"
                {...register('iAs', { valueAsNumber: true })}
                error={!!errors.iAs}
                placeholder="0.00"
              />
              {errors.iAs && (
                <p className="text-sm text-[#DA291C] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.iAs.message}
                </p>
              )}
            </div>

            {/* MMA */}
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">
                {t('MMA')}
              </label>
              <Input
                type="number"
                step="0.01"
                {...register('MMA', { valueAsNumber: true })}
                error={!!errors.MMA}
                placeholder="0.00"
              />
              {errors.MMA && (
                <p className="text-sm text-[#DA291C] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.MMA.message}
                </p>
              )}
            </div>

            {/* DMA */}
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">
                {t('DMA')}
              </label>
              <Input
                type="number"
                step="0.01"
                {...register('DMA', { valueAsNumber: true })}
                error={!!errors.DMA}
                placeholder="0.00"
              />
              {errors.DMA && (
                <p className="text-sm text-[#DA291C] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.DMA.message}
                </p>
              )}
            </div>
          </div>

          {/* 心毒性药物 */}
          <div className="space-y-4 pt-4 border-t border-[#E0E0E0]">
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-3">
                {t('ctDrug')}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="Yes"
                    {...register('CT_drug')}
                    className="w-4 h-4 text-[#005EB8] focus:ring-[#005EB8]"
                  />
                  <span className="text-[#212121]">{t('ctDrugYes')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="No"
                    {...register('CT_drug')}
                    className="w-4 h-4 text-[#005EB8] focus:ring-[#005EB8]"
                  />
                  <span className="text-[#212121]">{t('ctDrugNo')}</span>
                </label>
              </div>
            </div>

            {/* 药物列表提示 */}
            <div className="bg-[#F0F7FF] rounded-lg p-4">
              <button
                type="button"
                onClick={() => setShowDrugList(!showDrugList)}
                className="flex items-center gap-2 text-sm text-[#005EB8] font-medium hover:underline"
              >
                <Info className="w-4 h-4" />
                {t('viewFullList')}
              </button>

              {showDrugList && (
                <div className="mt-3 text-sm text-[#757575] space-y-2">
                  <p className="font-medium text-[#212121]">{t('drugListTitle')}</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>{t('drug1')}</li>
                    <li>{t('drug2')}</li>
                    <li>{t('drug3')}</li>
                    <li>{t('drug4')}</li>
                    <li>{t('drug5')}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="pt-6">
            <Button
              type="submit"
              size="lg"
              disabled={isCalculating}
              className="w-full"
            >
              {isCalculating ? t('calculating') : t('calculate')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
