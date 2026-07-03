/**
 * 全域常數集中管理
 * 修改這裡會同步影響前後端所有使用處
 */

export const UPLOAD_CONFIG = {
  /** PDF 檔案大小上限（bytes） */
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  /** 文字貼上最少字元數 */
  MIN_TEXT_LENGTH: 50,
  /** 文字貼上最多字元數（防止超長輸入佔用 token） */
  MAX_TEXT_LENGTH: 8000,
} as const;

export const AI_CONFIG = {
  /**
   * 使用的 Gemini 模型（此為模型 SoT，改此處同步影響 route.ts PDF+文字兩路徑）
   * ⚠️ 客戶端付費診斷刻意釘版（非用 gemini-flash-latest 滾動別名），避免模型靜默更換造成結構化輸出漂移。
   * ⛔ gemini-2.5-flash 於 2026-10-16 停用 → 屆時前須遷移（評估 2.5-flash-lite vs 3.5-flash，權衡成本）。追蹤：dev/tasks.md（RCF-123 衍生）。
   */
  MODEL: "gemini-2.5-flash",
  /** 思考預算（越高越嚴謹，但速度較慢） */
  THINKING_BUDGET: 8000,
  /** 前端請求超時（毫秒） */
  REQUEST_TIMEOUT_MS: 30000,
} as const;

export const RATE_LIMIT_CONFIG = {
  /** 每個 IP 在時間窗口內的最大請求數 */
  MAX_REQUESTS: 10,
  /** 時間窗口長度（毫秒） */
  WINDOW_MS: 60 * 60 * 1000, // 1 小時
} as const;
