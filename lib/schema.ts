import { z } from "zod";

export const ScoreBreakdownSchema = z.object({
  年資與穩定性: z.number().min(0).max(100),
  成果量化: z.number().min(0).max(100),
  結構與ATS: z.number().min(0).max(100),
  關鍵字覆蓋: z.number().min(0).max(100),
  細節完整性: z.number().min(0).max(100),
});

export const StarRewriteSchema = z.object({
  // 引用原文中哪段經歷（職稱 + 年份）
  source: z.string(),
  // 原始文字（直接引用）
  original: z.string(),
  // 改寫後示範（相同職責層級，動詞開頭 + 量化）
  rewritten: z.string(),
  // 改寫說明（解釋改了什麼、為什麼）
  note: z.string(),
});

export const ResumeAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()).min(2).max(3),
  weaknesses: z.array(z.string()).min(2).max(3),
  // 行動建議依優先序：① 致命失誤 → ② 結構重組 → ③ 關鍵字/量化強化
  actionable_advice: z.array(z.string()).min(2).max(3),
  // 明顯的事實錯誤或遺漏；無問題時為空陣列
  fact_check_issues: z.array(z.string()).max(3).optional().default([]),
  // 跨產業可轉移技能；無法辨識時為空陣列
  transferable_skills: z.array(z.string()).max(3).optional().default([]),
  // 五維度評分分解
  score_breakdown: ScoreBreakdownSchema.optional(),
  // 最值得改寫的一條 STAR 示範（可為 null）
  star_rewrite: StarRewriteSchema.nullable().optional(),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;
export type StarRewrite = z.infer<typeof StarRewriteSchema>;
