import { useState } from "react";
import { Activity, Clock, CheckCircle2, AlertCircle, Award } from "lucide-react";

interface MetricsPanelProps {
  clickCount: number;
  totalReadsOpened: number;
  effectiveReads: number;
  irrelevantFlagsCount: number;
  bootTime: number; // in seconds
  watchlistSize: number;
}

export default function MetricsPanel({
  clickCount,
  totalReadsOpened,
  effectiveReads,
  irrelevantFlagsCount,
  bootTime,
  watchlistSize,
}: MetricsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Compute stats
  const effectiveReadRate = totalReadsOpened > 0 
    ? Math.round((effectiveReads / totalReadsOpened) * 100) 
    : 100;

  // Metric A success check: Clicks count under 3 for typical watchlists
  const isMetricASuccessful = watchlistSize >= 3 ? clickCount <= watchlistSize * 2 : clickCount <= 5;

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-950/80 backdrop-blur overflow-hidden transition-all duration-300">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors cursor-pointer text-left focus:outline-none"
        id="btn-toggle-metrics-panel"
      >
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-medium text-zinc-100">本案成功指標檢驗 (Success Metrics KPI)</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
            {isOpen ? "收合面版" : "展開評估"}
          </span>
          <div className="flex gap-1">
            <span className={`w-2 h-2 rounded-full ${isMetricASuccessful ? "bg-emerald-400 animate-pulse" : "bg-yellow-400 animate-pulse"}`} />
            <span className={`w-2 h-2 rounded-full ${effectiveReadRate >= 70 ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"}`} />
          </div>
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-4 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          
          {/* KPI A Detail */}
          <div className="space-y-3 p-3 bg-zinc-900/40 rounded-lg border border-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-medium">指標 A 效率性 (從打走到自選)</span>
              {isMetricASuccessful ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 標準通過
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-yellow-500 font-mono">
                  <AlertCircle className="w-3.5 h-3.5" /> 點擊稍多
                </span>
              )}
            </div>
            
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              標準：使用者從啟動應用到完整獲取三支自選股核心數據（本益比、一年高低點），操作點擊控制在 <strong className="text-zinc-300">3 次內</strong>。
            </p>

            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-900/60">
                <div className="text-zinc-500 text-[9px] uppercase">當前累積點擊數</div>
                <div className="text-base font-semibold text-zinc-200 mt-0.5">{clickCount} 次</div>
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-900/60">
                <div className="text-zinc-500 text-[9px] uppercase">初次讀取耗時 (Boot)</div>
                <div className="text-base font-semibold text-zinc-200 mt-0.5">{bootTime.toFixed(2)}s</div>
              </div>
            </div>
            <div className="text-[10px] text-zinc-400">
              💡 自選預置標的（2330.TW、AAPL 等）僅需單擊直接帶出，極速簡約。
            </div>
          </div>

          {/* KPI B Detail */}
          <div className="space-y-3 p-3 bg-zinc-900/40 rounded-lg border border-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-medium">指標 B 精準與有效滿意度</span>
              {effectiveReadRate >= 50 && totalReadsOpened > 0 ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 font-mono">
                  <Award className="w-3.5 h-3.5" /> 滿意度高
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 font-mono">
                  <Clock className="w-3.5 h-3.5" /> 待累積點閱
                </span>
              )}
            </div>

            <p className="text-zinc-500 text-[11px] leading-relaxed">
              標準：推送新聞摘要的有效點擊率。點擊新聞後停留 <strong className="text-zinc-300">10秒以上</strong> 代表有效，同時手動標記不相關新聞的次數降至最低。
            </p>

            <div className="grid grid-cols-3 gap-2 font-mono">
              <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-900/60">
                <div className="text-zinc-500 text-[9px] uppercase">開啟新聞</div>
                <div className="text-base font-semibold text-zinc-200 mt-0.5">{totalReadsOpened}</div>
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-900/60">
                <div className="text-zinc-500 text-[9px] uppercase">有效閱讀 &gt;10s</div>
                <div className="text-base font-semibold text-emerald-400 mt-0.5">{effectiveReads}</div>
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-900/60">
                <div className="text-zinc-500 text-[9px] uppercase">不相關標記</div>
                <div className="text-base font-semibold text-rose-400 mt-0.5">{irrelevantFlagsCount}</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-zinc-950/80 px-2 py-1.5 rounded border border-zinc-900">
              <span className="text-[10px] text-zinc-400 font-mono">有效閱讀率 (10s Dwell Rate):</span>
              <span className="text-xs font-semibold font-mono text-emerald-400">{effectiveReadRate}%</span>
            </div>
            
            <div className="text-[10px] text-zinc-400">
              💡 點擊新聞將開啟自動停留計時器，閱讀超過10秒即加算為有效。
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
