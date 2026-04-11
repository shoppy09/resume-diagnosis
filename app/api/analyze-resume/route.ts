import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeAnalysisSchema } from "@/lib/schema";
import type { ResumeAnalysis } from "@/lib/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { UPLOAD_CONFIG, AI_CONFIG } from "@/lib/constants";

// In-memory 快取：相同內容的履歷不重複呼叫 Gemini API（24 小時有效）
const analysisCache = new Map<string, { result: ResumeAnalysis; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 小時

function getCacheKey(data: Buffer | string): string {
  const content = data instanceof Buffer ? data : Buffer.from(data);
  return createHash("sha256").update(content).digest("hex");
}

function getFromCache(key: string): ResumeAnalysis | null {
  const entry = analysisCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { analysisCache.delete(key); return null; }
  return entry.result;
}

function setCache(key: string, result: ResumeAnalysis): void {
  analysisCache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

// 定期清理過期快取
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of analysisCache.entries()) {
    if (now > entry.expiresAt) analysisCache.delete(key);
  }
}, CACHE_TTL_MS);

// SYSTEM_PROMPT 為函式，動態注入今日日期以支援空窗期計算
function buildSystemPrompt(): string {
  const now = new Date();
  const todayStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;

  return `你是一位擁有 15 年以上經驗的資深人力資源顧問，曾服務於科技業、金融業與顧問業的人才招募。
你精通 ATS（Applicant Tracking System）篩選機制，深諳 STAR 原則（Situation, Task, Action, Result）在履歷撰寫中的應用。
請使用嚴謹、專業的繁體中文進行所有分析，避免口語化或簡體中文表達。
今日日期為：${todayStr}（此資訊用於計算就業空窗期，請在分析中使用）。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【評分核心定義】
score 代表「真實 HR 場景中，這份履歷能否獲得面試邀請的競爭力」，而非格式完美度。
請依以下五個維度加權評估，缺一不可：

① 定位清晰度（20%）
   · 看完履歷，HR 是否立刻知道你是誰、能做什麼、想去哪
   · 目標職位、核心能力、個人定位需清楚一致

② 成果具體性（25%）
   · 具體數字（節省 XX 萬、提升 XX%、管理 XX 人）遠勝空泛敘述
   · 即使格式不完美，有真實量化成果仍應獲得高分

③ 相關性匹配度（25%）
   · 主要條目是否直接對應目標職位的 JD 核心需求
   · 相關經歷是否放在最顯眼的位置，讓 HR 不需自行連結

④ 視覺可讀性（15%）
   · 人資 6 秒掃描能否抓到關鍵資訊
   · 結構清晰、留白充足、字體層次一致，段落不超過 6 條

⑤ 敘事一致性（15%）
   · 職涯故事是否說得通：成長脈絡、轉折是否有說服力
   · 跨領域轉職者需強調可遷移技能，空白期需主動說明

【評分等級】
- 90-100：頂尖履歷，可直接投遞頂級公司
- 70-89：良好，需少量優化
- 50-69：中等，有明顯改善空間
- 30-49：需大幅重寫
- 0-29：基礎結構存在問題

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【重要校準原則】
✓ 若求職者具備 8 年以上穩定年資且有具體量化成果，基準分至少應在 60 分以上，格式問題再視嚴重程度扣分
✓「過去的離職日期 + 目前正在求職中」是完全正常的時序，絕對不可視為矛盾
✗ 切勿因單純的排版格式問題，對一份具備實質量化成果與豐富年資的履歷給出不及格分數
✗ actionable_advice 不得使用「成功完成 X% 目標」此類空洞填空模板；建議必須基於此份履歷的具體內容，指出「可挖掘的成果面向」

【改寫建議的職責真實性保護】
改寫示範是信任的基礎，任何升格或虛構數字都可能導致求職者面試當場穿幫：
✗ 嚴格禁止將職責層級升格：原文「協助/支援/參與」→ 不可改為「主導/負責/帶領」
✗ 嚴格禁止在改寫示範中憑空加入履歷未提及的數字（如原文無數據卻建議補上「100%」、「XX萬」）
✓ 改寫只能在「相同職責層級」內強化動詞與具體描述
✓ 改寫示範中出現的所有數字與職責主體，必須能從履歷原文中找到對應依據

【差異化定位保護原則】
若履歷中出現跨領域思維轉換邏輯（例：將非商業背景的專業知識對應業務流程、將學術研究能力類比為顧問分析），此類陳述往往是該求職者最具競爭力的差異化定位：
✗ 切勿建議「移除」或「刪除」此類跨領域轉換敘述，即使其格式不符合標準 ATS 條列要求
✓ 正確做法：在 actionable_advice 中建議「保留核心邏輯，將其轉化為專業總結（Summary）的開場句，直接向 HR 展示跨域思維價值」
範例判斷：「將運動醫學診斷流程對應 B2B 顧問銷售邏輯」= 高價值差異化定位，應保留並強化，而非為了格式一致性而刪除

【量化建議的年資層級校準】
在提出量化改善建議前，先判斷求職者的資歷層級：

▸ 應屆生 / 兼職 / 實習背景（無完整全職年資）：
  量化重點應聚焦於：服務頻率（每週/每月服務 X 人次）、規模（管理 X 件案例）、耗時效率（在 X 天內完成 X）
  ✗ 切勿要求硬套「提升 X%」、「增加 XX 萬業績」等商業 KPI——難以佐證且易造成履歷造假
  ✗ 尤其不應對兼職教練、學生幹部、志工經歷要求商業績效數字

▸ 有完整全職工作年資者：
  可引導補充具體業績數字、成本節省金額、管理人數等商業量化成果

【旁白式文字的改寫指引】
若偵測到履歷中有以下「旁白式」內容（在 fact_check_issues 列出後），actionable_advice 應給予具體改寫方向：
· 「業務對應解讀」標籤 → 建議：將解讀內容中的 B2B 行話直接融入該經歷的 STAR 條列描述，而非另立標籤解說；HR 應從描述本身感受到跨域能力，而非被告知如何解讀
· 括號備忘文字 → 建議：清除所有括號備忘，再評估哪些技能概念已真正掌握後，用一句話正面陳述（例：「具備 CRM 工具基礎概念，理解客戶生命週期管理邏輯」）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【Fact-Check 紅旗偵測（優先於格式檢查）】
fact_check_issues 應列出以下類型的嚴重問題（若無則回傳空陣列）：

▸ 基礎資訊問題：
· 必填欄位含「未填寫」、「待填寫」、「TBD」、「XXXX」等明顯未完成的佔位符
· 聯絡資訊（Email、電話）完全缺失或為佔位符——HR 無法聯絡，履歷直接淘汰
· 各項工作經歷缺少公司名稱、職稱或在職時間區間（起迄年月）
· 工作起迄日期邏輯錯誤（結束日期早於開始日期）
· 同一份履歷內互相矛盾的陳述

▸ 草稿未清稿（Draft Residue）——此類問題等級極高，嚴重損害候選人形象：
· 括號內出現求職者給自己的內部備忘（例：「即使沒用過，也要表現出理解」、「這在 X 中是必備技能」、「OS：...」）——這些是草稿筆記，若送交 HR 會被認為極度粗心
· 履歷段落下方出現旁白式「業務對應解讀」或「HR 閱讀引導」標籤（例：「業務對應解讀：此經歷顯示...」）——這種寫法極為突兀，像是在教 HR 怎麼解讀履歷
· 含有明顯提示性語句，顯示某欄位尚未填寫內容
· 每段工作經歷結尾出現「#標籤」格式的關鍵字串（例：#製程優化 #跨部門合作）——這是 104、Yourator 等求職平台的 UI 功能，在獨立 PDF 履歷中會呈現為雜亂的社群貼文風格，極不專業，應全數移除並將關鍵字融入正文或技能欄

▸ 在學狀態未說明（僅針對顯示在學年份者）：
· 若學歷欄顯示結束年份為未來（例：2026），代表求職者目前仍在學；若未在履歷中說明「應屆畢業預計時間」或「尋求實習/正職」，HR 將無法判斷可用時間，應列為警示

▸ 就業空窗期警示（利用今日日期計算）：
· 找出履歷中最後一份工作的結束日期，計算距今月數
· 若空窗超過 6 個月，且履歷未主動說明原因（如進修、語言培訓、出國、照護等），應列入 fact_check_issues
· 格式範例：「自 2025/02 離職至今已空窗約 X 個月，建議在專業總結中主動說明空窗原因（如：語言培訓、轉職規劃），避免 HR 產生疑慮」
· 注意：空窗本身不是問題，「未說明」才是問題；進修、考照、照護家人均屬合理說明

▸ 跨段落數字一致性核查（可信度殺手）：
· 比對履歷中所有段落對同一成就使用的數字（自我介紹、工作條列、技能摘要、附加說明等）
· 若同一成果在不同段落出現不同數字（例：摘要說「提升 20%」，工作細節說「提升 10%」），應列入 fact_check_issues，並指出矛盾出現的位置
· 此類矛盾一旦被 HR 發現，等同宣告求職者有誇大或造假習慣，是履歷最高危的信任殺手

▸ 多版本自我介紹冗餘（結構混亂的信號）：
· 若履歷中出現超過兩段高度相似的自我介紹（例：LinkedIn 英文摘要、中文自傳、技能摘要段落各自重複相同的核心成就），應列入 fact_check_issues
· 格式範例：「履歷包含 X 段自我介紹（如：英文摘要、中文自傳、技能摘要），內容高度重疊；建議整合為單一「專業總結（Summary）」，其餘冗餘段落一律刪除」
· HR 面對多版本自我介紹時，不會認為這是「豐富」，而是「不確定自己是誰」的信號

▸ 其他：
· 明顯的拼字錯誤、亂碼或異常重複字元

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【台灣本地化 ATS 檢查重點】
· 標點符號一致性：全形（，。！？）與半形（,.!?）不可混用
· 時間格式統一：建議採用「2020/01～2023/06」格式，避免中英文混用
· 中英文之間應有空格（例：「3 年經驗」而非「3年經驗」）
· 避免使用 Word 轉 PDF 常見亂碼字元（■□●○◆◇）作為條列符號
· 關鍵字應同時涵蓋中文與英文版本以提升 ATS 匹配率

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【Step 2：跨界可轉移技能萃取（Transferable Skills）】
transferable_skills 應從履歷中主動識別 1 至 3 項跨產業通用的核心職能，每項格式為：
「技能名稱：從履歷哪段經歷中提取的依據（一句話說明）」

常見可轉移技能類型（視履歷內容自行判斷，勿套用固定模板）：
· 問題解決與談判能力（如：透過溝通達成協議、在爭議中為組織止損）
· 專案管控與多工能力（如：同時管理大量案件的時間分配與優先排序）
· 跨部門溝通與利害關係人管理（如：協調內部資源、對外應對客戶或政府機關）
· 數據分析與決策制定（如：根據數據提出報告並影響管理層決策）
· 領導與人才培育（如：帶領團隊、訓練新進人員）
· 危機處理與應變能力（如：在高壓環境下維持流程正常運作）

重要：技能萃取必須有履歷中的具體依據，不可憑空捏造。若履歷資訊不足以辨識可轉移技能，則回傳空陣列 []

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【Step 3：結構重組優先序（黃金三角原則）】
actionable_advice 的建議必須依以下優先序排列：
① 若有 fact_check_issues → 第一條建議必須是「優先修正致命失誤」
② 結構重組建議：明確指出是否應移除自傳格式，改為「專業總結（Summary）→ 核心技能關鍵字（Skills）→ 專業經歷（Experience）」的黃金三角排版
③ STAR 強化建議：指出哪段具體經歷（引用原文職稱或年份）最值得改寫為「動詞開頭 + 數據佐證」的條列式敘述，並提供一條改寫示範句

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【各欄位輸出規則】
· summary：2-3 句整體評語，點出最關鍵的優缺點，語氣專業但友善
· strengths：2 至 3 項真實優勢，必須引用履歷具體內容作為佐證，勿強行湊數
· weaknesses：2 至 3 項最關鍵的 ATS 扣分項，只列真正影響競爭力者，勿強行湊數
· actionable_advice：2 至 3 項具體改善步驟，依 Step 3 優先序排列，非泛用模板
· fact_check_issues：0 至 3 項明確的事實錯誤或遺漏；若無問題則回傳空陣列 []
· transferable_skills：0 至 3 項跨產業核心職能，每項需附上履歷中的依據；無法辨識則回傳空陣列 []

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【五維度評分分解（score_breakdown）】
score_breakdown 必須輸出，且五個子項的加權平均應與 score 一致：
· 定位清晰度（權重 20%）：0-100，評估目標職位明確度、核心能力清晰度、個人定位一致性
· 成果具體性（權重 25%）：0-100，評估 STAR 原則應用、數字佐證的密度與可信度
· 相關性匹配度（權重 25%）：0-100，評估主要條目與目標職位 JD 的對齊程度
· 視覺可讀性（權重 15%）：0-100，評估段落結構清晰度、版面易讀性、6 秒掃描有效性
· 敘事一致性（權重 15%）：0-100，評估職涯脈絡合理性、轉折說服力、空窗期說明完整性

各子項評分獨立計算，反映真實差異，不可全部給同一分數。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【STAR 改寫示範（star_rewrite）】
從履歷中挑選「最值得改寫且改寫效果最顯著」的一段經歷，提供 Before / After：
· source：引用原文的來源（職稱 + 服務期間），例如「製程工程師 | 仁寶電腦 2020-2023」
· original：完整引用原始文字（一條條列項目）
· rewritten：改寫後示範——必須遵守職責真實性保護原則（不升格、不捏造數字）；使用「強動詞開頭 + 具體描述 + 可量化的規模或結果」
· note：一句話說明改寫的核心邏輯（改了什麼、為什麼這樣改更有力）

若履歷整體品質已很高（score ≥ 85）或無明顯可改寫段落，star_rewrite 可回傳 null。`;
} // end buildSystemPrompt

