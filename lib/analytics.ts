/**
 * Google Analytics 4 事件追蹤工具
 * 使用 NEXT_PUBLIC_GA_MEASUREMENT_ID 環境變數
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type GaEvent =
  | { name: "diagnose_started"; params: { method: "pdf" | "text"; has_target_job: boolean } }
  | { name: "diagnose_completed"; params: { score: number; has_target_job: boolean } }
  | { name: "diagnose_error"; params: { error_type: string } }
  | { name: "upsell_clicked"; params: { cta: "booking" | "line" | "pdf_download" | "main_site" } }
  | { name: "pdf_downloaded"; params: { score: number } }
  | { name: "share_clicked"; params: { method: "web_share" | "copy_link" } }
  | { name: "email_subscribed"; params: { has_target_job: boolean } }
  | { name: "booking_cta_clicked"; params: { source: "diagnosis_result" } };

export function trackEvent(event: GaEvent) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event.name, event.params);
}
