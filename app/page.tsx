"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Zap, Target, FileSearch, CalendarCheck } from "lucide-react";
import { AI_CONFIG } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import {
  canUse,
  getRemainingUses,
  incrementUsage,
  getMaxUses,
  FREE_USES,
} from "@/lib/usage";
import { UploadZone } from "@/components/UploadZone";
import { DiagnosisReport } from "@/components/DiagnosisReport";
import { AnalysisSkeleton } from "@/components/AnalysisSkeleton";
import { EmailCapture } from "@/components/EmailCapture";
import { UsageGate } from "@/components/UsageGate";
import type { ResumeAnalysis } from "@/lib/schema";

const features = [
  {
    icon: Zap,
    title: "五維框架診斷",
    desc: "從定位清晰度、成果具體性、相關性匹配度、視覺可讀性、敘事一致性五個維度，找出你的履歷真正卡在哪裡。",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Target,
    title: "相關性精準匹配",
    desc: "對照目標職位 JD，分析你的履歷與職缺的關鍵字吻合度，直接提高進入人工審閱的機率。",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: FileSearch,
    title: "具體修改建議",
    desc: "不只告訴你「哪裡不好」，而是給出可立即執行的修改步驟，讓每一次改版都有方向。",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [lastRequest, setLastRequest] = useState<{ data: FormData | string; targetJob?: string } | null>(null);
  const [hasError, setHasError] = useState(false);

  // 次數相關 — SSR 安全（localStorage 只在 client 讀）
  const [remaining, setRemaining] = useState<number>(FREE_USES);
  const [maxUses, setMaxUses] = useState<number>(FREE_USES);
  const [showGate, setShowGate] = useState(false);
  // 暫存待執行的分析請求（點擊「開始」時若次數不足先暫存）
  const [pendingRequest, setPendingRequest] = useState<{ data: FormData | string; targetJob?: string } | null>(null);

  // 初始化次數（避免 hydration mismatch）
  useEffect(() => {
    setRemaining(getRemainingUses());
    setMaxUses(getMaxUses());
  }, []);

  const refreshUsage = () => {
    setRemaining(getRemainingUses());
    setMaxUses(getMaxUses());
  };

  // ── 核心分析流程 ──────────────────────────────────────────────────────────
  const handleAnalyze = async (data: FormData | string, targetJob?: string) => {
    // 先檢查次數（使用最新 localStorage 值）
    if (!canUse()) {
      setPendingRequest({ data, targetJob });
      setShowGate(true);
      return;
    }

    setIsLoading(true);
    setResult(null);
    setHasError(false);
    setLastRequest({ data, targetJob });

    const method = data instanceof FormData ? "pdf" : "text";
    trackEvent({ name: "diagnose_started", params: { method, has_target_job: !!targetJob } });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.REQUEST_TIMEOUT_MS);

    try {
      let response: Response;

      if (data instanceof FormData) {
        if (targetJob) data.append("targetJob", targetJob);
        response = await fetch("/api/analyze-resume", {
          method: "POST",
          body: data,
          signal: controller.signal,
        });
      } else {
        response = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data, targetJob }),
          signal: controller.signal,
        });
      }

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "分析失敗，請稍後再試");
      }

      // 成功後才計次
      incrementUsage();
      refreshUsage();

      setResult(json);
      trackEvent({ name: "diagnose_completed", params: { score: json.score, has_target_job: !!targetJob } });

      setTimeout(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setHasError(true);
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      const message = isAbort
        ? "分析逾時（30 秒），請稍後再試"
        : err instanceof Error
        ? err.message
        : "發生未知錯誤，請稍後再試";
      toast.error(message, { duration: 5000 });
      trackEvent({ name: "diagnose_error", params: { error_type: isAbort ? "timeout" : "api_error" } });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  // ── UsageGate 解鎖後自動繼續 ─────────────────────────────────────────────
  const handleUnlocked = () => {
    setShowGate(false);
    refreshUsage();
    if (pendingRequest) {
      const req = pendingRequest;
      setPendingRequest(null);
      // 稍微延遲讓 gate 動畫收起
      setTimeout(() => handleAnalyze(req.data, req.targetJob), 300);
    }
  };

  const handleRetry = () => {
    if (lastRequest) handleAnalyze(lastRequest.data, lastRequest.targetJob);
  };

  // ── 次數指示器顏色 ───────────────────────────────────────────────────────
  const remainingColor =
    remaining === 0
      ? "text-red-600 bg-red-50 border-red-200"
      : remaining === 1
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-green-700 bg-green-50 border-green-200";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* UsageGate modal */}
      {showGate && <UsageGate onUnlocked={handleUnlocked} />}

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#1e293b",
            color: "#f8fafc",
            fontSize: "14px",
          },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">ResumeAI</span>
          </div>
          <div className="flex items-center gap-3">
            {/* 次數指示器 */}
            <div className={`hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${remainingColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              剩餘 {remaining} 次免費診斷
            </div>
            <span className="text-xs text-slate-400 hidden lg:block">由 Gemini AI 驅動</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        {/* Hero */}
        <section className="pt-16 pb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            由 Gemini AI 驅動的智能履歷診斷
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
            AI 驅動，
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              30 秒
            </span>
            找出履歷盲點
          </h1>

          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-10">
            上傳履歷，用五維框架找出真正的卡關點：定位、成果、相關性、視覺、敘事。
            30 秒診斷，給出可立即執行的修改方向。
          </p>

          {/* Upload Card */}
          <div className="mx-auto max-w-xl">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 p-7">
              <UploadZone onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>

            {/* 次數提示（卡片下方） */}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
              {Array.from({ length: maxUses }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < (maxUses - remaining) ? "bg-slate-300" : "bg-blue-400"
                  }`}
                />
              ))}
              <span className="ml-1">
                {remaining > 0
                  ? `剩餘 ${remaining} 次免費診斷`
                  : "次數已用完，訂閱 Email 解鎖更多次數"}
              </span>
            </div>
          </div>
        </section>

        {/* Features */}
        {!isLoading && !result && (
          <section className="pb-16">
            <h2 className="text-center text-xl font-bold text-slate-700 mb-8">
              為什麼選擇 ResumeAI？
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {features.map(({ icon: Icon, title, desc, color, bg }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Loading */}
        {isLoading && (
          <section className="max-w-xl mx-auto pb-16">
            <AnalysisSkeleton />
          </section>
        )}

        {/* Error Retry */}
        {hasError && !isLoading && !result && lastRequest && (
          <section className="max-w-xl mx-auto pb-6">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
              <p className="text-sm text-red-700 font-medium">分析失敗，是否要重新嘗試？</p>
              <button
                onClick={handleRetry}
                className="flex-shrink-0 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
              >
                重試
              </button>
            </div>
          </section>
        )}

        {/* Result */}
        {result && !isLoading && (
          <section id="result" className="max-w-xl mx-auto pb-16 scroll-mt-20 space-y-5">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-blue-600 inline-block" />
              AI 診斷報告
            </h2>
            <DiagnosisReport data={result} />
            <EmailCapture score={result.score} targetJob={lastRequest?.targetJob} />
            {/* 預約諮詢 CTA */}
            <a
              href="https://my-booking-system.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent({ name: "booking_cta_clicked", params: { source: "diagnosis_result" } })}
              className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 hover:from-blue-700 hover:to-indigo-700 transition-all group"
            >
              <div>
                <p className="text-sm font-bold text-white mb-0.5">想深入改善？預約 1-on-1 諮詢</p>
                <p className="text-xs text-blue-200">CDA 認證顧問 Tim・提供具體修改方向・無次數限制</p>
              </div>
              <CalendarCheck className="w-6 h-6 text-white flex-shrink-0 group-hover:scale-110 transition-transform" />
            </a>
            <button
              onClick={() => setResult(null)}
              className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
            >
              ← 重新診斷
            </button>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 space-y-1">
        <p>© 2026 職涯停看聽 · ResumeAI · 您的履歷資料不會被儲存 · 安全加密傳輸</p>
        <p>
          <a href="/privacy" className="underline hover:text-slate-600 transition-colors">
            隱私政策
          </a>
          {" · "}
          <a href="https://lin.ee/IOX6V66" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600 transition-colors">
            聯絡我們
          </a>
        </p>
      </footer>
    </div>
  );
}
