@AGENTS.md

# AI 履歷診斷工具 - 操作規則

## 系統定位
這是職涯停看聽的核心產品工具。透過 AI 幫助求職者診斷履歷問題，免費使用 2 次，建立信任後導流至付費諮詢。

## 角色說明
你是這個 Next.js 應用的開發維護者。負責確保診斷功能正常、使用流程順暢、並協助建立使用追蹤機制。

## 技術架構
- Framework：Next.js（版本注意：API 與慣例可能與舊版不同，修改前先讀 AGENTS.md）
- 部署：Vercel
- 路徑：嵌入個人網站 https://tzlth-website.vercel.app/#ai-tool

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

### 每次完成任何修改後，必須執行收尾五件事（順序不可省略）：
0. **git commit + git push 到 GitHub**（shoppy09/resume-diagnosis）→ 修改後 build → push → `npx vercel --prod`
1. **更新本文件「最近修改記錄」**（日期、修改內容、狀態 ✅）← **當場就寫，不等收尾**
2. **更新總部任務清單**：`C:\Users\USER\Desktop\tzlth-hq\dev\tasks.md`（完成項目標 [x] + 完成日期）
3. **更新每日日誌**：`C:\Users\USER\Desktop\tzlth-hq\reports\daily-log.md`
4. **寫入反思日誌**：`C:\Users\USER\Desktop\tzlth-hq\reports\reflection-log.md`（有實質改善價值才寫）

> 未完成收尾五件事 = 任務未完成。修改記錄空白 = 上次沒有收尾。未 push = 儀表板看不到。

### 最近修改記錄

| 日期 | 修改內容 | 執行視窗 | 狀態 |
|------|---------|---------|------|
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
