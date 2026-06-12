import { useState, useEffect, useMemo } from "react";
import { StockQuote, PortfolioItem, ColorConvention } from "../types";
import { PieChart, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";

interface ActiveStockPortfolioProps {
  quote: StockQuote;
  colorConvention: ColorConvention;
}

export default function ActiveStockPortfolio({ quote, colorConvention }: ActiveStockPortfolioProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newShares, setNewShares] = useState("");
  const [newCost, setNewCost] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("portfolio_holdings");
      if (stored) {
        setPortfolio(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const savePortfolio = (newPort: PortfolioItem[]) => {
    setPortfolio(newPort);
    localStorage.setItem("portfolio_holdings", JSON.stringify(newPort));
  };

  const handleAdd = () => {
    if (!newShares || !newCost) return;
    const item: PortfolioItem = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: quote.symbol,
      shares: parseFloat(newShares),
      averageCost: parseFloat(newCost),
      addedAt: new Date().toISOString()
    };
    savePortfolio([...portfolio, item]);
    setIsAdding(false);
    setNewShares("");
    setNewCost("");
  };

  const handleRemove = (id: string) => {
    savePortfolio(portfolio.filter(p => p.id !== id));
  };

  const currentHoldings = useMemo(() => {
    return portfolio.filter(p => p.symbol === quote.symbol);
  }, [portfolio, quote.symbol]);

  const totals = useMemo(() => {
    let totalCost = 0;
    let totalShares = 0;

    currentHoldings.forEach(item => {
      totalCost += item.shares * item.averageCost;
      totalShares += item.shares;
    });

    const averageCost = totalShares > 0 ? totalCost / totalShares : 0;
    const totalValue = totalShares * quote.price;
    const diff = totalValue - totalCost;
    const diffPercent = totalCost > 0 ? (diff / totalCost) * 100 : 0;

    return { totalCost, totalShares, averageCost, totalValue, diff, diffPercent };
  }, [currentHoldings, quote.price]);

  const isUp = totals.diff >= 0;
  let color = "text-zinc-400";
  if (totals.diff !== 0) {
    if (colorConvention === "taiwan") color = isUp ? "text-rose-400" : "text-emerald-400";
    else color = isUp ? "text-emerald-400" : "text-rose-400";
  }

  const historicalPE = useMemo(() => {
    if (!quote.peRatio || !quote.sparkline || quote.sparkline.length === 0 || quote.price === 0) return [];
    // Assuming EPS is mostly constant in the 1-year sparkline scale for a simplistic P/E trend 
    const currentEPS = quote.price / quote.peRatio;
    if (currentEPS === 0) return [];
    return quote.sparkline.map(price => price / currentEPS);
  }, [quote]);

  const peAverage = useMemo(() => {
    if (historicalPE.length === 0) return null;
    const sum = historicalPE.reduce((a, b) => a + b, 0);
    return sum / historicalPE.length;
  }, [historicalPE]);

  const peChartPath = useMemo(() => {
     if (historicalPE.length === 0) return "";
     const minPe = Math.min(...historicalPE) * 0.95;
     const maxPe = Math.max(...historicalPE) * 1.05;
     const range = maxPe - minPe || 1;
     const width = 200;
     const height = 40;
     const pts = historicalPE.map((pe, i) => {
         const x = (i / (historicalPE.length - 1)) * width;
         const y = height - ((pe - minPe) / range) * height;
         return `${x},${y}`;
     });
     return `M ${pts.join(" L ")}`;
  }, [historicalPE]);

  if (currentHoldings.length === 0 && !isAdding) {
    return (
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-400">尚未建立 {quote.symbol} 的持股紀錄</span>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="text-[10px] flex items-center gap-1 bg-[#238636] hover:bg-[#2EA043] text-white px-2 py-1 rounded transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3 h-3" /> 新增持股
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[#58A6FF]" />
          <h4 className="text-[13px] font-bold text-zinc-100">{quote.symbol} 當前持股總覽</h4>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-[10px] flex items-center gap-1 bg-[#238636] hover:bg-[#2EA043] text-white px-2 py-1 rounded transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3 h-3" /> {isAdding ? "取消" : "新增持股"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#0D1117] border border-[#30363D] p-3 rounded-lg flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[80px] space-y-1">
            <label className="text-[10px] text-zinc-400 font-semibold uppercase">股數</label>
            <input type="number" value={newShares} onChange={e=>setNewShares(e.target.value)} placeholder="0" className="w-full bg-[#010409] border border-[#30363D] rounded px-2 py-1 text-xs outline-none focus:border-[#58A6FF]" />
          </div>
          <div className="flex-1 min-w-[80px] space-y-1">
            <label className="text-[10px] text-zinc-400 font-semibold uppercase">均價</label>
            <input type="number" value={newCost} onChange={e=>setNewCost(e.target.value)} placeholder="0.0" className="w-full bg-[#010409] border border-[#30363D] rounded px-2 py-1 text-xs outline-none focus:border-[#58A6FF]" />
          </div>
          <button onClick={handleAdd} className="bg-[#58A6FF]/20 text-[#58A6FF] hover:bg-[#58A6FF]/30 border border-[#58A6FF]/50 px-3 py-1 rounded text-xs font-medium transition-colors h-[26px]">
            確認
          </button>
        </div>
      )}

      {currentHoldings.length > 0 && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#010409]/60 border border-[#30363D] rounded p-2 text-center">
              <div className="text-[9px] text-zinc-500 uppercase">總股數</div>
              <div className="font-mono text-sm font-bold text-zinc-200">{totals.totalShares.toLocaleString()}</div>
            </div>
            <div className="bg-[#010409]/60 border border-[#30363D] rounded p-2 text-center">
              <div className="text-[9px] text-zinc-500 uppercase">平均成本</div>
              <div className="font-mono text-sm font-bold text-zinc-200">{totals.averageCost.toLocaleString(undefined, {maximumFractionDigits:2})}</div>
            </div>
            <div className="bg-[#010409]/60 border border-[#30363D] rounded p-2 text-center">
              <div className="text-[9px] text-zinc-500 uppercase">當前市值</div>
              <div className="font-mono text-sm font-bold text-zinc-200">{totals.totalValue.toLocaleString(undefined, {maximumFractionDigits:2})}</div>
            </div>
            <div className={`border rounded p-2 text-center ${isUp && totals.diff !== 0 ? 'bg-emerald-500/10 border-emerald-500/20' : totals.diff < 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-[#010409]/60 border-[#30363D]'}`}>
              <div className="text-[9px] text-zinc-500 uppercase">未實現損益</div>
              <div className={`font-mono text-sm font-bold ${color}`}>
                {totals.diff > 0 ? "+" : ""}{totals.diff.toLocaleString(undefined, {maximumFractionDigits:2})}
                <span className="text-[9px] ml-1 opacity-80">({totals.diffPercent > 0 ? "+" : ""}{totals.diffPercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
          
          {/* P/E Ratio Mini Chart */}
          {historicalPE.length > 0 && peAverage !== null && quote.peRatio !== null && (
            <div className="bg-[#010409]/60 border border-[#30363D] rounded p-3 flex flex-col gap-2 relative overflow-hidden">
              <div className="flex items-center justify-between z-10">
                 <div className="text-[10px] text-zinc-400 font-semibold uppercase flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    近一年本益比 (P/E Ratio) 走勢
                 </div>
                 <div className="flex items-center gap-3 font-mono text-[10px]">
                    <div className="flex flex-col items-end">
                       <span className="text-zinc-500 uppercase text-[8px]">歷史均值</span>
                       <span className="text-zinc-300 font-bold">{peAverage.toFixed(1)} 倍</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-zinc-500 uppercase text-[8px]">當前本益比</span>
                       <span className={`font-bold ${quote.peRatio > peAverage ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {quote.peRatio.toFixed(1)} 倍
                       </span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-zinc-500 uppercase text-[8px]">距均值</span>
                       <span className={`font-bold ${quote.peRatio > peAverage ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {quote.peRatio > peAverage ? '+' : ''}{(quote.peRatio - peAverage).toFixed(1)}
                       </span>
                    </div>
                 </div>
              </div>
              <div className="h-[40px] w-full mt-1 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 200 40" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <path 
                    d={peChartPath} 
                    fill="none" 
                    stroke="#58A6FF" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  {/* Average Line */}
                  <line 
                     x1="0" 
                     y1={(() => {
                        const minPe = Math.min(...historicalPE) * 0.95;
                        const maxPe = Math.max(...historicalPE) * 1.05;
                        const range = maxPe - minPe || 1;
                        return 40 - ((peAverage - minPe) / range) * 40;
                     })()} 
                     x2="200" 
                     y2={(() => {
                        const minPe = Math.min(...historicalPE) * 0.95;
                        const maxPe = Math.max(...historicalPE) * 1.05;
                        const range = maxPe - minPe || 1;
                        return 40 - ((peAverage - minPe) / range) * 40;
                     })()} 
                     stroke="#A855F7" 
                     strokeWidth="1" 
                     strokeDasharray="4 4" 
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded border border-[#30363D]">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#10141B] border-b border-[#30363D]">
                  <th className="py-1.5 px-3 font-semibold text-zinc-400">平均均價</th>
                  <th className="py-1.5 px-3 font-semibold text-zinc-400">股數</th>
                  <th className="py-1.5 px-3 font-semibold text-zinc-400 text-right">損益 ($)</th>
                  <th className="py-1.5 px-3 font-semibold text-zinc-400 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D] bg-[#010409]">
                {currentHoldings.map(item => {
                  const itemValue = quote.price * item.shares;
                  const itemCost = item.averageCost * item.shares;
                  const itemDiff = itemValue - itemCost;
                  const itemDiffPercent = itemCost > 0 ? (itemDiff / itemCost) * 100 : 0;
                  const isItemUp = itemDiff >= 0;
                  
                  let itemColor = "text-zinc-400";
                  if (itemDiff !== 0) {
                    if (colorConvention === "taiwan") itemColor = isItemUp ? "text-rose-400" : "text-emerald-400";
                    else itemColor = isItemUp ? "text-emerald-400" : "text-rose-400";
                  }

                  return (
                    <tr key={item.id} className="hover:bg-[#161B22]/50 group">
                      <td className="py-2 px-3 font-mono text-zinc-400">
                        {item.averageCost.toLocaleString(undefined, {maximumFractionDigits:2})}
                      </td>
                      <td className="py-2 px-3 font-mono text-zinc-200">{item.shares.toLocaleString()}</td>
                      <td className={`py-2 px-3 font-mono text-right font-semibold ${itemColor}`}>
                        {itemDiff > 0 ? "+" : ""}{itemDiff.toLocaleString(undefined, {maximumFractionDigits:2})}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button 
                          onClick={() => handleRemove(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