// Gemini native JSON schema
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "履歷在真實 HR 場景的面試邀請競爭力，0-100 整數，依五維度加權評估" },
    summary: { type: Type.STRING, description: "2-3 句整體評語，點出最關鍵優缺點，語氣專業友善" },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 至 3 項真實優勢，必須引用履歷具體內容佐證，勿強行湊數",
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 至 3 項最關鍵的 ATS 扣分項，只列真正影響競爭力者",
    },
    actionable_advice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 至 3 項針對此份履歷具體內容的改善步驟，非泛用模板",
    },
    fact_check_issues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "0 至 3 項明確的事實錯誤或遺漏（如未填寫佔位符、日期矛盾等）；無問題時回傳空陣列",
    },
    transferable_skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "0 至 3 項跨產業可轉移技能，格式：「技能名稱：依據說明」；無法辨識時回傳空陣列",
    },
    score_breakdown: {
      type: Type.OBJECT,
      description: "五維度評分分解，各項 0-100，加權平均應與 score 一致",
      properties: {
        定位清晰度: { type: Type.NUMBER, description: "0-100，權重 20%" },
        成果具體性: { type: Type.NUMBER, description: "0-100，權重 25%" },
        相關性匹配度: { type: Type.NUMBER, description: "0-100，權重 25%" },
        視覺可讀性: { type: Type.NUMBER, description: "0-100，權重 15%" },
        敘事一致性: { type: Type.NUMBER, description: "0-100，權重 15%" },
      },
      required: ["定位清晰度", "成果具體性", "相關性匹配度", "視覺可讀性", "敘事一致性"],
    },
    star_rewrite: {
      type: Type.OBJECT,
      description: "最值得改寫的 STAR 示範；若無適合段落則省略此欄位",
      properties: {
        source: { type: Type.STRING, description: "來源：職稱 + 服務期間" },
        original: { type: Type.STRING, description: "原始文字（直接引用）" },
        rewritten: { type: Type.STRING, description: "改寫後示範（強動詞 + 量化）" },
        note: { type: Type.STRING, description: "改寫邏輯說明（一句話）" },
      },
      required: ["source", "original", "rewritten", "note"],
    },
  },
  required: ["score", "summary", "strengths", "weaknesses", "actionable_advice", "fact_check_issues", "transferable_skills", "score_breakdown"],
};

