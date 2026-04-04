"use client";

import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Zap, Target, FileSearch } from "lucide-react";
import { AI_CONFIG } from "@/lib/constants";
import { UploadZone } from "@/components/UploadZone";
import { DiagnosisReport } from "@/components/DiagnosisReport";
import { AnalysisSkeleton } from "@/components/AnalysisSkeleton";
import type { ResumeAnalysis } from "@/lib/schema";

const features = [
  {
    icon: Zap,
    title: "快速掃描",
    desc: "30 秒內完成全方位履歷解析，AI 即時給出評分與診斷摘要，省去等待的焦慮。",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Target,
    title: "ATS 友善度分析",
    desc: "模擬 HR 系統自動篩選邏輯，找出會讓你在第一關就被刷掉的關鍵字缺漏與格式地雷。",
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
  const [lastRequest, setLastRequest] = useState<FormData | string | null>(null);
  const [hasError, setHasError] = useState(false);

  const handleAnalyze = async (data: FormData | string) => {
    setIsLoading(true);
    setResult(null);
    setHasError(false);
    setLastRequest(data);

    // 30 秒超時保護，防止 Gemini API 無回應時永久 Loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.REQUEST_TIMEOUT_MS);

    try {
      let response: Response;

      if (data instanceof FormData) {
        response = await fetch("/api/analyze-resume", {
          method: "POST",
          body: data,
          signal: controller.signal,
        });
      } else {
        response = await fetch("/api/analyze-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data }),
          signal: controller.signal,
        });
      }

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "分析失敗，請稍後再試");
      }

      setResult(json);

      setTimeout(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setHasError(true);
      if (err instanceof DOMException && err.name === "AbortError") {
        toast.error("分析逾時（30 秒），請稍後再試", { duration: 5000 });
      } else {
        const message = err instanceof Error ? err.message : "發生未知錯誤，請稍後再試";
        toast.error(message, { duration: 5000 });
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#1e293b",
            color: "#f8fafc",
            fontSize: "14px",
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
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
          <span className="text-xs text-slate-400 hidden sm:block">
            由 Gemini AI 驅動 · 完全免費使用
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        {/* Hero Section */}
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
            上傳履歷，即刻獲得 ATS 友善度評分、履歷優勢、扣分項目、可轉移技能與具體改善建議。
            讓你的下一份履歷直接突破篩選關卡。
          </p>

          {/* Upload Card */}
          <div className="mx-auto max-w-xl">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 p-7">
              <UploadZone onAnalyze={handleAnalyze} isLoading={isLoading} />
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

        {/* Loading State */}
        {isLoading && (
          <section className="max-w-xl mx-auto pb-16">
            <AnalysisSkeleton />
          </section>
        )}

        {/* Error Retry Banner */}
        {hasError && !isLoading && !result && lastRequest && (
          <section className="max-w-xl mx-auto pb-6">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
              <p className="text-sm text-red-700 font-medium">分析失敗，是否要重新嘗試？</p>
              <button
                onClick={() => handleAnalyze(lastRequest)}
                className="flex-shrink-0 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
              >
                重試
              </button>
            </div>
          </section>
        )}

        {/* Result */}
        {result && !isLoading && (
          <section id="result" className="max-w-xl mx-auto pb-16 scroll-mt-20">
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-blue-600 inline-block" />
              AI 診斷報告
            </h2>
            <DiagnosisReport data={result} />
            <button
              onClick={() => setResult(null)}
              className="mt-6 w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
            >
              ← 重新診斷
            </button>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © 2026 ResumeAI · 您的履歷資料不會被儲存 · 安全加密傳輸
      </footer>
    </div>
  );
}
