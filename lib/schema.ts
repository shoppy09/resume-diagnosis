import { z } from "zod";

export const ResumeAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()).min(2).max(3),
  weaknesses: z.array(z.string()).min(2).max(3),
  // 行動建議依優先序排列：① 致命失誤修正 → ② 結構重組 → ③ 關鍵字/量化強化
  actionable_advice: z.array(z.string()).min(2).max(3),
  // 明顯的事實錯誤或遺漏（如「未填寫」佔位符、日期矛盾等）；無問題時為空陣列
  fact_check_issues: z.array(z.string()).max(3).optional().default([]),
  // 從履歷中萃取的跨產業可轉移技能，附上依據來源；無法辨識時為空陣列
  transferable_skills: z.array(z.string()).max(3).optional().default([]),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;
