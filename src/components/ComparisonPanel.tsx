import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Layers, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { StockQuote, ColorConvention } from '../types';

interface ComparisonPanelProps {
  colorConvention: ColorConvention;
}

interface StockItem {
  symbol: string;
  name: string;
  englishName: string;
  category: string;
}

export default function ComparisonPanel({ colorConvention }: ComparisonPanelProps) {
  const [range, setRange] = useState<"1d" | "2d" | "3d" | "5d" | "1w" | "2w" | "3w" | "1m" | "2m" | "3m" | "4m" | "5m" | "6m" | "9m" | "ytd" | "1y" | "2y" | "3y" | "4y" | "5y" | "10y" | "15y" | "20y" | "all">("1y");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StockItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const delaySearch = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.slice(0, 6)); // limit to 6
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const fetchQuotesForCurrentRange = async (symbolsToFetch: string[]) => {
    for (const sym of symbolsToFetch) {
      try {
        const res = await fetch(`/api/stocks/quote/${encodeURIComponent(sym)}?range=${range}`);
        if (res.ok) {
          const data = await res.json();
          setQuotes(prev => ({ ...prev, [sym]: data }));
        }
      } catch(e) {
        console.error(e);
      }
    }
  };

  // Auto-refresh selected symbols periodically
  useEffect(() => {
    if (selectedSymbols.length === 0) return;
    const interval = setInterval(() => {
      fetchQuotesForCurrentRange(selectedSymbols);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedSymbols, range]);

  useEffect(() => {
    if (selectedSymbols.length > 0) {
      fetchQuotesForCurrentRange(selectedSymbols);
    }
  }, [range]);

  const addSymbol = async (symbol: string) => {
    if (selectedSymbols.includes(symbol)) return;
    if (selectedSymbols.length >= 5) {
       alert("最多只能比較 5 檔股票/ETF");
       return;
    }
    
    setSearchQuery("");
    setSuggestions([]);
    
    const newSymbols = [...selectedSymbols, symbol];
    setSelectedSymbols(newSymbols);
    
    // Fetch quote
    try {
      const res = await fetch(`/api/stocks/quote/${encodeURIComponent(symbol)}?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        setQuotes(prev => ({ ...prev, [symbol]: data }));
      }
    } catch(e) {
      console.error(e);
    }
  };

  const removeSymbol = (symbol: string) => {
    setSelectedSymbols(prev => prev.filter(s => s !== symbol));
  };

  const getGrowthColor = (growth: number) => {
    if (growth === 0) return "text-[#8B949E]";
    return colorConvention === "taiwan"
         ? (growth > 0 ? "text-red-400" : "text-green-400")
         : (growth > 0 ? "text-green-400" : "text-red-400");
  };

  const validPEs = selectedSymbols.map(sym => quotes[sym]?.peRatio).filter((pe): pe is number => typeof pe === 'number' && pe > 0);
  const avgPE = validPEs.length > 0 ? validPEs.reduce((a, b) => a + b, 0) / validPEs.length : 15;

  const calculateRelativeTarget = (eps: number | null | undefined, avgPE: number) => {
    if (!eps || eps <= 0) return null;
    return eps * avgPE;
  };

  const calculateDCFTarget = (eps: number | null | undefined, peRatio: number | null | undefined) => {
    if (!eps || eps <= 0) return null;
    const r = 0.10; // 10% discount rate
    let g = peRatio ? (peRatio / 1.5) / 100 : 0.05;
    g = Math.max(0.02, Math.min(g, 0.20)); // Cap between 2% and 20%
    const g_term = 0.03; // 3% terminal growth

    let pv = 0;
    let cf = eps;
    for (let i = 1; i <= 10; i++) {
        cf = cf * (1 + g);
        pv += cf / Math.pow(1 + r, i);
    }
    const tv = (cf * (1 + g_term)) / (r - g_term);
    pv += tv / Math.pow(1 + r, 10);
    return pv;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-medium tracking-tight text-[#C9D1D9]">股票比較 (Compare)</h2>
          <p className="text-xs text-[#8B949E] mt-0.5">跌圖比較與成長率分析 (最多支援 5 檔)</p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1.5 min-w-[200px]">
           <div className="flex justify-between items-center w-full px-1">
             <span className="text-[10px] text-zinc-500 font-mono">比較時間精度</span>
             <span className="text-[11px] font-bold text-[#58A6FF]">{({ "1d": "1日", "2d": "2日", "3d": "3日", "5d": "5日", "1w": "1週", "2w": "2週", "3w": "3週", "1m": "1個月", "2m": "2個月", "3m": "3個月", "4m": "4個月", "5m": "5個月", "6m": "6個月", "9m": "9個月", "ytd": "今年以來", "1y": "1年", "2y": "2年", "3y": "3年", "4y": "4年", "5y": "5年", "10y": "10年", "15y": "15年", "20y": "20年", "all": "全部" } as Record<string,string>)[range]}</span>
           </div>
           <input 
             type="range" 
             min="0" 
             max="23" 
             step="1"
             value={["1d", "2d", "3d", "5d", "1w", "2w", "3w", "1m", "2m", "3m", "4m", "5m", "6m", "9m", "ytd", "1y", "2y", "3y", "4y", "5y", "10y", "15y", "20y", "all"].indexOf(range)}
             onChange={(e) => {
               const opts = ["1d", "2d", "3d", "5d", "1w", "2w", "3w", "1m", "2m", "3m", "4m", "5m", "6m", "9m", "ytd", "1y", "2y", "3y", "4y", "5y", "10y", "15y", "20y", "all"] as const;
               setRange(opts[parseInt(e.target.value)]);
             }}
             className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer accent-[#58A6FF] outline-none"
           />
        </div>
      </div>

      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
        <label className="block text-xs font-medium tracking-wider uppercase text-[#8B949E] mb-2">
          新增標的
        </label>
        <div className="relative z-20 w-full mb-5">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" /> : <Search className="w-4 h-4 text-[#8B949E]" />}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋台股代碼或公司名稱 (例如: 2330 或 台積電)..."
            className="w-full bg-[#010409] border border-[#30363D] rounded-lg pl-9 pr-4 py-2 text-xs text-[#C9D1D9] placeholder:text-[#8B949E] focus:outline-none focus:border-[#58A6FF] transition-colors"
          />

          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-[#161B22] border border-[#30363D] rounded-lg shadow-xl divide-y divide-[#30363D] overflow-hidden max-h-48 overflow-y-auto">
              {suggestions.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => addSymbol(item.symbol)}
                  className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[#010409]/60 cursor-pointer text-left transition-colors font-sans"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#58A6FF]">{item.symbol}</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-[#30363D]/50 text-[#8B949E]">{item.category}</span>
                    </div>
                    <div className="text-xs text-[#C9D1D9] mt-0.5">{item.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedSymbols.map((sym, i) => {
             const quote = quotes[sym];
             const colorClasses = [
                "border-emerald-500/30 text-emerald-400",
                "border-blue-500/30 text-blue-400",
                "border-amber-500/30 text-amber-400",
                "border-purple-500/30 text-purple-400",
                "border-rose-500/30 text-rose-400"
             ];
             const dotColors = [
                "bg-emerald-400", "bg-blue-400", "bg-amber-400", "bg-purple-400", "bg-rose-400"
             ];
             return (
               <div key={sym} className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-[#010409] ${colorClasses[i]} `}>
                 <div className="flex flex-col">
                   <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
                     <div className={`w-2 h-2 rounded-full ${dotColors[i]}`} />
                     {sym}
                   </div>
                   {quote && <div className="text-[10px] opacity-70 text-zinc-400 truncate w-16">{quote.displayName}</div>}
                 </div>
                 {quote && (
                   <div className="text-xs font-mono ml-2">
                     ${quote.price.toFixed(2)}
                   </div>
                 )}
                 <button onClick={() => removeSymbol(sym)} className="ml-2 hover:opacity-75 cursor-pointer">
                   <X className="w-3.5 h-3.5" />
                 </button>
               </div>
             )
          })}
          {selectedSymbols.length === 0 && (
            <div className="text-xs text-[#8B949E] italic mt-1">目前未選擇任何比較標的</div>
          )}
        </div>
      </div>

      {selectedSymbols.length > 0 && (
         <CompareChartArea symbols={selectedSymbols} quotes={quotes} colorConvention={colorConvention} range={range} />
      )}

      {selectedSymbols.length > 1 && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden mt-5">
           <div className="px-5 py-4 border-b border-[#30363D] flex items-center justify-between">
              <h3 className="text-sm font-medium tracking-tight text-[#C9D1D9]">詳細數據比較</h3>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left text-xs text-[#C9D1D9]">
               <thead>
                 <tr className="bg-[#0D1117] border-b border-[#30363D]">
                   <th className="px-5 py-3 font-medium text-[#8B949E] w-1/6">指標</th>
                   {selectedSymbols.map((sym, i) => {
                     const colors = ["text-emerald-400", "text-blue-400", "text-amber-400", "text-purple-400", "text-rose-400"];
                     return (
                       <th key={sym} className="px-5 py-3 font-medium min-w-[120px]">
                         <div className={`font-mono text-sm ${colors[i]}`}>{sym}</div>
                         <div className="text-[11px] text-[#8B949E] truncate font-sans max-w-[150px]">{quotes[sym]?.displayName || "-"}</div>
                       </th>
                     );
                   })}
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#30363D]/50 font-mono">
                 <tr className="hover:bg-[#0D1117]/50 transition-colors">
                   <td className="px-5 py-3 font-sans text-[#8B949E]">當前價格</td>
                   {selectedSymbols.map(sym => (
                     <td key={sym} className="px-5 py-3">
                       {quotes[sym] ? `$${quotes[sym].price.toFixed(2)}` : "-"}
                     </td>
                   ))}
                 </tr>
                 <tr className="hover:bg-[#0D1117]/50 transition-colors">
                   <td className="px-5 py-3 font-sans text-[#8B949E]">單日漲跌幅</td>
                   {selectedSymbols.map(sym => {
                     const q = quotes[sym];
                     if (!q) return <td key={sym} className="px-5 py-3">-</td>;
                     return (
                       <td key={sym} className={`px-5 py-3 ${getGrowthColor(q.changePercent)}`}>
                         {q.changePercent > 0 ? "+" : ""}{q.changePercent.toFixed(2)}%
                       </td>
                     );
                   })}
                 </tr>
                 <tr className="hover:bg-[#0D1117]/50 transition-colors">
                   <td className="px-5 py-3 font-sans text-[#8B949E]">EPS (每股盈餘)</td>
                   {selectedSymbols.map(sym => (
                     <td key={sym} className="px-5 py-3">
                       {quotes[sym]?.eps ? `$${quotes[sym].eps!.toFixed(2)}` : "N/A"}
                     </td>
                   ))}
                 </tr>
                 <tr className="hover:bg-[#0D1117]/50 transition-colors">
                   <td className="px-5 py-3 font-sans text-[#8B949E]">本益比 (PE)</td>
                   {selectedSymbols.map(sym => (
                     <td key={sym} className="px-5 py-3">
                       {quotes[sym]?.peRatio ? quotes[sym].peRatio!.toFixed(2) : "N/A"}
                     </td>
                   ))}
                 </tr>
                 <tr className="hover:bg-[#0D1117]/50 transition-colors">
                   <td className="px-5 py-3 font-sans text-[#8B949E]">預估殖利率</td>
                   {selectedSymbols.map(sym => (
                     <td key={sym} className="px-5 py-3">
                       {quotes[sym]?.peRatio ? (100 / quotes[sym].peRatio!).toFixed(2) + "%" : "N/A"}
                     </td>
                   ))}
                 </tr>
                 <tr className="hover:bg-[#0D1117]/50 transition-colors">
                   <td className="px-5 py-3 font-sans text-[#8B949E]">相對估值目標價</td>
                   {selectedSymbols.map(sym => {
                     const tgt = calculateRelativeTarget(quotes[sym]?.eps, avgPE);
                     return (
                       <td key={sym} className="px-5 py-3 text-blue-400/80">
                         {tgt ? `$${tgt.toFixed(2)}` : "-"}
                       </td>
                     );
                   })}
                 </tr>
                 <tr className="hover:bg-[#0D1117]/50 transition-colors">
                   <td className="px-5 py-3 font-sans text-[#8B949E]">絕對估值(DCF)</td>
                   {selectedSymbols.map(sym => {
                     const tgt = calculateDCFTarget(quotes[sym]?.eps, quotes[sym]?.peRatio);
                     return (
                       <td key={sym} className="px-5 py-3 text-emerald-400/80">
                         {tgt ? `$${tgt.toFixed(2)}` : "-"}
                       </td>
                     );
                   })}
                 </tr>
                 <tr className="hover:bg-[#0D1117]/50 transition-colors">
                   <td className="px-5 py-3 font-sans text-[#8B949E]">52週最高</td>
                   {selectedSymbols.map(sym => (
                     <td key={sym} className="px-5 py-3 text-emerald-400/80">
                       {quotes[sym]?.fiftyTwoWeekHigh ? `$${quotes[sym].fiftyTwoWeekHigh.toFixed(2)}` : "-"}
                     </td>
                   ))}
                 </tr>
                 <tr className="hover:bg-[#0D1117]/50 transition-colors">
                   <td className="px-5 py-3 font-sans text-[#8B949E]">52週最低</td>
                   {selectedSymbols.map(sym => (
                     <td key={sym} className="px-5 py-3 text-red-400/80">
                       {quotes[sym]?.fiftyTwoWeekLow ? `$${quotes[sym].fiftyTwoWeekLow.toFixed(2)}` : "-"}
                     </td>
                   ))}
                 </tr>
                 <tr className="hover:bg-[#0D1117]/50 transition-colors">
                   <td className="px-5 py-3 font-sans text-[#8B949E]">昨收 / 開盤</td>
                   {selectedSymbols.map(sym => {
                     const q = quotes[sym];
                     if (!q) return <td key={sym} className="px-5 py-3">-</td>;
                     return (
                       <td key={sym} className="px-5 py-3 text-[11px] text-[#8B949E]">
                         {q.previousClose?.toFixed(2) || "-"} / {q.open?.toFixed(2) || "-"}
                       </td>
                     );
                   })}
                 </tr>
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
}

// Chart Sub-Component
function CompareChartArea({ symbols, quotes, colorConvention, range }: { symbols: string[], quotes: Record<string, StockQuote>, colorConvention: ColorConvention, range: string }) {
   const width = 800;
   const height = 240;

   const activeQuotes = symbols.map(s => quotes[s]).filter(Boolean);

   // Calculate normalized series (percentage change from start, so they all start at 0)
   const series = useMemo(() => {
     return activeQuotes.map((q, i) => {
       if (!q.sparkline || q.sparkline.length === 0) {
          return { symbol: q.symbol, prices: [], changes: [], timestamps: [] };
       }
       
       const basePrice = q.sparkline[0] || 1;
       
       // Calculate percentage change from the first price point
       const changes = q.sparkline.map(price => (price / basePrice - 1) * 100);
       
       return { symbol: q.symbol, prices: q.sparkline, changes, timestamps: q.sparklineTimestamps || [] };
     });
   }, [activeQuotes]);

   if (series.length === 0) return null;

   let maxLen = 0;
   let minTime = Infinity;
   let maxTime = -Infinity;
   let maxChange = -Infinity;
   let minChange = Infinity;

   series.forEach(s => {
     if (s.prices.length > maxLen) maxLen = s.prices.length;
     if (s.timestamps.length > 0) {
       minTime = Math.min(minTime, s.timestamps[0]);
       maxTime = Math.max(maxTime, s.timestamps[s.timestamps.length - 1]);
     }
     s.changes.forEach(c => {
       if (c > maxChange) maxChange = c;
       if (c < minChange) minChange = c;
     });
   });
   
   if (maxChange === -Infinity) maxChange = 1;
   if (minChange === Infinity) minChange = -1;
   
   // Add padding to range
   const rangeSpan = Math.max(maxChange - minChange, 5);
   const maxVal = maxChange + rangeSpan * 0.1;
   const minVal = minChange - rangeSpan * 0.1;
   
   const rangeLabel = range === "1m" ? "1個月" : range === "6m" ? "半年期" : range === "1y" ? "1年期" : "5年期";

   const timeTicks = [];
   if (maxTime > minTime && maxTime !== Infinity) {
      for (let i = 0; i <= 4; i++) {
         const t = minTime + (maxTime - minTime) * (i / 4);
         const date = new Date(t);
         let label = "";
         if (range === "1d" || range === "5d" || range === "1w") {
           label = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
         } else if (range === "1m" || range === "3m" || range === "6m" || range === "ytd") {
           label = `${date.getMonth()+1}/${date.getDate()}`;
         } else {
           label = `${date.getFullYear()}/${date.getMonth()+1}`;
         }
         timeTicks.push({ x: (i / 4) * width, label });
      }
   }

   return (
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 mt-5 relative min-h-[300px]">
        <h3 className="text-sm font-medium tracking-tight text-[#C9D1D9] mb-4">{rangeLabel}跌圖 (Overlay Chart)</h3>
        
        <div className="relative w-full h-[240px]">
           <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
               {/* Horizontal Grid */}
               <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#30363D" strokeDasharray="4 4" strokeWidth="1" />
               <line x1="0" y1="0" x2={width} y2="0" stroke="#30363D" strokeWidth="1" />
               <line x1="0" y1={height} x2={width} y2={height} stroke="#30363D" strokeWidth="1" />

               {/* Zero Line for Growth Rate */}
               {maxVal > 0 && minVal < 0 && (
                 <line x1="0" y1={height - ((0 - minVal) / (maxVal - minVal)) * height} x2={width} y2={height - ((0 - minVal) / (maxVal - minVal)) * height} stroke="#8B949E" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
               )}

               {/* Vertical Grid & X-axis Labels */}
               {timeTicks.map((tick, i) => (
                  <g key={`tick-${i}`}>
                     <line x1={tick.x} y1="0" x2={tick.x} y2={height} stroke="#30363D" strokeDasharray="2 4" strokeWidth="1" opacity={0.5} />
                     <text x={tick.x} y={height + 16} fill="#8B949E" fontSize="10" fontFamily="mono" textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}>
                       {tick.label}
                     </text>
                  </g>
               ))}

               {/* Y-axis labels */}
               <text x={0} y={12} fill="#8B949E" fontSize="10" fontFamily="mono">+{maxVal.toFixed(1)}%</text>
               <text x={0} y={height - 4} fill="#8B949E" fontSize="10" fontFamily="mono">{minVal.toFixed(1)}%</text>

               {series.map((s, idx) => {
                  if (s.prices.length === 0) return null;
                  
                  // Construct path
                  let path = "";
                  s.changes.forEach((val, i) => {
                     let x;
                     if (s.timestamps.length === s.changes.length && maxTime > minTime) {
                        x = ((s.timestamps[i] - minTime) / (maxTime - minTime)) * width;
                     } else {
                        x = (i / (s.changes.length - 1 || 1)) * width;
                     }
                     
                     const y = height - ((val - minVal) / (maxVal - minVal)) * height;
                     
                     // clamp x visually just in case
                     if (x > width) x = width;
                     if (x < 0) x = 0;
                     
                     if (i === 0) path += `M ${x} ${y} `;
                     else path += `L ${x} ${y} `;
                  });

                  const colors = ["#34d399", "#60a5fa", "#fbbf24", "#c084fc", "#fb7185"];
                  return (
                     <path
                       key={s.symbol}
                       d={path}
                       fill="none"
                       stroke={colors[idx]}
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       className="transition-all duration-300"
                     />
                  );
               })}
           </svg>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
           {activeQuotes.map((q, idx) => {
              const basePrice = q.sparkline && q.sparkline.length > 0 ? q.sparkline[0] : q.price;
              const growth = (q.price / basePrice - 1) * 100;
              const colors = ["text-emerald-400", "text-blue-400", "text-amber-400", "text-purple-400", "text-rose-400"];
              
              let growthColor = colorConvention === "taiwan"
                   ? (growth >= 0 ? "text-red-400" : "text-green-400")
                   : (growth >= 0 ? "text-green-400" : "text-red-400");
              return (
                <div key={q.symbol} className="bg-[#010409] border border-[#30363D] rounded-lg p-4">
                   <div className={`font-mono text-xs font-bold ${colors[idx]} mb-1 flex items-center justify-between`}>
                     <span>{q.symbol}</span>
                     <span className={growthColor}>{growth > 0 ? "+" : ""}{growth.toFixed(2)}%</span>
                   </div>
                   <div className="text-[#C9D1D9] text-sm truncate font-medium mb-3">{q.displayName}</div>
                   
                   <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                         <span className="text-[#8B949E]">當前價</span>
                         <span className="text-[#C9D1D9] font-mono">${q.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                         <span className="text-[#8B949E]">期初價</span>
                         <span className="text-[#C9D1D9] font-mono">${basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                         <span className="text-[#8B949E]">EPS</span>
                         <span className="text-[#C9D1D9] font-mono">{q.eps ? `$${q.eps.toFixed(2)}` : "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                         <span className="text-[#8B949E]">本益比 (PE)</span>
                         <span className="text-[#C9D1D9] font-mono">{q.peRatio ? q.peRatio.toFixed(2) : "N/A"}</span>
                      </div>
                      {/* Yield = 100 / peRatio approximation */}
                      <div className="flex justify-between items-center text-[11px]">
                         <span className="text-[#8B949E]">殖利率 (Est.)</span>
                         <span className="text-[#C9D1D9] font-mono">{q.peRatio ? (100 / q.peRatio).toFixed(2) + "%" : "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                         <span className="text-[#8B949E]">目標價</span>
                         <span className="text-[#C9D1D9] font-mono">{q.targetPrice ? `$${q.targetPrice.toFixed(2)}` : "N/A"}</span>
                      </div>
                   </div>
                </div>
              );
           })}
        </div>
      </div>
   );
}
