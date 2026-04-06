/**
 * Rate Limiter — 優先使用 Upstash Redis（Vercel 跨 instance 共享狀態）
 * 若未設定 Upstash 環境變數，自動降回 in-memory（本機開發用）
 *
 * Upstash 設定：
 *   UPSTASH_REDIS_REST_URL=...
 *   UPSTASH_REDIS_REST_TOKEN=...
 */
import { RATE_LIMIT_CONFIG } from "@/lib/constants";

const MAX_REQUESTS = RATE_LIMIT_CONFIG.MAX_REQUESTS;
const WINDOW_MS = RATE_LIMIT_CONFIG.WINDOW_MS;
const WINDOW_SEC = Math.floor(WINDOW_MS / 1000);

// ─── Upstash Redis path ───────────────────────────────────────────────────────

let upstashLimiter: {
  limit: (id: string) => Promise<{ success: boolean; remaining: number; reset: number }>;
} | null = null;

async function getUpstashLimiter() {
  if (upstashLimiter) return upstashLimiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const redis = new Redis({ url, token });
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, `${WINDOW_SEC} s`),
      analytics: false,
    });

    upstashLimiter = {
      limit: async (id: string) => {
        const result = await limiter.limit(id);
        return {
          success: result.success,
          remaining: result.remaining,
          reset: result.reset,
        };
      },
    };
    return upstashLimiter;
  } catch {
    console.warn("[RateLimit] Failed to init Upstash, falling back to in-memory");
    return null;
  }
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

interface RateRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateRecord>();

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of store.entries()) {
    if (now > record.resetAt) store.delete(ip);
  }
}, WINDOW_MS);

function checkInMemory(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
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

// ─── Public API ───────────────────────────────────────────────────────────────

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const limiter = await getUpstashLimiter();
    if (limiter) {
      const { success, remaining, reset } = await limiter.limit(ip);
      return { allowed: success, remaining, resetAt: reset };
    }
  } catch (err) {
    console.error("[RateLimit] Upstash error, falling back:", err);
  }
  return checkInMemory(ip);
}
