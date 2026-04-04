/**
 * 簡易 in-memory IP Rate Limiter
 * 每個 IP 每小時最多 10 次分析請求
 * 注意：重啟 server 後計數重設；生產環境建議改用 Redis
 */
import { RATE_LIMIT_CONFIG } from "@/lib/constants";

const MAX_REQUESTS = RATE_LIMIT_CONFIG.MAX_REQUESTS;
const WINDOW_MS = RATE_LIMIT_CONFIG.WINDOW_MS;

interface RateRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateRecord>();

// 定期清理過期記錄，避免 Map 無限增長
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of store.entries()) {
    if (now > record.resetAt) store.delete(ip);
  }
}, WINDOW_MS);

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    // 新的時間窗口
    const newRecord: RateRecord = { count: 1, resetAt: now + WINDOW_MS };
    store.set(ip, newRecord);
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: newRecord.resetAt };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - record.count, resetAt: record.resetAt };
}
