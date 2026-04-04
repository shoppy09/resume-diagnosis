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
  /** 使用的 Gemini 模型 */
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
