"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Download,
  CalendarCheck,
  Star,
  ShieldAlert,
  Repeat2,
  Share2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import type { ResumeAnalysis, ScoreBreakdown } from "@/lib/schema";

interface DiagnosisReportProps {
  data: ResumeAnalysis;
}

// ─── Score helpers ───────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

function scoreBarColor(score: number): { bg: string; text: string } {
  if (score >= 80) return { bg: "bg-green-500", text: "text-green-600" };
  if (score >= 60) return { bg: "bg-blue-500",  text: "text-blue-600" };
  if (score >= 40) return { bg: "bg-yellow-500", text: "text-yellow-600" };
  return { bg: "bg-red-500", text: "text-red-600" };
}

function scoreLabel(score: number) {
  if (score >= 90) return "頂尖履歷";
  if (score >= 70) return "良好表現";
  if (score >= 50) return "有待加強";
  if (score >= 30) return "需要重寫";
  return "基礎問題";
}

function scorePercentile(score: number): number {
  if (score >= 90) return 95;
  if (score >= 80) return 80;
  if (score >= 70) return 65;
  if (score >= 60) return 45;
  if (score >= 50) return 30;
  if (score >= 40) return 15;
  if (score >= 30) return 8;
  return 3;
}

// ─── Score Breakdown Section ─────────────────────────────────────────────────

const BREAKDOWN_META: {
  key: keyof ScoreBreakdown;
  label: string;
  weight: string;
  color: string;
}[] = [
  { key: "成果量化", label: "成果量化", weight: "25%", color: "bg-green-500" },
  { key: "年資與穩定性", label: "年資與穩定性", weight: "20%", color: "bg-blue-500" },
  { key: "結構與ATS", label: "結構與 ATS", weight: "20%", color: "bg-indigo-500" },
  { key: "細節完整性", label: "細節完整性", weight: "20%", color: "bg-orange-500" },
  { key: "關鍵字覆蓋", label: "關鍵字覆蓋", weight: "15%", color: "bg-purple-500" },
];

