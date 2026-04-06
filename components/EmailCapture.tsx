"use client";

import { useState } from "react";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface EmailCaptureProps {
  score: number;
  targetJob?: string;
}

export function EmailCapture({ score, targetJob }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "loading" || status === "success") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), score, targetJob }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "訂閱失敗");
      }

      setStatus("success");
      trackEvent({ name: "email_subscribed", params: { has_target_job: !!targetJob } });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "發生錯誤，請稍後再試");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">已成功訂閱！</p>
          <p className="text-xs text-green-600 mt-0.5">我們會將履歷優化技巧與職涯資源寄送到您的信箱。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Mail className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">獲得更多履歷優化秘訣</p>
          <p className="text-xs text-slate-500">訂閱電子報，每週收到 HR 視角的求職建議</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="您的電子郵件"
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          訂閱
        </button>
      </form>

      {status === "error" && (
        <p className="mt-2 text-xs text-red-600">{errorMsg}</p>
      )}

      <p className="mt-2 text-xs text-slate-400">隱私保護：您的信箱僅用於寄送職涯資源，不會轉售。</p>
    </div>
  );
}
