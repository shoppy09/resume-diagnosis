/**
 * 使用次數管理（localStorage，客戶端）
 * 軟性限制：不是安全防護，而是轉換漏斗的觸發點
 */

const KEY_COUNT = "resumeai_count";
const KEY_EMAIL_UNLOCKED = "resumeai_email_unlocked";
const KEY_SHARE_UNLOCKED = "resumeai_share_unlocked";

export const FREE_USES = 2;
export const EMAIL_BONUS = 3;
export const SHARE_BONUS = 1;

function safe<T>(fn: () => T, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return fn(); } catch { return fallback; }
}

export function getUsageCount(): number {
  return safe(() => parseInt(localStorage.getItem(KEY_COUNT) || "0", 10), 0);
}

export function incrementUsage(): void {
  safe(() => {
    localStorage.setItem(KEY_COUNT, String(getUsageCount() + 1));
  }, undefined);
}

export function isEmailUnlocked(): boolean {
  return safe(() => localStorage.getItem(KEY_EMAIL_UNLOCKED) === "true", false);
}

export function unlockWithEmail(): void {
  safe(() => localStorage.setItem(KEY_EMAIL_UNLOCKED, "true"), undefined);
}

export function isShareUnlocked(): boolean {
  return safe(() => localStorage.getItem(KEY_SHARE_UNLOCKED) === "true", false);
}

export function unlockWithShare(): void {
  safe(() => localStorage.setItem(KEY_SHARE_UNLOCKED, "true"), undefined);
}

export function getMaxUses(): number {
  return safe(() => {
    let max = FREE_USES;
    if (isEmailUnlocked()) max += EMAIL_BONUS;
    if (isShareUnlocked()) max += SHARE_BONUS;
    return max;
  }, FREE_USES);
}

export function canUse(): boolean {
  return getUsageCount() < getMaxUses();
}

export function getRemainingUses(): number {
  return Math.max(0, getMaxUses() - getUsageCount());
}
