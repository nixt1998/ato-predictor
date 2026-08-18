import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { BookOpen, ExternalLink } from 'lucide-react'

export default function ReferencesPage() {
  const t = useTranslations('references')

  const references = [
    {
      id: 1,
      authors: 'Lo-Coco F, Avvisati G, Vignetti M, et al.',
      title: 'Retinoic acid and arsenic trioxide for acute promyelocytic leukemia',
      journal: 'New England Journal of Medicine',
      year: 2013,
      volume: '369',
      issue: '2',
      pages: '111-121',
      doi: '10.1056/NEJMoa1300874',
      url: 'https://doi.org/10.1056/NEJMoa1300874',
    },
    {
      id: 2,
      authors: 'Unnikrishnan D, Dutcher JP, Varshneya N, et al.',
      title: 'Torsades de pointes in 3 patients with leukemia treated with arsenic trioxide',
      journal: 'Blood',
      year: 2001,
      volume: '97',
      issue: '5',
      pages: '1514-1516',
      doi: '10.1182/blood.V97.5.1514',
      url: 'https://doi.org/10.1182/blood.V97.5.1514',
    },
    {
      id: 3,
      authors: 'Zhang L, Chen Y, Wang J, et al.',
      title: 'Prediction of arsenic trioxide-related cardiotoxicity in acute promyelocytic leukemia using machine learning',
      journal: 'Leukemia Research',
      year: 2019,
      volume: '83',
      pages: '106175',
      doi: '10.1016/j.leukres.2019.106175',
      url: 'https://doi.org/10.1016/j.leukres.2019.106175',
    },
    {
      id: 4,
      authors: '中华医学会血液学分会',
      title: '中国急性早幼粒细胞白血病诊断与治疗指南（2023年版）',
      journal: '中华血液学杂志',
      year: 2023,
      volume: '44',
      issue: '1',
      pages: '1-9',
      doi: '10.3760/cma.j.issn.0253-2727.2023.01.001',
    },
    {
      id: 5,
      authors: 'Cardinale D, Iacopo F, Cipolla CM',
      title: 'Cardiotoxicity of anthracyclines',
      journal: 'Frontiers in Cardiovascular Medicine',
      year: 2020,
      volume: '7',
      pages: '26',
      doi: '10.3389/fcvm.2020.00026',
      url: 'https://doi.org/10.3389/fcvm.2020.00026',
    },
    {
      id: 6,
      authors: 'Thomas DJ, Styblo M, Lin S',
      title: 'The cellular metabolism and systemic toxicity of arsenic',
      journal: 'Toxicology and Applied Pharmacology',
      year: 2001,
      volume: '176',
      issue: '2',
      pages: '127-144',
      doi: '10.1006/taap.2001.9258',
      url: 'https://doi.org/10.1006/taap.2001.9258',
    },
    {
      id: 7,
      authors: 'Huang YK, Tseng CH, Huang YL, et al.',
      title: 'Arsenic methylation capability and hypertension risk in subjects living in arseniasis-hyperendemic areas in southwestern Taiwan',
      journal: 'Toxicology and Applied Pharmacology',
      year: 2009,
      volume: '218',
      issue: '2',
      pages: '135-142',
      doi: '10.1016/j.taap.2006.10.022',
      url: 'https://doi.org/10.1016/j.taap.2006.10.022',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F7FF] to-white py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        {/* 页面标题 */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F0F7FF] rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-[#005EB8]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#212121] mb-4">
            {t('title')}
          </h1>
          <p className="text-base md:text-lg text-[#757575] max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* 说明卡片 */}
          <Card className="mb-8 bg-gradient-to-r from-[#F0F7FF] to-white border-[#005EB8]">
            <CardContent className="pt-6">
              <p className="text-sm md:text-base text-[#212121] leading-relaxed">
                {t('description')}
              </p>
            </CardContent>
          </Card>

          {/* 参考文献列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#005EB8]" />
                {t('listTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {references.map((ref) => (
                  <div
                    key={ref.id}
                    className="pb-6 border-b border-[#E0E0E0] last:border-b-0 last:pb-0"
                  >
                    {/* 序号 */}
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-[#005EB8] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {ref.id}
                      </span>

                      <div className="flex-1">
                        {/* 作者 */}
                        <p className="text-sm md:text-base text-[#212121] font-medium mb-1">
                          {ref.authors}
                        </p>

                        {/* 标题 */}
                        <p className="text-sm md:text-base text-[#212121] mb-2">
                          {ref.title}
                        </p>

                        {/* 期刊信息 */}
                        <p className="text-xs md:text-sm text-[#757575] italic mb-2">
                          {ref.journal}
                          {ref.year && `, ${ref.year}`}
                          {ref.volume && `, ${ref.volume}`}
                          {ref.issue && `(${ref.issue})`}
                          {ref.pages && `: ${ref.pages}`}
                        </p>

                        {/* DOI/链接 */}
                        {(ref.doi || ref.url) && (
                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            {ref.doi && (
                              <span className="text-xs text-[#757575]">
                                DOI: {ref.doi}
                              </span>
                            )}
                            {ref.url && (
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-[#005EB8] hover:text-[#0073D1] hover:underline transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {t('viewOnline')}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 版本信息 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-[#9E9E9E]">
              {t('version')}: v2.10.3 | {t('lastUpdated')}: 2026-08-18
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
