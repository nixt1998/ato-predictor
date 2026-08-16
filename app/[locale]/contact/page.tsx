import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Mail, Phone, MapPin, Clock, MessageSquare, HelpCircle } from 'lucide-react'

export default function ContactPage() {
  const t = useTranslations('contact')

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F7FF] to-white py-16">
      <div className="container mx-auto px-6">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <MessageSquare className="w-16 h-16 text-[#005EB8] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[#212121] mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-[#757575] max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 联系信息 */}
            <div className="space-y-6">
              {/* 邮箱 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#F0F7FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-[#005EB8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#212121] mb-1">
                        {t('email.title')}
                      </h3>
                      <p className="text-[#757575] text-sm mb-2">
                        {t('email.desc')}
                      </p>
                      <a
                        href="mailto:contact@example.com"
                        className="text-[#005EB8] hover:underline font-medium"
                      >
                        contact@example.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 电话 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#F0F7FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-[#005EB8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#212121] mb-1">
                        {t('phone.title')}
                      </h3>
                      <p className="text-[#757575] text-sm mb-2">
                        {t('phone.desc')}
                      </p>
                      <p className="text-[#005EB8] font-medium">
                        [占位符: 联系电话]
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 地址 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#F0F7FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[#005EB8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#212121] mb-1">
                        {t('address.title')}
                      </h3>
                      <p className="text-[#757575] text-sm mb-2">
                        {t('address.desc')}
                      </p>
                      <p className="text-[#212121]">
                        {t('address.content')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 工作时间 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#F0F7FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-[#005EB8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#212121] mb-1">
                        {t('hours.title')}
                      </h3>
                      <p className="text-[#757575] text-sm mb-2">
                        {t('hours.desc')}
                      </p>
                      <div className="text-[#212121] text-sm space-y-1">
                        <p>{t('hours.weekday')}: 9:00 - 17:00</p>
                        <p>{t('hours.weekend')}: {t('hours.closed')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 常见问题 */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-[#005EB8]" />
                    {t('faq.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* FAQ 1 */}
                  <div className="border-l-4 border-[#005EB8] pl-4">
                    <h4 className="font-semibold text-[#212121] mb-2">
                      {t('faq.q1.question')}
                    </h4>
                    <p className="text-sm text-[#757575]">
                      {t('faq.q1.answer')}
                    </p>
                  </div>

                  {/* FAQ 2 */}
                  <div className="border-l-4 border-[#005EB8] pl-4">
                    <h4 className="font-semibold text-[#212121] mb-2">
                      {t('faq.q2.question')}
                    </h4>
                    <p className="text-sm text-[#757575]">
                      {t('faq.q2.answer')}
                    </p>
                  </div>

                  {/* FAQ 3 */}
                  <div className="border-l-4 border-[#005EB8] pl-4">
                    <h4 className="font-semibold text-[#212121] mb-2">
                      {t('faq.q3.question')}
                    </h4>
                    <p className="text-sm text-[#757575]">
                      {t('faq.q3.answer')}
                    </p>
                  </div>

                  {/* FAQ 4 */}
                  <div className="border-l-4 border-[#005EB8] pl-4">
                    <h4 className="font-semibold text-[#212121] mb-2">
                      {t('faq.q4.question')}
                    </h4>
                    <p className="text-sm text-[#757575]">
                      {t('faq.q4.answer')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 反馈建议 */}
              <Card className="mt-6 bg-[#F0F7FF]">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-[#005EB8] mb-2">
                    {t('feedback.title')}
                  </h3>
                  <p className="text-sm text-[#757575]">
                    {t('feedback.content')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
