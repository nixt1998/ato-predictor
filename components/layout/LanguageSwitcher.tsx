'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { locales } from '@/i18n'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    // 获取当前路径，去掉语言前缀
    const currentPath = pathname.replace(`/${locale}`, '')
    // 跳转到新语言的路径
    router.push(`/${newLocale}${currentPath}`)
  }

  return (
    <div className="flex items-center space-x-1 rounded-lg border border-[#E0E0E0] p-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
            ${
              locale === loc
                ? 'bg-[#005EB8] text-white shadow-sm'
                : 'text-[#757575] hover:text-[#212121] hover:bg-[#F5F5F5]'
            }
          `}
        >
          {loc === 'zh' ? '中' : 'EN'}
        </button>
      ))}
    </div>
  )
}
