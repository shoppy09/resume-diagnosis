"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "解析履歷內容", emoji: "📄" },
  { label: "執行 ATS 關鍵字比對", emoji: "🔍" },
  { label: "分析職涯時間軸", emoji: "📅" },
  { label: "萃取可轉移技能", emoji: "✨" },
  { label: "生成 STAR 改寫建議", emoji: "✍️" },
];

// 5 steps × 5.5s = ~27.5s; progress bar targets ~30s total
const STEP_DURATION_MS = 5500;
const TOTAL_DURATION_MS = 30000;

export function AnalysisSkeleton() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Advance step every STEP_DURATION_MS
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, STEP_DURATION_MS);

    // Smooth progress bar: update every 200ms, cap at 95%
    const tickMs = 200;
    const increment = (tickMs / TOTAL_DURATION_MS) * 95;
    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(prev + increment, 95));
    }, tickMs);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className="w-full space-y-5">
      {/* Spinner + current step label */}
      <div className="flex flex-col items-center py-8">
        <div className="relative w-24 h-24">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          {/* Emoji center */}
          <div className="absolute inset-0 flex items-center justify-center text-3xl select-none">
            {STEPS[currentStep].emoji}
          </div>
        </div>

        <p className="mt-5 text-base font-semibold text-slate-800">
          {STEPS[currentStep].label}...
        </p>
        <p className="mt-1 text-xs text-slate-400">AI 正在深度分析您的履歷，約需 30 秒</p>
      </div>

      {/* Step checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3.5">
        {STEPS.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          return (
            <div key={i} className="flex items-center gap-3">
              {/* Status indicator */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-500 ${
                  isDone
                    ? "bg-blue-600 text-white scale-100"
                    : isActive
                    ? "bg-blue-50 text-blue-600 ring-2 ring-blue-400 ring-offset-1 animate-pulse"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>

              {/* Step label */}
              <span
                className={`text-sm transition-colors duration-300 ${
                  isDone
                    ? "text-slate-400 line-through"
                    : isActive
                    ? "text-slate-800 font-semibold"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>

              {/* Active spinner dot */}
              {isActive && (
                <span className="ml-auto flex gap-1">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                      style={{ animationDelay: `${dot * 150}ms` }}
                    />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex justify-between text-xs text-slate-500 mb-2.5">
          <span>整體進度</span>
          <span className="tabular-nums font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
