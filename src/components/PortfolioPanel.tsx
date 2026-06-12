import { useState, useMemo, useEffect } from "react";
import { PortfolioItem, StockQuote, ColorConvention } from "../types";
import { Plus, Trash2, PieChart as PieChartIcon, TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface PortfolioPanelProps {
  quotes: Record<string, StockQuote>;
  colorConvention: ColorConvention;
  onPortfolioChange?: (symbols: string[]) => void;
}

const COLORS = ['#58A6FF', '#3FB950', '#A371F7', '#D2A8FF', '#F85149', '#E3B341', '#FF7B72', '#79C0FF'];

export default function PortfolioPanel({ quotes, colorConvention, onPortfolioChange }: PortfolioPanelProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newCost, setNewCost] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("portfolio_holdings");
      if (stored) {
        const parsed = JSON.parse(stored);
        setPortfolio(parsed);
        if (onPortfolioChange) {
           onPortfolioChange(Array.from(new Set(parsed.map((p: PortfolioItem) => p.symbol))));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const savePortfolio = (newPort: PortfolioItem[]) => {
    setPortfolio(newPort);
    localStorage.setItem("portfolio_holdings", JSON.stringify(newPort));
    if (onPortfolioChange) {
      onPortfolioChange(Array.from(new Set(newPort.map(p => p.symbol))));
    }
  };

  const handleAdd = () => {
    if (!newSymbol || !newShares || !newCost) return;
    const sym = newSymbol.toUpperCase();
    const item: PortfolioItem = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: sym,
      shares: parseFloat(newShares),
      averageCost: parseFloat(newCost),
      addedAt: new Date().toISOString()
    };
    savePortfolio([...portfolio, item]);
    setIsAdding(false);
    setNewSymbol("");
    setNewShares("");
    setNewCost("");
  };

  const handleRemove = (id: string) => {
    savePortfolio(portfolio.filter(p => p.id !== id));
  };

  const totals = useMemo(() => {
    let totalCost = 0;
    let totalValue = 0;

    portfolio.forEach(item => {
      const q = quotes[item.symbol];
      const price = q ? q.price : item.averageCost;
      totalCost += item.shares * item.averageCost;
      totalValue += item.shares * price;
    });

    const diff = totalValue - totalCost;
    const diffPercent = totalCost > 0 ? (diff / totalCost) * 100 : 0;
    return { totalCost, totalValue, diff, diffPercent };
  }, [portfolio, quotes]);

  const pieData = useMemo(() => {
    return portfolio.map(item => {
      const q = quotes[item.symbol];
      const price = q ? q.price : item.averageCost;
      return {
         name: item.symbol,
         value: item.shares * price
      };
    }).filter(d => d.value > 0).sort((a,b) => b.value - a.value);
  }, [portfolio, quotes]);

  const isUp = totals.diff >= 0;
  let color = "text-zinc-400";
  if (totals.diff !== 0) {
    if (colorConvention === "taiwan") color = isUp ? "text-rose-400" : "text-emerald-400";
    else color = isUp ? "text-emerald-400" : "text-rose-400";
  }

  return (
    <div className="space-y-6 flex flex-col md:flex-row gap-6 items-start animate-in fade-in zoom-in-95 duration-500">
      
      {/* Overview Block */}
      <div className="w-full md:w-1/3 space-y-6">
        <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/80 via-emerald-500/80 to-violet-500/80" />
          
          <div className="flex items-center gap-2 border-b border-[#30363D] pb-3 mb-5 mt-1">
            <div className="p-1.5 rounded bg-gradient-to-br from-[#58A6FF]/20 to-violet-500/20 border border-[#58A6FF]/30">
              <PieChartIcon className="w-4 h-4 text-[#58A6FF]" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-zinc-100 uppercase tracking-widest">持股總覽 (Overview)</h4>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#010409] border border-[#30363D] p-4 rounded-lg space-y-1 relative shadow-inner">
              <div className="text-[11px] text-zinc-500 font-medium tracking-wide">當前總市值 (Value)</div>
              <div className="text-2xl font-bold font-mono text-zinc-200">
                ${totals.totalValue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#010409]/60 border border-[#30363D] p-3 rounded-lg space-y-1">
                <div className="text-[11px] text-zinc-500 font-medium tracking-wide">總投入成本</div>
                <div className="text-[13px] font-bold font-mono text-zinc-300">
                  ${totals.totalCost.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}
                </div>
              </div>
              <div className={`border p-3 rounded-lg space-y-1 ${totals.diff === 0 ? 'bg-[#010409]/60 border-[#30363D]' : isUp ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                <div className="text-[11px] font-medium flex items-center gap-1 text-zinc-400">
                  未實現損益 
                  {totals.diff !== 0 && (isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
                </div>
                <div className={`text-[13px] font-bold font-mono ${color}`}>
                  {totals.diff > 0 ? "+" : ""}{totals.diffPercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {pieData.length > 0 && (
            <div className="h-48 mt-6 border-t border-[#30363D] pt-5 flex flex-col items-center">
              <span className="text-[10px] text-zinc-500 w-full text-left uppercase tracking-widest font-semibold mb-2">Portfolio Allocation</span>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    contentStyle={{ backgroundColor: "#0D1117", borderColor: "#30363D", fontSize: "11px", color: "#C9D1D9", borderRadius: "8px" }}
                    itemStyle={{ color: "#E6EDF3" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Block */}
      <div className="w-full md:w-2/3 bg-[#161B22] border border-[#30363D] rounded-xl p-5 shadow-lg min-h-[460px] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#30363D] pb-3 mb-4 shrink-0 mt-1">
          <h4 className="text-[13px] font-bold text-zinc-100 tracking-wider uppercase">個股明細 (Holdings)</h4>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="text-[11px] md:text-[11px] text-[12px] flex items-center gap-1.5 bg-[#238636] hover:bg-[#2EA043] text-white px-3 sm:px-2.5 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[unset] rounded-md font-medium transition-colors border border-[rgba(240,246,252,0.1)] shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> 加入紀錄
          </button>
        </div>

        {isAdding && (
          <div className="bg-[#0D1117] border border-[#30363D] p-3 rounded-lg mb-4 flex flex-col sm:flex-row flex-wrap gap-3 items-end shrink-0 shadow-inner">
            <div className="w-full sm:flex-1 min-w-[110px] space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold tracking-wider">代碼 (SYMBOL)</label>
              <input value={newSymbol} onChange={e=>setNewSymbol(e.target.value)} placeholder="如 2330.TW" className="w-full bg-[#010409] border border-[#30363D] rounded px-3 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[unset] text-[16px] sm:text-xs font-mono outline-none focus:border-[#58A6FF]" />
            </div>
            <div className="w-full sm:flex-1 min-w-[90px] space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold tracking-wider">股數 (SHARES)</label>
              <input type="number" value={newShares} onChange={e=>setNewShares(e.target.value)} placeholder="0" className="w-full bg-[#010409] border border-[#30363D] rounded px-3 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[unset] text-[16px] sm:text-xs font-mono outline-none focus:border-[#58A6FF]" />
            </div>
            <div className="w-full sm:flex-1 min-w-[90px] space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold tracking-wider">均價 (COST)</label>
              <input type="number" value={newCost} onChange={e=>setNewCost(e.target.value)} placeholder="0.0" className="w-full bg-[#010409] border border-[#30363D] rounded px-3 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[unset] text-[16px] sm:text-xs font-mono outline-none focus:border-[#58A6FF]" />
            </div>
            <button onClick={handleAdd} className="w-full sm:w-auto bg-[#58A6FF] text-[#0D1117] hover:bg-[#58A6FF]/90 px-3 py-2 sm:py-1.5 rounded text-xs font-bold transition-colors min-h-[40px] sm:min-h-[32px] sm:h-[32px] shadow-sm cursor-pointer">
              確認加入
            </button>
          </div>
        )}

        <div className="grow overflow-auto">
          {portfolio.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 border border-dashed border-[#30363D] rounded-lg bg-[#010409]/30 py-10 mt-4">
              <PieChartIcon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">目前沒有持倉紀錄，請點擊右上方「加入紀錄」。</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded border border-[#30363D] bg-[#010409]">
              <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#10141B] border-b border-[#30363D]">
                    <th className="py-2.5 px-3 font-semibold text-zinc-400 w-6"></th>
                    <th className="py-2.5 px-3 font-semibold text-zinc-400">代碼</th>
                    <th className="py-2.5 px-3 font-semibold text-zinc-400 text-right">均價</th>
                    <th className="py-2.5 px-3 font-semibold text-zinc-400 text-right">現價</th>
                    <th className="py-2.5 px-3 font-semibold text-zinc-400 text-right">股數</th>
                    <th className="py-2.5 px-3 font-semibold text-zinc-400 text-right">市值</th>
                    <th className="py-2.5 px-3 font-semibold text-zinc-400 text-right">報酬率</th>
                    <th className="py-2.5 px-3 font-semibold text-zinc-400 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D]">
                  {portfolio.map((item, i) => {
                    const q = quotes[item.symbol];
                    const currentPrice = q ? q.price : item.averageCost;
                    const itemValue = currentPrice * item.shares;
                    const itemCost = item.averageCost * item.shares;
                    const itemDiff = itemValue - itemCost;
                    const itemDiffPercent = itemCost > 0 ? (itemDiff / itemCost) * 100 : 0;
                    const isItemUp = itemDiff >= 0;
                    const weight = totals.totalValue > 0 ? (itemValue / totals.totalValue) * 100 : 0;
                    
                    let itemColor = "text-zinc-400";
                    if (itemDiff !== 0) {
                      if (colorConvention === "taiwan") itemColor = isItemUp ? "text-rose-400" : "text-emerald-400";
                      else itemColor = isItemUp ? "text-emerald-400" : "text-rose-400";
                    }

                    return (
                      <tr key={item.id} className="hover:bg-[#161B22]/80 transition-colors group">
                        <td className="py-3 px-3 w-6 text-center">
                           <div className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-[#58A6FF]">{item.symbol}</div>
                          {q && <div className="text-[9px] text-zinc-500 truncate max-w-[80px] mt-0.5">{q.displayName}</div>}
                        </td>
                        <td className="py-3 px-3 font-mono text-zinc-400 text-right">
                          {item.averageCost.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                        </td>
                        <td className="py-3 px-3 font-mono text-zinc-200 text-right">
                          {q ? currentPrice.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : "-"}
                        </td>
                        <td className="py-3 px-3 font-mono text-zinc-300 text-right">{item.shares.toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono text-zinc-200 text-right">
                          <div className="flex flex-col items-end gap-1">
                             <span>${itemValue.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}</span>
                             <div className="flex items-center gap-1.5 w-16 justify-end">
                               <span className="text-[9px] text-zinc-500 font-mono">{weight.toFixed(1)}%</span>
                               <div className="h-1 bg-[#30363D] w-full max-w-[20px] rounded-full overflow-hidden shrink-0">
                                  <div className="h-full rounded-full" style={{ width: `${weight}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                               </div>
                             </div>
                          </div>
                        </td>
                        <td className={`py-3 px-3 font-mono text-right font-bold ${itemColor}`}>
                          {itemDiff > 0 ? "+" : ""}{itemDiffPercent.toFixed(2)}%
                        </td>
                        <td className="py-3 px-3 text-center w-10">
                          <button 
                            onClick={() => handleRemove(item.id)}
                            className="opacity-100 sm:opacity-0 group-hover:opacity-100 p-2 sm:p-1.5 text-zinc-500 hover:text-rose-400 rounded transition-all cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center inline-flex"
                          >
                            <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
