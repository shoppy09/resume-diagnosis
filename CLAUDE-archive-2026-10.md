# CLAUDE.md 修改記錄全文封存（2026-10）

> RCF-175 雙層制（tzlth-hq 主規則）：主檔 `CLAUDE.md`「最近修改記錄」只放 ≤300 字元摘要列，完整敘事寫在這裡（newest-first）。
> 2026-10-03 首建（RCF-187 §七-3：系統 repo 也適用雙層制）。

| 日期 | 修改內容 | 執行視窗 | 狀態 |
|------|---------|---------|------|
| 2026-10-03 | 【DEV】**退役後文件對齊（tzlth-hq「說明書格式推廣其餘系統」L119，RCF-187 第 8 份；Tim「照建議，執行」＋5 版查照）**：逐條反查本檔，5 節仍是退役前內容——① 系統定位寫「核心產品工具」② 角色說明寫「確保診斷功能正常」③ 商業邏輯三步驟 ④ 待辦 2 條未勾（轉換率、第三次付費）⑤ HQ 連結的角色／存檔規定／拉取欄位。全部改為退役後現況（舊文刪除線保留）。一手證據：curl 兩網域 × `/`、`/privacy`、`/burnout`、`/api/analyze-resume`、`/api/subscribe`（GET＋POST）全 308；`vercel env ls` 只剩 `NEXT_PUBLIC_GA_MEASUREMENT_ID`、`GEMINI_API_KEY`（皆 Config 型），程式另讀的 `RESEND_*`、`UPSTASH_*` 4 個已無設定；`vercel integration list` 0 個資源；09-24 push 產生的 git 部署為 Canceled（auto-deploy 停用屬實）。只改文件，push 不部署 | tzlth-hq | ✅ |
