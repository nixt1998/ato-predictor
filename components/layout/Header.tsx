import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const t = useTranslations()

  const navItems = [
    { key: 'home', href: '/' },
    { key: 'about', href: '/about' },
    { key: 'algorithm', href: '/algorithm' },
    { key: 'privacy', href: '/privacy' },
    { key: 'disclaimer', href: '/disclaimer' },
    { key: 'contact', href: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E0E0E0] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
          <Image
            src="/images/logo.svg"
            alt={t('common.appName')}
            width={200}
            height={80}
            className="h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-lg font-bold text-[#212121] transition-colors hover:text-[#005EB8]"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        {/* Language Switcher */}
        <div className="flex items-center">
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-[#F5F5F5]"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-[#212121]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}
