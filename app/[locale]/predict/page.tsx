'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import PredictionInput from '@/components/predict/PredictionInput'
import PredictionResult from '@/components/predict/PredictionResult'
import PredictionAnalysis from '@/components/predict/PredictionAnalysis'
import PredictionSuggestions from '@/components/predict/PredictionSuggestions'
import { useAppStore } from '@/lib/store'

export default function PredictPage() {
  const t = useTranslations('predict')
  const { activeTab, setActiveTab, result } = useAppStore()

  const tabs = [
    { id: 'input', label: t('tabs.input'), disabled: false },
    { id: 'result', label: t('tabs.result'), disabled: !result },
    { id: 'analysis', label: t('tabs.analysis'), disabled: !result },
    { id: 'suggestion', label: t('tabs.suggestion'), disabled: !result },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F7FF] to-white py-12">
      <div className="container mx-auto px-6">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#212121] mb-2">
            {t('title')}
          </h1>
          <p className="text-[#757575]">
            {t('subtitle') || 'Enter patient information to calculate cardiotoxicity risk'}
          </p>
        </div>

        {/* Tab 导航 */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2 shadow-md">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`
                  flex-1 min-w-[120px] py-3 px-4 rounded-lg font-medium transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#005EB8] to-[#0073D1] text-white shadow-lg'
                      : tab.disabled
                      ? 'bg-[#F5F5F5] text-[#BDBDBD] cursor-not-allowed'
                      : 'bg-transparent text-[#757575] hover:bg-[#F5F5F5] hover:text-[#212121]'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 内容 */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'input' && <PredictionInput />}
          {activeTab === 'result' && result && <PredictionResult />}
          {activeTab === 'analysis' && result && <PredictionAnalysis />}
          {activeTab === 'suggestion' && result && <PredictionSuggestions />}
        </div>
      </div>
    </div>
  )
}
