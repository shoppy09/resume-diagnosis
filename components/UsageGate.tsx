"use client";

import { useState } from "react";
import { Mail, Share2, CalendarCheck, Zap, Lock, CheckCircle2 } from "lucide-react";
import { unlockWithEmail, unlockWithShare, FREE_USES, EMAIL_BONUS, SHARE_BONUS } from "@/lib/usage";
import { trackEvent } from "@/lib/analytics";

interface UsageGateProps {
  onUnlocked: () => void;
}

export function UsageGate({ onUnlocked }: UsageGateProps) {
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "done">("idle");
  const [shareStatus, setShareStatus] = useState<"idle" | "done">("idle");

  // ── Email 解鎖 ───────────────────────────────────────────────────────────
  const handleEmailUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || emailStatus !== "idle") return;
    setEmailStatus("loading");

    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), score: 0, source: "usage_gate" }),
      });
    } catch {
      // fire-and-forget；即使 API 失敗也讓用戶繼續使用
    }

    unlockWithEmail();
    setEmailStatus("done");
    trackEvent({ name: "email_subscribed", params: { has_target_job: false } });
    setTimeout(onUnlocked, 900);
  };

  // ── 分享解鎖 ─────────────────────────────────────────────────────────────
  const handleShareUnlock = async () => {
    if (shareStatus === "done") return;

    const shareText = "我用 ResumeAI 在 30 秒內拿到了 AI 履歷診斷！完全免費，快來試試：";
    const shareUrl = "https://resume-diagnosis.vercel.app/";

    try {
      const shareApi = (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share;
      if (shareApi) {
        await shareApi.call(navigator, { title: "AI 履歷診斷", text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      }
      unlockWithShare();
      setShareStatus("done");
      trackEvent({
        name: "share_clicked",
        params: { method: (navigator as Navigator & { share?: unknown }).share ? "web_share" : "copy_link" },
      });
      setTimeout(onUnlocked, 900);
    } catch {
      // 使用者取消分享，不做任何事
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* 頂部漸層條 */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600" />

        <div className="p-7">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 text-center">
              {FREE_USES} 次免費診斷已用完
            </h2>
            <p className="text-sm text-slate-500 text-center mt-1.5 leading-relaxed">
              選擇以下任一方式，即可繼續使用
            </p>
          </div>

          {/* ── 選項一：Email 訂閱 +3 次 ── */}
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 mb-3">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-bold text-blue-800 text-sm">訂閱履歷優化電子報</span>
              <span className="ml-auto flex-shrink-0 text-xs bg-blue-600 text-white rounded-full px-2.5 py-0.5 font-bold">
                +{EMAIL_BONUS} 次
              </span>
            </div>
            <p className="text-xs text-blue-600 mb-3">每週收到 HR 視角求職技巧，立即解鎖 3 次診斷</p>

            {emailStatus === "done" ? (
              <div className="flex items-center gap-2 py-2 text-green-700 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                已解鎖！繼續診斷中...
              </div>
            ) : (
              <form onSubmit={handleEmailUnlock} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 min-w-0 rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={emailStatus === "loading" || !email.trim()}
                  className="flex-shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {emailStatus === "loading" ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : "解鎖"}
                </button>
              </form>
            )}
          </div>

          {/* ── 選項二：分享 +1 次 ── */}
          <button
            onClick={handleShareUnlock}
            disabled={shareStatus === "done"}
            className="w-full rounded-2xl border-2 border-slate-200 bg-white p-4 flex items-center gap-3 hover:border-blue-200 hover:bg-slate-50 transition-all mb-3 disabled:opacity-70 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              {shareStatus === "done"
                ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                : <Share2 className="w-5 h-5 text-slate-600" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">
                {shareStatus === "done" ? "✓ 分享成功，已解鎖！" : "分享給正在求職的朋友"}
              </p>
              <p className="text-xs text-slate-500">轉傳連結或分享至社群</p>
            </div>
            <span className="flex-shrink-0 text-xs bg-slate-800 text-white rounded-full px-2.5 py-0.5 font-bold">
              +{SHARE_BONUS} 次
            </span>
          </button>

          {/* ── 選項三：直接諮詢（無限）── */}
          <a
            href="https://forms.gle/f87NSamCuZXTKzBB7"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent({ name: "upsell_clicked", params: { cta: "booking" } })}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-3 hover:from-blue-700 hover:to-indigo-700 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">預約 Tim 1-on-1 深度諮詢</p>
              <p className="text-xs text-blue-200">CDA 認證職涯顧問 · 無次數限制</p>
            </div>
            <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0 group-hover:scale-110 transition-transform" />
          </a>

          <p className="text-center text-xs text-slate-400 mt-4">
            每次成功取得診斷報告消耗 1 次次數
          </p>
        </div>
      </div>
    </div>
  );
}
