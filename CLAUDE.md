@AGENTS.md

# AI 履歷診斷工具 - 操作規則

## 系統定位
這是職涯停看聽的核心產品工具。透過 AI 幫助求職者診斷履歷問題，免費使用 2 次，建立信任後導流至付費諮詢。

## 角色說明
你是這個 Next.js 應用的開發維護者。負責確保診斷功能正常、使用流程順暢、並協助建立使用追蹤機制。

## 技術架構
- Framework：Next.js（版本注意：API 與慣例可能與舊版不同，修改前先讀 AGENTS.md）
- 部署：Vercel
- 正式網址：https://diagnose.careerssl.com（canonical；`resume-diagnosis.vercel.app` 為 Vercel fallback，對外一律用 canonical）
- 官網入口：https://www.careerssl.com/#ai-tool（2026-08-10 更正：原記 `tzlth-website.vercel.app` 已 301 至 www）

## 商業邏輯
1. 使用者輸入履歷 → AI 診斷 → 給出建議
2. 免費 2 次：建立信任
3. 第 3 次起：導購付費諮詢服務

## 待辦事項
- [x] 建立使用次數追蹤機制 → GA4 已啟用（G-DG6PL8E1BG），scripts/fetch-ga4-weekly.py 自動拉取 ✅ 2026-04-14
- [ ] 追蹤免費→付費轉換率（upsell_clicked 事件已追蹤，等待用戶觸發）
- [ ] 考慮第三次診斷的付費機制

---
## ⚡ 跨視窗同步協議（最高優先規則）

> 所有對話視窗共用檔案系統。**文件是各視窗之間唯一的共用記憶。**

### 收尾七件事（每次對話結束前必做，2026-07-02 指針化 RCF-120）
收尾完整規則詳見**總部 CLAUDE.md →「核心原則零：收尾七件事」**（7 步驟：git push / 最近修改記錄 / tasks.md / inventory.json / daily-log / reflection-log / 品質自查 HARD STOP / 未完成清單 HARD STOP）。
**本 repo 部署特例（步驟 0）**：程式碼修改＝`npm run build` → git push（shoppy09/resume-diagnosis）→ `npx vercel --prod` 三步缺一不可；純文件修改 push 即可。
> ✅ **2026-08-23 dashboard 實查確認：本 repo auto-deploy 確為「停用」**（Deployments 列表零 git-source 部署）⇒ `npx vercel --prod` **確實是唯一上線途徑**，本欄記載正確（停用日為本檔 2026-04-13 記錄的 Ignored Build Step 處置）。⚠️ 但總部主檔規則零原載的**全域**「Vercel GitHub 自動部署永久停用」是錯誤通則——8 專案實查為 5 開／2 關／1 未連（RCF-153），本 repo 屬「關」的那 2 個之一，**不可據此推論其他 repo**。
> ✅ **憑證已於 2026-08-23 由 Tim 重新登入復原**（`npx.cmd vercel login`；`Active team: shoppy09-2874s-projects`，**不需 `--scope`**）⇒ CLI 路徑恢復可用。⛔ **PowerShell 一律打 `npx.cmd`**（`npx` 會被 ExecutionPolicy 擋在 `npx.ps1`，回 `UnauthorizedAccess`；Bash 不受影響。IMP-112）。
**步驟 1 提醒**：「更新本文件最近修改記錄」= 更新本 CLAUDE.md 的「最近修改記錄」表格。

> 未完成收尾七件事 = 任務未完成。未 push = 儀表板看不到。

### 最近修改記錄

| 日期 | 修改內容 | 執行視窗 | 狀態 |
|------|---------|---------|------|
| 2026-08-10 | **2 個對外預約 CTA 改指 canonical + 3 處 stale URL 順修（HQ tasks L139，commit `793dd8f`）**：`UsageGate.tsx:152`／`DiagnosisReport.tsx:491` 原指 `my-booking-system.onrender.com`（退場中的 Render 重複實例，當日已被抽 5 把 env → 客戶能送出預約但不寄確認信/不發 LINE/不建 GCal/Tim 收不到通知＝**靜默失敗**；09-15 評估 suspend 後直接 503）→ 改 `www.careerssl.com/booking?source=diagnosis-{usagegate,report}`。順修：分享網址 ×2（`UsageGate:44`／`DiagnosisReport:166`）→ `diagnose.careerssl.com/`；main_site CTA（`DiagnosisReport:542`）→ `www.careerssl.com`（原 301 多一跳）。**根因＝兩次清掃皆漏**：官網 `0cae3fa`(04-21) find-replace 只掃官網 repo；本 repo `d6a4c09`(05-19) 搜尋鍵為前一代值 `booking.careerssl.com`、掃不到更早的 onrender。**`?source=` 刻意不用 `utm_*`**（與預約同網域共用 roll-up `G-TK8D1DX7MJ`，mid-funnel utm 會覆寫流量來源、污染端到端漏斗歸因）。GA4 事件與 CTA 文案未動。驗證：`dev/deploy-verify/SYS-03-2026-08-10.md`（bundle 0 殘留／UsageGate 實際渲染 E2E 桌機+手機 375×812／落地頁導航含 `page_location`）| 總部視窗 | ✅ |
| 2026-07-02 | 收尾規則指針化（RCF-120 D6）：舊「收尾四/五件事」清單 → 總部 CLAUDE.md 收尾七件事指針式（部署特例保留在地）；消除與主檔的版本漂移 | 總部視窗 | ✅ |
| 2026-04-19 | 新增 /burnout 職業倦怠快測路由（app/burnout/page.tsx）+ 診斷結果頁 burnout CTA + analytics.ts 新增 burnout_completed 事件 | 總部視窗 | ✅ |
| 2026-04-14 | GA4 Data API 自動拉取腳本上線（scripts/fetch-ga4-weekly.py），W15 基準值填入 ga4-weekly-log.md | 總部視窗 | ✅ |
| 2026-04-13 | 修復主網址 404（重新 deploy + alias + vercel domain add，tzlth-resume-diagnosis.vercel.app 恢復）| 總部視窗 | ✅ |
| 2026-04-13 | 修正 page.tsx features card 文案，對齊五維框架（移除 ATS 舊說法）| 總部視窗 | ✅ |
| 2026-04-13 | 停用 Vercel GitHub 自動部署（Ignored Build Step），改為手動 npx vercel --prod | 總部視窗 | ✅ |
| 2026-04-12 | 五維框架對齊品牌方法論（schema/route/DiagnosisReport 全更新，v1.1）| 總部視窗 | ✅ |
| 2026-04-11 | GA4 追蹤啟用（G-DG6PL8E1BG，property 532491434）| 總部視窗 | ✅ |

---
## 總部連結（TZLTH-HQ）
- 系統代號：SYS-03
- 總部路徑：C:\Users\USER\Desktop\tzlth-hq
- HQ 角色：產品變現漏斗的頂端。免費工具建立信任，是諮詢收入的重要引流來源。
- 存檔規定：目前無追蹤機制，建立後每週記錄一次使用數據（觸發事件：週五統計）
- 拉取欄位：使用追蹤檔案（待建立）、最後程式碼修改時間（確認系統有無更新）
---
