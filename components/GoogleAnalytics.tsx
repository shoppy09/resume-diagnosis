"use client";

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// 跨系統漏斗 roll-up property（官網 + 預約 www.careerssl.com 已共用此 ID）。
// dual-tag：診斷子網域 diagnose.careerssl.com 事件併入此 property，使
// 官網 → 診斷 → 預約 端到端旅程在單一 property 縫合（GA4 同 root 子網域自動共享 _ga cookie，
// 無需 cross-domain 設定）。診斷專屬數據仍保留於 GA_ID（G-DG6PL8E1BG）。來源：RCF-118 D10。
const ROLLUP_GA_ID = "G-TK8D1DX7MJ";

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          gtag('config', '${ROLLUP_GA_ID}', { page_path: window.location.pathname });
        `}
      </Script>
    </>
  );
}
