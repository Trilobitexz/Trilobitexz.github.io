import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { StockItem, StockQuote, NewsItem, ColorConvention, StockAnalysis } from "./types";
import Sparkline from "./components/Sparkline";
import NewsPanel from "./components/NewsPanel";
import MetricsPanel from "./components/MetricsPanel";
import ActiveStockChart from "./components/ActiveStockChart";
import StockDetailsPanel from "./components/StockDetailsPanel";
import ActiveStockPortfolio from "./components/ActiveStockPortfolio";
import AiAnalysisPanel from "./components/AiAnalysisPanel";
import AiStrongStocksPanel from "./components/AiStrongStocksPanel";
import TaiwanEtfLeaderboard from "./components/TaiwanEtfLeaderboard";
import PortfolioPanel from "./components/PortfolioPanel";
import ComparisonPanel from "./components/ComparisonPanel";
import TaiwanTopBottomStocks from "./components/TaiwanTopBottomStocks";
import GlobalTopBottomStocks from "./components/GlobalTopBottomStocks";
import CloudStrategyPanel from "./components/CloudStrategyPanel";
import UtcClock from "./components/UtcClock";
import { useAuth, useCloudWatchlist } from "./hooks/useFirebaseSync";
import { useFirebaseTest } from "./hooks/useFirebaseTest";

import { 
  Search, 
  Plus, 
  Trash2, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  HelpCircle,
  BarChart2,
  ExternalLink,
  EyeOff,
  ChevronRight,
  Info,
  X,
  Compass,
  Layout,
  Sliders,
  DollarSign,
  Briefcase,
  Layers,
  ChevronUp,
  AlertTriangle,
  BookOpen,
  Timer,
  CheckCircle,
  Cpu,
  RefreshCcw,
  Zap,
  PieChart,
  LogIn,
  LogOut,
  Cloud,
  Bell,
  BellOff,
  Globe2,
  LayoutDashboard,
  Sparkles,
  Command,
  AlertCircle
} from "lucide-react";