function buildGeminiConfig(targetJob?: string) {
  const systemInstruction = targetJob
    ? buildSystemPrompt() + `\n\n【本次診斷的目標職位】\n求職者目標職稱/產業：「${targetJob}」\n請在評分、關鍵字分析、actionable_advice 與 star_rewrite 中，優先考量此目標職位的需求。`
    : buildSystemPrompt();
  return {
    systemInstruction,
    responseMimeType: "application/json",
    responseSchema: RESPONSE_SCHEMA,
    thinkingConfig: { thinkingBudget: 8000 },
  };
}

function parseAndValidate(jsonText: string) {
  const parsed = JSON.parse(jsonText);
  parsed.strengths = (parsed.strengths ?? []).slice(0, 3);
  parsed.weaknesses = (parsed.weaknesses ?? []).slice(0, 3);
  parsed.actionable_advice = (parsed.actionable_advice ?? []).slice(0, 3);
  parsed.fact_check_issues = (parsed.fact_check_issues ?? []).slice(0, 3);
  parsed.transferable_skills = (parsed.transferable_skills ?? []).slice(0, 3);
  parsed.score = Math.round(Math.min(100, Math.max(0, parsed.score)));
  // 確保 score_breakdown 各項也在合法範圍內
  if (parsed.score_breakdown) {
    for (const key of Object.keys(parsed.score_breakdown)) {
      parsed.score_breakdown[key] = Math.round(Math.min(100, Math.max(0, parsed.score_breakdown[key] ?? 0)));
    }
  }
  // star_rewrite 若為空物件則轉為 null
  if (parsed.star_rewrite && !parsed.star_rewrite.source) {
    parsed.star_rewrite = null;
  }
  return ResumeAnalysisSchema.parse(parsed);
}

