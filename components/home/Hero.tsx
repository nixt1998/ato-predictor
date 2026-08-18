'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Hero() {
  const t = useTranslations('home')

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F0F7FF] to-white -z-10" />
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center space-y-4 md:space-y-6 max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="text-[#212121]">{t('welcome')} </span>
            <span className="text-[#005EB8]">{t('welcomeHighlight')}</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#757575] max-w-4xl mx-auto leading-relaxed px-4">
            {t('subtitle')}
          </p>
          <div className="pt-4 md:pt-8">
            <Link
              href="/predict"
              className="inline-flex items-center justify-center h-12 md:h-14 px-6 md:px-8 text-base md:text-lg font-semibold bg-gradient-to-r from-[#005EB8] to-[#0073D1] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {t('startPrediction')}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
