export function AnalysisSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Score bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-slate-200 rounded-md" />
          <div className="h-10 w-20 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-3 w-full bg-slate-200 rounded-full" />
        <div className="h-4 w-3/4 bg-slate-200 rounded-md mt-4" />
        <div className="h-4 w-1/2 bg-slate-200 rounded-md mt-2" />
      </div>

      {/* Radar animation */}
      <div className="flex flex-col items-center py-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
        <p className="mt-4 text-sm text-slate-500 animate-pulse">AI 正在掃描您的履歷...</p>
      </div>

      {/* Cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-5 w-24 bg-slate-200 rounded-md mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex gap-3">
                <div className="h-4 w-4 bg-slate-200 rounded-full mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-full bg-slate-200 rounded-md" />
                  <div className="h-4 w-4/5 bg-slate-200 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
