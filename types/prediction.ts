/**
 * 预测输入参数
 */
export interface PredictionInput {
  iAs: number;      // 无机砷 (ng/mL)
  MMA: number;      // 一甲基砷酸 (ng/mL)
  DMA: number;      // 二甲基砷酸 (ng/mL)
  CT_drug: 'Yes' | 'No';  // 合并心毒性药物
}

/**
 * 砷代谢参数
 */
export interface MetabolismParams {
  tAs: number;      // 总砷 = iAs + MMA + DMA
  PMI: number;      // 一级甲基化指数 = MMA / iAs
  SMI: number;      // 二级甲基化指数 = DMA / MMA
  iAs_pct: number;  // 无机砷百分比 = (iAs / tAs) * 100
  MMA_pct: number;  // MMA 百分比
  DMA_pct: number;  // DMA 百分比
}

/**
 * SHAP 值
 */
export interface ShapValues {
  tAs: number;
  SMI: number;
  MMA_per: number;
  DMA_per: number;
  CT_drug: number;
}

/**
 * 预测结果
 */
export interface PredictionResult {
  prediction: {
    class: 'No' | 'Yes';
    probability: number;
    risk_level: 'low' | 'medium' | 'high';
  };
  metabolism: MetabolismParams;
  shap_values: ShapValues;
  major_risk_factor: string;
  suggestions: Suggestion[];
  timestamp: string;
}

/**
 * 建议（含语言无关的 key，供前端翻译用）
 */
export interface Suggestion {
  risk_factor: string;
  suggestion: string;
  key?: string;           // 可选：语言无关的键名，供前端按当前语言重新渲染
  ct_drug?: boolean;      // 是否因 CT_drug 触发
  risk_level?: string;    // 触发此建议的风险等级
}


/**
 * 计算历史记录
 */
export interface CalculationHistory {
  id: string;
  timestamp: string;
  input: PredictionInput;
  result: PredictionResult;
}
