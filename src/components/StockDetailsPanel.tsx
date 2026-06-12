import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Info, Briefcase, PieChart as PieChartIcon, LayoutList, ChevronDown, ChevronUp } from "lucide-react";

interface StockDetailsPanelProps {
  symbol: string;
}

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#6366f1"
];

export default function StockDetailsPanel({ symbol }: StockDetailsPanelProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    
    let isMounted = true;
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/stocks/profile/${symbol}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();
    // Default expand if it's an ETF context or just close by default to save space
    setIsExpanded(true);

    return () => { isMounted = false; };
  }, [symbol]);

  if (isLoading) {
    return (
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-zinc-500 text-sm">載入詳細資料中...</p>
      </div>
    );
  }

  if (!profile || Object.keys(profile).length === 0) {
    return null; // Don't show anything if no profile data available
  }

  const isETF = !!profile.topHoldings || !!profile.fundProfile;
  const assetProfile = profile.assetProfile || profile.summaryProfile;
  const topHoldings = profile.topHoldings?.holdings || [];
  const sectorWeightings = profile.topHoldings?.sectorWeightings || [];
  const summaryDetail = profile.summaryDetail;
  const financialData = profile.financialData;
  const defaultKeyStatistics = profile.defaultKeyStatistics;

  // Format helpers
  const formatNumber = (num: number) => {
    if (!num && num !== 0) return "N/A";
    if (num >= 1e12) return (num / 1e12).toFixed(2) + " 兆";
    if (num >= 1e8) return (num / 1e8).toFixed(2) + " 億";
    if (num >= 1e4) return (num / 1e4).toFixed(2) + " 萬";
    return num.toLocaleString();
  };

  const formatPercent = (num: number) => {
    if (!num && num !== 0) return "N/A";
    return (num * 100).toFixed(2) + "%";
  };

  // Recharts needs name and value
  const holdingsPieData = topHoldings.map((h: any) => ({
    name: h.holdingName || h.symbol,
    value: typeof h.holdingPercent === 'number' ? h.holdingPercent * 100 : 0
  })).filter((h: any) => h.value > 0);

  const sectorPieData = sectorWeightings.map((s: any) => {
      // Sector weightings can be returned as objects or arrays in some formats, let's normalize
      let name = "";
      let value = 0;
      
      const keys = Object.keys(s);
      if (keys.length === 1 && typeof s[keys[0]] === 'number') {
        name = keys[0];
        value = s[keys[0]] * 100;
      } else {
        name = s.name || s.sector || "Unknown";
        value = typeof s.weight === 'number' ? s.weight * 100 : (typeof s.percent === 'number' ? s.percent * 100 : 0);
      }
      return { name, value };
  }).filter((s: any) => s.value > 0);

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden mt-5">
      <div 
        className="px-6 py-4 border-b border-[#30363D]/40 flex justify-between items-center cursor-pointer hover:bg-[#1C2128] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#8B949E]" />
          <h3 className="text-sm font-bold text-[#C9D1D9]">
            {isETF ? "ETF 基本資料與前十大持股 (Top Holdings)" : "公司基本資料與財務指標"}
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-[#8B949E]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#8B949E]" />
        )}
      </div>

      {isExpanded && (
        <div className="p-6">
          {/* ----- ETF VIEW ----- */}
          {isETF && (
            <div className="space-y-8">
              {/* Profile summary */}
              {profile.fundProfile && (
                <div className="text-sm text-zinc-300 bg-[#0D1117] p-4 rounded-lg border border-[#30363D]">
                  <p className="leading-relaxed">
                    <span className="font-semibold text-emerald-400">基金類別:</span> {profile.fundProfile.categoryName || "N/A"} <br/>
                    <span className="font-semibold text-emerald-400">基金家族:</span> {profile.fundProfile.family || "N/A"} <br/>
                    {profile.fundProfile.legalType && <><span className="font-semibold text-emerald-400">法律型態:</span> {profile.fundProfile.legalType}<br/></>}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-8">
                {/* Holdngs Pie Chart */}
                {holdingsPieData.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <PieChartIcon className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">前十大持股佔比 (Top 10)</h4>
                    </div>
                    <div className="h-[250px] w-full border border-[#30363D] rounded-lg bg-[#0D1117] p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={holdingsPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {holdingsPieData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`${value.toFixed(2)}%`, '佔比']}
                            contentStyle={{ backgroundColor: '#161B22', borderColor: '#30363D', color: '#fff', fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                
                {/* Holdings List */}
                {topHoldings.length > 0 && (
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 text-zinc-400">
                      <LayoutList className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">持股明細</h4>
                    </div>
                    <div className="border border-[#30363D] rounded-lg overflow-hidden bg-[#0D1117]">
                      <table className="w-full text-left text-xs text-[#C9D1D9]">
                        <thead className="bg-[#161B22] border-b border-[#30363D]">
                          <tr className="text-[10px] text-zinc-500 font-mono uppercase">
                            <th className="px-3 py-2 font-medium">代碼</th>
                            <th className="px-3 py-2 font-medium">標的</th>
                            <th className="px-3 py-2 font-medium text-right">權重</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363D]/40">
                          {topHoldings.map((h: any, i: number) => (
                           <tr key={i} className="hover:bg-[#1C2128] transition-colors">
                              <td className="px-3 py-2 font-mono text-[#58A6FF]">{h.symbol}</td>
                              <td className="px-3 py-2 truncate max-w-[120px]" title={h.holdingName}>{h.holdingName || h.symbol}</td>
                              <td className="px-3 py-2 text-right font-mono text-emerald-400">
                                {typeof h.holdingPercent === 'number' ? (h.holdingPercent * 100).toFixed(2) + '%' : '-'}
                              </td>
                           </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----- COMPANY VIEW ----- */}
          {!isETF && (
            <div className="space-y-6">
              {/* Financial & Statistics Bento Box (if available) */}
              {(summaryDetail || financialData || defaultKeyStatistics) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <PieChartIcon className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">核心財務數據與估值指標</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {summaryDetail?.marketCap && (
                      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
                        <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">市值 (Market Cap)</p>
                        <p className="text-sm font-bold text-emerald-400 font-mono">{formatNumber(summaryDetail.marketCap)}</p>
                      </div>
                    )}
                    {summaryDetail?.trailingPE && (
                      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
                        <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">本益比 (P/E)</p>
                        <p className="text-sm font-bold text-zinc-200 font-mono">{summaryDetail.trailingPE.toFixed(2)}</p>
                      </div>
                    )}
                    {defaultKeyStatistics?.priceToBook && (
                      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
                        <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">股價淨值比 (P/B)</p>
                        <p className="text-sm font-bold text-zinc-200 font-mono">{defaultKeyStatistics.priceToBook.toFixed(2)}</p>
                      </div>
                    )}
                    {summaryDetail?.dividendYield && (
                      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
                        <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">殖利率 (Yield)</p>
                        <p className="text-sm font-bold text-[#58A6FF] font-mono">{formatPercent(summaryDetail.dividendYield)}</p>
                      </div>
                    )}
                    {financialData?.totalRevenue && (
                      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
                        <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">總營收 (TTM)</p>
                        <p className="text-sm font-bold text-zinc-200 font-mono">{formatNumber(financialData.totalRevenue)}</p>
                      </div>
                    )}
                    {financialData?.revenueGrowth !== undefined && (
                      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
                        <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">營收成長率</p>
                        <p className={`text-sm font-bold font-mono ${financialData.revenueGrowth >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {formatPercent(financialData.revenueGrowth)}
                        </p>
                      </div>
                    )}
                    {financialData?.grossMargins !== undefined && (
                      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
                        <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">毛利率</p>
                        <p className="text-sm font-bold text-zinc-200 font-mono">{formatPercent(financialData.grossMargins)}</p>
                      </div>
                    )}
                    {financialData?.returnOnEquity !== undefined && (
                      <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
                        <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">股東權益報酬率 (ROE)</p>
                        <p className="text-sm font-bold text-zinc-200 font-mono">{formatPercent(financialData.returnOnEquity)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {assetProfile && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Info className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">公司基本資料</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
                      <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">產業 (Industry)</p>
                      <p className="text-[13px] font-bold text-zinc-200 truncate" title={assetProfile.industry}>{assetProfile.industry || "N/A"}</p>
                    </div>
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
                      <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">板塊 (Sector)</p>
                      <p className="text-[13px] font-bold text-zinc-200 truncate" title={assetProfile.sector}>{assetProfile.sector || "N/A"}</p>
                    </div>
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
                      <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">全職僱員</p>
                      <p className="text-[13px] font-bold text-zinc-200 font-mono">
                        {assetProfile.fullTimeEmployees ? assetProfile.fullTimeEmployees.toLocaleString() : "N/A"}
                      </p>
                    </div>
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3">
                      <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">總部</p>
                      <p className="text-[13px] font-bold text-zinc-200 truncate" title={assetProfile.city ? `${assetProfile.city}, ${assetProfile.country}` : ""}>
                        {assetProfile.city ? `${assetProfile.city}, ${assetProfile.country}` : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {assetProfile.longBusinessSummary && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Briefcase className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">業務摘要 (Business Summary)</h4>
                    </div>
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 text-[13px] text-zinc-300 leading-relaxed max-h-[300px] overflow-y-auto">
                      {assetProfile.longBusinessSummary}
                    </div>
                  </div>
                )}

                {assetProfile.website && (
                  <a 
                    href={assetProfile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-[#58A6FF] hover:underline mt-2"
                  >
                    前往公司官方網站 &rarr;
                  </a>
                )}
              </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
