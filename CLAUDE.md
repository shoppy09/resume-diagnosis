@AGENTS.md

# AI 履歷診斷工具 - 操作規則

## 系統定位
⛔ **已退役（2026-08-13 決議、2026-09-09 technical retirement）**：本專案現在只是 **308 轉址殼**——兩個網域的所有路徑（含 `/api/*`，GET／POST 皆然）都轉到官網。保留它的唯一理由是存量貼文連結不要 404（2026-10-03 更正；退役後全貌與殘留面見 tzlth-hq `projects/SYS-03-ai-resume.md`）。
> 原定位（歷史）：AI 履歷診斷工具，免費 2 次後導流付費諮詢。

## 角色說明
維護轉址殼：確保 `vercel.json` 三條 redirect 持續生效。⛔ 不恢復功能、不新增導流（恢復＝Tim 裁決）。`app/`、`components/`、`lib/` 的程式碼仍在 repo，但線上**任何路徑都到不了**（轉址在函式執行前就發生）。

## 技術架構
- Framework：Next.js（版本注意：API 與慣例可能與舊版不同，修改前先讀 AGENTS.md）
- 部署：Vercel
- ⛔ **2026-09-09 technical retirement 完成：本專案已成為 308 轉址殼，無對外功能**
  - `diagnose.careerssl.com` 與 `resume-diagnosis.vercel.app` **兩域皆 308**（`vercel.json` `redirects` 為專案級非網域級）
  - `/privacy` → `www.careerssl.com/privacy.html`（⚠️ 目標**必須帶 `.html`**：`/privacy` 實測 404）
  - `/burnout` 與 `/(.*)` → `www.careerssl.com/#quiz`
  - ⛔ **不刪專案、不移除網域**：4 則 Threads 存量貼文＋≥6 篇 FB/IG 已發布貼文首則留言仍指向本站，刪除會使它們 404（Tim 2026-09-04 裁決不動存量貼文）
  - ⚠️ **`vercel.json` 不接受自訂頂層鍵**（`_retirement_note` 被 schema 拒絕、部署直接失敗）⇒ WHY 只能寫在本檔與 commit message
  - ⚠️ `GEMINI_API_KEY` 仍在本專案 Vercel、已零消費者：**刻意暫留**保回退零阻力，建議 2026-10-16 後由 Tim 刪除
- ~~官網入口 `www.careerssl.com/#ai-tool`~~ ⛔ **該錨點 2026-08-13 退場時已隨整段 70 行移除**（2026-09-09 實測官網 `id="ai-tool"` 零命中）⇒ 本列原內容 stale 27 天，已更正

## 商業邏輯（⛔ 歷史，已隨退役終止）
~~1. 使用者輸入履歷 → AI 診斷 → 給出建議／2. 免費 2 次：建立信任／3. 第 3 次起：導購付費諮詢服務~~

## 待辦事項
- [x] 建立使用次數追蹤機制 → GA4 已啟用（G-DG6PL8E1BG），scripts/fetch-ga4-weekly.py 自動拉取 ✅ 2026-04-14
- ~~[ ] 追蹤免費→付費轉換率~~ ⛔ 隨退役取消
- ~~[ ] 考慮第三次診斷的付費機制~~ ⛔ 隨退役取消
> 2026-10-03：本 repo 不再維護待辦清單；殘留面的拆除條件見 HQ 說明書 §C

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
| 2026-10-03 | 【DEV】**退役後文件對齊（tzlth-hq 說明書九章化，RCF-187 第 8 份）**：系統定位／角色／商業邏輯／待辦／HQ 連結 5 節改為退役後現況；修改記錄改雙層制。全文見 `CLAUDE-archive-2026-10.md` | tzlth-hq | ✅ |
| 2026-09-24 | 【DEV】新增 `.gitattributes`：文字檔一律以 LF 存入 repo、二進位檔明列不轉換（總部批次:B28／RCF-198 統一推送）。本 repo renormalize 零檔變動（index 原本即全為 LF）；零程式碼改動 | tzlth-hq（批次:B28） | ✅ |
| 2026-09-09 | ⛔ **technical retirement 完成：加 308 轉址三條，本專案成為轉址殼**（tzlth-hq `批次:B5`／`roadmap-diagnosis.md` §二，Tim「執行」＋6 輪 rigor gate）：`/privacy`→官網 `privacy.html`、`/burnout` 與 `/(.*)`→官網 `#quiz`，全 `permanent: true`（308）。**驗收：兩域 × 四路徑 8/8 全 308 且 destination 正確**。🔴 **部署攔下一個查照沒抓到的錯**：我在 `vercel.json` 加了 `_retirement_note` 自訂鍵記錄 WHY——**Vercel schema 拒絕自訂頂層鍵，部署直接失敗**（`should NOT have additional property`）。⇒ 本專案的 `inventory.json` 慣例（`_` 前綴自訂欄位）**不適用於平台 schema 驗證的設定檔**；WHY 改寫在本檔與 commit message。🔴 **另一個 assert 攔下的錯**：加 redirects 時錨點寫 `  "headers": [`（2 空格），但巢狀的 6 空格版**內含它為子字串** ⇒ 命中 2 次、assert 擋下；改用含換行的錨點。⚠️ 目標 URL 經實測修正：官網 `/privacy` **404**、`/privacy.html` **200** ⇒ 若照 roadmap 原文寫 `/privacy` 會製造新 404。 | 總部視窗 | ✅ |
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
- HQ 角色：⛔ 已退役（inventory status＝`retired`）；只承接存量貼文連結
- 存檔規定：無（A-36 GA4 週報自 2026-09-09 停查診斷段）
- 拉取欄位：`curl -sI https://diagnose.careerssl.com/` 應回 308 → `www.careerssl.com/#quiz`（轉址仍生效＝正常）
---
