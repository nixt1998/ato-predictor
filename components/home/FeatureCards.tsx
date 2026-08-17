'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Info, Calculator, Upload } from 'lucide-react'

export default function FeatureCards() {
  const t = useTranslations('home')

  const features = [
    {
      key: 'intro',
      icon: Info,
      href: '/about',
      isPrimary: false,
    },
    {
      key: 'calc',
      icon: Calculator,
      href: '/predict',
      isPrimary: true,
    },
    {
      key: 'upload',
      icon: Upload,
      href: '/upload',
      isPrimary: false,
    },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon

            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={feature.href}>
                  {feature.isPrimary ? (
                    // 主要卡片 - 开始计算（更大、渐变背景、脉冲动画）
                    <motion.div
                      whileHover={{ scale: 1.05, y: -8 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative h-56 rounded-2xl overflow-hidden cursor-pointer group"
                    >
                      {/* 渐变背景 */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#005EB8] via-[#0073D1] to-[#41B6E6]" />

                      {/* 脉冲动画效果 */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.2, 0.5],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                      />

                      {/* 内容 */}
                      <div className="relative h-full flex flex-col items-center justify-center text-white p-8 text-center">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon className="w-16 h-16 mb-6 drop-shadow-lg" />
                        </motion.div>

                        <h3 className="text-2xl font-bold mb-3">
                          {t(`feature${feature.key.charAt(0).toUpperCase() + feature.key.slice(1)}`)}
                        </h3>

                        <p className="text-white/90 text-base">
                          {t(`feature${feature.key.charAt(0).toUpperCase() + feature.key.slice(1)}Desc`)}
                        </p>

                        {/* 箭头图标 */}
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="mt-4"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </motion.div>
                      </div>

                      {/* 悬停时的光晕效果 */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
                      </div>
                    </motion.div>
                  ) : (
                    // 普通卡片 - 高度与主卡片一致
                    <motion.div
                      whileHover={{ y: -6 }}
                      whileTap={{ scale: 0.98 }}
                      className="h-56 rounded-2xl border-2 border-[#E0E0E0] bg-white p-8 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-[#005EB8]/30"
                    >
                      <div className="flex flex-col items-center text-center h-full justify-center">
                        <Icon className="w-12 h-12 mb-4 text-[#005EB8]" />

                        <h3 className="text-xl font-semibold text-[#212121] mb-2">
                          {t(`feature${feature.key.charAt(0).toUpperCase() + feature.key.slice(1)}`)}
                        </h3>

                        <p className="text-sm text-[#757575]">
                          {t(`feature${feature.key.charAt(0).toUpperCase() + feature.key.slice(1)}Desc`)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