export default function App() {
  useFirebaseTest();
  
  // --- STATE DECLARATIONS ---
  const [globalMarket, setGlobalMarket] = useState<"taiwan" | "us">("taiwan");
  
  const { user, login, logout } = useAuth();
  
  const initialTW = [
    "2330.TW", "2317.TW", "2454.TW", "2382.TW", "2603.TW", "0050.TW", "0056.TW", "00929.TW"
  ];
  const initialUS = [
    "AAPL", "NVDA", "MSFT", "TSLA", "AMZN", "META", "GOOGL", "AVGO"
  ];
  
  const { cloudTW, cloudUS, updateCloudWatchlist, isSyncing } = useCloudWatchlist(user, initialTW, initialUS);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const [watchlistTW, setWatchlistTW] = useState<string[]>(initialTW);
  const [watchlistUS, setWatchlistUS] = useState<string[]>(initialUS);
  
  // Resync from cloud
  useEffect(() => {
    setWatchlistTW(Array.from(new Set(cloudTW)));
    setWatchlistUS(Array.from(new Set(cloudUS)));
  }, [cloudTW, cloudUS]);

  const handleSetWatchlistTW = (val: string[] | ((p: string[]) => string[])) => {
    setWatchlistTW(p => {
      const next = Array.from(new Set(typeof val === 'function' ? val(p) : val));
      updateCloudWatchlist(next, watchlistUS);
      return next;
    });
  };

  const handleSetWatchlistUS = (val: string[] | ((p: string[]) => string[])) => {
    setWatchlistUS(p => {
      const next = Array.from(new Set(typeof val === 'function' ? val(p) : val));
      updateCloudWatchlist(watchlistTW, next);
      return next;
    });
  };

  const watchlist = globalMarket === "taiwan" ? watchlistTW : watchlistUS;
  const setWatchlist = globalMarket === "taiwan" ? handleSetWatchlistTW : handleSetWatchlistUS;

  const [portfolioSymbols, setPortfolioSymbols] = useState<string[]>([]);
  const allSymbolsToFetch = useMemo(() => {
    return Array.from(new Set([...watchlist, ...portfolioSymbols]));
  }, [watchlist, portfolioSymbols]);

  const allSymbolsKey = allSymbolsToFetch.join(",");

  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  
  // Keep quotesRef up to date to prevent effect interval disruption
  const quotesRef = useRef<Record<string, StockQuote>>({});
  useEffect(() => {
    quotesRef.current = quotes;
  }, [quotes]);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StockItem[]>([]);
  const [activeNewsFilter, setActiveNewsFilter] = useState("all");
  
  // Custom stock trend & market filter states
  const [activeChartSymbol, setActiveChartSymbol] = useState<string>("2330.TW");
  const [activePage, setActivePage] = useState<"dashboard" | "momentum" | "rankings" | "news" | "portfolio" | "compare" | "cloud_strategy">("dashboard");

  // Dynamic range adjusting & AI-based search analysis states matching user requirements
  const [activeChartRange, setActiveChartRange] = useState<"1d" | "2d" | "3d" | "5d" | "1w" | "2w" | "3w" | "1m" | "2m" | "3m" | "4m" | "5m" | "6m" | "9m" | "ytd" | "1y" | "2y" | "3y" | "4y" | "5y" | "10y" | "15y" | "20y" | "all" | "custom">("1y");
  const [activeChartStartDate, setActiveChartStartDate] = useState<string | undefined>();
  const [activeChartEndDate, setActiveChartEndDate] = useState<string | undefined>();

  const handleActiveRangeChange = (r: "1d" | "2d" | "3d" | "5d" | "1w" | "2w" | "3w" | "1m" | "2m" | "3m" | "4m" | "5m" | "6m" | "9m" | "ytd" | "1y" | "2y" | "3y" | "4y" | "5y" | "10y" | "15y" | "20y" | "all" | "custom", start?: string, end?: string) => {
    setActiveChartRange(r);
    setActiveChartStartDate(start);
    setActiveChartEndDate(end);
  };

  const [marketChartRange, setMarketChartRange] = useState<"1d" | "2d" | "3d" | "5d" | "1w" | "2w" | "3w" | "1m" | "2m" | "3m" | "4m" | "5m" | "6m" | "9m" | "ytd" | "1y" | "2y" | "3y" | "4y" | "5y" | "10y" | "15y" | "20y" | "all" | "custom">("1y");
  const [marketChartStartDate, setMarketChartStartDate] = useState<string | undefined>();
  const [marketChartEndDate, setMarketChartEndDate] = useState<string | undefined>();

  const handleMarketRangeChange = (r: "1d" | "2d" | "3d" | "5d" | "1w" | "2w" | "3w" | "1m" | "2m" | "3m" | "4m" | "5m" | "6m" | "9m" | "ytd" | "1y" | "2y" | "3y" | "4y" | "5y" | "10y" | "15y" | "20y" | "all" | "custom", start?: string, end?: string) => {
    setMarketChartRange(r);
    setMarketChartStartDate(start);
    setMarketChartEndDate(end);
  };

  const [isChartQuoteLoading, setIsChartQuoteLoading] = useState(false);
  const [aiAnalysisCache, setAiAnalysisCache] = useState<Record<string, StockAnalysis>>({});
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  const isTaiwanStock = (sym: string) => {
    const uppercaseSym = sym.toUpperCase();
    return uppercaseSym.endsWith(".TW") || uppercaseSym.endsWith(".TWO") || /^\d+$/.test(uppercaseSym);
  };
  
  // App Performance & User Behavior KPI stats (Metric A & B indicators)
  const [clickCount, setClickCount] = useState(0);
  const [totalReadsOpened, setTotalReadsOpened] = useState(0);
  const [effectiveReads, setEffectiveReads] = useState(0);
  const [irrelevantFlagsCount, setIrrelevantFlagsCount] = useState(0);
  const [bootTime, setBootTime] = useState(0);
  const [isQuotesLoading, setIsQuotesLoading] = useState(false);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [colorConvention, setColorConvention] = useState<ColorConvention>("taiwan"); // Default taiwan (Red UP, Green DOWN)

  // Autocomplete warning indicator
  const [showAutoError, setShowAutoError] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Active reading modal
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [newsDwellTime, setNewsDwellTime] = useState(0);
  const [hasCreditedRead, setHasCreditedRead] = useState(false);
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track initial boot completion
  const bootStartTimeRef = useRef<number>(performance.now());
  const hasFinishedBootRef = useRef<boolean>(false);

  // Curated stocks index for fast one-click add panel (maximizing click-saving Metric A)
  const PRESET_STOCK_SHORTCUTS = globalMarket === "taiwan" ? [
    { symbol: "2330.TW", name: "台積電" },
    { symbol: "2317.TW", name: "鴻海" },
    { symbol: "3231.TW", name: "緯創" },
    { symbol: "2376.TW", name: "技嘉" },
    { symbol: "2603.TW", name: "長榮" },
    { symbol: "0050.TW", name: "台灣50" },
    { symbol: "00929.TW", name: "復華科技優息" }
  ] : [
    { symbol: "AAPL", name: "蘋果" },
    { symbol: "NVDA", name: "輝達" },
    { symbol: "TSLA", name: "特斯拉" },
    { symbol: "MSFT", name: "微軟" },
    { symbol: "SMCI", name: "美超微" },
    { symbol: "COIN", name: "Coinbase" },
    { symbol: "MSTR", name: "微策略" }
  ];

  // --- ACTIONS: QUANT DATA SOURCING ---

  // Bulk fetch stock quotes
  const fetchAllQuotes = useCallback(async (tickerList: string[], overrides?: { activeSymbol?: string, activeRange?: string, startDate?: string, endDate?: string }, showLoading: boolean = true) => {
    // Always include market index
    const uniqueTickers = Array.from(new Set([...tickerList, "^TWII"]));
    
    if (uniqueTickers.length === 0) {
      setQuotes({});
      return;
    }
    
    if (showLoading) setIsQuotesLoading(true);
    const newQuotes: Record<string, StockQuote> = {};
    
    try {
      await Promise.all(
        uniqueTickers.map(async (sym) => {
          try {
            let url = `/api/stocks/quote/${encodeURIComponent(sym)}`;
            const isSymActive = sym === (overrides?.activeSymbol || activeChartSymbol);
            if (isSymActive) {
               const targetRange = overrides?.activeRange || activeChartRange;
               let qs = `range=${targetRange}`;
               const targetStart = overrides?.startDate || activeChartStartDate;
               const targetEnd = overrides?.endDate || activeChartEndDate;
               if (targetRange === "custom" && targetStart && targetEnd) {
                 qs += `&startDate=${targetStart}&endDate=${targetEnd}`;
               }
               url += `?${qs}`;
            } else if (sym === "^TWII") {
               let qs = `range=${marketChartRange}`;
               if (marketChartRange === "custom" && marketChartStartDate && marketChartEndDate) {
                 qs += `&startDate=${marketChartStartDate}&endDate=${marketChartEndDate}`;
               }
               url += `?${qs}`;
            }
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              newQuotes[sym] = data;
            }
          } catch (e) {
            console.warn(`Failed loading quote for ${sym}:`, e);
          }
        })
      );
      
      setQuotes((prev) => ({ ...prev, ...newQuotes }));

      // Measure boot time on first successful complete loading
      if (!hasFinishedBootRef.current && tickerList.length >= 3) {
        const timeDiff = (performance.now() - bootStartTimeRef.current) / 1000;
        setBootTime(timeDiff);
        hasFinishedBootRef.current = true;
      }
    } catch (err) {
      console.warn("Bulk quote loading error:", err);
    } finally {
      setIsQuotesLoading(false);
    }
  }, [marketChartRange, marketChartStartDate, marketChartEndDate, activeChartSymbol, activeChartRange, activeChartStartDate, activeChartEndDate]);

  // Bulk fetch context-grounded news analysis
  const fetchNewsFeed = useCallback(async (tickerList: string[]) => {
    if (tickerList.length === 0) {
      setNews([]);
      return;
    }

    setIsNewsLoading(true);
    try {
      // Map ticker to standard Chinese name lookup
      const namesMap: Record<string, string> = {};
      const quotesData = quotesRef.current;
      tickerList.forEach(sym => {
        namesMap[sym] = quotesData[sym]?.displayName || sym;
      });

      const res = await fetch("/api/stocks/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: tickerList, names: namesMap })
      });

      if (res.ok) {
        const parsedNews = await res.json();
        setNews(parsedNews);
      }
    } catch (err) {
      console.warn("Failed downloading news analysis feed:", err);
    } finally {
      setIsNewsLoading(false);
    }
  }, []);

  // Load initial dataset or when switching markets
  useEffect(() => {
    const initData = async () => {
      await fetchAllQuotes(allSymbolsToFetch, undefined, true);
    };
    initData();
    
    // Auto-refresh quotes every 3 seconds without dynamic active chart overrides to keep performance stable
    const interval = setInterval(() => {
      fetchAllQuotes(allSymbolsToFetch, { activeSymbol: activeChartSymbol || undefined, activeRange: activeChartRange }, false);
    }, 3000);
    return () => clearInterval(interval);
  }, [globalMarket, fetchAllQuotes, allSymbolsKey]);

  // Synchronize news feed whenever watchlist items update or periodically
  useEffect(() => {
    if (watchlist.length > 0) {
      fetchNewsFeed(watchlist);
    }
  }, [watchlist, fetchNewsFeed]);
  
  // Auto-refresh news every 30 seconds - fully stable now as it doesn't depend on quotes
  useEffect(() => {
    const interval = setInterval(() => {
      if (watchlist.length > 0) {
        fetchNewsFeed(watchlist);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [watchlist, fetchNewsFeed]);

  // Autocomplete dynamic search
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        setSuggestions([]);
        setShowAutoError(false);
        return;
      }

      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(trimmed)}&market=${globalMarket}`);
        if (res.ok) {
          const matched = await res.json();
          setSuggestions(matched);
          setShowAutoError(matched.length === 0);
        }
      } catch (err) {
        console.warn("Error executing query autocompletion:", err);
      }
    }, 180);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // UseEffect 1: Refetch quote sparkline on activeChartSymbol or activeChartRange updates (user adjusted timeframe)
  useEffect(() => {
    const fetchRangeQuote = async () => {
      if (!activeChartSymbol) return;
      setIsChartQuoteLoading(true);
      try {
        let qs = `range=${activeChartRange}`;
        if (activeChartRange === "custom" && activeChartStartDate && activeChartEndDate) {
           qs += `&startDate=${activeChartStartDate}&endDate=${activeChartEndDate}`;
        }
        const res = await fetch(`/api/stocks/quote/${encodeURIComponent(activeChartSymbol)}?${qs}`);
        if (res.ok) {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            setQuotes((prev) => ({ ...prev, [activeChartSymbol]: data }));
          } catch (e) {
            throw new Error("Received non-JSON response");
          }
        }
      } catch (err) {
        console.warn("Failed fetching updated range candle quote:", err);
      } finally {
        setIsChartQuoteLoading(false);
      }
    };

    fetchRangeQuote();

    // Auto-refresh the active chart data every 3 seconds
    const interval = setInterval(() => {
      if (activeChartSymbol) {
        let qs = `range=${activeChartRange}`;
        if (activeChartRange === "custom" && activeChartStartDate && activeChartEndDate) {
           qs += `&startDate=${activeChartStartDate}&endDate=${activeChartEndDate}`;
        }
        fetch(`/api/stocks/quote/${encodeURIComponent(activeChartSymbol)}?${qs}`)
          .then(async res => {
            if (!res.ok) throw new Error("Network response was not ok.");
            const text = await res.text();
            try {
              return JSON.parse(text);
            } catch (e) {
              throw new Error("Received non-JSON response");
            }
          })
          .then(data => setQuotes((prev) => ({ ...prev, [activeChartSymbol]: data })))
          .catch(err => {
             // Silently ignore auto-refresh failures to prevent transient errors during server reloads
          });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeChartSymbol, activeChartRange, activeChartStartDate, activeChartEndDate]);

  // UseEffect 1.5: Refetch quote sparkline for TWII when marketChartRange changes
  useEffect(() => {
    const fetchMarketRangeQuote = async () => {
      try {
        let qs = `range=${marketChartRange}`;
        if (marketChartRange === "custom" && marketChartStartDate && marketChartEndDate) {
           qs += `&startDate=${marketChartStartDate}&endDate=${marketChartEndDate}`;
        }
        const res = await fetch(`/api/stocks/quote/%5ETWII?${qs}`);
        if (res.ok) {
          const text = await res.text();
          try {
             const data = JSON.parse(text);
             setQuotes((prev) => ({ ...prev, "^TWII": data }));
          } catch (e) {
             throw new Error("Received non-JSON response");
          }
        }
      } catch (err) {
        console.warn("Failed fetching updated market quote:", err);
      }
    };

    fetchMarketRangeQuote();

    const interval = setInterval(() => {
      let qs = `range=${marketChartRange}`;
      if (marketChartRange === "custom" && marketChartStartDate && marketChartEndDate) {
         qs += `&startDate=${marketChartStartDate}&endDate=${marketChartEndDate}`;
      }
      fetch(`/api/stocks/quote/%5ETWII?${qs}`)
        .then(async res => {
          if (!res.ok) throw new Error("Network response was not ok.");
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (e) {
            throw new Error("Received non-JSON response");
          }
        })
        .then(data => setQuotes((prev) => ({ ...prev, "^TWII": data })))
        .catch(err => {
           // Silently ignore auto-refresh failures
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [marketChartRange, marketChartStartDate, marketChartEndDate]);

  // UseEffect 2: Automated AI Search & Deep-dive analysis triggered when clicking or selecting a stock
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      if (!activeChartSymbol) return;
      
      // Skip if already in cache to keep UX instantaneous
      if (aiAnalysisCache[activeChartSymbol]) return;
      
      setIsAnalysisLoading(true);
      try {
        // Look up standard name if loaded
        const quoteObj = quotes[activeChartSymbol];
        const lookupName = quoteObj?.displayName || activeChartSymbol;
        
        const res = await fetch("/api/stocks/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: activeChartSymbol, name: lookupName })
        });
        
        if (res.ok) {
          const data = await res.json();
          setAiAnalysisCache((prev) => ({ ...prev, [activeChartSymbol]: data }));
        }
      } catch (err) {
        console.warn("Error drawing AI research review:", err);
      } finally {
        setIsAnalysisLoading(false);
      }
    };

    // Delay slightly to prevent spamming during fast list navigation
    const delayAiTimeout = setTimeout(() => {
      fetchAIAnalysis();
    }, 150);

    return () => clearTimeout(delayAiTimeout);
  }, [activeChartSymbol, quotes, aiAnalysisCache]);

  // --- ACTIONS: USER WORKFLOW ACTIONS ---

  // Try adding stock item to watchlist and trigger instant fetching
  const triggerAddStock = useCallback((symbolToAdd: string) => {
    setClickCount((p) => p + 1);
    const cleaned = symbolToAdd.trim().toUpperCase();

    if (!cleaned) return;
    
    // Set as active chart selection immediately for visual response
    setActiveChartSymbol(cleaned);

    if (watchlist.includes(cleaned)) {
      setSearchQuery("");
      setSuggestions([]);
      return;
    }

    setWatchlist((prev) => {
      if (prev.includes(cleaned)) return prev;
      const updated = [...prev, cleaned];
      // Fetch details immediately for the newly appended asset
      fetchAllQuotes(updated);
      return updated;
    });

    setSearchQuery("");
    setSuggestions([]);
    setShowAutoError(false);
  }, [watchlist, setWatchlist, fetchAllQuotes]);

  // Delete stock item safely from watchlist. Keep at least 1 for preview stability.
  const triggerRemoveStock = useCallback((symbolToRemove: string) => {
    setClickCount((p) => p + 1);
    
    // Maintain filtering context
    if (activeNewsFilter === symbolToRemove) {
      setActiveNewsFilter("all");
    }

    setWatchlist((prev) => {
      const updated = prev.filter((s) => s !== symbolToRemove);
      
      // If we are deleting the currently charted stock, choose the first remaining index
      if (activeChartSymbol === symbolToRemove) {
        if (updated.length > 0) {
          setActiveChartSymbol(updated[0]);
        }
      }

      // Clean up orphaned quote dictionary metrics
      setQuotes((q) => {
        const newQ = { ...q };
        delete newQ[symbolToRemove];
        return newQ;
      });
      return updated;
    });
  }, [activeNewsFilter, activeChartSymbol, setWatchlist]);

  // Dynamic news hiding (irrelevant feedback handler)
  const triggerHideNews = useCallback((newsId: string) => {
    setClickCount((p) => p + 1);
    setIrrelevantFlagsCount((prev) => prev + 1);
    setNews((prev) => 
      prev.map((item, idx) => {
        const matchId = item.id || `news-${idx}-${item.symbol}`;
        if (matchId === newsId) {
          return { ...item, userIrrelevant: true };
        }
        return item;
      })
    );
  }, []);

  // News open trigger (read details modal & tracking timer dispatch)
  const triggerOpenNewsDetail = useCallback((item: NewsItem) => {
    setClickCount((p) => p + 1);
    setTotalReadsOpened((p) => p + 1);
    setSelectedNews(item);
    setNewsDwellTime(0);
    setHasCreditedRead(false);

    // Cancel existing timers if any
    if (dwellTimerRef.current) {
      clearInterval(dwellTimerRef.current);
    }

    // Launch intensive 1-second interval tracker to fulfill Metric B (Dwell duration audit)
    dwellTimerRef.current = setInterval(() => {
      setNewsDwellTime((prev) => {
        const nextTime = prev + 1;
        if (nextTime >= 10 && !hasCreditedRead) {
          setHasCreditedRead(true);
          setEffectiveReads((activeCount) => activeCount + 1);
        }
        return nextTime;
      });
    }, 1000);
  }, [hasCreditedRead]);

  // Close modal dialog and teardown timers cleanly
  const triggerCloseNewsDetail = useCallback(() => {
    if (dwellTimerRef.current) {
      clearInterval(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    setSelectedNews(null);
  }, []);

  // Unmount safety hook
  useEffect(() => {
    return () => {
      if (dwellTimerRef.current) {
        clearInterval(dwellTimerRef.current);
      }
    };
  }, []);

  // --- STYLING RESOLUTION UTILITIES matching chosen palette ---

  // Returns positive / negative formatting colors according to local-user configurations
  const resolvePriceTrendStyle = (change: number) => {
    const isZero = change === 0;
    if (isZero) return { text: "text-zinc-400", bg: "bg-zinc-900 border-zinc-800", sign: "" };

    const isPositive = change > 0;
    if (colorConvention === "taiwan") {
      // Taiwan style: Red is UP, Green is DOWN
      return {
        text: isPositive ? "text-rose-400 font-bold" : "text-emerald-400 font-bold",
        bg: isPositive ? "bg-rose-950/30 border-rose-900/30" : "bg-emerald-950/30 border-emerald-900/30",
        sign: isPositive ? "▲" : "▼"
      };
    } else {
      // US style: Green is UP, Red is DOWN
      return {
        text: isPositive ? "text-emerald-400 font-bold" : "text-rose-400 font-bold",
        bg: isPositive ? "bg-emerald-950/30 border-emerald-900/30" : "bg-rose-950/30 border-rose-900/30",
        sign: isPositive ? "+" : ""
      };
    }
  };

  const getSparklineColor = (change: number) => {
    if (change === 0) return "rgb(161, 161, 170)"; // zinc-400
    const isPositive = change > 0;
    if (colorConvention === "taiwan") {
      return isPositive ? "rgb(244, 63, 94)" : "rgb(52, 211, 153)"; // rose-500, emerald-400
    } else {
      return isPositive ? "rgb(52, 211, 153)" : "rgb(251, 113, 133)"; // emerald-400, rose-400
    }
  };

  // Initialize activeChartSymbol automatically if it is empty
  useEffect(() => {
    if (watchlist.length > 0 && !activeChartSymbol) {
      setActiveChartSymbol(watchlist[0]);
    }
  }, [watchlist, activeChartSymbol]);

  return (
    <div className="h-screen bg-[#0B0E14] text-[#C9D1D9] font-sans flex flex-col md:flex-row text-[13px] leading-relaxed transition-colors duration-300 antialiased overflow-x-hidden selection:bg-[#58A6FF]/20 selection:text-[#58A6FF]">
      
      {/* 1. SIDEBAR RAIL (Styled strictly using High Density aesthetic markers) */}
      <div className="relative md:w-16 shrink-0 z-[100] hidden md:block">
        <aside className="fixed inset-y-0 left-0 w-16 hover:w-56 transition-all duration-300 bg-[#010409] border-r border-[#30363D] flex flex-col py-6 justify-between select-none overflow-hidden group/sidebar" id="app-sidebar-rail">
          <div className="flex flex-col gap-4 w-full px-3">
            {/* Logo / Terminal Sign */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F6FEB]/20 to-[#58A6FF]/10 border border-[#58A6FF]/30 flex items-center justify-center text-[#58A6FF] shrink-0 self-start shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(88,166,255,0.15)] group-hover/sidebar:shadow-[0_0_20px_rgba(88,166,255,0.3)] transition-all duration-500 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#58A6FF]/20 to-transparent opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500" />
              <TrendingUp className="w-5 h-5 drop-shadow-[0_0_8px_rgba(88,166,255,0.8)]" />
            </div>

            <div className="w-8 border-b border-[#30363D] my-1 ml-1" />

            {/* Preset Utility Tabs icons */}
            <button 
              onClick={() => setActivePage("dashboard")}
              className={`h-10 rounded-lg border flex items-center transition-all cursor-pointer w-10 group-hover/sidebar:w-full overflow-hidden shrink-0 ${
                activePage === "dashboard"
                  ? "border-[#30363D] bg-[#161B22] text-[#58A6FF] shadow-sm"
                  : "border-transparent text-[#8B949E] hover:border-[#30363D] hover:text-[#C9D1D9] group-hover/sidebar:hover:bg-[#161B22]"
              }`}
            >
              <div className="w-10 flex shrink-0 items-center justify-center">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <span className="translate-y-1 opacity-0 group-hover/sidebar:translate-y-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap text-[13px] font-medium pr-3">看盤儀表板 (Dashboard)</span>
            </button>
            
            <button 
              onClick={() => setActivePage("momentum")}
              className={`h-10 rounded-lg border flex items-center transition-all cursor-pointer w-10 group-hover/sidebar:w-full overflow-hidden shrink-0 ${
                activePage === "momentum"
                  ? "border-[#30363D] bg-[#161B22] text-violet-400 shadow-sm"
                  : "border-transparent text-[#8B949E] hover:border-[#30363D] hover:text-[#C9D1D9] group-hover/sidebar:hover:bg-[#161B22]"
              }`}
            >
              <div className="w-10 flex shrink-0 items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <span className="translate-y-1 opacity-0 group-hover/sidebar:translate-y-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap text-[13px] font-medium pr-3">動能排行 (Momentum)</span>
            </button>
            
            <button 
              onClick={() => setActivePage("news")}
              className={`h-10 rounded-lg border flex items-center transition-all cursor-pointer w-10 group-hover/sidebar:w-full overflow-hidden shrink-0 ${
                activePage === "news"
                  ? "border-[#30363D] bg-[#161B22] text-emerald-400 shadow-sm"
                  : "border-transparent text-[#8B949E] hover:border-[#30363D] hover:text-[#C9D1D9] group-hover/sidebar:hover:bg-[#161B22]"
              }`}
            >
              <div className="w-10 flex shrink-0 items-center justify-center">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <span className="translate-y-1 opacity-0 group-hover/sidebar:translate-y-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap text-[13px] font-medium pr-3">AI 財經新聞 (News)</span>
            </button>

            <button 
              onClick={() => setActivePage("portfolio")}
              className={`h-10 rounded-lg border flex items-center transition-all cursor-pointer w-10 group-hover/sidebar:w-full overflow-hidden shrink-0 ${
                activePage === "portfolio"
                  ? "border-[#30363D] bg-[#161B22] text-[#58A6FF] shadow-sm"
                  : "border-transparent text-[#8B949E] hover:border-[#30363D] hover:text-[#C9D1D9] group-hover/sidebar:hover:bg-[#161B22]"
              }`}
            >
              <div className="w-10 flex shrink-0 items-center justify-center">
                <PieChart className="w-4.5 h-4.5" />
              </div>
              <span className="translate-y-1 opacity-0 group-hover/sidebar:translate-y-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap text-[13px] font-medium pr-3">持股分析 (Portfolio)</span>
            </button>

            <button 
              onClick={() => setActivePage("compare")}
              className={`h-10 rounded-lg border flex items-center transition-all cursor-pointer w-10 group-hover/sidebar:w-full overflow-hidden shrink-0 ${
                activePage === "compare"
                  ? "border-[#30363D] bg-[#161B22] text-amber-400 shadow-sm"
                  : "border-transparent text-[#8B949E] hover:border-[#30363D] hover:text-[#C9D1D9] group-hover/sidebar:hover:bg-[#161B22]"
              }`}
            >
              <div className="w-10 flex shrink-0 items-center justify-center">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <span className="translate-y-1 opacity-0 group-hover/sidebar:translate-y-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap text-[13px] font-medium pr-3">股票比較 (Compare)</span>
            </button>

            <button 
              onClick={() => setActivePage("rankings")}
              className={`h-10 rounded-lg border flex items-center transition-all cursor-pointer w-10 group-hover/sidebar:w-full overflow-hidden shrink-0 ${
                activePage === "rankings"
                  ? "border-[#30363D] bg-[#161B22] text-rose-400 shadow-sm"
                  : "border-transparent text-[#8B949E] hover:border-[#30363D] hover:text-[#C9D1D9] group-hover/sidebar:hover:bg-[#161B22]"
              }`}
            >
              <div className="w-10 flex shrink-0 items-center justify-center">
                <BarChart2 className="w-4.5 h-4.5" />
              </div>
              <span className="translate-y-1 opacity-0 group-hover/sidebar:translate-y-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap text-[13px] font-medium pr-3">強弱勢排行 (Rankings)</span>
            </button>

            <button 
              onClick={() => setActivePage("cloud_strategy")}
              className={`h-10 rounded-lg border flex items-center transition-all cursor-pointer w-10 group-hover/sidebar:w-full overflow-hidden shrink-0 ${
                activePage === "cloud_strategy"
                  ? "border-[#30363D] bg-[#161B22] text-[#D2A8FF] shadow-sm animate-pulse-subtle"
                  : "border-transparent text-[#8B949E] hover:border-[#30363D] hover:text-[#C9D1D9] group-hover/sidebar:hover:bg-[#161B22]"
              }`}
            >
              <div className="w-10 flex shrink-0 items-center justify-center">
                <Cloud className="w-4.5 h-4.5" />
              </div>
              <span className="translate-y-1 opacity-0 group-hover/sidebar:translate-y-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap text-[13px] font-medium pr-3">AI 產業鏈選股 (AI Chain)</span>
            </button>
          </div>

          <div className="flex flex-col items-start px-3 gap-4 w-full">
            <div className="w-8 border-b border-[#30363D] my-1 ml-1" />
            <button 
              onClick={() => setShowGuide(true)}
              className="h-10 rounded-lg border border-transparent flex items-center text-[#8B949E] hover:text-[#C9D1D9] cursor-pointer w-10 group-hover/sidebar:w-full overflow-hidden group-hover/sidebar:hover:bg-[#161B22] group-hover/sidebar:hover:border-[#30363D] transition-all" 
              title="操作說明"
            >
              <div className="w-10 flex shrink-0 items-center justify-center">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <span className="translate-y-1 opacity-0 group-hover/sidebar:translate-y-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap text-[13px] font-medium pr-3">系統操作說明</span>
            </button>
          </div>
        </aside>
      </div>

      {/* MOBILE TAB BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(68px+env(safe-area-inset-bottom))] bg-[#010409] border-t border-[#30363D] flex items-start pt-2 justify-around px-2 z-[150] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <button 
            onClick={() => setActivePage("dashboard")}
            className={`flex flex-col items-center justify-start w-14 h-12 gap-1 transition-all ${activePage === "dashboard" ? "text-[#58A6FF]" : "text-[#8B949E]"}`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] scale-90 origin-bottom">儀表板</span>
        </button>
        <button 
            onClick={() => setActivePage("momentum")}
            className={`flex flex-col items-center justify-start w-14 h-12 gap-1 transition-all ${activePage === "momentum" ? "text-violet-400" : "text-[#8B949E]"}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] scale-90 origin-bottom">動能</span>
        </button>
        <button 
            onClick={() => setActivePage("news")}
            className={`flex flex-col items-center justify-start w-14 h-12 gap-1 transition-all ${activePage === "news" ? "text-emerald-400" : "text-[#8B949E]"}`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] scale-90 origin-bottom">新聞</span>
        </button>
        <button 
            onClick={() => setActivePage("portfolio")}
            className={`flex flex-col items-center justify-start w-14 h-12 gap-1 transition-all ${activePage === "portfolio" ? "text-[#58A6FF]" : "text-[#8B949E]"}`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] scale-90 origin-bottom">持股</span>
        </button>
        <button 
            onClick={() => setShowGuide(true)}
            className="flex flex-col items-center justify-start w-14 h-12 gap-1 transition-all text-[#8B949E]"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] scale-90 origin-bottom">說明</span>
        </button>
      </div>

      {/* 2. MAIN HUB WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 pb-[calc(68px+env(safe-area-inset-bottom))] md:pb-0 h-screen overflow-y-auto" id="main-content-area">
        
        {/* TOP SYSTEM HEADER */}
        <header className="sticky top-0 z-50 h-[60px] bg-gradient-to-r from-[#010409]/90 via-[#0D1117]/90 to-[#010409]/90 backdrop-blur-xl border-b border-[#30363D]/60 shadow-[0_8px_30px_rgb(0,0,0,0.4)] px-4 sm:px-6 flex items-center justify-between select-none gap-2 sm:gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-[#8B949E] bg-gradient-to-br from-[#010409]/80 to-[#161B22]/40 px-3 py-1.5 rounded-xl border border-[#30363D]/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#58A6FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <Globe2 className="w-4 h-4 text-[#58A6FF] drop-shadow-[0_0_8px_rgba(88,166,255,0.6)] group-hover:rotate-12 transition-transform duration-500" />
              <span className="font-bold tracking-[0.2em] text-[#C9D1D9] drop-shadow-sm uppercase ml-1">Quantum</span>
              <span className="w-px h-3.5 bg-gradient-to-b from-transparent via-[#30363D] to-transparent mx-1" />
              <UtcClock />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0 pr-1">
            {/* Color Convention Toggle Switch (Segmented Controller) */}
            <div className="flex items-center bg-[#010409]/60 p-[3px] border border-[#30363D]/60 rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] shrink-0">
              <button
                onClick={() => { setClickCount(p => p + 1); setColorConvention("taiwan"); }}
                className={`px-3 py-1.5 text-[10px] sm:text-[11px] rounded-lg transition-all duration-300 cursor-pointer font-medium ${
                  colorConvention === "taiwan"
                    ? "bg-[#161B22] text-white border border-[#30363D] shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                    : "text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]/50"
                }`}
                id="btn-toggle-convention-taiwan"
              >
                台股 <span className="hidden sm:inline">(紅漲綠跌)</span>
              </button>
              <button
                onClick={() => { setClickCount(p => p + 1); setColorConvention("us"); }}
                className={`px-3 py-1.5 text-[10px] sm:text-[11px] rounded-lg transition-all duration-300 cursor-pointer font-medium ${
                  colorConvention === "us"
                    ? "bg-[#161B22] text-white border border-[#30363D] shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                    : "text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]/50"
                }`}
                id="btn-toggle-convention-us"
              >
                美股 <span className="hidden sm:inline">(綠漲紅跌)</span>
              </button>
            </div>

            {/* Auth Button */}
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center gap-2 bg-[#010409]/80 p-1.5 pr-3 border border-[#30363D]/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] rounded-full">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1F6FEB] to-[#388BFD] overflow-hidden flex items-center justify-center shadow-sm">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-white text-[11px] font-bold shadow-sm">{user.email?.[0].toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#8B949E] hidden lg:block max-w-[120px] truncate">{user.email}</span>
                  <button onClick={logout} className="ml-1 text-[#8B949E] hover:text-[#F85149] transition-colors cursor-pointer" title="登出">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button onClick={login} className="flex items-center gap-2 bg-gradient-to-b from-[#2EA043] to-[#238636] hover:from-[#3FB950] hover:to-[#2EA043] shadow-[0_2px_10px_rgba(35,134,54,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] px-4 py-1.5 rounded-full border border-[#238636]/50 text-white text-[11px] font-bold tracking-wide transition-all duration-300 cursor-pointer" id="btn-login-cloud">
                  <LogIn className="w-3.5 h-3.5 drop-shadow-sm" />
                  <span className="drop-shadow-sm">登入同步雲端</span>
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-[#8B949E] bg-[#010409]/60 px-3 py-1.5 rounded-lg border border-[#30363D]/50 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
              {isSyncing ? (
                <span className="flex items-center gap-1.5 text-[#D2A8FF] font-medium"><RefreshCcw className="w-3.5 h-3.5 animate-spin"/> SYNCING</span>
              ) : user ? (
                <span className="flex items-center gap-1.5 text-[#3FB950] font-medium"><CheckCircle className="w-3.5 h-3.5"/> SYNCED</span>
              ) : null}
              {user && <span className="w-px h-3.5 bg-[#30363D] mx-1" />}
              <span>LATENCY:</span>
              <span className="text-[#58A6FF] font-bold drop-shadow-[0_0_8px_rgba(88,166,255,0.4)]">12ms</span>
            </div>

            <span className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              STABLE
            </span>
          </div>
        </header>

        {/* WORKSPACE DATA AREA */}
        <section className="flex-1 p-2 sm:p-5 overflow-y-auto space-y-3 sm:space-y-5 overflow-x-hidden">

          {/* ACTION TOOLBAR (Clean & Minimalist) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#30363D]/40 mt-1 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1F6FEB]/20 to-[#58A6FF]/10 border border-[#58A6FF]/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_10px_rgba(88,166,255,0.1)]">
                <LayoutDashboard className="w-4.5 h-4.5 text-[#58A6FF] drop-shadow-[0_0_8px_rgba(88,166,255,0.8)]" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#E6EDF3] tracking-tight">Market Overview</h1>
                <p className="text-[10px] text-[#8B949E] font-mono uppercase tracking-wider">Real-time data engine</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { 
                  setClickCount(p => p + 1); 
                  fetchAllQuotes(watchlist, { activeSymbol: activeChartSymbol || undefined, activeRange: activeChartRange, startDate: activeChartStartDate || undefined, endDate: activeChartEndDate || undefined }); 
                }}
                disabled={isQuotesLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#21262D] border border-[#30363D] hover:bg-[#30363D] hover:border-[#8B949E] text-[#C9D1D9] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 font-mono text-[11px] cursor-pointer focus:outline-none disabled:opacity-40 shadow-sm group"
                id="btn-trigger-all-refresh"
              >
                <RefreshCcw className={`w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-180 ${isQuotesLoading ? "animate-spin text-[#58A6FF]" : "text-[#8B949E] group-hover:text-white"}`} />
                <span className="font-semibold tracking-wide">REFRESH SYNC</span>
              </button>
            </div>
          </div>

          {/* LOWER WORK DECK */}
          <div className="w-full">
            
            {/* Dashboard View */}
            {activePage === "dashboard" && (
              <div className="flex flex-col gap-4 lg:gap-5">
                
                {/* Market Index Overview - TWII (NOW ON TOP) */}
                {quotes["^TWII"] && (
                  <div className="bg-gradient-to-br from-[#161B22]/80 to-[#0D1117]/80 backdrop-blur-xl border border-[#30363D]/80 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#1F6FEB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#30363D]/50 relative z-10 w-full gap-3">
                       <div className="flex items-center gap-3 w-full sm:w-auto">
                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F6FEB]/20 to-[#58A6FF]/10 border border-[#58A6FF]/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
                           <Activity className="w-5 h-5 text-[#58A6FF] drop-shadow-[0_0_8px_rgba(88,166,255,0.8)]" />
                         </div>
                         <div className="min-w-0">
                           <h3 className="text-sm border-0 bg-transparent font-bold text-[#E6EDF3] tracking-tight truncate m-0 p-0 leading-tight">Taiwan Capitalization Weighted Index</h3>
                           <p className="text-[10px] text-[#8B949E] font-mono tracking-widest uppercase mt-0.5">Macro Market Indicator (^TWII)</p>
                         </div>
                       </div>
                       
                       <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#010409]/60 rounded-lg border border-[#30363D]/50 backdrop-blur-sm shadow-inner self-start sm:self-auto">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                            <span className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider font-semibold">Live System Sync</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="mt-4 relative z-10 w-full">
                      <ActiveStockChart
                        quote={quotes["^TWII"]}
                        colorConvention={colorConvention}
                        range={marketChartRange}
                        startDate={marketChartStartDate}
                        endDate={marketChartEndDate}
                        // @ts-ignore
                        onRangeChange={handleMarketRangeChange}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
                  {/* LEFT SIDEBAR: Search Engine & Quick Interactions (Proportions: 4/12) */}
                  <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-5 space-y-0 h-auto lg:sticky lg:top-4 self-start">
                    {/* Global Unified Search Engine - Compacted for sidebar */}
                    <div className="bg-gradient-to-b from-[#161B22]/80 to-[#0D1117]/80 backdrop-blur-xl border border-[#30363D]/80 rounded-2xl p-5 flex flex-col justify-center gap-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.2)] relative overflow-visible group w-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#58A6FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
                      
                      <div className="space-y-1.5 relative z-10">
                        <h2 className="text-sm font-bold text-[#E6EDF3] tracking-tight flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#58A6FF] drop-shadow-[0_0_8px_rgba(88,166,255,0.8)]" />
                          Global Search
                        </h2>
                        <p className="text-[11px] text-[#8B949E] font-medium font-sans">Find stock ticker or company name</p>
                      </div>

                      <div className="relative group/input w-full z-20">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#58A6FF]/70 group-focus-within/input:text-[#58A6FF] transition-colors">
                          <Command className="w-4 h-4 drop-shadow-sm" />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="e.g. AAPL, NVDA..."
                          className="w-full bg-[#010409]/90 backdrop-blur-sm border border-[#30363D]/80 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder:text-[#58A6FF]/30 font-medium focus:outline-none focus:border-[#58A6FF]/60 focus:bg-[#0D1117] focus:ring-2 focus:ring-[#58A6FF]/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                          id="input-stock-autocomplete-search"
                        />
                        {showAutoError && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-400 text-[10px] font-bold pointer-events-none shadow-sm">
                            <AlertCircle className="w-3 h-3" />
                          </div>
                        )}

                        {suggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-[110%] bg-[#161B22]/95 backdrop-blur-2xl border border-[#30363D]/80 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] divide-y divide-[#30363D]/50 overflow-hidden outline outline-1 outline-white/5 opacity-100 z-[100]" id="suggestions-overlay-dropdown" style={{width: "max-content", minWidth: "100%"}}>
                            {suggestions.map((item) => (
                              <button
                                key={item.symbol}
                                onClick={() => triggerAddStock(item.symbol)}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1F6FEB]/10 cursor-pointer text-left transition-colors group/item"
                                id={`suggestion-item-${item.symbol}`}
                              >
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-bold text-[#58A6FF] group-hover/item:text-white transition-colors">{item.symbol}</span>
                                    <span className="text-[9px] font-mono bg-gradient-to-r from-[#30363D]/80 to-[#161B22]/80 border border-[#30363D] text-[#8B949E] px-1.5 py-0.5 rounded uppercase tracking-wider">
                                      {item.category}
                                    </span>
                                  </div>
                                  <span className="text-[13px] text-[#E6EDF3] font-medium group-hover/item:text-white transition-colors">{item.name}</span>
                                </div>
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#30363D]/30 text-[#8B949E] group-hover/item:bg-[#1F6FEB] group-hover/item:text-white transition-all shadow-sm">
                                  <Plus className="w-3.5 h-3.5" />
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Stock Portfolio Summary (Compact) */}
                    {quotes[activeChartSymbol] && (
                      <div className="flex flex-col gap-4 lg:gap-5 w-full">
                        <ActiveStockPortfolio 
                          quote={quotes[activeChartSymbol]}
                          colorConvention={colorConvention}
                        />
                        <StockDetailsPanel symbol={activeChartSymbol} />
                      </div>
                    )}
                  </div>

                  {/* RIGHT MAIN COLUMN: Active Chart & Deep Analysis (Proportions: 8/12) */}
                  <div className="lg:col-span-8 flex flex-col gap-4 lg:gap-5 h-full min-w-0">
                    {/* Interactive Trend Chart for the selected Symbol */}
                    {quotes[activeChartSymbol] ? (
                      <ActiveStockChart
                        quote={quotes[activeChartSymbol]}
                        colorConvention={colorConvention}
                        range={activeChartRange}
                        startDate={activeChartStartDate}
                        endDate={activeChartEndDate}
                        // @ts-ignore
                        onRangeChange={handleActiveRangeChange}
                      />
                    ) : watchlist.length > 0 && quotes[watchlist[0]] ? (
                      <ActiveStockChart
                        quote={quotes[watchlist[0]]}
                        colorConvention={colorConvention}
                        range={activeChartRange}
                        startDate={activeChartStartDate}
                        endDate={activeChartEndDate}
                        // @ts-ignore
                        onRangeChange={handleActiveRangeChange}
                      />
                    ) : (
                      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 text-center text-zinc-500 italic shadow-sm w-full">
                        請選擇下方或自選股清單中的股票以檢視即時趨勢圖
                      </div>
                    )}

                    {/* AI Deep Analysis underneath the trend chart */}
                    {quotes[activeChartSymbol] && (
                      <AiAnalysisPanel
                        quote={quotes[activeChartSymbol]}
                        analysis={aiAnalysisCache[activeChartSymbol] || null}
                        isLoading={isAnalysisLoading}
                        colorConvention={colorConvention}
                      />
                    )}
                  </div>
                </div>

                {/* BOTTOM FULL WIDTH: WATCHLIST INTERACTIVE TABLE */}
                <div className="bg-gradient-to-tr from-[#161B22]/90 to-[#0D1117]/90 border border-[#30363D]/80 rounded-2xl overflow-hidden h-fit shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                  {/* Header inside Container with segment selector */}
                  <div className="p-4 sm:p-5 border-b border-[#30363D]/60 flex flex-col sm:flex-row sm:items-center justify-between bg-[#161B22]/50 gap-4 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1F6FEB]/20 to-[#58A6FF]/10 border border-[#58A6FF]/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                            <Briefcase className="w-4 h-4 text-[#58A6FF]" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider flex items-center gap-2">
                              Watchlist Matrix
                              <span className="text-[10px] font-mono bg-[#010409] border border-[#30363D]/80 text-[#8B949E] px-2 py-0.5 rounded-full shadow-inner">
                                {watchlist.length}
                              </span>
                            </span>
                            <span className="text-[10px] text-[#8B949E] font-medium hidden sm:block">Real-time valuation synchronization</span>
                          </div>
                        </div>

                      {/* 一鍵切換台股美股: Segmented Filter Control */}
                      <div className="flex items-center bg-[#010409] p-0.5 border border-[#30363D] rounded-lg text-xs font-medium self-start sm:self-auto shrink-0 select-none">
                        <button
                          onClick={() => { 
                            setClickCount(p => p + 1); 
                            setGlobalMarket("taiwan"); 
                            setColorConvention("taiwan");
                          }}
                          className={`px-4 sm:px-3 py-2.5 sm:py-1.5 text-[12px] sm:text-[11px] rounded transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] sm:min-h-[unset] ${
                            globalMarket === "taiwan"
                              ? "bg-[#161B22] text-[#C9D1D9] border border-[#30363D] shadow-sm font-semibold"
                              : "text-[#8B949E] hover:text-[#C9D1D9]"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          台股 (TW)
                        </button>
                        <button
                          onClick={() => { 
                            setClickCount(p => p + 1); 
                            setGlobalMarket("us"); 
                            setColorConvention("us");
                          }}
                          className={`px-4 sm:px-3 py-2.5 sm:py-1.5 text-[12px] sm:text-[11px] rounded transition-all cursor-pointer flex items-center gap-1.5 min-h-[40px] sm:min-h-[unset] ${
                            globalMarket === "us"
                              ? "bg-[#161B22] text-[#C9D1D9] border border-[#30363D] shadow-sm font-semibold"
                              : "text-[#8B949E] hover:text-[#C9D1D9]"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-450" />
                          美股 (US)
                        </button>
                      </div>
                      
                      {isQuotesLoading ? (
                        <span className="text-[10px] text-[#58A6FF] animate-pulse font-mono flex items-center gap-1.5 bg-[#58A6FF]/10 px-2.5 py-0.5 rounded border border-[#58A6FF]/20">
                          <span className="w-1.5 h-1.5 bg-[#58A6FF] rounded-full animate-ping" />
                          更新中...
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          線上
                        </span>
                      )}
                    </div>

                    {/* Table Body */}
                    {watchlist.length === 0 ? (
                      <div className="p-12 text-center text-zinc-500 space-y-2">
                        <Info className="w-8 h-8 mx-auto text-[#8B949E] opacity-60" />
                        <p className="text-xs font-medium text-[#C9D1D9]">當前篩選下的股票清單是空的</p>
                        <p className="text-[11px] text-[#8B949E]">請使用上方「防呆搜尋」切換分類市場。</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto w-full">
                        <table className="w-full min-w-[700px] text-left border-collapse">
                          <thead>
                            <tr className="bg-[#010409]/60 border-b border-[#30363D] select-none text-[11px] uppercase text-[#8B949E]">
                              <th className="py-2.5 px-4 font-semibold">股票基本資訊</th>
                              <th className="py-2.5 px-3 font-semibold text-right">當前股價</th>
                              <th className="py-2.5 px-3 font-semibold text-right">漲跌幅</th>
                              <th className="py-2.5 px-3 font-semibold text-center">P/E</th>
                              <th className="py-2.5 px-4 font-semibold text-center min-w-[130px]">高低區間</th>
                              <th className="py-2.5 px-4 font-semibold text-center w-24">1y 趨勢</th>
                              <th className="py-2.5 px-3 font-semibold text-center">刪除</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#30363D] font-sans">
                            {watchlist.map((symbol) => {
                              const quote = quotes[symbol];
                              const isActive = activeChartSymbol === symbol;
                              
                              if (!quote) {
                                return (
                                  <tr key={symbol} className="hover:bg-[#010409]/10">
                                    <td className="py-3 px-4 font-mono text-xs font-bold text-[#58A6FF]">{symbol}</td>
                                    <td colSpan={6} className="py-3 px-4 text-xs font-mono text-[#8B949E] italic text-center">
                                      系統連結加載中...
                                    </td>
                                  </tr>
                                );
                              }

                              const trend = resolvePriceTrendStyle(quote.change);
                              
                              const rangeSpan = quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow || 1;
                              const rangePosPct = Math.min(
                                Math.max(((quote.price - quote.fiftyTwoWeekLow) / rangeSpan) * 100, 0),
                                100
                              );

                              return (
                                <tr 
                                  key={symbol} 
                                  onClick={() => {
                                    setClickCount((p) => p + 1);
                                    setActiveChartSymbol(symbol);
                                  }}
                                  className={`hover:bg-[#010409]/30 group transition-colors cursor-pointer select-none ${
                                    isActive 
                                      ? "bg-gradient-to-r from-[#58A6FF]/10 to-transparent border-l-2 border-[#58A6FF]" 
                                      : ""
                                  }`}
                                >
                                  {/* Symbol Info */}
                                  <td className="py-3 px-4">
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-xs font-bold text-[#C9D1D9]">{quote.symbol}</span>
                                        {quote.isModelFallback && (
                                          <span className="text-[9px] font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-1 rounded" title="伺服器 API 超載或防堵中，已啟用離線估算模型以維持使用者體驗穩定。">
                                            離線備援
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-[#8B949E] leading-tight" title={quote.displayName}>
                                        {quote.displayName}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Current Price */}
                                  <td className="py-3 px-3 text-right font-mono font-bold text-[#C9D1D9]">
                                    <div className="inline-block px-1 rounded -mr-1">
                                      {quote.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-[10px] text-[#8B949E] font-normal uppercase tracking-wider">{quote.currency}</div>
                                  </td>

                                  {/* Change % */}
                                  <td className="py-3 px-3 text-right font-mono">
                                    <div className={`inline-block px-1 rounded -mr-1 ${trend.text}`}>
                                      {trend.sign} {Math.abs(quote.change ?? 0).toFixed(2)}
                                    </div>
                                    <div className="flex flex-col items-end mt-0.5">
                                      <div className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                                        (quote.changePercent ?? 0) >= 9.8 
                                          ? (colorConvention === 'taiwan' ? 'bg-rose-500 text-[#010409] font-bold tracking-wide' : 'bg-emerald-500 text-[#010409] font-bold tracking-wide') 
                                          : (quote.changePercent ?? 0) <= -9.8 
                                            ? (colorConvention === 'taiwan' ? 'bg-emerald-500 text-[#010409] font-bold tracking-wide' : 'bg-rose-500 text-[#010409] font-bold tracking-wide')
                                            : `font-medium ${trend.text}`
                                      }`}>
                                        {(quote.changePercent ?? 0) >= 0 ? "+" : ""}{(quote.changePercent ?? 0).toFixed(2)}%
                                      </div>
                                    </div>
                                  </td>

                                  {/* P/E Ratio */}
                                  <td className="py-3 px-3 text-center font-mono">
                                    {typeof quote.peRatio === 'number' && quote.peRatio !== null ? (
                                      <span className="text-zinc-200 bg-[#010409] border border-[#30363D] px-2 py-0.75 rounded text-xs font-medium">
                                        {quote.peRatio.toFixed(1)}x
                                      </span>
                                    ) : (
                                      <span className="text-[#8B949E] text-xs font-normal">N/A</span>
                                    )}
                                  </td>

                                  {/* 52-Week High/Low range visual progress track */}
                                  <td className="py-3 px-4">
                                    <div className="flex flex-col gap-1 w-full text-[10px] font-mono text-[#8B949E]">
                                      <div className="flex justify-between w-full">
                                        <span title="52週最低">{(quote.fiftyTwoWeekLow ?? 0).toFixed(1)}</span>
                                        <span title="52週最高" className="text-right">{(quote.fiftyTwoWeekHigh ?? 0).toFixed(1)}</span>
                                      </div>
                                      <div className="relative h-2 bg-[#010409] rounded border border-[#30363D]">
                                        <div 
                                          className="absolute -top-1 w-2.5 h-3.5 bg-[#58A6FF] rounded border border-[#0B0E14] shadow-md -translate-x-1/2"
                                          style={{ left: `${rangePosPct}%` }}
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  {/* Sparkline Trend */}
                                  <td className="py-3 px-4 flex items-center justify-center w-24">
                                    <Sparkline
                                      points={quote.sparkline}
                                      color={getSparklineColor(quote.change)}
                                      id={quote.symbol.replace(".", "-")}
                                    />
                                  </td>

                                  {/* Actions Remove */}
                                  <td className="py-3 px-3 text-center">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        triggerRemoveStock(symbol);
                                      }}
                                      className="text-[#8B949E] hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Momentum View */}
            {activePage === "momentum" && (
              <div className="space-y-5">
                <AiStrongStocksPanel
                  onSelectStock={(sym) => { setActiveChartSymbol(sym); setActivePage("dashboard"); }}
                  onAddToWatchlist={triggerAddStock}
                  watchlistSymbols={watchlist}
                />

                <TaiwanEtfLeaderboard
                  onSelectStock={(sym) => { setActiveChartSymbol(sym); setActivePage("dashboard"); }}
                  onAddToWatchlist={triggerAddStock}
                  watchlistSymbols={watchlist}
                />
              </div>
            )}

            {/* News View */}
            {activePage === "news" && (
              <div className="w-full max-w-4xl mx-auto">
                <NewsPanel
                  news={news}
                  colorConvention={colorConvention}
                  onMarkIrrelevant={triggerHideNews}
                  onNewsClick={triggerOpenNewsDetail}
                  activeSymbolFilter={activeNewsFilter}
                  setActiveSymbolFilter={setActiveNewsFilter}
                  isLoading={isNewsLoading}
                  quotes={quotes}
                  onSearchSymbol={(sym) => {
                    triggerAddStock(sym);
                    setActiveNewsFilter(sym);
                  }}
                />
              </div>
            )}

            {/* Portfolio View */}
            {activePage === "portfolio" && (
              <div className="w-full max-w-5xl mx-auto">
                <PortfolioPanel
                  quotes={quotes}
                  colorConvention={colorConvention}
                  onPortfolioChange={setPortfolioSymbols}
                />
              </div>
            )}

            {/* Compare View */}
            {activePage === "compare" && (
              <ComparisonPanel colorConvention={colorConvention} />
            )}

            {/* Rankings View */}
            {activePage === "rankings" && (
              <div className="space-y-6 pb-20">
                <TaiwanTopBottomStocks
                  onSelectStock={(sym) => { setActiveChartSymbol(sym); setActivePage("dashboard"); }}
                  onAddToWatchlist={triggerAddStock}
                  watchlistSymbols={watchlist}
                  colorConvention={colorConvention}
                />
                <GlobalTopBottomStocks
                  onSelectStock={(sym) => { setActiveChartSymbol(sym); setActivePage("dashboard"); }}
                  onAddToWatchlist={triggerAddStock}
                  watchlistSymbols={watchlist}
                  colorConvention={colorConvention}
                />
              </div>
            )}

            {/* Cloud Strategy View */}
            {activePage === "cloud_strategy" && (
              <CloudStrategyPanel />
            )}

          </div>

        </section>
      </main>

      {/* 3. FLUID HIGH-DENSITY TERMINAL OVERLAY FOR NEWS READING (Metric B duration monitor) */}
      {selectedNews && (
        <div className="fixed inset-0 bg-[#0B0E14]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div 
            className="w-full max-w-xl bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl overflow-hidden flex flex-col"
            id="modal-news-reading"
          >
            {/* Modal Terminal Header */}
            <div className="px-4 py-3 bg-[#010409] border-b border-[#30363D] flex items-center justify-between">
              <span className="font-mono text-xs text-[#58A6FF] uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                AI 新聞深度解析
              </span>
              <button
                onClick={triggerCloseNewsDetail}
                className="text-[#8B949E] hover:text-[#C9D1D9] cursor-pointer"
                id="btn-close-news-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Ticker & Source banner */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono bg-[#010409] border border-[#30363D] px-2 py-0.5 rounded text-zinc-300 uppercase font-medium">
                  {selectedNews.symbol}
                </span>
                <span className="text-[#8B949E] font-serif italic text-[11px]">{selectedNews.source}</span>
                <span className="text-[#8B949E]">·</span>
                <span className="text-[#8B949E] text-[11px] font-mono">{selectedNews.time}</span>
              </div>

              {/* News Title */}
              <h2 className="text-sm font-bold text-semibold text-[#C9D1D9] leading-relaxed">
                {selectedNews.title}
              </h2>

              <hr className="border-[#30363D]" />

              {/* Bullet analysis points */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#58A6FF]" />
                  AI 摘錄核心營運動因分析
                </h3>
                <ul className="space-y-3 pl-1">
                  {selectedNews.summaryPoints.map((pt, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-zinc-300 leading-relaxed">
                      <span className="text-[#58A6FF] font-mono mt-0.5 select-none font-bold">[{idx + 1}]</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Professional investment guidelines disclaimer panel */}
              <div className="bg-[#010409] p-3 rounded-lg border border-[#30363D] space-y-1">
                <p className="text-[11px] text-[#8B949E] leading-relaxed">
                  📢 <strong>波段基本面分析提示：</strong>投資人在此應專注獲利與毛利率的相對動態，而非沉迷於分K級別的極短線情緒波動。
                </p>
              </div>

              {/* Metric B dynamic counter track */}
              <div className="bg-[#010409]/60 p-3.5 rounded-lg border border-[#30363D] flex items-center justify-between gap-3 font-mono">
                <div className="flex items-center gap-2">
                  <Timer className={`w-4 h-4 ${hasCreditedRead ? "text-emerald-400" : "text-[#58A6FF] animate-spin"}`} />
                  <div className="text-xs">
                    <span className="text-[#8B949E]">當前累計閱讀停留:</span>{" "}
                    <span className="text-[#C9D1D9] font-bold">{newsDwellTime}s</span>{" "}
                    <span className="text-[#8B949E]">/ 10s</span>
                  </div>
                </div>

                <div>
                  {hasCreditedRead ? (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> 效能通過
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#8B949E] animate-pulse">停留倒數中...</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-4 py-3 bg-[#010409] border-t border-[#30363D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-[#8B949E]">
                * 點擊右側連結可追蹤 Grounding 來源
              </span>
              <a 
                href={selectedNews.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF] hover:bg-[#30363D]/50 text-xs text-[#58A6FF] transition-all cursor-pointer font-sans"
                id="link-news-modal-original"
              >
                <span>閱讀新聞原始連結</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal (操作說明) */}
      {showGuide && (
        <div className="fixed inset-0 bg-[#0B0E14]/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in font-sans" onClick={() => setShowGuide(false)}>
          <div 
            className="w-full max-w-lg bg-[#0D1117] border border-[#30363D] rounded-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            onClick={e => e.stopPropagation()}
            id="modal-guide"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363D]">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#58A6FF]" />
                <h3 className="text-[15px] font-bold text-[#E6EDF3] tracking-wider">系統操作說明</h3>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent hover:bg-[#30363D]/50 text-[#8B949E] hover:text-[#C9D1D9] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 text-[#C9D1D9] text-[13px] leading-relaxed space-y-4">
              <p className="text-[#8B949E] border-b border-[#30363D]/50 pb-3">
                本系統為「極簡化量化決策平台」，旨在透過資訊減法協助投資人克服雜訊。以下為基礎操作簡介：
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Activity className="w-4 h-4 text-[#58A6FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#C9D1D9]">看盤儀表板 (Dashboard)</span>
                    <p className="text-zinc-400 mt-1">匯聚關注清單，點擊標的秒速檢閱股價走勢、大盤對比與 AI 基本面診斷。</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#C9D1D9]">AI 財經新聞 (News) & 雜訊過濾</span>
                    <p className="text-zinc-400 mt-1">自動分析市場新聞，可將無關報導一鍵「標記無關」，系統將自動重新校驗並剔除雜訊。</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <BarChart2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#C9D1D9]">排行與動能 (Rankings)</span>
                    <p className="text-zinc-400 mt-1">即時檢視台美股市場排名前段班與強弱勢排行榜。</p>
                  </div>
                </li>
              </ul>

              <div className="bg-[#161B22]/50 rounded-lg p-3 border border-[#30363D] mt-2">
                <strong>💡 快速上手：</strong> 於左上方搜尋列輸入股票代號或名稱，即可加入自訂追蹤清單。點擊該檔股票，右側將載入最深度的基本面與總結，完全無需面對複雜 K 線。
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3 bg-[#010409] border-t border-[#30363D] flex justify-end">
              <button 
                onClick={() => setShowGuide(false)}
                className="px-4 py-1.5 rounded-lg bg-[#58A6FF] hover:bg-[#58A6FF]/90 text-[#0B0E14] font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                了解並開始使用
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
