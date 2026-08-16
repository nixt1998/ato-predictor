import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertTriangle, FileText, Stethoscope, BookOpen, Scale } from 'lucide-react'

export default function DisclaimerPage() {
  const t = useTranslations('disclaimer')

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9E6] to-white py-16">
      <div className="container mx-auto px-6">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <AlertTriangle className="w-16 h-16 text-[#ED8B00] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[#212121] mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-[#757575] max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* 重要提示 */}
          <Card className="border-2 border-[#ED8B00] bg-[#FFF9E6]">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <AlertTriangle className="w-8 h-8 text-[#ED8B00] flex-shrink-0" />
                <div>
                  <p className="text-lg font-semibold text-[#ED8B00] mb-2">
                    {t('important.title')}
                  </p>
                  <p className="text-[#212121] leading-relaxed">
                    {t('important.content')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 工具性质 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#005EB8]" />
                {t('nature.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#212121] leading-relaxed">
                {t('nature.content')}
              </p>
              <ul className="space-y-2 text-[#212121]">
                {['point1', 'point2', 'point3', 'point4'].map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="text-[#ED8B00] flex-shrink-0">•</span>
                    <span>{t(`nature.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 不适用场景 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-[#005EB8]" />
                {t('notForUse.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#212121] leading-relaxed mb-4">
                {t('notForUse.intro')}
              </p>
              <div className="grid gap-3">
                {['scenario1', 'scenario2', 'scenario3', 'scenario4'].map((key) => (
                  <div key={key} className="bg-[#FFF9E6] border-l-4 border-[#ED8B00] rounded-lg p-4">
                    <p className="text-[#212121]">{t(`notForUse.${key}`)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 数据准确性 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#005EB8]" />
                {t('accuracy.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#212121] leading-relaxed">
                {t('accuracy.content')}
              </p>
              <div className="bg-[#F0F7FF] rounded-lg p-4">
                <p className="text-sm text-[#757575]">
                  <strong className="text-[#005EB8]">{t('accuracy.note')}</strong>
                  {' '}{t('accuracy.noteContent')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 责任限制 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-6 h-6 text-[#005EB8]" />
                {t('liability.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#212121] leading-relaxed">
                {t('liability.intro')}
              </p>
              <ul className="space-y-2 text-[#212121]">
                {['limit1', 'limit2', 'limit3', 'limit4', 'limit5'].map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="text-[#DA291C] flex-shrink-0">✗</span>
                    <span>{t(`liability.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 专业建议 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('professional.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#212121] leading-relaxed mb-4">
                {t('professional.content')}
              </p>
              <div className="bg-gradient-to-r from-[#F0F7FF] to-white border-l-4 border-[#005EB8] rounded-lg p-6">
                <p className="font-semibold text-[#005EB8] mb-3">
                  {t('professional.recommendation')}
                </p>
                <ul className="space-y-2 text-sm text-[#212121]">
                  {['rec1', 'rec2', 'rec3'].map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="text-[#005EB8]">→</span>
                      <span>{t(`professional.${key}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 隐私与安全 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('privacy.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#212121] leading-relaxed">
                {t('privacy.content')}
              </p>
            </CardContent>
          </Card>

          {/* 知识产权 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('intellectual.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#212121] leading-relaxed">
                {t('intellectual.content')}
              </p>
            </CardContent>
          </Card>

          {/* 声明更新 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('updates.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#212121] leading-relaxed">
                {t('updates.content')}
              </p>
              <p className="text-sm text-[#757575] mt-4">
                <strong className="text-[#212121]">{t('updates.lastUpdated')}</strong>
                {' '}2026年8月16日
              </p>
            </CardContent>
          </Card>

          {/* 用户确认 */}
          <Card className="bg-[#F0F7FF] border-2 border-[#005EB8]">
            <CardContent className="pt-6">
              <p className="text-[#212121] leading-relaxed text-center">
                <strong className="text-[#005EB8] text-lg">{t('confirmation.title')}</strong>
              </p>
              <p className="text-[#757575] text-center mt-2">
                {t('confirmation.content')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
