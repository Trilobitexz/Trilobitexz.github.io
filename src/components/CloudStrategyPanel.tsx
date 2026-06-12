import { useState } from "react";
import { Cloud, Upload, AlertTriangle, Play, ChevronDown, CheckCircle2, XCircle, Info, ChevronRight, LayoutList } from "lucide-react";

interface AiChainStock {
  symbol: string;
  companyDescription: string;
  bottleneck: string;
  rating: string;
  whyGood: string;
  valuation: string;
  status: string;
  risks: string;
  action: string;
}

interface AiChainLayer {
  layerIndex: number;
  layerName: string;
  layerDescription: string;
  stocks: AiChainStock[];
  footnote?: string;
}

interface AiChainAnalyzeResult {
  layers: AiChainLayer[];
  avoidList: { symbol: string; reason: string }[];
  nextSteps: string[];
}

export default function CloudStrategyPanel() {
  const [mode, setMode] = useState<"manual" | "auto">("auto");
  const [csvData, setCsvData] = useState("");
  const [symbols, setSymbols] = useState("NVDA, TSM, MSFT, META, GOOGL, AMZN, ASML, AVGO");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AiChainAnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedLayer, setExpandedLayer] = useState<number | null>(1);

  const handleAnalyze = async () => {
    if (mode === "manual" && !csvData.trim()) {
      setError("請貼上 InvestingPro / Pro+ 股票篩選器導出的 Excel / CSV 表格內容。");
      return;
    }
    if (mode === "auto" && !symbols.trim()) {
      setError("請輸入自動搜尋的股票代碼。");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/stocks/ai-chain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, csvData: mode === "manual" ? csvData : "", symbols: mode === "auto" ? symbols : "" }),
      });

      if (!response.ok) {
        throw new Error("分析失敗，請檢查表格內容格式是否正確。");
      }

      const dataStr = await response.text();
      const cleanJson = dataStr.replace(/```(json)?\n?/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(cleanJson);
      
      setResult(data);
      setExpandedLayer(data.layers?.[0]?.layerIndex || 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "發生未知錯誤");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRatingBadge = (rating: string) => {
    if (rating.includes("強烈關注")) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🟢 強烈關注</span>;
    if (rating.includes("迴避")) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">🔴 迴避</span>;
    if (rating.includes("觀望")) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">🟡 觀望</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">🔵 關注</span>;
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in p-5 lg:p-8 outline-none max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <LayoutList className="w-6 h-6 text-[#58A6FF]" />
        <div>
          <h2 className="text-xl font-bold text-[#E6EDF3] tracking-wider">AI 產業鏈選股 (七層 + 太空層)</h2>
          <p className="text-[13px] text-[#8B949E] mt-1">
            結合即時自動網頁搜尋與 AI 估值，為您深入剖析 8 層深度產業鏈。
          </p>
        </div>
      </div>

      {!result ? (
        <div className="flex flex-col gap-5">
           <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 shadow-xl">
             <div className="flex bg-[#0D1117] p-1 rounded-lg border border-[#30363D] mb-6">
               <button 
                 onClick={() => setMode("auto")}
                 className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === "auto" ? "bg-[#21262D] text-[#E6EDF3] shadow-sm" : "text-[#8B949E] hover:text-[#C9D1D9]"}`}
               >
                 ✨ 自動搜尋與分析
               </button>
               <button 
                 onClick={() => setMode("manual")}
                 className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === "manual" ? "bg-[#21262D] text-[#E6EDF3] shadow-sm" : "text-[#8B949E] hover:text-[#C9D1D9]"}`}
               >
                 📝 手動貼上 CSV
               </button>
             </div>

             {mode === "auto" ? (
               <div className="flex flex-col gap-3">
                 <div className="flex items-start gap-3">
                   <Upload className="w-5 h-5 text-[#58A6FF] shrink-0 mt-0.5" />
                   <div>
                      <h3 className="text-sm font-semibold text-[#E6EDF3]">自動分析股票代碼</h3>
                      <p className="text-[12px] text-[#8B949E] mt-1">請輸入欲分析的股票代碼，以逗號分隔。AI 將自動為您透過 Google Search 擷取 Investing.com 等平台的專業數據與公允價值。</p>
                   </div>
                 </div>
                 <textarea 
                   className="w-full h-32 bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-sm text-[#C9D1D9] focus:outline-none focus:border-[#58A6FF] resize-none font-mono placeholder:text-[#484F58]"
                   placeholder="例如：NVDA, TSM, MSFT, AAPL, GOOGL"
                   value={symbols}
                   onChange={(e) => setSymbols(e.target.value)}
                 />
               </div>
             ) : (
               <div className="flex flex-col gap-3">
                 <div className="flex items-start gap-3">
                   <Upload className="w-5 h-5 text-[#58A6FF] shrink-0 mt-0.5" />
                   <div>
                      <h3 className="text-sm font-semibold text-[#E6EDF3]">匯入 InvestingPro 篩選器結果</h3>
                      <p className="text-[12px] text-[#8B949E] mt-1">請將從篩選器匯出的 CSV 或 Excel 內容（包含代碼、估值、利潤率、現金流等欄位）直接貼入下方文字方塊中。</p>
                   </div>
                 </div>
                 <textarea 
                   className="w-full h-40 bg-[#0D1117] border border-[#30363D] rounded-lg p-3 text-sm text-[#C9D1D9] focus:outline-none focus:border-[#58A6FF] resize-none whitespace-pre overflow-x-auto font-mono placeholder:text-[#484F58]"
                   placeholder="貼上 CSV 資料..."
                   value={csvData}
                   onChange={(e) => setCsvData(e.target.value)}
                 />
               </div>
             )}
             
             {error && (
               <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2">
                 <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                 <span className="text-sm text-rose-300">{error}</span>
               </div>
             )}

             <div className="mt-5 flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 bg-[#58A6FF] hover:bg-[#318CE7] disabled:bg-[#30363D] disabled:text-[#8B949E] text-[#0D1117] font-bold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      正在執行深度分析...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      開始 AI 產業鏈分析
                    </>
                  )}
                </button>
             </div>
           </div>

           <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-5 text-sm">
              <h4 className="font-semibold text-[#8B949E] mb-3">AI 產業鏈分析框架說明：</h4>
              <ul className="space-y-2 text-[#8B949E] text-[13px]">
                <li><strong className="text-[#E6EDF3]">1. 八層歸類：</strong> 將股票歸類至 7 個核心層與 1 個太空延伸層，幫助您看清楚資金與算力聚焦點。</li>
                <li><strong className="text-[#E6EDF3]">2. 深度搜尋延展：</strong> 自動上網搜尋 InvestingPro 專業平台上的即時估值、財報與分析師報告，補足缺失的專業洞察。</li>
                <li><strong className="text-[#E6EDF3]">3. 四大瓶頸標記：</strong> 自動偵測受惠於 CoWoS 封裝、HBM、先進製程、資料中心電力的關鍵企業。</li>
                <li><strong className="text-[#E6EDF3]">4. 小白評級制：</strong> 根據估值、飆漲程度、獲利能力，給予強烈關注、關注、觀望或迴避的直觀評級。</li>
                <li><strong className="text-[#E6EDF3]">5. 避開清單：</strong> 自動挑出那些空有 AI 概念但護城河薄弱的「套殼」軟體股。</li>
              </ul>
           </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#E6EDF3]">分析報告完成</h3>
            <button 
              onClick={() => {
                setResult(null);
                setCsvData("");
              }}
              className="text-[#8B949E] hover:text-[#E6EDF3] text-sm underline cursor-pointer"
            >
              分析其他資料
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              {result.layers.map((layer) => (
                <div key={layer.layerIndex} className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => setExpandedLayer(expandedLayer === layer.layerIndex ? null : layer.layerIndex)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#0D1117] transition-colors cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-[#E6EDF3] text-[15px]">第 {layer.layerIndex} 層：{layer.layerName}</h4>
                      <p className="text-[12px] text-[#8B949E] mt-1 pr-6">{layer.layerDescription}</p>
                    </div>
                    {expandedLayer === layer.layerIndex ? (
                      <ChevronDown className="w-5 h-5 text-[#8B949E] shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#8B949E] shrink-0" />
                    )}
                  </button>

                  <div 
                    className={`grid transition-all duration-300 ease-in-out ${
                      expandedLayer === layer.layerIndex ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-5 pt-0 border-t border-[#30363D] space-y-4 bg-[#0D1117]/30">
                        {layer.stocks && layer.stocks.length > 0 ? (
                          layer.stocks.map((stock, idx) => (
                            <div key={idx} className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className="font-mono text-base font-bold text-[#58A6FF]">{stock.symbol}</span>
                                {stock.bottleneck && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F85149]/20 text-[#F85149] border border-[#F85149]/30">
                                    {stock.bottleneck}
                                  </span>
                                )}
                                {getRatingBadge(stock.rating)}
                              </div>
                              <p className="text-sm text-[#C9D1D9] font-medium mb-3">{stock.companyDescription}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div className="bg-[#161B22] p-3 rounded border border-[#30363D]/50">
                                  <span className="text-[11px] font-bold text-[#8B949E] block mb-1">👍 為什麼這隻票好</span>
                                  <span className="text-[13px] text-[#E6EDF3]">{stock.whyGood}</span>
                                </div>
                                <div className="bg-[#161B22] p-3 rounded border border-[#30363D]/50">
                                  <span className="text-[11px] font-bold text-[#8B949E] block mb-1">💡 估值貴嗎？</span>
                                  <span className="text-[13px] text-[#E6EDF3]">{stock.valuation}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2 mt-3 pt-3 border-t border-[#30363D]/30">
                                <p className="text-[13px] text-[#C9D1D9]"><span className="text-[#8B949E] inline-block w-16">現狀點評：</span>{stock.status}</p>
                                <p className="text-[13px] text-[#C9D1D9]"><span className="text-[#8B949E] inline-block w-16">風險提示：</span>{stock.risks}</p>
                                <p className="text-[13px] text-[#C9D1D9]"><span className="text-[#8B949E] inline-block w-16">操作建議：</span><strong className="text-[#3FB950]">{stock.action}</strong></p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-[#8B949E] italic p-3 text-center">
                            在此次輸入的資料中，沒有找到屬於此層的對應股票。
                          </div>
                        )}
                        
                        {layer.footnote && (
                          <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 mt-4">
                            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-[12px] text-blue-300">{layer.footnote}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-80 shrink-0 space-y-6">
               <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
                 <h4 className="font-bold text-[#E6EDF3] flex items-center gap-2 mb-4">
                   <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                   接下來怎麼做 (工作流)
                 </h4>
                 <ul className="space-y-3 text-[13px] text-[#C9D1D9]">
                   {result.nextSteps.map((step, idx) => (
                     <li key={idx} className="flex items-start gap-2">
                       <span className="text-[#8B949E] font-mono">{idx + 1}.</span>
                       <span>{step}</span>
                     </li>
                   ))}
                 </ul>
               </div>

               <div className="bg-[#0D1117] border border-rose-500/30 rounded-xl p-5">
                 <h4 className="font-bold text-rose-400 flex items-center gap-2 mb-4">
                   <XCircle className="w-4 h-4" />
                   避開清單 (AI 取代危機)
                 </h4>
                 {result.avoidList && result.avoidList.length > 0 ? (
                   <ul className="space-y-4">
                     {result.avoidList.map((item, idx) => (
                       <li key={idx} className="bg-[#161B22] border border-[#30363D] p-3 rounded-lg">
                         <span className="font-mono font-bold text-[#C9D1D9] text-sm block mb-1">{item.symbol}</span>
                         <span className="text-[12px] text-[#8B949E]">{item.reason}</span>
                       </li>
                     ))}
                   </ul>
                 ) : (
                   <p className="text-sm text-[#8B949E] italic">本次清單中沒有偵測到需要強烈迴避的套殼軟體股。</p>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

