'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { routing } from '@/routing'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    const currentPath = pathname.replace(`/${locale}`, '') || '/'
    router.push(`/${newLocale}${currentPath}`)
  }

  return (
    <div className="flex items-center space-x-1 rounded-lg border border-[#E0E0E0] p-1">
      {routing.locales.map((loc) => (
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
