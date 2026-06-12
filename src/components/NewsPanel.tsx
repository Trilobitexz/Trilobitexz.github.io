import { useState, useMemo } from "react";
import { NewsItem, ColorConvention, StockQuote } from "../types";
import { Newspaper, EyeOff, AlertTriangle, ThumbsUp, ThumbsDown, BookOpen, Search } from "lucide-react";

interface NewsPanelProps {
  news: NewsItem[];
  colorConvention: ColorConvention;
  onMarkIrrelevant: (newsId: string) => void;
  onNewsClick: (newsItem: NewsItem) => void;
  activeSymbolFilter: string;
  setActiveSymbolFilter: (symbol: string) => void;
  isLoading: boolean;
  quotes?: Record<string, StockQuote>;
  onSearchSymbol?: (symbol: string) => void;
}

export default function NewsPanel({
  news,
  colorConvention,
  onMarkIrrelevant,
  onNewsClick,
  activeSymbolFilter,
  setActiveSymbolFilter,
  isLoading,
  quotes = {},
  onSearchSymbol
}: NewsPanelProps) {
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [customSearchSymbol, setCustomSearchSymbol] = useState("");

  const uniqueSymbols = useMemo(() => {
    const list = new Set<string>();
    news.forEach(item => {
      if (!item.userIrrelevant) {
        list.add(item.symbol);
      }
    });
    return Array.from(list);
  }, [news]);

  const filteredNews = news.filter((item) => {
    if (item.userIrrelevant) return false;
    
    const matchesSymbol = activeSymbolFilter === "all" || item.symbol === activeSymbolFilter;
    const matchesSentiment = sentimentFilter === "all" || item.sentiment === sentimentFilter;
    
    return matchesSymbol && matchesSentiment;
  });

  const getSentimentStyles = (sentiment: "positive" | "neutral" | "negative") => {
    if (sentiment === "neutral") {
      return {
        bg: "bg-[#161B22] border-[#30363D]",
        text: "text-zinc-400",
        badge: "bg-zinc-800/60 text-zinc-300 border-zinc-700/50",
        icon: "text-zinc-400",
        label: "中立保守",
        IconComponent: BookOpen
      };
    }

    const isUp = sentiment === "positive";
    
    if (colorConvention === "taiwan") {
      return {
        bg: isUp ? "bg-rose-950/10 border-rose-900/30" : "bg-emerald-950/20 border-emerald-900/30",
        text: isUp ? "text-rose-400" : "text-emerald-400",
        badge: isUp ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: isUp ? "text-rose-500" : "text-emerald-500",
        label: isUp ? "重大利多" : "潛在風險",
        IconComponent: isUp ? ThumbsUp : ThumbsDown
      };
    } else {
      return {
        bg: isUp ? "bg-emerald-950/10 border-emerald-900/30" : "bg-rose-950/20 border-rose-900/30",
        text: isUp ? "text-emerald-400" : "text-rose-400",
        badge: isUp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20",
        icon: isUp ? "text-emerald-500" : "text-rose-500",
        label: isUp ? "重大利多" : "潛在風險",
        IconComponent: isUp ? ThumbsUp : ThumbsDown
      };
    }
  };

  const getPriceColor = (changePercent: number) => {
    if (changePercent === 0) return "text-zinc-400";
    if (changePercent > 0) return colorConvention === "taiwan" ? "text-rose-500" : "text-emerald-500";
    return colorConvention === "taiwan" ? "text-emerald-500" : "text-rose-500";
  };

  return (
    <div className="flex flex-col gap-6 w-full fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1117] p-5 border border-[#30363D] rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Newspaper className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wide">AI 智能新聞與基本面解析</h2>
            <p className="text-xs text-zinc-500 mt-0.5">即時提煉高頻市場快訊、財報異動與產業催化劑</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (customSearchSymbol.trim() && onSearchSymbol) {
                onSearchSymbol(customSearchSymbol.trim().toUpperCase());
                setCustomSearchSymbol("");
              }
            }}
            className="flex items-center rounded-lg bg-[#161B22] border border-[#30363D] overflow-hidden drop-shadow-sm focus-within:border-indigo-500/50 transition-colors h-[30px]"
          >
            <div className="pl-2 gap-1 text-zinc-500 flex items-center bg-[#161B22] h-full">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input 
              type="text"
              placeholder="輸入代碼搜查新聞..."
              value={customSearchSymbol}
              onChange={(e) => setCustomSearchSymbol(e.target.value)}
              className="bg-transparent border-none text-xs text-zinc-200 placeholder:text-zinc-600 px-2 py-1 flex-1 w-[130px] focus:outline-none focus:ring-0 h-full"
            />
            <button 
              type="submit"
              disabled={!customSearchSymbol.trim() || isLoading}
              className="bg-[#30363D] hover:bg-indigo-500/20 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 px-3 py-1 text-xs font-medium cursor-pointer transition-colors border-l border-[#30363D] h-full"
            >
              搜星聞
            </button>
          </form>

          <div className="flex items-center gap-1 bg-[#161B22] p-1 border border-[#30363D] rounded-lg shadow-inner">
            <button
              onClick={() => setActiveSymbolFilter("all")}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
                activeSymbolFilter === "all"
                  ? "bg-[#30363D] text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              全局情報
            </button>
            {uniqueSymbols.map((sym) => (
              <button
                key={sym}
                onClick={() => setActiveSymbolFilter(sym)}
                className={`px-3 py-1.5 rounded-md transition-colors font-mono font-medium ${
                  activeSymbolFilter === sym
                    ? "bg-[#30363D] text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {sym.split(".")[0]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#161B22] p-1 border border-[#30363D] rounded-lg shadow-inner">
            <button
              onClick={() => setSentimentFilter("all")}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
                sentimentFilter === "all"
                  ? "bg-[#30363D] text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              所有事件
            </button>
            <button
              onClick={() => setSentimentFilter("positive")}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
                sentimentFilter === "positive"
                  ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                  : "text-emerald-500/70 hover:text-emerald-400"
              }`}
            >
              利多訊號
            </button>
            <button
              onClick={() => setSentimentFilter("negative")}
              className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
                sentimentFilter === "negative"
                  ? "bg-rose-500/20 text-rose-300 shadow-sm"
                  : "text-rose-500/70 hover:text-rose-400"
              }`}
            >
              風險示警
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 border border-[#30363D] bg-[#0D1117]/80 rounded-xl space-y-4 shadow-sm">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-indigo-300/80 font-mono tracking-wide">Gemini 智能引擎正為您解析全網財經大數據...</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed border-[#30363D] bg-[#0D1117]/50 rounded-xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-zinc-600 mb-2" />
          <p className="text-sm text-zinc-400 font-medium tracking-wide">當前標的及篩選條件下，無相關重大情報</p>
          <p className="text-xs text-zinc-500">建議選擇「全局情報」，或將新的追蹤個股加入自選清單以取得資訊。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 auto-rows-max">
          {filteredNews.map((item, idx) => {
            const styles = getSentimentStyles(item.sentiment);
            const itemUniqueId = item.id || `news-${idx}-${item.symbol}`;
            
            const quote = quotes[item.symbol];

            return (
              <div
                key={itemUniqueId}
                className={`group flex flex-col justify-between p-5 rounded-2xl border ${styles.bg} transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}
                style={{ 
                  boxShadow: item.sentiment !== 'neutral' ? `inset 0 1px 0 0 rgba(255,255,255,0.05)` : '' 
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold font-mono tracking-wide bg-[#161B22] border border-[#30363D] px-2 py-0.5 rounded text-zinc-200 uppercase shadow-sm">
                            {item.symbol}
                          </span>
                          {quote && (
                            <span className={`text-[11px] font-bold font-mono flex items-center gap-1 ${getPriceColor(quote.changePercent)}`}>
                              {quote.price.toFixed(2)}
                              <span className="opacity-80 ml-1">
                                {quote.changePercent > 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
                              </span>
                            </span>
                          )}
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] text-zinc-500 font-mono bg-black/20 px-1.5 py-0.5 rounded">{item.time}</span>
                         <span className="text-[10px] text-indigo-400/80 font-medium max-w-[150px]">{item.source}</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border leading-none tracking-wide ${styles.badge}`}>
                        <styles.IconComponent className="w-3 h-3" />
                        {styles.label}
                      </span>
                      <button
                        onClick={() => onMarkIrrelevant(itemUniqueId)}
                        title="隱藏情報"
                        className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer p-1 rounded-md hover:bg-rose-500/10"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100 mb-3 gap-1 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">
                    {item.title}
                  </h3>

                  <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4 shadow-inner">
                    <ul className="space-y-2">
                      {item.summaryPoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
                          <span className="text-indigo-500/60 mt-1 select-none text-[10px] shrink-0">❖</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => onNewsClick(item)}
                  className="w-full justify-center flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-white bg-[#161B22] p-2.5 rounded-xl border border-[#30363D] hover:bg-[#30363D]/60 hover:border-indigo-500/30 transition-all cursor-pointer focus:outline-none shadow-sm group/btn"
                >
                  <BookOpen className="w-3.5 h-3.5 opacity-70 group-hover/btn:text-indigo-400" />
                  <span className="tracking-wide">AI 深度洞察與原文來源</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
