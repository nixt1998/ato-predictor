import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Brain, BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function AlgorithmPage() {
  const t = useTranslations('algorithm')

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F7FF] to-white py-16">
      <div className="container mx-auto px-6">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#212121] mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-[#757575] max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* 模型概述 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-[#005EB8]" />
                {t('overview.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#212121] leading-relaxed">
                {t('overview.content')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-[#F0F7FF] rounded-lg p-4">
                  <p className="text-sm text-[#757575] mb-1">{t('overview.modelType')}</p>
                  <p className="text-lg font-semibold text-[#005EB8]">{t('overview.modelTypeValue')}</p>
                </div>
                <div className="bg-[#F0F7FF] rounded-lg p-4">
                  <p className="text-sm text-[#757575] mb-1">{t('overview.sampleSize')}</p>
                  <p className="text-lg font-semibold text-[#005EB8]">N = 500+</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 输入特征 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('features.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['feature1', 'feature2', 'feature3', 'feature4', 'feature5'].map((key) => (
                  <div key={key} className="flex items-start gap-3 p-3 bg-[#F5F5F5] rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-[#007F3B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#212121]">{t(`features.${key}.name`)}</p>
                      <p className="text-sm text-[#757575]">{t(`features.${key}.desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 性能指标 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-[#005EB8]" />
                {t('performance.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-[#F0F7FF] to-white rounded-lg">
                  <p className="text-3xl font-bold text-[#005EB8] mb-1">0.909</p>
                  <p className="text-sm text-[#757575]">{t('performance.auc')}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#F0F7FF] to-white rounded-lg">
                  <p className="text-3xl font-bold text-[#005EB8] mb-1">84.8%</p>
                  <p className="text-sm text-[#757575]">{t('performance.accuracy')}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#F0F7FF] to-white rounded-lg">
                  <p className="text-3xl font-bold text-[#005EB8] mb-1">78.7%</p>
                  <p className="text-sm text-[#757575]">{t('performance.sensitivity')}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#F0F7FF] to-white rounded-lg">
                  <p className="text-3xl font-bold text-[#005EB8] mb-1">93.3%</p>
                  <p className="text-sm text-[#757575]">{t('performance.specificity')}</p>
                </div>
              </div>

              <p className="text-sm text-[#757575] mt-4">
                {t('performance.note')}
              </p>
            </CardContent>
          </Card>

          {/* SHAP 解释 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('shap.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#212121] leading-relaxed">
                {t('shap.content')}
              </p>

              <div className="bg-[#F0F7FF] rounded-lg p-6">
                <p className="font-medium text-[#005EB8] mb-3">{t('shap.interpretation')}</p>
                <ul className="space-y-2 text-sm text-[#212121]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#DA291C] font-bold">+</span>
                    <span>{t('shap.positive')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#007F3B] font-bold">−</span>
                    <span>{t('shap.negative')}</span>
                  </li>
                </ul>
                <p className="text-sm text-[#757575] mt-4 bg-[#F5F5F5] rounded-lg p-3">
                  {t('shap.barPlotNote')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 局限性 */}
          <Card className="border-[#ED8B00] bg-[#FFF9E6]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-[#ED8B00]" />
                {t('limitations.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-[#212121]">
                {['limitation1', 'limitation2', 'limitation3'].map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="text-[#ED8B00]">•</span>
                    <span>{t(`limitations.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 参考文献 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('references.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-[#757575]">
                <li>
                  <span className="font-medium text-[#212121]">[1]</span> {t('references.ref1')}
                </li>
                <li>
                  <span className="font-medium text-[#212121]">[2]</span> {t('references.ref2')}
                </li>
                <li>
                  <span className="font-medium text-[#212121]">[3]</span> {t('references.ref3')}
                </li>
                <li>
                  <span className="font-medium text-[#212121]">[4]</span> {t('references.ref4')}
                </li>
                <li>
                  <span className="font-medium text-[#212121]">[5]</span> {t('references.ref5')}
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
