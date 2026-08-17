import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function AboutPage() {
  const t = useTranslations('about')

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
          {/* 项目背景 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('background.title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-[#212121] leading-relaxed">
                {t('background.content')}
              </p>
            </CardContent>
          </Card>

          {/* 研究目标 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('objectives.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {['obj1', 'obj2', 'obj3', 'obj4'].map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-[#005EB8] text-white rounded-full flex items-center justify-center text-sm font-semibold mt-1">
                      ✓
                    </span>
                    <span className="text-[#212121] leading-relaxed">
                      {t(`objectives.${key}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 研究团队 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('team.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 机构 Logo */}
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center p-4">
                    <Image
                      src="/images/hospital-logo.png"
                      alt="Hospital"
                      width={120}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm font-medium text-[#212121]">
                    {t('team.hospital')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center p-4">
                    <Image
                      src="/images/university-logo.png"
                      alt="University"
                      width={120}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm font-medium text-[#212121]">
                    {t('team.university')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center p-4">
                    <Image
                      src="/images/lab-logo.png"
                      alt="Lab"
                      width={120}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm font-medium text-[#212121]">
                    {t('team.lab')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 适用范围 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('scope.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#F0F7FF] rounded-lg p-6">
                <p className="text-[#212121] leading-relaxed mb-4">
                  {t('scope.content')}
                </p>
                <div className="bg-white rounded-lg p-4 border-l-4 border-[#005EB8]">
                  <p className="text-sm text-[#757575]">
                    <strong className="text-[#005EB8]">{t('scope.note')}</strong>
                    {' '}{t('scope.noteContent')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
