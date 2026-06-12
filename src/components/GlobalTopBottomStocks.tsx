import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Check, BookmarkPlus, RefreshCw } from "lucide-react";

interface GlobalTopBottomStocksProps {
  onSelectStock: (symbol: string) => void;
  onAddToWatchlist: (symbol: string, name: string) => void;
  watchlistSymbols: string[];
  colorConvention: "taiwan" | "us";
}

interface RankedStock {
  symbol: string;
  name: string;
  price: string;
  changePercent: number;
  changePercentStr: string;
  country?: string;
  change?: string;
  changeStr?: string;
  volume?: number;
  value?: number;
}

export default function GlobalTopBottomStocks({
  onSelectStock,
  onAddToWatchlist,
  watchlistSymbols,
  colorConvention,
}: GlobalTopBottomStocksProps) {
  const [topGainers, setTopGainers] = useState<RankedStock[]>([]);
  const [bottomLosers, setBottomLosers] = useState<RankedStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRankings = async (showLoading: boolean = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetch("/api/stocks/global-rankings");
      if (response.ok) {
        const data = await response.json();
        setTopGainers(data.topGainers || []);
        setBottomLosers(data.bottomLosers || []);
      }
    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings(true);
    // Poll every 60s
    const interval = setInterval(() => fetchRankings(false), 60000);
    return () => clearInterval(interval);
  }, []);

  const upColor = colorConvention === "taiwan" ? "text-rose-400" : "text-emerald-400";
  const upBorderColor = colorConvention === "taiwan" ? "border-rose-500/20" : "border-emerald-500/20";
  const downColor = colorConvention === "taiwan" ? "text-emerald-400" : "text-red-400";
  const downBorderColor = colorConvention === "taiwan" ? "border-emerald-500/20" : "border-red-500/20";

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4 shadow-lg h-full relative mt-6" id="global-top-bottom">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#30363D] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 px-1.5 rounded bg-amber-500/10 border border-amber-500/20">
            <TrendingUp className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-widest flex items-center gap-1.5">
              美日韓(前 100)綜合縮影與漲跌幅極端排行 (中文顯示)
            </h4>
            <p className="text-[10px] text-zinc-500">
              即時追蹤美股、日股、韓股權值與熱門個股，查看當日漲跌幅表現兩極端的熱門標的
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchRankings(true)}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-[#8B949E] border border-transparent hover:border-[#30363D] hover:bg-[#30363D]/20 px-2 py-1 rounded text-[10px] hover:text-[#C9D1D9] uppercase font-bold tracking-wider transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-500" : ""}`} />
          刷新排名
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Gainers */}
        <div className="space-y-3">
          <h5 className={`text-[11px] font-mono tracking-widest ${upColor} border-b ${upBorderColor} pb-1 mb-2`}>TOP 100 GAINERS</h5>
          <div className="border border-[#30363D] rounded-lg overflow-hidden bg-[#0D1117] relative">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs text-[#C9D1D9] whitespace-nowrap">
                <thead className="sticky top-0 bg-[#0D1117] border-b border-[#30363D] z-10">
                  <tr className="text-[10px] text-zinc-500 font-mono uppercase">
                    <th className="px-3 py-2 font-medium">排行</th>
                    <th className="px-3 py-2 font-medium">代碼/市場/中文簡稱</th>
                    <th className="px-3 py-2 font-medium text-right">股價</th>
                    <th className="px-3 py-2 font-medium text-right">漲跌</th>
                    <th className={`px-3 py-2 font-medium text-right ${upColor}`}>漲幅</th>
                    <th className="px-3 py-2 font-medium text-right">成交量</th>
                    <th className="px-3 py-2 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D]/40">
                  {topGainers.map((stock, i) => {
                    const isAdded = watchlistSymbols.includes(stock.symbol.toUpperCase());
                    return (
                      <tr key={stock.symbol} className="hover:bg-[#161B22] transition-colors group">
                        <td className="px-3 py-2.5 font-mono text-zinc-500">{i + 1}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-12 shrink-0">
                              <button
                                onClick={() => onSelectStock(stock.symbol)}
                                type="button"
                                className="font-mono text-[10px] font-bold text-amber-500 hover:underline bg-amber-500/5 hover:bg-amber-500/10 px-1 py-0.5 rounded cursor-pointer w-full text-left truncate"
                                title={stock.symbol.split('.')[0]}
                              >
                                {stock.symbol.split('.')[0]}
                              </button>
                            </div>
                            <div className="w-8 shrink-0 flex justify-center">
                              {stock.country && (
                                <span className={`text-[9px] px-1 py-0.5 rounded font-bold shrink-0 select-none ${
                                  stock.country === '美國' 
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                                    : stock.country === '日本' 
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/15'
                                }`}>
                                  {stock.country}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span 
                                onClick={() => onSelectStock(stock.symbol)}
                                className="font-bold text-zinc-200 group-hover:text-amber-500 cursor-pointer transition-colors text-[11px] leading-tight block truncate"
                                title={stock.name}
                              >
                                {stock.name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono">{stock.price}</td>
                        <td className={`px-3 py-2.5 text-right font-mono ${stock.changePercent > 0 ? upColor : downColor}`}>{stock.changeStr || '-'}</td>
                        <td className="px-3 py-2.5 text-right font-mono">
                          <div className={`inline-block px-1.5 py-0.5 rounded font-bold ${
                            stock.changePercent >= 9.8 
                              ? (colorConvention === 'taiwan' ? 'bg-rose-500 text-[#010409]' : 'bg-emerald-500 text-[#010409]') 
                              : stock.changePercent <= -9.8 
                                ? (colorConvention === 'taiwan' ? 'bg-emerald-500 text-[#010409]' : 'bg-rose-500 text-[#010409]')
                                : (stock.changePercent > 0 ? upColor : downColor)
                          }`}>
                            {stock.changePercentStr}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-zinc-400">
                          {stock.volume ? (stock.volume > 1000000 ? (stock.volume/1000000).toFixed(1) + 'M' : stock.volume.toLocaleString()) : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => onAddToWatchlist(stock.symbol, stock.name)}
                            type="button"
                            disabled={isAdded}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              isAdded
                                ? "text-emerald-400 cursor-not-allowed"
                                : "text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#30363D]"
                            }`}
                          >
                            {isAdded ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Losers */}
        <div className="space-y-3">
          <h5 className={`text-[11px] font-mono tracking-widest ${downColor} border-b ${downBorderColor} pb-1 mb-2`}>BOTTOM 100 LOSERS</h5>
          <div className="border border-[#30363D] rounded-lg overflow-hidden bg-[#0D1117] relative">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs text-[#C9D1D9] whitespace-nowrap">
                <thead className="sticky top-0 bg-[#0D1117] border-b border-[#30363D] z-10">
                  <tr className="text-[10px] text-zinc-500 font-mono uppercase">
                    <th className="px-3 py-2 font-medium">排行</th>
                    <th className="px-3 py-2 font-medium">代碼/市場/中文簡稱</th>
                    <th className="px-3 py-2 font-medium text-right">股價</th>
                    <th className="px-3 py-2 font-medium text-right">漲跌</th>
                    <th className={`px-3 py-2 font-medium text-right ${downColor}`}>跌幅</th>
                    <th className="px-3 py-2 font-medium text-right">成交量</th>
                    <th className="px-3 py-2 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D]/40">
                  {bottomLosers.map((stock, i) => {
                    const isAdded = watchlistSymbols.includes(stock.symbol.toUpperCase());
                    return (
                      <tr key={stock.symbol} className="hover:bg-[#161B22] transition-colors group">
                        <td className="px-3 py-2.5 font-mono text-zinc-500">{i + 1}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-12 shrink-0">
                              <button
                                onClick={() => onSelectStock(stock.symbol)}
                                type="button"
                                className="font-mono text-[10px] font-bold text-amber-500 hover:underline bg-amber-500/5 hover:bg-amber-500/10 px-1 py-0.5 rounded cursor-pointer w-full text-left truncate"
                                title={stock.symbol.split('.')[0]}
                              >
                                {stock.symbol.split('.')[0]}
                              </button>
                            </div>
                            <div className="w-8 shrink-0 flex justify-center">
                              {stock.country && (
                                <span className={`text-[9px] px-1 py-0.5 rounded font-bold shrink-0 select-none ${
                                  stock.country === '美國' 
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                                    : stock.country === '日本' 
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/15'
                                }`}>
                                  {stock.country}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span 
                                onClick={() => onSelectStock(stock.symbol)}
                                className="font-bold text-zinc-200 group-hover:text-amber-500 cursor-pointer transition-colors text-[11px] leading-tight block truncate"
                                title={stock.name}
                              >
                                {stock.name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono">{stock.price}</td>
                        <td className={`px-3 py-2.5 text-right font-mono ${stock.changePercent > 0 ? upColor : downColor}`}>{stock.changeStr || '-'}</td>
                        <td className="px-3 py-2.5 text-right font-mono">
                          <div className={`inline-block px-1.5 py-0.5 rounded font-bold ${
                            stock.changePercent >= 9.8 
                              ? (colorConvention === 'taiwan' ? 'bg-rose-500 text-[#010409]' : 'bg-emerald-500 text-[#010409]') 
                              : stock.changePercent <= -9.8 
                                ? (colorConvention === 'taiwan' ? 'bg-emerald-500 text-[#010409]' : 'bg-rose-500 text-[#010409]')
                                : (stock.changePercent > 0 ? upColor : downColor)
                          }`}>
                            {stock.changePercentStr}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-zinc-400">
                          {stock.volume ? (stock.volume > 1000000 ? (stock.volume/1000000).toFixed(1) + 'M' : stock.volume.toLocaleString()) : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => onAddToWatchlist(stock.symbol, stock.name)}
                            type="button"
                            disabled={isAdded}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              isAdded
                                ? "text-emerald-400 cursor-not-allowed"
                                : "text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#30363D]"
                            }`}
                          >
                            {isAdded ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
