import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="container mx-auto px-6 py-16">
      {/* Hero 区域 */}
      <div className="text-center space-y-6 py-20">
        <h1 className="text-5xl md:text-6xl font-bold text-[#212121] leading-tight">
          {t('welcome')}
          <br />
          {t('welcomeLine2')}
        </h1>
        <p className="text-lg text-[#757575] max-w-3xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* 占位符内容 */}
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <div className="bg-[#F5F5F5] rounded-xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-[#212121] mb-4">
            布局组件测试页面
          </h2>
          <p className="text-[#757575]">
            Header 和 Footer 已成功集成。接下来将开发首页的完整内容。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">ℹ️</div>
            <h3 className="text-lg font-semibold text-[#212121] mb-2">
              {t('featureIntro')}
            </h3>
            <p className="text-sm text-[#757575]">
              {t('featureIntroDesc')}
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#005EB8] to-[#0073D1] rounded-xl p-6 text-center hover:shadow-xl transition-all hover:scale-105">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t('featureCalc')}
            </h3>
            <p className="text-sm text-white/90">
              {t('featureCalcDesc')}
            </p>
          </div>

          <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">📤</div>
            <h3 className="text-lg font-semibold text-[#212121] mb-2">
              {t('featureUpload')}
            </h3>
            <p className="text-sm text-[#757575]">
              {t('featureUploadDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
