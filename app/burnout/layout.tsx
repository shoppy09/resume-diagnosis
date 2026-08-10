import type { Metadata } from "next";

// page.tsx 為 "use client" 無法 export metadata，故以本 layout 承載。
// 目的：覆寫 root layout 的 canonical:"/"，避免本頁被指向首頁。
export const metadata: Metadata = {
  alternates: { canonical: "/burnout" },
};

export default function BurnoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
