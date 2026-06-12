import { useState, useEffect } from "react";
import { StrongStock } from "../types";
import { Sparkles, ArrowUpRight, Plus, Check, Loader2, Compass, BookmarkPlus } from "lucide-react";

interface AiStrongStocksPanelProps {
  onSelectStock: (symbol: string) => void;
  onAddToWatchlist: (symbol: string, name: string) => void;
  watchlistSymbols: string[];
}

export default function AiStrongStocksPanel({ 
  onSelectStock, 
  onAddToWatchlist, 
  watchlistSymbols 
}: AiStrongStocksPanelProps) {
  const [strongStocks, setStrongStocks] = useState<StrongStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStrong() {
      try {
        const res = await fetch("/api/stocks/strong-momentum");
        if (res.ok) {
          const data = await res.json();
          setStrongStocks(data);
        }
      } catch (err) {
        console.error("Failed loading strong stocks list:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStrong();

    const interval = setInterval(fetchStrong, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4 animate-pulse">
        <div className="flex items-center gap-2 border-b border-[#30363D] pb-3">
          <Sparkles className="w-4.5 h-4.5 text-violet-400 animate-pulse" />
          <div className="h-4 bg-zinc-800 rounded w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-zinc-800 p-3 rounded-lg space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
              <div className="h-2 bg-zinc-800 rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4 shadow-lg relative overflow-hidden" id="ai-strong-stocks-panel">
      {/* Visual Accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 via-[#58A6FF] to-violet-500" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363D] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 px-1.5 rounded bg-violet-500/10 border border-violet-500/20">
            <Sparkles className="w-4.5 h-4.5 text-violet-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-widest flex items-center gap-1.5">
              AI 聯網搜羅 • 本週強勢突破股
            </h4>
            <p className="text-[10px] text-zinc-500">
              整合全網 AI 演算搜尋最近營收、法人買超、題材動向爆發之強勢標的
            </p>
          </div>
        </div>
        <div className="text-[9px] font-mono text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded border border-violet-500/20 uppercase tracking-wider self-start sm:self-center">
          MOMENTUM RADAR
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {strongStocks.map((stock) => {
          const isAdded = watchlistSymbols.includes(stock.symbol.toUpperCase());
          return (
            <div 
              key={stock.symbol}
              className="bg-[#0D1117] border border-[#30363D]/80 hover:border-violet-500/40 rounded-xl p-4.5 flex flex-col justify-between transition-all hover:translate-y-[-1px] relative group"
            >
              <div className="space-y-2.5">
                {/* Symbol, Category & Return Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      onClick={() => onSelectStock(stock.symbol)}
                      className="font-mono text-xs font-bold text-zinc-100 hover:text-[#58A6FF] cursor-pointer bg-[#30363D]/40 px-2 py-0.5 rounded border border-[#30363D]"
                    >
                      {stock.symbol}
                    </span>
                    <span className="text-[9.5px] text-zinc-500 font-sans">
                      {stock.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.5 flex items-center gap-0.5">
                    {stock.recentGain}
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Company Name & Detailed Reason */}
                <div>
                  <h5 
                    onClick={() => onSelectStock(stock.symbol)}
                    className="text-xs font-bold text-zinc-200 hover:text-[#58A6FF] cursor-pointer mb-1 transition-colors"
                  >
                    {stock.name}
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">
                    {stock.reason}
                  </p>
                </div>
              </div>

              {/* Catalyst & Quick Watchlist Action */}
              <div className="border-t border-[#30363D]/60 pt-3 mt-3.5 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] text-zinc-500 block uppercase font-mono tracking-wider">最近上漲催化劑</span>
                  <p className="text-[10px] text-violet-300 font-sans truncate" title={stock.catalyst}>
                    ✦ {stock.catalyst}
                  </p>
                </div>

                <button
                  onClick={() => onAddToWatchlist(stock.symbol, stock.name)}
                  type="button"
                  disabled={isAdded}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isAdded
                      ? "bg-[#21262D]/40 border-emerald-500/30 text-emerald-400 cursor-not-allowed"
                      : "bg-[#21262D] border-[#30363D] text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#30363D]"
                  }`}
                  title={isAdded ? "已在觀察清單" : "加入觀察清單"}
                >
                  {isAdded ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <BookmarkPlus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-violet-400" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
