'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

export default function Team() {
  const t = useTranslations('home')
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          {/* 标题 */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-[#212121] text-center mb-12"
          >
            {t('teamTitle')}
          </motion.h2>

          {/* 负责人卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-white to-[#F5F5F5] rounded-2xl p-8 md:p-10 shadow-xl border border-[#E0E0E0] mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
              {/* 左侧：头像 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex justify-center md:justify-start"
              >
                <div className="relative w-48 h-48 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/images/placeholder-avatar.jpg"
                    alt={t('teamLeaderName')}
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>

              {/* 右侧：信息 */}
              <div className="flex flex-col justify-center space-y-4">
                {/* 姓名和职称 */}
                <div>
                  <h3 className="text-2xl font-bold text-[#212121] mb-2">
                    {t('teamLeaderName')}
                  </h3>
                  <p className="text-lg text-[#005EB8] font-medium mb-1">
                    {t('teamLeaderTitle')}
                  </p>
                  <p className="text-base text-[#757575]">
                    {t('teamLeaderAffiliation')}
                  </p>
                </div>

                {/* 分割线 */}
                <div className="border-t border-[#E0E0E0] my-2" />

                {/* 个人简介 */}
                <p className="text-[#212121] leading-relaxed">
                  {t('teamLeaderBio')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* 团队合照 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative w-full h-[300px] rounded-2xl overflow-hidden shadow-xl"
          >
            <Image
              src="/images/placeholder-team.jpg"
              alt="Team Photo"
              fill
              className="object-cover"
            />

            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {/* 文字叠加 */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-lg font-semibold drop-shadow-lg">
                {t('teamLeaderAffiliation')} 研究团队
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
