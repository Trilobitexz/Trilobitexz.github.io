import { StockAnalysis, StockQuote, ColorConvention } from "../types";
import { Sparkles, ShieldCheck, AlertTriangle, ExternalLink, FileText, Bot, HelpCircle, Activity, Crosshair, BarChart2 } from "lucide-react";

interface AiAnalysisPanelProps {
  quote: StockQuote;
  analysis: StockAnalysis | null;
  isLoading: boolean;
  colorConvention: ColorConvention;
}

export default function AiAnalysisPanel({ quote, analysis, isLoading, colorConvention }: AiAnalysisPanelProps) {
  const isUp = quote.change >= 0;
  
  // Theme coloring match
  const focusColor = quote.change === 0 
    ? "text-zinc-400" 
    : colorConvention === "taiwan"
      ? isUp ? "text-rose-400" : "text-emerald-400"
      : isUp ? "text-emerald-400" : "text-rose-400";

  if (isLoading) {
    return (
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4 animate-pulse">
        <div className="flex items-center gap-2 border-b border-[#30363D] pb-3">
          <Bot className="w-5 h-5 text-[#58A6FF] animate-spin" />
          <div className="h-4 bg-zinc-800 rounded w-1/3" />
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-zinc-800 rounded w-full" />
          <div className="h-3 bg-zinc-800 rounded w-5/6" />
          <div className="h-3 bg-zinc-800 rounded w-4/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="border border-zinc-800 p-3 rounded-lg space-y-2">
            <div className="h-3 bg-zinc-800 rounded w-1/2" />
            <div className="h-2 bg-zinc-800 rounded w-5/6" />
          </div>
          <div className="border border-zinc-800 p-3 rounded-lg space-y-2">
            <div className="h-3 bg-zinc-800 rounded w-1/2" />
            <div className="h-2 bg-zinc-800 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 text-center text-zinc-500 italic flex flex-col items-center justify-center gap-2">
        <Bot className="w-8 h-8 text-[#8B949E] opacity-60" />
        <p className="text-xs">無法讀取 {quote.displayName} 的 AI 搜尋分析資料</p>
        <p className="text-[11px] text-[#8B949E]">請確認網際網路連線或嘗試切換其他股票。</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-5 shadow-lg relative overflow-hidden" id={`ai-analysis-panel-${quote.symbol.replace(".", "-")}`}>
        {/* Visual Accent glow line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500/80 via-[#58A6FF]/80 to-emerald-500/80" />

        {/* Header with AI Meta Info and Fundamental Score */}
        <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
          <div className="flex items-center gap-3 border-r border-[#30363D] pr-4">
            <div className="p-1 px-1.5 rounded bg-gradient-to-br from-[#58A6FF]/20 to-violet-500/20 border border-[#58A6FF]/30">
              <Sparkles className="w-5 h-5 text-[#58A6FF]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-widest flex items-center gap-1.5">
                AI 深度透視分析
              </h4>
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:block mt-0.5">
                整合 Search 搜尋最新法說會與動能動態
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {analysis.fundamentalScore !== undefined && (
              <div className="flex flex-col items-center">
                <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">綜合評分</div>
                <div className={`text-xl font-bold font-mono ${analysis.fundamentalScore >= 7 ? "text-emerald-400" : analysis.fundamentalScore <= 4 ? "text-rose-400" : "text-yellow-400"}`}>
                  {analysis.fundamentalScore.toFixed(1)}
                  <span className="text-[10px] text-zinc-600 ml-0.5">/10</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-1 bg-[#10141B] border border-[#30363D] text-[9.5px] text-emerald-400 font-mono px-2 py-0.5 rounded ml-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span>REAL-TIME</span>
            </div>
          </div>
        </div>

        {/* Grid: 3 Segments */}
        <div className="space-y-4">
          
          {/* 1. 近期重大事件分析 */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#58A6FF]" />
              基本面大事件與最新營收動能
            </h5>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0">
              {analysis.recentDevelopments.map((pt, idx) => (
                <li 
                  key={idx} 
                  className="bg-[#010409]/40 border border-[#30363D]/60 p-3 rounded-lg text-xs leading-relaxed text-zinc-300 relative pl-7 before:absolute before:left-3 before:top-3.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#58A6FF]"
                >
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* 2. 多空利弊/催化劑與風險的二元分拆 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths (多頭動能) */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold border-b border-emerald-500/10 pb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>多頭看漲催化劑 (Catalysts)</span>
              </div>
              <ul className="space-y-1.5 pl-0 pr-1">
                {analysis.strengths.map((pt, idx) => (
                  <li key={idx} className="text-[11.5px] text-zinc-300 leading-relaxed list-none relative pl-4 before:content-['✓'] before:absolute before:left-0 before:text-emerald-400 before:font-bold">
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks (空頭壓力) */}
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold border-b border-rose-500/10 pb-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>空頭防守風險 (Risks)</span>
              </div>
              <ul className="space-y-1.5 pl-0 pr-1">
                {analysis.risks.map((pt, idx) => (
                  <li key={idx} className="text-[11.5px] text-zinc-300 leading-relaxed list-none relative pl-4 before:content-['⚠'] before:absolute before:left-0 before:text-rose-400 before:font-bold">
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. 技術面與籌碼面近期展望 */}
          {analysis.technicalOutlook && analysis.technicalOutlook.length > 0 && (
            <div className="bg-[#010409]/60 border border-violet-500/20 rounded-xl p-3.5 space-y-2.5">
              <h5 className="text-xs font-bold text-violet-400 flex items-center gap-1.5 border-b border-violet-500/10 pb-1.5">
                <Crosshair className="w-4 h-4" />
                技術面與籌碼面綜合展望
              </h5>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-0">
                {analysis.technicalOutlook.map((pt, idx) => (
                  <li key={idx} className="text-[11.5px] text-zinc-300 leading-relaxed list-none relative pl-4 before:content-['⚬'] before:absolute before:left-0 before:text-violet-400">
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. Analyst Wave Perspective Summary */}
          <div className="bg-[#10141B] border border-[#30363D] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold">
              <BarChart2 className="w-4 h-4 text-emerald-500" />
              <span>專業投資分析師展望總評</span>
              <span className="text-[10px] font-normal text-zinc-500">(僅供波段決策參考，非買賣建議)</span>
            </div>
            <p className="text-[12px] leading-relaxed text-zinc-200">
              {analysis.analystSummary}
            </p>
          </div>

          {/* 5. Grounding references */}
          {analysis.sourceLinks && analysis.sourceLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500 border-t border-[#30363D]/60 pt-3">
              <span className="font-semibold text-zinc-400 flex items-center gap-1 font-mono">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                搜尋參照來源：
              </span>
              {analysis.sourceLinks.map((link, idx) => (
                <a 
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#58A6FF] hover:underline flex items-center gap-0.5"
                >
                  {link.title}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
