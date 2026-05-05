import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "隱私政策 — ResumeAI",
  description: "AI 履歷診斷服務隱私政策",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
        >
          ← 返回診斷頁面
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">隱私政策</h1>
        <p className="text-sm text-slate-500 mb-8">
          服務提供者：職涯停看聽（顧問：蒲朝棟）｜最後更新：2026 年 4 月 11 日
        </p>

        <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700">

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">一、蒐集的資料範圍</h2>
            <p>當您使用本 AI 履歷診斷服務時，本服務將處理以下資料：</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>您上傳的履歷文件（PDF 格式或貼上的文字內容）</li>
              <li>您輸入的目標職位資訊（選填）</li>
              <li>瀏覽行為數據（透過 Google Analytics 4 匿名蒐集，包含頁面瀏覽、功能使用次數）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">二、資料的使用目的</h2>
            <p>您的履歷資料僅用於以下目的：</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>透過 Google Gemini AI API 進行即時分析，生成個人化診斷報告</li>
              <li>診斷完成後，您的履歷文件與內容<strong>不會被本服務的伺服器儲存</strong></li>
              <li>為提升服務效能，相同內容的分析結果可能在伺服器記憶體中暫存最多 24 小時（無法識別個人身份）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">三、第三方服務說明</h2>
            <p>本服務使用以下第三方工具，您的資料將依各自隱私政策處理：</p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>
                <strong>Google Gemini API</strong>：用於履歷 AI 分析。您的履歷內容將傳送至 Google 伺服器進行處理。
                詳見 <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google 隱私政策</a>。
              </li>
              <li>
                <strong>Google Analytics 4</strong>：用於使用量統計，蒐集匿名化行為數據（不含個人識別資訊）。
              </li>
              <li>
                <strong>Vercel</strong>：本服務的部署平台，處理網路請求與伺服器運算。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">四、您的個資保護權利</h2>
            <p>依台灣《個人資料保護法》，您享有以下權利：</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>查詢或請求閱覽您的個人資料</li>
              <li>請求補充或更正不完整、不正確的資料</li>
              <li>請求停止蒐集、處理或利用</li>
              <li>請求刪除您的個人資料</li>
            </ul>
            <p className="mt-2">
              由於本服務不儲存個人履歷內容，如需行使上述權利，請透過下方聯絡方式與我們聯繫。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">五、使用本服務即代表您同意</h2>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>您的履歷內容將被傳送至 Google Gemini AI 進行分析處理</li>
              <li>本服務蒐集匿名使用數據以改善服務品質</li>
              <li>本隱私政策可能不定期更新，請定期查閱</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3">六、聯絡方式</h2>
            <p>
              如有任何隱私相關問題或疑慮，請透過 LINE 官方帳號聯繫職涯停看聽：
            </p>
            <p className="mt-2">
              <a
                href="https://lin.ee/IOX6V66"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                https://lin.ee/IOX6V66
              </a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          © 2026 職涯停看聽 · ResumeAI
        </div>
      </div>
    </div>
  );
}
