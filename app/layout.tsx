import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://diagnose.careerssl.com"),
  title: "ResumeAI — AI 驅動，30 秒找出履歷盲點",
  description: "上傳履歷，即刻獲得 ATS 友善度評分、履歷優勢、扣分項目、可轉移技能與具體改善建議。",
  // 首頁 self-canonical：收斂 ?source= 等追蹤參數變體（GSC「重複網頁；使用者未選取標準網頁」）
  // ⚠️ 子路由會繼承此值 → /burnout 與 /privacy 各自宣告自身 canonical 覆寫，勿移除
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