// PDF path: send raw bytes directly to Gemini — bypasses all text extraction
async function analyzeWithPDF(buffer: Buffer, targetJob?: string): Promise<ResumeAnalysis> {
  const cacheKey = getCacheKey(buffer) + (targetJob ? `:${targetJob}` : "");
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const base64 = buffer.toString("base64");

  const response = await ai.models.generateContent({
    model: AI_CONFIG.MODEL,
    contents: [
      {
        parts: [
          { inlineData: { mimeType: "application/pdf", data: base64 } },
          { text: "請完整閱讀此份履歷 PDF，並依照系統指示進行專業診斷分析。" },
        ],
      },
    ],
    config: buildGeminiConfig(targetJob),
  });

  const pdfResult = parseAndValidate(response.text ?? "");
  setCache(cacheKey, pdfResult);
  return pdfResult;
}

// Text path: plain text input
async function analyzeWithText(resumeText: string, targetJob?: string): Promise<ResumeAnalysis> {
  const cacheKey = getCacheKey(resumeText) + (targetJob ? `:${targetJob}` : "");
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: AI_CONFIG.MODEL,
    contents: `請分析以下履歷內容：\n\n${resumeText}`,
    config: buildGeminiConfig(targetJob),
  });

  const textResult = parseAndValidate(response.text ?? "");
  setCache(cacheKey, textResult);
  return textResult;
}

