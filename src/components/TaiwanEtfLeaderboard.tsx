import React, { useState, useEffect, useMemo } from "react";
import { 
  Award, 
  Check, 
  TrendingUp, 
  HelpCircle, 
  Activity, 
  BookmarkPlus, 
  RefreshCw, 
  Sparkles, 
  Calculator, 
  CalendarRange, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  ChevronDown, 
  ChevronUp,
  Sliders,
  Wallet,
  Play
} from "lucide-react";
import { StockQuote } from "../types";

interface TaiwanEtfLeaderboardProps {
  onSelectStock: (symbol: string) => void;
  onAddToWatchlist: (symbol: string, name: string) => void;
  watchlistSymbols: string[];
}

interface EtfDetail {
  symbol: string;
  name: string;
  theme: string;
  yieldRate: number; // Target yield in % e.g. 7.5
  frequency: "月配息" | "季配息" | "半年配";
  payoutMonths: number[]; // 1-indexed months
  desc: string;
  tags: string[];
  cagr: number; // Estimated long-term annual compound rate % e.g. 8.5
  expenseRatio: number; // Total annual expense ratio % e.g. 0.38
  beta: number; // Beta coefficient
  topSectors: string; // Top component sectors
}

const ETF_ROSTER: EtfDetail[] = [
  {
    symbol: "0050.TW",
    name: "元大台灣50",
    theme: "市值型龍頭",
    yieldRate: 4.0,
    frequency: "半年配",
    payoutMonths: [1, 7],
    desc: "追蹤台股上市前50大權值企業。緊貼大盤長線爆發力，適合長抱複利資產積累。",
    tags: ["台積電佔比高", "穩健藍籌", "資值成長首選"],
    cagr: 10.2,
    expenseRatio: 0.43,
    beta: 1.00,
    topSectors: "半導體 58.2%、金融 11.5%、電子零組件 5.8%"
  },
  {
    symbol: "006208.TW",
    name: "富邦台50",
    theme: "超低規費市值型",
    yieldRate: 4.1,
    frequency: "半年配",
    payoutMonths: [7, 11],
    desc: "追蹤富時台灣50指數。與0050同質，但擁有更低內扣費用，實屬小資族指數跟隨神器。",
    tags: ["總內扣費低", "零股首選", "追蹤極精準"],
    cagr: 10.3,
    expenseRatio: 0.25,
    beta: 0.99,
    topSectors: "半導體 58.5%、金融 11.2%、電子零組件 5.5%"
  },
  {
    symbol: "0056.TW",
    name: "元大高股息",
    theme: "預期累積高股息",
    yieldRate: 7.5,
    frequency: "季配息",
    payoutMonths: [1, 4, 7, 10],
    desc: "台股歷史最悠久高息ETF。預測篩選「未來一年預期殖利率」前50檔優質企業。",
    tags: ["殖利率歷史強", "科技/成熟製造", "填息穩打"],
    cagr: 8.5,
    expenseRatio: 0.45,
    beta: 0.81,
    topSectors: "電腦及週邊 32.4%、半導體 22.8%、電子通路 9.2%"
  },
  {
    symbol: "00878.TW",
    name: "國泰永續高股息",
    theme: "ESG穩健高股息",
    yieldRate: 7.2,
    frequency: "季配息",
    payoutMonths: [2, 5, 8, 11],
    desc: "融入MSCI ESG永續評級與過去收益紀錄。高抗震防禦力，為全台受益人數最大王牌。",
    tags: ["永續認證", "低波動特質", "金融科技並重"],
    cagr: 8.8,
    expenseRatio: 0.40,
    beta: 0.72,
    topSectors: "金融保險 25.1%、半導體 21.8%、電腦及週邊 19.5%"
  },
  {
    symbol: "00919.TW",
    name: "群益台灣精選高息",
    theme: "已宣告極致高息",
    yieldRate: 10.1,
    frequency: "季配息",
    payoutMonths: [3, 6, 9, 12],
    desc: "鎖定5月已宣告與12月盈餘展望極速配。追求高周轉填息能效，深受息值雙贏客喜愛。",
    tags: ["月月宣告精確", "高息水準", "資金效率優"],
    cagr: 9.6,
    expenseRatio: 0.42,
    beta: 0.84,
    topSectors: "半導體 40.8%、航運及鋼鐵 14.2%、電子通路 11.2%"
  },
  {
    symbol: "00713.TW",
    name: "元大台灣高息低波",
    theme: "多因子防禦型高息",
    yieldRate: 6.8,
    frequency: "季配息",
    payoutMonths: [3, 6, 9, 12],
    desc: "篩選低波動、高股息與高股東權益報酬。回撤防禦極強，多頭領漲空頭極抗跌之神盾。",
    tags: ["抗跌低波動", "高ROE品質", "優異夏普比"],
    cagr: 9.4,
    expenseRatio: 0.62,
    beta: 0.62,
    topSectors: "金融 18.2%、半導體 15.5%、化學/傳產 12.8%"
  },
  {
    symbol: "00929.TW",
    name: "復華台灣科技優息",
    theme: "電子科技月配息",
    yieldRate: 8.9,
    frequency: "月配息",
    payoutMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    desc: "全台首檔全科技主軸的月配息。剔除景氣高波動股。享受電子熱潮與每月穩固收息。",
    tags: ["純科技電子", "全台首檔月配", "波動排除因子"],
    cagr: 8.6,
    expenseRatio: 0.38,
    beta: 0.89,
    topSectors: "半導體 44.5%、電腦及週邊 18.2%、電信及光電 12.5%"
  },
  {
    symbol: "00940.TW",
    name: "元大台灣價值高息",
    theme: "巴菲特指標月配息",
    yieldRate: 8.0,
    frequency: "月配息",
    payoutMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    desc: "專注自由現金流利益，排除本益比過高企業，旨在以合理甜甜價格買入優質穩健公司。",
    tags: ["嚴選現金流", "發行千億爆款", "月配平準金"],
    cagr: 8.0,
    expenseRatio: 0.35,
    beta: 0.79,
    topSectors: "半導體 32.5%、聯發科概念 12.0%、運輸 10.5%"
  }
];

