'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const t = useTranslations()
  const locale = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { key: 'home', originalHref: '' },
    { key: 'history', originalHref: '/history' },
    { key: 'about', originalHref: '/about' },
    { key: 'algorithm', originalHref: '/algorithm' },
    { key: 'references', originalHref: '/references' },
    { key: 'privacy', originalHref: '/privacy' },
    { key: 'disclaimer', originalHref: '/disclaimer' },
    { key: 'contact', originalHref: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E0E0E0] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center space-x-3 transition-opacity hover:opacity-80">
          <Image
            src="/images/logo.png"
            alt={t('common.appName')}
            width={200}
            height={80}
            className="h-10 md:h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.originalHref}`}
              className="text-lg font-bold text-[#212121] transition-colors hover:text-[#005EB8]"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        {/* Desktop Language Switcher */}
        <div className="hidden lg:flex items-center">
          <LanguageSwitcher />
        </div>

        {/* Mobile: Language Switcher + Menu Button */}
        <div className="lg:hidden flex items-center gap-3">
          {/* 语言切换器（始终可见）*/}
          <LanguageSwitcher />

          {/* 汉堡菜单按钮 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-[#F5F5F5] transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-[#212121]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-[#E0E0E0] bg-white"
          >
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={`/${locale}${item.originalHref}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-[#212121] hover:bg-[#F0F7FF] hover:text-[#005EB8] rounded-lg transition-colors"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
