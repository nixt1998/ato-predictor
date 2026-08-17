'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Hero() {
  const t = useTranslations('home')

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F0F7FF] to-white -z-10" />
      <div className="container mx-auto px-6">
        <div className="text-center space-y-6 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            <span className="text-[#212121]">{t('welcome')} </span>
            <span className="text-[#005EB8]">{t('welcomeHighlight')}</span>
          </h1>
          <p className="text-lg md:text-xl text-[#757575] max-w-4xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          <div className="pt-8">
            <Link
              href="/predict"
              className="inline-flex items-center justify-center h-14 px-8 text-lg font-semibold bg-gradient-to-r from-[#005EB8] to-[#0073D1] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
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