export default function TaiwanEtfLeaderboard({
  onSelectStock,
  onAddToWatchlist,
  watchlistSymbols
}: TaiwanEtfLeaderboardProps) {

  const [activeTab, setActiveTab] = useState<"metrics" | "calculator" | "allocation">("metrics");
  const [liveQuotes, setLiveQuotes] = useState<Record<string, { price: number; change: number; changePercent: number; loading: boolean }>>({});
  const [isRefreshingQuotes, setIsRefreshingQuotes] = useState(false);

  // Quick Fetch Function for all ETF current prices
  const handleFetchLiveQuotes = async () => {
    setIsRefreshingQuotes(true);
    const updated: Record<string, { price: number; change: number; changePercent: number; loading: boolean }> = {};
    
    // Set loading state
    ETF_ROSTER.forEach(etf => {
      updated[etf.symbol] = { price: 0, change: 0, changePercent: 0, loading: true };
    });
    setLiveQuotes({ ...updated });

    try {
      await Promise.all(
        ETF_ROSTER.map(async (etf) => {
          try {
            const res = await fetch(`/api/stocks/quote/${encodeURIComponent(etf.symbol)}`);
            if (res.ok) {
              const data = await res.json();
              updated[etf.symbol] = {
                price: data.price || 0,
                change: data.change || 0,
                changePercent: data.changePercent || 0,
                loading: false
              };
            } else {
              // fallback
              updated[etf.symbol] = { price: -1, change: 0, changePercent: 0, loading: false };
            }
          } catch (e) {
            updated[etf.symbol] = { price: -1, change: 0, changePercent: 0, loading: false };
          }
        })
      );
      setLiveQuotes({ ...updated });
    } catch (err) {
      console.warn("Failed fetching ETF live quotes:", err);
    } finally {
      setIsRefreshingQuotes(false);
    }
  };

  useEffect(() => {
    handleFetchLiveQuotes();
  }, []);

  // --- TAB 1: CALCULATOR STATES ---
  const [calcPrincipal, setCalcPrincipal] = useState<number>(100000); // TWD
  const [calcMonthly, setCalcMonthly] = useState<number>(10000); // TWD/month
  const [calcYears, setCalcYears] = useState<number>(10);
  const [calcReinvest, setCalcReinvest] = useState<boolean>(true); // Compound (DRIP) vs Simple Interest
  const [selectedCalcEtfSymbol, setSelectedCalcEtfSymbol] = useState<string>("0050.TW");

  const calcSelectedEtf = useMemo(() => {
    return ETF_ROSTER.find(e => e.symbol === selectedCalcEtfSymbol) || ETF_ROSTER[0];
  }, [selectedCalcEtfSymbol]);

  // Compute Calculator results monthly
  const simulatorResult = useMemo(() => {
    const months = calcYears * 12;
    const annualTotalReturn = calcSelectedEtf.cagr / 100;
    const monthlyTotalReturn = Math.pow(1 + annualTotalReturn, 1 / 12) - 1;
    
    const annualYield = calcSelectedEtf.yieldRate / 100;
    const annualPriceGrowth = annualTotalReturn - annualYield;
    const monthlyPriceGrowthRate = Math.pow(1 + Math.max(0, annualPriceGrowth), 1 / 12) - 1;

    let totalPrincipal = calcPrincipal;
    let portfolioValue = calcPrincipal;
    let cumulativeDividends = 0;
    const chartPoints: { month: number; principal: number; value: number; dividends: number }[] = [];

    // Monthly compound simulation
    for (let m = 1; m <= months; m++) {
      // Monthly contributions occur at standard start
      totalPrincipal += calcMonthly;
      portfolioValue += calcMonthly;

      // growth
      if (calcReinvest) {
        // Compound dividends back in (Total CAGR captures full return)
        portfolioValue = portfolioValue * (1 + monthlyTotalReturn);
        cumulativeDividends = portfolioValue - totalPrincipal;
      } else {
        // No DRIP: Stock grows by price appreciation only, dividends paid in cash
        const prevValue = portfolioValue;
        portfolioValue = portfolioValue * (1 + monthlyPriceGrowthRate);
        const dividendForThisMonth = prevValue * (annualYield / 12);
        cumulativeDividends += dividendForThisMonth;
      }

      // Record key horizons (every 12 months, or end)
      if (m % 12 === 0 || m === months) {
        chartPoints.push({
          month: m / 12,
          principal: totalPrincipal,
          value: parseFloat(portfolioValue.toFixed(0)),
          dividends: parseFloat(cumulativeDividends.toFixed(0))
        });
      }
    }

    const finalVal = calcReinvest ? portfolioValue : (portfolioValue + cumulativeDividends);
    const finalSecurities = portfolioValue;
    const passiveYearlyDividend = finalSecurities * (calcSelectedEtf.yieldRate / 100);

    return {
      totalPrincipal,
      finalValue: parseFloat(finalVal.toFixed(0)),
      finalSecurities: parseFloat(finalSecurities.toFixed(0)),
      cumulativeDividends: parseFloat(cumulativeDividends.toFixed(0)),
      passiveYearlyDividend: parseFloat(passiveYearlyDividend.toFixed(0)),
      chartPoints
    };
  }, [calcPrincipal, calcMonthly, calcYears, calcReinvest, selectedCalcEtfSymbol]);

  // --- TAB 2: PORTFOLIO ALLOCATION STATES ---
  const [allocWeights, setAllocWeights] = useState<Record<string, number>>({
    "0050.TW": 30,
    "0056.TW": 10,
    "00878.TW": 30,
    "00919.TW": 20,
    "00929.TW": 10,
    "00940.TW": 0,
    "006208.TW": 0,
    "00713.TW": 0
  });

  const totalAllocWeight = useMemo(() => {
    return (Object.values(allocWeights) as number[]).reduce((a, b) => a + b, 0);
  }, [allocWeights]);

  const setPresetWeight = (preset: "active" | "income" | "balanced" | "zero") => {
    if (preset === "active") {
      setAllocWeights({
        "0050.TW": 60,
        "006208.TW": 40,
        "0056.TW": 0,
        "00878.TW": 0,
        "00919.TW": 0,
        "00929.TW": 0,
        "00940.TW": 0,
        "00713.TW": 0
      });
    } else if (preset === "income") {
      setAllocWeights({
        "0050.TW": 0,
        "006208.TW": 0,
        "0056.TW": 20,
        "00878.TW": 30,
        "00919.TW": 30,
        "00929.TW": 10,
        "00940.TW": 10,
        "00713.TW": 0
      });
    } else if (preset === "balanced") {
      setAllocWeights({
        "0050.TW": 30,
        "006208.TW": 0,
        "0056.TW": 20,
        "00878.TW": 25,
        "00919.TW": 10,
        "00929.TW": 0,
        "00940.TW": 0,
        "00713.TW": 15
      });
    } else if (preset === "zero") {
      const reset: Record<string, number> = {};
      ETF_ROSTER.forEach(e => { reset[e.symbol] = 0; });
      setAllocWeights(reset);
    }
  };

  // Blended Portfolio metrics based on weights
  const blendedPortfolioMetrics = useMemo(() => {
    if (totalAllocWeight === 0) return { yield: 0, cagr: 0, expense: 0, beta: 0 };
    
    let wYield = 0;
    let wCagr = 0;
    let wExpense = 0;
    let wBeta = 0;

    ETF_ROSTER.forEach((etf) => {
      const w = (allocWeights[etf.symbol] || 0) / totalAllocWeight;
      wYield += etf.yieldRate * w;
      wCagr += etf.cagr * w;
      wExpense += etf.expenseRatio * w;
      wBeta += etf.beta * w;
    });

    return {
      yield: parseFloat(wYield.toFixed(2)),
      cagr: parseFloat(wCagr.toFixed(2)),
      expense: parseFloat(wExpense.toFixed(3)),
      beta: parseFloat(wBeta.toFixed(2))
    };
  }, [allocWeights, totalAllocWeight]);

  // Blended monthly dividend distribution calendar
  const twelveMonthsDistribution = useMemo(() => {
    // 1-indexed month array representing payout weight
    const monthlySums = Array(12).fill(0);
    
    ETF_ROSTER.forEach((etf) => {
      const pct = (allocWeights[etf.symbol] || 0);
      if (pct <= 0) return;

      const scale = pct / 100;
      const targetYield = etf.yieldRate / 100;

      if (etf.frequency === "月配息") {
        // Pays every month. Adds 1/12 of the yield weight each month
        for (let m = 0; m < 12; m++) {
          monthlySums[m] += scale * (targetYield / 12);
        }
      } else if (etf.frequency === "季配息") {
        // Pays 4 times. Adds 1/4 of the yield weight in payoutMonths
        etf.payoutMonths.forEach((m) => {
          monthlySums[m - 1] += scale * (targetYield / 4);
        });
      } else if (etf.frequency === "半年配") {
        // Pays 2 times. Adds 1/2 of the yield weight in payoutMonths
        etf.payoutMonths.forEach((m) => {
          monthlySums[m - 1] += scale * (targetYield / 2);
        });
      }
    });

    // Check months with any payout
    return monthlySums.map((val, idx) => ({
      month: idx + 1,
      paymentRawValue: val,
      paymentPercentOfYear: parseFloat((blendedPortfolioMetrics.yield > 0 ? (val / (blendedPortfolioMetrics.yield / 100)) * 100 : 0).toFixed(1))
    }));
  }, [allocWeights, blendedPortfolioMetrics.yield]);

  return (
    <div className="bg-gradient-to-b from-[#161B22]/95 to-[#0D1117]/98 border border-[#30363D] rounded-2xl p-5 lg:p-6 space-y-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] relative overflow-hidden" id="taiwan-etf-leaderboard">
      
      {/* Decorative ambient background mesh */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#58A6FF]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363D]/60 pb-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-xl shadow-inner shrink-0">
            <Award className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#E6EDF3] tracking-normal flex items-center gap-2">
              台灣高息 & 龍頭 ETF 存股專題大師
              <span className="text-[10px] font-mono font-bold bg-[#1F6FEB]/15 border border-[#1F6FEB]/30 text-[#58A6FF] px-2 py-0.5 rounded-full">PRO ALGO</span>
            </h3>
            <p className="text-xs text-[#8B949E] mt-1 max-w-2xl leading-relaxed">
              整合台股市場前瞻理財策略。內含實時行情同步、嚴格精準的<strong>資產複利試算體系</strong>與<strong>智慧型月月配配息月份日曆</strong>，提供最全面存股決策佐證。
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#0D1117] border border-[#30363D] rounded-xl p-1 self-start md:self-center shrink-0 shadow-inner">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === "metrics"
                ? "bg-[#21262D] text-[#58A6FF] border border-[#30363D] shadow-sm"
                : "text-[#8B949E] hover:text-[#C9D1D9] border border-transparent"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            即時排行
          </button>
          <button
            onClick={() => setActiveTab("allocation")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === "allocation"
                ? "bg-[#21262D] text-[#58A6FF] border border-[#30363D] shadow-sm"
                : "text-[#8B949E] hover:text-[#C9D1D9] border border-transparent"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            配置校準器
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === "calculator"
                ? "bg-[#21262D] text-[#58A6FF] border border-[#30363D] shadow-sm"
                : "text-[#8B949E] hover:text-[#C9D1D9] border border-transparent"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            複利試算
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE METRICS & TABLE */}
      {activeTab === "metrics" && (
        <div className="space-y-4 relative z-10 transition-opacity duration-300">
          
          {/* Controls bar layout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161B22]/40 p-3 rounded-xl border border-[#30363D]/40">
            <span className="text-[11px] text-[#8B949E] flex items-center gap-1.5 font-sans">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              點擊藍色股票代碼或分析按鈕即可加載精準的 AI 深度研報與即時 K 線圖
            </span>

            <button
              onClick={handleFetchLiveQuotes}
              disabled={isRefreshingQuotes}
              type="button"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] text-[11px] text-[#C9D1D9] font-medium transition-colors cursor-pointer group shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#58A6FF] ${isRefreshingQuotes ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              {isRefreshingQuotes ? "同步中..." : "重新整理即時行情"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#30363D]/80 bg-[#0D1117]/60 shadow-inner">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-[#30363D] text-[10px] text-zinc-500 font-mono uppercase tracking-widest bg-[#161B22]/60">
                  <th className="py-3 px-4 font-semibold">代碼與簡稱</th>
                  <th className="py-3 px-3 font-semibold text-right text-[#58A6FF]">實時市價 (TWD)</th>
                  <th className="py-3 px-3 font-semibold text-right">漲跌幅</th>
                  <th className="py-3 px-3 font-semibold text-[#8B949E]">費用 & BETA</th>
                  <th className="py-3 px-3 font-semibold text-emerald-400">估算殖利率</th>
                  <th className="py-3 px-3 font-semibold">主題與重倉領域</th>
                  <th className="py-3 px-4 font-semibold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D]/40">
                {ETF_ROSTER.map((etf) => {
                  const isAdded = watchlistSymbols.includes(etf.symbol.toUpperCase());
                  const quote = liveQuotes[etf.symbol];
                  const isLoadingPrice = quote?.loading;
                  const priceStr = quote && quote.price > 0 ? quote.price.toFixed(2) : quote?.price === -1 ? "讀取失敗" : "讀取中...";
                  const changePercent = quote?.changePercent || 0;
                  const isUp = changePercent >= 0;

                  return (
                    <tr 
                      key={etf.symbol}
                      className="hover:bg-[#161B22]/40 transition-all text-xs group"
                    >
                      {/* Name & Symbol */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSelectStock(etf.symbol)}
                              type="button"
                              className="font-mono text-[11px] font-bold text-[#58A6FF] hover:text-white bg-[#58A6FF]/5 hover:bg-[#1F6FEB] px-1.5 py-0.5 rounded border border-[#58A6FF]/20 text-left cursor-pointer transition-colors"
                            >
                              {etf.symbol.replace(".TW", "")}
                            </button>
                            <span 
                              onClick={() => onSelectStock(etf.symbol)}
                              className="font-bold text-[#E6EDF3] group-hover:text-[#58A6FF] cursor-pointer transition-colors text-[13px]"
                            >
                              {etf.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 tracking-wide font-sans">{etf.theme}</span>
                        </div>
                      </td>

                      {/* Real-time Price */}
                      <td className="py-3.5 px-3 text-right">
                        {isLoadingPrice ? (
                          <div className="h-4 w-12 bg-[#30363D]/60 animate-pulse rounded ml-auto" />
                        ) : (
                          <span className="font-mono font-bold text-[#C9D1D9] tracking-tight text-[13px]">
                            {priceStr}
                          </span>
                        )}
                      </td>

                      {/* Day Change % */}
                      <td className="py-3.5 px-3 text-right">
                        {isLoadingPrice ? (
                          <div className="h-4 w-12 bg-[#30363D]/60 animate-pulse rounded ml-auto" />
                        ) : quote && quote.price > 0 ? (
                          <div className={`flex items-center justify-end gap-0.5 font-mono font-bold text-xs ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                            {isUp ? <ArrowUpRight className="w-3.5 h-3.5 shrink-0" /> : <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />}
                            {isUp ? "+" : ""}{changePercent.toFixed(2)}%
                          </div>
                        ) : (
                          <span className="text-zinc-600 font-mono">-</span>
                        )}
                      </td>

                      {/* Financial Math parameters: Expense Ratio & Beta */}
                      <td className="py-3.5 px-3 font-mono">
                        <div className="flex flex-col">
                          <span className="text-[11px] text-zinc-300">內扣 {etf.expenseRatio}%</span>
                          <span className="text-[10px] text-zinc-500">Beta {etf.beta}</span>
                        </div>
                      </td>

                      {/* Yield & Frequency */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-mono font-extrabold text-emerald-400 text-[13px]">
                            {etf.yieldRate.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium">{etf.frequency}</span>
                        </div>
                      </td>

                      {/* Description with sector labels */}
                      <td className="py-3.5 px-3 max-w-[280px]">
                        <div className="space-y-1">
                          <p className="text-[11px] text-[#8B949E] leading-relaxed truncate group-hover:text-zinc-300" title={etf.desc}>
                            {etf.desc}
                          </p>
                          <div className="text-[10px] text-[#58A6FF]/95 truncate" title={etf.topSectors}>
                            <span className="text-[9px] text-[#8B949E] font-medium mr-1 uppercase">重倉:</span>
                            {etf.topSectors}
                          </div>
                        </div>
                      </td>

                      {/* Interactive Trigger Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end items-center gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => onSelectStock(etf.symbol)}
                            type="button"
                            className="text-[10px] font-semibold text-[#58A6FF] hover:text-white bg-[#1F6FEB]/10 hover:bg-[#1F6FEB] border border-[#1F6FEB]/30 rounded px-2.5 py-1.5 cursor-pointer transition-all"
                          >
                            選定分析
                          </button>

                          <button
                            onClick={() => onAddToWatchlist(etf.symbol, etf.name)}
                            type="button"
                            disabled={isAdded}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isAdded
                                ? "bg-transparent border-emerald-500/20 text-emerald-400 cursor-not-allowed"
                                : "bg-[#21262D] border-[#30363D] text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#30363D] hover:border-[#8B949E]"
                            }`}
                            title={isAdded ? "已在觀察名單" : "加入觀測自選"}
                          >
                            {isAdded ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <BookmarkPlus className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE ALLOCATION & DIVIDEND CALENDAR */}
      {activeTab === "allocation" && (
        <div className="space-y-5 relative z-10 transition-opacity duration-300">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Weights Slider Console */}
            <div className="lg:col-span-5 bg-[#0D1117]/80 rounded-2xl p-4 lg:p-5 border border-[#30363D] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  配置權重權重分配 (%)
                </h4>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setPresetWeight("balanced")}
                    className="text-[10px] bg-[#21262D] hover:bg-[#30363D] px-1.5 py-0.5 rounded border border-[#30363D] text-zinc-400 cursor-pointer"
                  >
                    均衡
                  </button>
                  <button 
                    onClick={() => setPresetWeight("income")}
                    className="text-[10px] bg-[#21262D] hover:bg-[#30363D] px-1.5 py-0.5 rounded border border-[#30363D] text-zinc-400 cursor-pointer"
                  >
                    高息月配
                  </button>
                  <button 
                    onClick={() => setPresetWeight("active")}
                    className="text-[10px] bg-[#21262D] hover:bg-[#30363D] px-1.5 py-0.5 rounded border border-[#30363D] text-zinc-400 cursor-pointer"
                  >
                    大盤藍籌
                  </button>
                  <button 
                    onClick={() => setPresetWeight("zero")}
                    className="text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 cursor-pointer"
                  >
                    重置
                  </button>
                </div>
              </div>

              {/* Weight sliders roster */}
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {ETF_ROSTER.map((etf) => {
                  const weight = allocWeights[etf.symbol] || 0;
                  return (
                    <div key={etf.symbol} className="bg-[#161B22]/60 p-2.5 rounded-lg border border-[#30363D]/40 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#E6EDF3] flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-[#58A6FF]">{etf.symbol.replace(".TW", "")}</span>
                          {etf.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={weight}
                            onChange={(e) => {
                              const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                              setAllocWeights({ ...allocWeights, [etf.symbol]: val });
                            }}
                            className="bg-[#0D1117] w-12 text-center text-xs border border-[#30363D] rounded p-0.5 font-mono text-[#58A6FF]"
                          />
                          <span className="text-[#8B949E] font-mono text-[10px]">%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={weight}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setAllocWeights({ ...allocWeights, [etf.symbol]: val });
                          }}
                          className="w-full h-1 bg-[#161B22] rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Weight sum alert */}
              <div className={`p-2.5 rounded-xl border text-center text-xs font-semibold ${
                totalAllocWeight === 100 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : totalAllocWeight > 100
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}>
                {totalAllocWeight === 100 
                  ? "✓ 權重總合完美達到 100%" 
                  : `▲ 目前總合為 ${totalAllocWeight}% (請微調使其達到 100%)`}
              </div>
            </div>

            {/* Right Portfolio Analytics & 12 Month Dividend Calendar */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Core Portfolio Weighted Metrics */}
              <div className="bg-[#0D1117]/80 rounded-2xl p-4 lg:p-5 border border-[#30363D] grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#161B22]/50 p-3 rounded-xl border border-[#30363D]/40 text-center">
                  <p className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">組合均殖利率</p>
                  <p className="text-xl font-mono font-black text-emerald-400 mt-1">{blendedPortfolioMetrics.yield}%</p>
                </div>
                <div className="bg-[#161B22]/50 p-3 rounded-xl border border-[#30363D]/40 text-center">
                  <p className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">組合開銷 (內扣)</p>
                  <p className="text-xl font-mono font-black text-[#58A6FF] mt-1">{blendedPortfolioMetrics.expense}%</p>
                </div>
                <div className="bg-[#161B22]/50 p-3 rounded-xl border border-[#30363D]/40 text-center">
                  <p className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">綜合回報估值 (CAGR)</p>
                  <p className="text-xl font-mono font-black text-violet-400 mt-1">{blendedPortfolioMetrics.cagr}%</p>
                </div>
                <div className="bg-[#161B22]/50 p-3 rounded-xl border border-[#30363D]/40 text-center">
                  <p className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">系統貝他 Beta</p>
                  <p className="text-xl font-mono font-black text-zinc-300 mt-1">{blendedPortfolioMetrics.beta}</p>
                </div>
              </div>

              {/* Monthly Calendar Visualization Card */}
              <div className="bg-[#0D1117]/80 rounded-2xl p-4 lg:p-5 border border-[#30363D] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarRange className="w-4 h-4 text-[#58A6FF]" />
                      全年「月月領息」被動收入月份圖
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">以 100 萬台幣投資本金為例的配息分佈額比例估算</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                    MONTHLY CASH CALENDAR
                  </span>
                </div>

                {/* Vertical Bar Graph */}
                <div className="grid grid-cols-12 gap-1.5 items-end h-[160px] pt-4 border-b border-[#30363D]/40">
                  {twelveMonthsDistribution.map((item) => {
                    const isPay = item.paymentRawValue > 0;
                    const computedPayoutValue = blendedPortfolioMetrics.yield > 0 ? (1000000 * item.paymentRawValue).toFixed(0) : "0";
                    return (
                      <div key={item.month} className="flex flex-col items-center h-full group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#161B22] border border-[#30363D] text-[#E6EDF3] p-1.5 rounded shadow-xl text-[9px] w-[90px] text-center hidden group-hover:block z-20 pointer-events-none">
                          <p className="font-bold">配息份額估算</p>
                          <p className="text-emerald-400 font-mono mt-0.5">${parseInt(computedPayoutValue).toLocaleString()} 元</p>
                          <p className="text-[#8B949E] text-[8px]">佔全年配息 {item.paymentPercentOfYear}%</p>
                        </div>

                        {/* Bar */}
                        <div className="w-full bg-[#161B22] rounded-t-md h-full flex flex-col justify-end">
                          <div 
                            style={{ height: `${isPay ? Math.max(8, item.paymentPercentOfYear) : 0}%` }}
                            className={`w-full rounded-t-sm transition-all duration-500 ${
                              isPay 
                                ? "bg-gradient-to-t from-emerald-500/40 to-emerald-400 hover:brightness-125 cursor-pointer shadow-[0_0_8px_rgba(52,211,153,0.3)]" 
                                : "bg-transparent"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Months Indicator Text */}
                <div className="grid grid-cols-12 gap-1.5 text-center font-mono text-[9px] text-[#8B949E]">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <div key={m} className="font-semibold">{m}月</div>
                  ))}
                </div>

                <div className="bg-[#161B22]/50 p-3 rounded-xl border border-[#30363D]/40 text-xs text-[#8B949E] leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#58A6FF] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#C9D1D9] font-medium mb-0.5">配息月份分析與現金流策略建議</p>
                    {totalAllocWeight !== 100 ? (
                      <span className="text-amber-500">※ 請先調整左側滑桿配置權重比，使加總為 100% 以校準最新的被動收入日曆圖。</span>
                    ) : (
                      <span>
                        根據配息設定，此比例可在 {twelveMonthsDistribution.filter(m => m.paymentRawValue > 0).length} 個月份發放配息。
                        {blendedPortfolioMetrics.yield >= 7.5 ? " 此組合屬於高股息型，年配息預期豐富，但應留意電子成分股權重以便於抵禦市場系統性波動。" : " 此組合較為兼顧市值與高息，具備適度的長期資產增值能力配合健康穩定的配息表現。"}
                      </span>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 3: COMPOUND GROW SIMULATOR */}
      {activeTab === "calculator" && (
        <div className="space-y-4 relative z-10 transition-opacity duration-300">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Input fields console */}
            <div className="lg:col-span-4 bg-[#0D1117]/80 rounded-2xl p-4 lg:p-5 border border-[#30363D] space-y-4">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-400" />
                定期定額複利算法設定
              </h4>

              {/* ETF Selection dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono font-bold">試算模擬目標 ETF</label>
                <select
                  value={selectedCalcEtfSymbol}
                  onChange={(e) => setSelectedCalcEtfSymbol(e.target.value)}
                  className="bg-[#161B22] text-[#E6EDF3] border border-[#30363D] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#58A6FF]/60 cursor-pointer w-full"
                >
                  {ETF_ROSTER.map((e) => (
                    <option key={e.symbol} value={e.symbol}>
                      {e.symbol.replace(".TW", "")} - {e.name} (複利率: {e.cagr}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Seed Capital */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold text-zinc-500">
                  <span>初始單筆本金</span>
                  <span className="text-emerald-400 font-bold">${calcPrincipal.toLocaleString()} 元</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="10000"
                  value={calcPrincipal}
                  onChange={(e) => setCalcPrincipal(parseInt(e.target.value) || 0)}
                  className="w-full h-1 bg-[#161B22] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex gap-2.5">
                  <button onClick={() => setCalcPrincipal(0)} className="text-[10px] text-zinc-500 hover:text-zinc-400">0萬</button>
                  <button onClick={() => setCalcPrincipal(100000)} className="text-[10px] text-[#58A6FF] hover:underline">10萬</button>
                  <button onClick={() => setCalcPrincipal(500000)} className="text-[10px] text-[#58A6FF] hover:underline">50萬</button>
                  <button onClick={() => setCalcPrincipal(1000000)} className="text-[10px] text-[#58A6FF] hover:underline">100萬</button>
                </div>
              </div>

              {/* Monthly contribution */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold text-zinc-500">
                  <span>每月定期定額本金</span>
                  <span className="text-[#58A6FF] font-bold">${calcMonthly.toLocaleString()} 元</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={calcMonthly}
                  onChange={(e) => setCalcMonthly(parseInt(e.target.value) || 0)}
                  className="w-full h-1 bg-[#161B22] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex gap-2.5">
                  <button onClick={() => setCalcMonthly(3000)} className="text-[10px] text-[#58A6FF] hover:underline">3千(基本)</button>
                  <button onClick={() => setCalcMonthly(10000)} className="text-[10px] text-[#58A6FF] hover:underline">1萬(穩健)</button>
                  <button onClick={() => setCalcMonthly(30000)} className="text-[10px] text-[#58A6FF] hover:underline">3萬(積極)</button>
                  <button onClick={() => setCalcMonthly(50000)} className="text-[10px] text-[#58A6FF] hover:underline">5萬(強大)</button>
                </div>
              </div>

              {/* Years */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold text-zinc-500">
                  <span>預期存股天數/年限</span>
                  <span className="text-[#E6EDF3] font-bold">{calcYears} 年</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={calcYears}
                  onChange={(e) => setCalcYears(parseInt(e.target.value) || 1)}
                  className="w-full h-1 bg-[#161B22] rounded-lg appearance-none cursor-pointer accent-[#58A6FF]"
                />
              </div>

              {/* Reinvest Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-[#161B22]/60 rounded-xl border border-[#30363D]/40">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[#E6EDF3]">配息滾入再投資 (DRIP)</span>
                  <span className="text-[10px] text-[#8B949E]">啟用可實現複利滾存增值的爆炸效果</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCalcReinvest(!calcReinvest)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    calcReinvest ? "bg-emerald-500" : "bg-[#30363D]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      calcReinvest ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

            </div>

            {/* Results Output Section */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="bg-[#0D1117]/80 rounded-2xl p-4 lg:p-5 border border-[#30363D] grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#161B22]/50 p-3 rounded-xl border border-[#30363D]/40 text-center">
                  <p className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">累計投入本金</p>
                  <p className="text-lg font-mono font-black text-[#E6EDF3] mt-1">${simulatorResult.totalPrincipal.toLocaleString()}</p>
                </div>
                <div className="bg-[#161B22]/50 p-3 rounded-xl border border-[#30363D]/40 text-center">
                  <p className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">
                    {calcReinvest ? "期末持有總資產" : "累積資產+領得息"}
                  </p>
                  <p className="text-lg font-mono font-black text-emerald-400 mt-1">${simulatorResult.finalValue.toLocaleString()}</p>
                </div>
                <div className="bg-[#161B22]/50 p-3 rounded-xl border border-[#30363D]/40 text-center">
                  <p className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">累計獲配利息額</p>
                  <p className="text-lg font-mono font-black text-amber-400 mt-1">${simulatorResult.cumulativeDividends.toLocaleString()}</p>
                </div>
                <div className="bg-[#161B22]/50 p-3 rounded-xl border border-[#30363D]/40 text-center">
                  <p className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">期末被動年配息估</p>
                  <p className="text-lg font-mono font-black text-violet-400 mt-1">${simulatorResult.passiveYearlyDividend.toLocaleString()}</p>
                </div>
              </div>

              {/* Simulation Grid Timeline */}
              <div className="bg-[#0D1117]/80 rounded-2xl p-4 lg:p-5 border border-[#30363D] space-y-3">
                <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                  定期存股財富倍增規劃明細表格
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead>
                      <tr className="border-b border-[#30363D] text-zinc-500 uppercase tracking-wider pb-2">
                        <th className="py-2 text-zinc-400">年份 (Year)</th>
                        <th className="py-2 text-right text-zinc-400">累計投入本金</th>
                        <th className="py-2 text-right text-emerald-400">總市值 + 保守盈餘</th>
                        <th className="py-2 text-right text-amber-400">累計實得股息</th>
                        <th className="py-2 text-right text-purple-400">次年預估月配現金流</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363D]/40 text-[#C9D1D9]">
                      {simulatorResult.chartPoints.map((pt) => {
                        const estimatedNextMonthlyCash = ((pt.value * (calcSelectedEtf.yieldRate / 100)) / 12).toFixed(0);
                        return (
                          <tr key={pt.month} className="hover:bg-[#161B22]/30 transition-colors">
                            <td className="py-2 font-bold text-[#58A6FF]">第 {pt.month} 年</td>
                            <td className="py-2 text-right">${pt.principal.toLocaleString()}</td>
                            <td className="py-2 text-right font-bold text-emerald-400">${pt.value.toLocaleString()}</td>
                            <td className="py-2 text-right text-amber-500">${pt.dividends.toLocaleString()}</td>
                            <td className="py-2 text-right text-violet-400 font-black">${parseInt(estimatedNextMonthlyCash).toLocaleString()} 元 / 月</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Algorithmic note disclosure */}
                <div className="text-[10px] text-zinc-500 leading-relaxed bg-[#161B22]/50 p-2.5 rounded-lg border border-[#30363D]/30">
                  <span className="font-semibold text-zinc-300">算法備忘說明：</span>
                  本試算採用台股該檔 ETF 之特定合理總回報率 CAGR 歷史估計（包含成分股分紅及長期資本利得折算）。
                  {calcReinvest 
                    ? "「配息再投資」假設所得現金利息每季或每月均等自動增購零股、享受複利乘數擴散機制。" 
                    : "「不滾入再投資」假設每年獲取現金紅利後放置於空閑現金帳戶、期末價值為資產增值加上累計現金息總量。"}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
