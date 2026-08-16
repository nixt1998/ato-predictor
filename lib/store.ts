import { create } from 'zustand'
import { PredictionInput, PredictionResult, CalculationHistory } from '@/types/prediction'

interface AppState {
  // 语言
  locale: 'zh' | 'en'
  setLocale: (locale: 'zh' | 'en') => void

  // 计算输入
  input: PredictionInput | null
  setInput: (input: PredictionInput) => void

  // 计算结果
  result: PredictionResult | null
  setResult: (result: PredictionResult) => void

  // 计算状态
  isCalculating: boolean
  setIsCalculating: (isCalculating: boolean) => void

  // 计算历史
  history: CalculationHistory[]
  addHistory: (item: CalculationHistory) => void
  removeHistory: (id: string) => void
  clearHistory: () => void

  // 当前 Tab
  activeTab: 'input' | 'result' | 'analysis' | 'suggestion'
  setActiveTab: (tab: 'input' | 'result' | 'analysis' | 'suggestion') => void
}

export const useAppStore = create<AppState>((set) => ({
  // 语言
  locale: 'zh',
  setLocale: (locale) => set({ locale }),

  // 计算输入
  input: null,
  setInput: (input) => set({ input }),

  // 计算结果
  result: null,
  setResult: (result) => set({ result }),

  // 计算状态
  isCalculating: false,
  setIsCalculating: (isCalculating) => set({ isCalculating }),

  // 计算历史
  history: [],
  addHistory: (item) => set((state) => ({
    history: [item, ...state.history].slice(0, 10) // 只保留最近 10 条
  })),
  removeHistory: (id) => set((state) => ({
    history: state.history.filter(item => item.id !== id)
  })),
  clearHistory: () => set({ history: [] }),

  // 当前 Tab
  activeTab: 'input',
  setActiveTab: (activeTab) => set({ activeTab })
}))

// 从 LocalStorage 加载历史记录（客户端）
if (typeof window !== 'undefined') {
  const savedHistory = localStorage.getItem('calc_history')
  if (savedHistory) {
    try {
      const history = JSON.parse(savedHistory)
      useAppStore.setState({ history })
    } catch (e) {
      console.error('Failed to load history:', e)
    }
  }

  // 订阅历史变化，自动保存到 LocalStorage
  useAppStore.subscribe((state) => {
    localStorage.setItem('calc_history', JSON.stringify(state.history))
  })
}
