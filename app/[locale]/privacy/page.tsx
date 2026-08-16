import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Shield, Lock, Eye, Database, UserCheck } from 'lucide-react'

export default function PrivacyPage() {
  const t = useTranslations('privacy')

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F7FF] to-white py-16">
      <div className="container mx-auto px-6">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-[#005EB8] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[#212121] mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-[#757575] max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* 数据收集 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-6 h-6 text-[#005EB8]" />
                {t('collection.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#212121] leading-relaxed">
                {t('collection.intro')}
              </p>
              <ul className="space-y-2 text-[#212121]">
                {['item1', 'item2', 'item3', 'item4'].map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="text-[#005EB8] flex-shrink-0">•</span>
                    <span>{t(`collection.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 数据使用 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-6 h-6 text-[#005EB8]" />
                {t('usage.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#212121] leading-relaxed">
                {t('usage.intro')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['purpose1', 'purpose2', 'purpose3', 'purpose4'].map((key) => (
                  <div key={key} className="bg-[#F0F7FF] rounded-lg p-4">
                    <p className="text-[#212121] font-medium">{t(`usage.${key}`)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 数据安全 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-6 h-6 text-[#005EB8]" />
                {t('security.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#212121] leading-relaxed">
                {t('security.intro')}
              </p>
              <div className="bg-gradient-to-r from-[#F0F7FF] to-white border-l-4 border-[#005EB8] rounded-lg p-6">
                <ul className="space-y-3 text-[#212121]">
                  {['measure1', 'measure2', 'measure3', 'measure4'].map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-[#005EB8] flex-shrink-0 mt-0.5" />
                      <span>{t(`security.${key}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 数据共享 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-[#005EB8]" />
                {t('sharing.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#212121] leading-relaxed">
                {t('sharing.content')}
              </p>
              <div className="bg-[#FFF9E6] border border-[#ED8B00] rounded-lg p-4">
                <p className="text-sm text-[#757575]">
                  <strong className="text-[#ED8B00]">{t('sharing.note')}</strong>
                  {' '}{t('sharing.noteContent')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 用户权利 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rights.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#212121] leading-relaxed mb-4">
                {t('rights.intro')}
              </p>
              <ul className="space-y-2 text-[#212121]">
                {['right1', 'right2', 'right3', 'right4'].map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="text-[#007F3B] font-bold flex-shrink-0">✓</span>
                    <span>{t(`rights.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>{t('cookies.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[#212121] leading-relaxed">
                {t('cookies.content')}
              </p>
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p className="text-sm text-[#757575]">
                  {t('cookies.manage')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 更新通知 */}
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

          {/* 联系方式 */}
          <Card className="bg-[#F0F7FF]">
            <CardHeader>
              <CardTitle>{t('contact.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#212121] leading-relaxed">
                {t('contact.content')}
              </p>
              <div className="mt-4 space-y-2 text-sm text-[#757575]">
                <p><strong className="text-[#212121]">{t('contact.email')}</strong> privacy@example.com</p>
                <p><strong className="text-[#212121]">{t('contact.phone')}</strong> [占位符: 联系电话]</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