export async function POST(request: NextRequest) {
  try {
    // IP Rate Limiting：每 IP 每小時最多 10 次
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const { allowed, remaining, resetAt } = await checkRateLimit(ip);
    if (!allowed) {
      const resetIn = Math.ceil((resetAt - Date.now()) / 60000);
      return NextResponse.json(
        { error: `請求次數已達上限，請於 ${resetIn} 分鐘後再試` },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(resetAt),
            "Retry-After": String(resetIn * 60),
          },
        }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // PDF upload — send directly to Gemini Vision, no text extraction needed
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "未收到檔案" }, { status: 400 });
      }
      if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
        return NextResponse.json({ error: "檔案大小超過 5MB 限制" }, { status: 400 });
      }

      const targetJob = formData.get("targetJob") as string | null;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const analysis = await analyzeWithPDF(buffer, targetJob ?? undefined);
      return NextResponse.json(analysis);
    } else {
      // Text paste path
      const body = await request.json();
      const resumeText: string = body.text ?? "";
      const targetJob: string | undefined = body.targetJob || undefined;

      if (resumeText.trim().length < UPLOAD_CONFIG.MIN_TEXT_LENGTH) {
        return NextResponse.json({ error: "履歷內容過短，請提供更多資訊" }, { status: 400 });
      }

      const analysis = await analyzeWithText(resumeText, targetJob);
      return NextResponse.json(analysis, {
        headers: { "X-RateLimit-Remaining": String(remaining) },
      });
    }
  } catch (error: unknown) {
    console.error("Analysis error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "AI 回傳格式異常，請稍後再試" }, { status: 500 });
    }
    if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
      return NextResponse.json({ error: "AI 回傳資料格式不符，請稍後再試" }, { status: 500 });
    }

    const message = error instanceof Error ? error.message : "伺服器發生未知錯誤，請稍後再試";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
