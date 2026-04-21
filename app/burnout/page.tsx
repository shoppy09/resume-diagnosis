'use client'
import { useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

const QUESTIONS = [
  '早上準備去上班，會有明顯的抗拒感或疲憊感？',
  '工作中遇到小挫折，比以前更難恢復？',
  '你對現在的工作內容感到無聊或沒有意義？',
  '你覺得自己的付出和回報（薪資/認可/成就感）嚴重不成比例？',
  '下班後你很難「關掉」工作模式，但也沒辦法真正投入工作？',
]
const OPTIONS = ['從不', '偶爾', '有時', '常常', '幾乎總是']

const colorMap: Record<string, string> = {
  green:  'bg-green-50 border-green-200 text-green-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  red:    'bg-red-50 border-red-200 text-red-700',
}
const ctaMap: Record<string, string> = {
  green:  'bg-blue-600 hover:bg-blue-700',
  yellow: 'bg-amber-500 hover:bg-amber-600',
  red:    'bg-red-600 hover:bg-red-700',
}

const RESULTS = {
  low: {
    label: '目前還在穩定區', color: 'green',
    desc: '現在的狀態是疲憊，但還沒到倦怠。方向問題比倦怠更值得先解決。',
    reasons: ['工作節奏稍快但尚可調節', '對現職仍有部分認同感', '近期壓力集中，非長期累積'],
    cta_text: '方向問題比倦怠更值得先釐清 →',
    cta_link: '/', cta_sub: '試試 AI 履歷診斷',
  },
  mid: {
    label: '累積性疲勞，需要關注', color: 'yellow',
    desc: '還沒到倦怠臨界點，但訊號已出現。建議找出根源，避免累積到爆點。',
    reasons: ['付出與回報的落差感正在累積', '工作意義感逐漸下降', '身心已出現疲勞訊號'],
    cta_text: '累積到爆點之前先聊聊 →',
    cta_link: 'https://booking.careerssl.com', cta_sub: '30 分鐘方向釐清諮詢 NT$600',
  },
  high: {
    label: '倦怠指數偏高', color: 'red',
    desc: '需要認真討論是策略問題還是環境問題。繼續撐下去通常不是解法。',
    reasons: ['工作已嚴重消耗能量', '動機與投入感明顯下滑', '需要從外部視角釐清處境'],
    cta_text: '這個狀況需要認真討論 →',
    cta_link: 'https://booking.careerssl.com', cta_sub: '預約職涯諮詢',
  },
}

export default function BurnoutPage() {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(5).fill(null))
  const [submitted, setSubmitted] = useState(false)

  const score = answers.reduce<number>((s, v) => s + (v ?? 0), 0)
  const level: 'low' | 'mid' | 'high' = score <= 7 ? 'low' : score <= 14 ? 'mid' : 'high'
  const result = RESULTS[level]
  const allAnswered = answers.every(v => v !== null)

  const handleSubmit = () => {
    if (!allAnswered) return
    setSubmitted(true)
    trackEvent({ name: 'burnout_completed', params: { score, result_level: level } })
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto px-4 py-10 space-y-8">
        <div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">← 回 AI 履歷診斷</Link>
          <h1 className="text-2xl font-bold text-slate-800 mt-4">職業倦怠快測</h1>
          <p className="text-slate-500 mt-1 text-sm">5 題，約 2 分鐘｜診斷你是「累了」還是「倦怠了」</p>
        </div>
        {!submitted ? (
          <div className="space-y-6">
            {QUESTIONS.map((q, qi) => (
              <div key={qi} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <p className="text-sm font-medium text-slate-700 mb-3">Q{qi + 1}｜{q}</p>
                <div className="flex gap-2 flex-wrap">
                  {OPTIONS.map((opt, oi) => (
                    <button key={oi}
                      onClick={() => { const next = [...answers]; next[qi] = oi; setAnswers(next) }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${answers[qi] === oi ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}
                    >{opt}</button>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={handleSubmit} disabled={!allAnswered}
              className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              查看我的倦怠指數
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className={`rounded-2xl border p-6 ${colorMap[result.color]}`}>
              <p className="text-xs font-medium mb-1">倦怠指數 {score} / 20</p>
              <h2 className="text-xl font-bold mb-2">{result.label}</h2>
              <p className="text-sm">{result.desc}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-3">可能的原因</p>
              <ul className="space-y-2">
                {result.reasons.map((r, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2"><span className="text-slate-400">·</span>{r}</li>
                ))}
              </ul>
            </div>
            <a href={result.cta_link}
              target={result.cta_link.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`flex flex-col items-start gap-0.5 rounded-2xl p-5 text-white transition-all ${ctaMap[result.color]}`}>
              <span className="font-semibold text-sm">{result.cta_text}</span>
              <span className="text-xs opacity-80">{result.cta_sub}</span>
            </a>
            <button onClick={() => { setAnswers(Array(5).fill(null)); setSubmitted(false) }}
              className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-2">
              ← 重新作答
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