function ScoreBreakdownSection({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-700 text-base">五維度評分分解</CardTitle>
        <p className="text-xs text-slate-400">括號內為各項在總分中的權重</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {BREAKDOWN_META.map(({ key, label, weight, color }) => {
          const val = breakdown[key] ?? 0;
          const colors = scoreBarColor(val);
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700">
                  {label}
                  <span className="ml-1 text-slate-400 font-normal">({weight})</span>
                </span>
                <span className={`font-bold tabular-nums ${colors.text}`}>
                  {val}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── STAR Rewrite Section ─────────────────────────────────────────────────────

function StarRewriteSection({ data }: { data: NonNullable<ResumeAnalysis["star_rewrite"]> }) {
  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <ArrowRight className="w-5 h-5" />
          STAR 改寫示範
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          來源：<span className="font-medium text-slate-700">{data.source}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Before */}
        <div className="rounded-xl bg-red-50 border border-red-100 p-4">
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Before（原文）</p>
          <p className="text-sm text-red-800 leading-relaxed whitespace-pre-wrap">{data.original}</p>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-blue-600 rotate-90" />
          </div>
        </div>

        {/* After */}
        <div className="rounded-xl bg-green-50 border border-green-100 p-4">
          <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">After（改寫示範）</p>
          <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap">{data.rewritten}</p>
        </div>

        {/* Note */}
        <div className="flex gap-2 pt-1">
          <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">{data.note}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Share Button ─────────────────────────────────────────────────────────────

function ShareButton({ score }: { score: number }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: "我的 AI 履歷診斷結果",
      text: `我的履歷在 ResumeAI 獲得了 ${score} 分！快來試試看你的履歷能拿幾分？`,
      url: "https://resume-diagnosis.vercel.app/",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackEvent({ name: "share_clicked", params: { method: "web_share" } });
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        trackEvent({ name: "share_clicked", params: { method: "copy_link" } });
      }
    } catch {
      // User cancelled share or clipboard failed — ignore
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
    >
      <Share2 className="w-3.5 h-3.5" />
      {copied ? "連結已複製！" : "分享結果"}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DiagnosisReport({ data }: DiagnosisReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const percentile = scorePercentile(data.score);

  const handleDownloadPDF = async () => {
    if (!reportRef.current || isDownloading) return;
    setIsDownloading(true);
    trackEvent({ name: "pdf_downloaded", params: { score: data.score } });

    const { toPng } = await import("html-to-image");
    const jsPDFMod = await import("jspdf");
    const jsPDF = jsPDFMod.default ?? (jsPDFMod as unknown as typeof jsPDFMod.default);

    const dataUrl = await toPng(reportRef.current, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (img.naturalHeight * pdfWidth) / img.naturalWidth;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("履歷診斷報告.pdf");
    setIsDownloading(false);
  };

  return (
    <div className="w-full space-y-5">
      <div ref={reportRef} className="space-y-5 bg-white p-1">

        {/* ── Score Card ── */}
        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AI 診斷總評</CardTitle>
              <div className="text-right">
                <span className={`text-4xl font-bold tabular-nums ${scoreColor(data.score)}`}>
                  {data.score}
                </span>
                <span className="text-slate-400 text-sm ml-1">/ 100</span>
                <p className={`text-xs font-semibold mt-0.5 ${scoreColor(data.score)}`}>
                  {scoreLabel(data.score)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={data.score} className="mb-3" />

            {/* Percentile badge */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-500">
                贏過使用本工具的{" "}
                <span className="font-bold text-blue-600">{percentile}%</span> 用戶
              </p>
              {/* Toggle breakdown */}
              <button
                onClick={() => setShowBreakdown((v) => !v)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {showBreakdown ? (
                  <>收起詳情 <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>五維度詳情 <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>
          </CardContent>
        </Card>

        {/* ── Score Breakdown (toggleable) ── */}
        {showBreakdown && data.score_breakdown && (
          <ScoreBreakdownSection breakdown={data.score_breakdown} />
        )}

        {/* ── Strengths ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              履歷優勢
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.strengths.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Weaknesses ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
              ATS 扣分項目
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Transferable Skills ── */}
        {data.transferable_skills && data.transferable_skills.length > 0 && (
          <Card className="border-violet-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-violet-700">
                <Repeat2 className="w-5 h-5" />
                跨界可轉移技能
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                以下技能可跨產業遷移，是您在求職時的隱形競爭優勢。
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.transferable_skills.map((skill, i) => {
                  const [name, ...rest] = skill.split("：");
                  const detail = rest.join("：");
                  return (
                    <li key={i} className="flex gap-3 text-sm text-slate-700">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">
                        {detail ? (
                          <>
                            <span className="font-semibold text-violet-800">{name}</span>
                            <span className="text-slate-500">：</span>
                            {detail}
                          </>
                        ) : (
                          skill
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* ── Actionable Advice ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Lightbulb className="w-5 h-5" />
              具體行動建議
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.actionable_advice.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{a}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Fact-Check Issues ── */}
        {data.fact_check_issues && data.fact_check_issues.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <ShieldAlert className="w-5 h-5" />
                履歷紅旗警示
              </CardTitle>
              <p className="text-xs text-red-500 mt-1">
                以下問題在 HR 審閱時會立即引發疑慮，建議優先修正。
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.fact_check_issues.map((issue, i) => (
                  <li key={i} className="flex gap-3 text-sm text-red-800">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center">
                      ！
                    </span>
                    <span className="leading-relaxed">{issue}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* ── STAR Rewrite ── */}
        {data.star_rewrite && <StarRewriteSection data={data.star_rewrite} />}

      </div>

      {/* ── Share row ── */}
      <div className="flex items-center justify-end">
        <ShareButton score={data.score} />
      </div>

      {/* ── Upsell Section ── */}
      <div className="relative overflow-hidden rounded-2xl p-[2px] bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600">
        <div className="relative rounded-[14px] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-7 text-white overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-start gap-4 mb-5">
              {/* Tim's avatar */}
              <div className="flex-shrink-0 relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  T
                </div>
                {/* CDA badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 border-2 border-blue-700 flex items-center justify-center">
                  <Star className="w-3 h-3 text-white fill-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-bold text-white text-base">Tim</span>
                  <span className="text-xs bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 rounded-full px-2 py-0.5 font-semibold">
                    CDA 認證職涯發展顧問
                  </span>
                </div>
                <p className="text-blue-200 text-xs">15 年人資與職涯規劃經驗 · 協助 500+ 求職者轉職</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-semibold tracking-widest text-blue-200 uppercase">
                進階服務
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2 leading-snug">
              AI 只能指出問題，真人顧問能陪你解決問題。
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              想針對這份報告進行深度優化嗎？Tim 將與您 1-on-1 分析盲點，模擬真實 HR 面試場景，協助您找到理想職位。
            </p>

            <div className="flex flex-col gap-3">
              {/* 第一行：主要 CTA + LINE@ */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://forms.gle/f87NSamCuZXTKzBB7"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent({ name: "upsell_clicked", params: { cta: "booking" } })}
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-100/80 to-transparent group-hover:animate-shimmer" />
                  <CalendarCheck className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">預約 Tim 諮詢</span>
                </a>

                <a
                  href="https://lin.ee/5fmASoJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent({ name: "upsell_clicked", params: { cta: "line" } })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-[#06C755]/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-[#06C755]/40 active:bg-[#06C755]/50"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.494.25l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  加入 LINE@ 諮詢
                </a>
              </div>

              {/* 第二行：下載報告 */}
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 active:bg-white/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    產生中...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    下載此份 AI 報告 (PDF)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
