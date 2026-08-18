'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

export default function Footer() {
  const t = useTranslations()
  const locale = useLocale()

  const quickLinks = [
    { key: 'about', originalHref: '/about' },
    { key: 'algorithm', originalHref: '/algorithm' },
    { key: 'contact', originalHref: '/contact' },
  ]

  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="container mx-auto px-6 py-12">
        {/* 主要内容区 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 左侧：Logo + 简介 */}
          <div className="space-y-4">
            <Image
              src="/images/logo-white.png"
              alt={t('common.appName')}
              width={200}
              height={80}
              className="h-12 w-auto opacity-90"
            />
            <p className="text-[#BDBDBD] text-sm leading-relaxed max-w-md">
              {t('footer.description')}
            </p>
          </div>

          {/* 右侧：快速链接 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#41B6E6]">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={`/${locale}${link.originalHref}`}
                    className="text-[#BDBDBD] hover:text-[#41B6E6] transition-colors text-sm"
                  >
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 机构 Logo 展示区 */}
        <div className="border-t border-[#333333] pt-8 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Image
              src="/images/hospital-logo.png"
              alt="Hospital Logo"
              width={150}
              height={60}
              className="h-12 w-auto hover:opacity-80 transition-opacity"
            />
            <Image
              src="/images/university-logo.png"
              alt="University Logo"
              width={150}
              height={60}
              className="h-12 w-auto hover:opacity-80 transition-opacity"
            />
            <Image
              src="/images/lab-logo.png"
              alt="Lab Logo"
              width={150}
              height={60}
              className="h-12 w-auto hover:opacity-80 transition-opacity"
            />
          </div>
        </div>

        {/* 底部：Copyright + 备案信息 */}
        <div className="border-t border-[#333333] pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#757575]">
            {/* Copyright */}
            <p>{t('footer.copyright')}</p>

            {/* 备案信息 */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* ICP 备案 */}
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#41B6E6] transition-colors"
              >
                {t('footer.icpBeian')}
              </a>

              {/* 公安备案（带图标）*/}
              <a
                href="http://www.beian.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#41B6E6] transition-colors"
              >
                <Image
                  src="/images/beian-icon.png"
                  alt="公安备案"
                  width={16}
                  height={16}
                  className="w-4 h-auto opacity-80"
                />
                <span>{t('footer.policeBeian')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
