import React, { useState, useMemo, useRef, useEffect } from "react";
import { StockQuote, ColorConvention } from "../types";
import { TrendingUp, TrendingDown, Clock, Activity, Calendar, Award, Loader2 } from "lucide-react";

interface ActiveStockChartProps {
  quote: StockQuote;
  colorConvention: ColorConvention;
  range: "1d" | "2d" | "3d" | "5d" | "1w" | "2w" | "3w" | "1m" | "2m" | "3m" | "4m" | "5m" | "6m" | "9m" | "ytd" | "1y" | "2y" | "3y" | "4y" | "5y" | "10y" | "15y" | "20y" | "all" | "custom";
  startDate?: string;
  endDate?: string;
  onRangeChange: (r: "1d" | "2d" | "3d" | "5d" | "1w" | "2w" | "3w" | "1m" | "2m" | "3m" | "4m" | "5m" | "6m" | "9m" | "ytd" | "1y" | "2y" | "3y" | "4y" | "5y" | "10y" | "15y" | "20y" | "all" | "custom", startDate?: string, endDate?: string) => void;
  isLoading?: boolean;
}

export default function ActiveStockChart({ 
  quote, 
  colorConvention, 
  range, 
  startDate,
  endDate,
  onRangeChange,
  isLoading = false 
}: ActiveStockChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const points = quote.sparkline;
  const isUp = quote.change >= 0;
  
  // High density stock themes
  const color = useMemo(() => {
    if (quote.change === 0) return "rgb(161, 161, 170)"; // zinc-400
    if (colorConvention === "taiwan") {
      return isUp ? "rgb(244, 63, 94)" : "rgb(52, 211, 153)"; // Red (rose) is up, Green (emerald) is down
    } else {
      return isUp ? "rgb(52, 211, 153)" : "rgb(251, 113, 133)"; // Green (emerald) is up, Red (rose) is down
    }
  }, [quote.change, colorConvention, isUp]);

  // Dimensions of container
  const width = 640;
  const height = 180;

  const [viewRange, setViewRange] = useState<[number, number]>([0, 1]);

  const [visibleMAs, setVisibleMAs] = useState({
    ma5: false,
    ma10: true,
    ma20: true,
    ma60: false
  });
  
  const [showRSI, setShowRSI] = useState(false);

  const movingAveragesData = useMemo(() => {
    const ma5: {index: number, value: number}[] = [];
    const ma10: {index: number, value: number}[] = [];
    const ma20: {index: number, value: number}[] = [];
    const ma60: {index: number, value: number}[] = [];

    let sum5 = 0;
    let sum10 = 0;
    let sum20 = 0;
    let sum60 = 0;

    for (let i = 0; i < points.length; i++) {
      sum5 += points[i];
      sum10 += points[i];
      sum20 += points[i];
      sum60 += points[i];

      if (i > 4) sum5 -= points[i - 5];
      ma5.push({ index: i, value: sum5 / Math.min(i + 1, 5) });
      
      if (i > 9) sum10 -= points[i - 10];
      ma10.push({ index: i, value: sum10 / Math.min(i + 1, 10) });
      
      if (i > 19) sum20 -= points[i - 20];
      ma20.push({ index: i, value: sum20 / Math.min(i + 1, 20) });

      if (i > 59) sum60 -= points[i - 60];
      ma60.push({ index: i, value: sum60 / Math.min(i + 1, 60) });
    }
    
    return { ma5, ma10, ma20, ma60 };
  }, [points]);

  useEffect(() => {
    setViewRange([0, 1]);
  }, [quote.symbol, range]);

  useEffect(() => {
    const handleNativeWheel = (e: WheelEvent) => {
      if ((e.target as Element)?.closest('svg')) {
        e.preventDefault(); // Prevent page scroll
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleNativeWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener("wheel", handleNativeWheel);
      }
    };
  }, []);

  const minVal = useMemo(() => {
    const start = Math.floor(viewRange[0] * (points.length - 1));
    const end = Math.ceil(viewRange[1] * (points.length - 1));
    const slice = points.slice(Math.max(0, start), Math.min(points.length, end + 1));
    let currentMin = Math.min(...(slice.length ? slice : points));
    
    // Also include MAs in bounds
    if (visibleMAs.ma5) {
      const ma5Slice = movingAveragesData.ma5.slice(Math.max(0, start), Math.min(points.length, end + 1));
      currentMin = Math.min(currentMin, ...ma5Slice.map(d => d.value));
    }
    if (visibleMAs.ma10) {
      const ma10Slice = movingAveragesData.ma10.slice(Math.max(0, start), Math.min(points.length, end + 1));
      currentMin = Math.min(currentMin, ...ma10Slice.map(d => d.value));
    }
    if (visibleMAs.ma20) {
      const ma20Slice = movingAveragesData.ma20.slice(Math.max(0, start), Math.min(points.length, end + 1));
      currentMin = Math.min(currentMin, ...ma20Slice.map(d => d.value));
    }
    if (visibleMAs.ma60) {
      const ma60Slice = movingAveragesData.ma60.slice(Math.max(0, start), Math.min(points.length, end + 1));
      currentMin = Math.min(currentMin, ...ma60Slice.map(d => d.value));
    }

    return currentMin;
  }, [points, viewRange, visibleMAs, movingAveragesData]);

  const maxVal = useMemo(() => {
    const start = Math.floor(viewRange[0] * (points.length - 1));
    const end = Math.ceil(viewRange[1] * (points.length - 1));
    const slice = points.slice(Math.max(0, start), Math.min(points.length, end + 1));
    let currentMax = Math.max(...(slice.length ? slice : points));

    // Also include MAs in bounds
    if (visibleMAs.ma5) {
      const ma5Slice = movingAveragesData.ma5.slice(Math.max(0, start), Math.min(points.length, end + 1));
      currentMax = Math.max(currentMax, ...ma5Slice.map(d => d.value));
    }
    if (visibleMAs.ma10) {
      const ma10Slice = movingAveragesData.ma10.slice(Math.max(0, start), Math.min(points.length, end + 1));
      currentMax = Math.max(currentMax, ...ma10Slice.map(d => d.value));
    }
    if (visibleMAs.ma20) {
      const ma20Slice = movingAveragesData.ma20.slice(Math.max(0, start), Math.min(points.length, end + 1));
      currentMax = Math.max(currentMax, ...ma20Slice.map(d => d.value));
    }
    if (visibleMAs.ma60) {
      const ma60Slice = movingAveragesData.ma60.slice(Math.max(0, start), Math.min(points.length, end + 1));
      currentMax = Math.max(currentMax, ...ma60Slice.map(d => d.value));
    }

    return currentMax;
  }, [points, viewRange, visibleMAs, movingAveragesData]);

  const valueRange = useMemo(() => (maxVal - minVal || 1), [maxVal, minVal]);

  const volumeData = useMemo(() => {
    if (points.length === 0) return [];
    
    return points.map((val, idx) => {
       const isUp = idx === 0 ? true : val >= points[idx - 1];
       const change = idx === 0 ? 0.01 : Math.abs(val - points[idx - 1]) / points[idx - 1];
       const baseVol = quote.volume ? (quote.volume / points.length) : 10000;
       
       // Add pseudo-randomness + volatility correlation
       const pseudoRandom = Math.abs(Math.sin((val + idx) * 12345)); 
       let generatedVol = baseVol * 0.5 + baseVol * change * 30 + baseVol * pseudoRandom * 0.5;

       return {
          vol: generatedVol,
          isUp
       };
    });
  }, [points, quote.volume]);

  const maxVolume = useMemo(() => {
    const start = Math.floor(viewRange[0] * (points.length - 1));
    const end = Math.ceil(viewRange[1] * (points.length - 1));
    const slice = volumeData.slice(Math.max(0, start), Math.min(volumeData.length, end + 1));
    return Math.max(...slice.map(d => d.vol), 1);
  }, [volumeData, viewRange, points.length]);

  const getX = useMemo(() => (idx: number) => {
    const logicalCount = Math.max(points.length, 1);
    const idxRatio = (idx + 0.5) / logicalCount;
    return ((idxRatio - viewRange[0]) / (viewRange[1] - viewRange[0])) * width;
  }, [points.length, viewRange, width]);

  const chartData = useMemo(() => {
    if (points.length === 0) return [];
    return points.map((val, idx) => {
      const x = getX(idx);
      // Invert Y axis, leave 12px margin top and bottom
      const y = height - ((val - minVal) / valueRange) * (height - 24) - 12;
      return { x, y, value: val, index: idx };
    });
  }, [points, minVal, maxVal, valueRange, height, getX]);

  const yTicks = useMemo(() => {
     return [
       { val: minVal + valueRange * 0.9, y: height - 0.9 * (height - 24) - 12 },
       { val: minVal + valueRange * 0.5, y: height - 0.5 * (height - 24) - 12 },
       { val: minVal + valueRange * 0.1, y: height - 0.1 * (height - 24) - 12 },
     ];
  }, [minVal, valueRange, height]);

  const xTicks = useMemo(() => {
     if (points.length === 0 || !quote.sparklineTimestamps) return [];
     const totalItems = points.length;
     const startIdx = Math.max(0, Math.floor(viewRange[0] * totalItems));
     const endIdx = Math.min(totalItems - 1, Math.floor(viewRange[1] * totalItems));
     const visibleItems = endIdx - startIdx;
     if (visibleItems < 1) return [];

     const ticks = [];
     for (let i = 0; i <= 4; i++) {
        const itemIdx = startIdx + Math.floor((i / 4) * visibleItems);
        const t = quote.sparklineTimestamps[itemIdx];
        if (t) {
            
            const date = new Date(t);
            let label = "";
            if (range === "1d" || range === "3d" || range === "5d" || range === "1w") {
               label = `${date.getMonth()+1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            } else if (range === "2w" || range === "3w" || range === "1m" || range === "2m" || range === "3m" || range === "6m" || range === "ytd") {
               label = `${date.getMonth()+1}/${date.getDate()}`;
            } else {
               label = `${date.getFullYear()}/${date.getMonth()+1}`;
            }

            ticks.push({
               index: itemIdx,
               x: getX(itemIdx),
               label
            });
        }
     }
     return ticks;
  }, [viewRange, points.length, getX, quote.sparklineTimestamps, range]);

  const movingAveragesPaths = useMemo(() => {
    const generatePath = (maData: {index: number, value: number}[]) => {
      if (maData.length === 0) return "";
      let path = "";
      for (let i = 0; i < maData.length; i++) {
         const p = maData[i];
         const x = getX(p.index);
         const y = height - ((p.value - minVal) / valueRange) * (height - 24) - 12;
         if (i === 0) {
           path += `M ${x} ${y}`;
         } else {
           path += ` L ${x} ${y}`;
         }
      }
      return path;
    };

    return { 
      ma5Path: generatePath(movingAveragesData.ma5),
      ma10Path: generatePath(movingAveragesData.ma10), 
      ma20Path: generatePath(movingAveragesData.ma20),
      ma60Path: generatePath(movingAveragesData.ma60),
    };
  }, [movingAveragesData, minVal, valueRange, getX, height]);

  const rsiData = useMemo(() => {
    if (points.length < 15) return [];
    
    let rsiArray: {index: number, x: number, rsi: number}[] = [];
    let gains = 0;
    let losses = 0;
    const period = 14;

    for (let i = 1; i < points.length; i++) {
       const change = points[i] - points[i - 1];
       const gain = change > 0 ? change : 0;
       const loss = change < 0 ? -change : 0;

       if (i <= period) {
          gains += gain;
          losses += loss;
          if (i === period) {
             const avgGain = gains / period;
             const avgLoss = losses / period;
             const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
             const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
             const x = getX(i);
             rsiArray.push({ index: i, x, rsi });
          }
       } else {
          gains = (gains * (period - 1) + gain) / period;
          losses = (losses * (period - 1) + loss) / period;
          const avgGain = gains;
          const avgLoss = losses;
          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
          const x = getX(i);
          rsiArray.push({ index: i, x, rsi });
       }
    }
    return rsiArray;
  }, [points, getX]);

  const rsiPath = useMemo(() => {
     if (rsiData.length === 0) return "";
     let path = "";
     for (let i = 0; i < rsiData.length; i++) {
        const p = rsiData[i];
        // Scale RSI 0-100 to 0-40 (height of RSI chart)
        const y = 40 - (p.rsi / 100) * 40;
        if (i === 0) {
           path += `M ${p.x} ${y}`;
        } else {
           path += ` L ${p.x} ${y}`;
        }
     }
     return path;
  }, [rsiData]);

  // Smooth spline path generator using cubic Bézier interpolation control points
  const linePath = useMemo(() => {
    if (chartData.length === 0) return "";
    
    let path = `M ${chartData[0].x} ${chartData[0].y}`;
    
    for (let i = 0; i < chartData.length - 1; i++) {
      const p0 = chartData[i];
      const p1 = chartData[i + 1];
      
      // Control points are adjusted to create custom smooth curve tension
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      
      const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
      const cpY2 = p1.y;
      
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [chartData]);

  // Filled closed path for gradient
  const fillPath = useMemo(() => {
    if (chartData.length === 0) return "";
    return `${linePath} L ${chartData[chartData.length - 1].x} ${height} L ${chartData[0].x} ${height} Z`;
  }, [chartData, linePath]);

  const [isDragging, setIsDragging] = useState(false);
  const lastXRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!(e.target as Element)?.closest('svg')) return;
    setIsDragging(true);
    lastXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    lastXRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const pinchRef = useRef<{ initialDistance: number, initialSpan: [number, number] } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!(e.target as Element)?.closest('svg')) return;
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchRef.current = { initialDistance: dist, initialSpan: [...viewRange] as [number, number] };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchRef.current) {
      if (e.cancelable) e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const { initialDistance, initialSpan } = pinchRef.current;
      const ratio = initialDistance / dist;
      
      const span = initialSpan[1] - initialSpan[0];
      let newSpan = span * ratio;
      
      const minSpan = Math.max(0.01, 10 / points.length);
      newSpan = Math.max(minSpan, Math.min(newSpan, 1));
      
      const centerClientX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const rect = e.currentTarget.getBoundingClientRect();
      const cursorX = centerClientX - rect.left;
      const cursorRatio = Math.max(0, Math.min(1, cursorX / rect.width));
      
      const cursorLogicalRatio = initialSpan[0] + cursorRatio * span;
      
      let newStart = cursorLogicalRatio - cursorRatio * newSpan;
      let newEnd = newStart + newSpan;
      
      if (newStart < 0) {
        newStart = 0;
        newEnd = newSpan;
      }
      if (newEnd > 1) {
        newEnd = 1;
        newStart = 1 - newSpan;
      }
      
      setViewRange([newStart, newEnd]);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      pinchRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (points.length < 2) return;
    if (!(e.target as Element)?.closest('svg')) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorRatio = Math.max(0, Math.min(1, cursorX / rect.width));

    const span = viewRange[1] - viewRange[0];
    
    // Zoom handling
    let dynZoomFactor = 1 + (e.deltaY * 0.002);
    if (dynZoomFactor < 0.5) dynZoomFactor = 0.5;
    if (dynZoomFactor > 2) dynZoomFactor = 2;
    
    let newSpan = span * dynZoomFactor;
    
    const minSpan = Math.max(0.01, 10 / points.length);
    newSpan = Math.max(minSpan, Math.min(newSpan, 1));
    
    const pxPerRatio = span / rect.width;
    let panDelta = e.deltaX * pxPerRatio * 0.5; // slow down trackpad panning
    
    const cursorLogicalRatio = viewRange[0] + cursorRatio * span;
    
    let newStart = cursorLogicalRatio - cursorRatio * newSpan + panDelta;
    let newEnd = newStart + newSpan;
    
    if (newStart < 0) {
       newStart = 0;
       newEnd = newSpan;
    }
    if (newEnd > 1) {
       newEnd = 1;
       newStart = 1 - newSpan;
    }
    
    setViewRange([newStart, newEnd]);
  };

  // Pointer move handler representing interactive hover tooltip crosshair
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement | SVGSVGElement>) => {
    if (!containerRef.current || chartData.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPos = e.clientX - rect.left;

    if (isDragging && lastXRef.current !== null) {
       const dx = e.clientX - lastXRef.current;
       lastXRef.current = e.clientX;
       
       const span = viewRange[1] - viewRange[0];
       const pxPerRatio = span / rect.width;
       let panDelta = -dx * pxPerRatio;
       
       let newStart = viewRange[0] + panDelta;
       let newEnd = viewRange[1] + panDelta;
       if (newStart < 0) {
         newStart = 0;
         newEnd = span;
       }
       if (newEnd > 1) {
         newEnd = 1;
         newStart = 1 - span;
       }
       setViewRange([newStart, newEnd]);
       return; 
    }
    
    // Calculate precise target index based on cursor ratio in the current view span
    const cursorRatio = xPos / rect.width;
    const span = viewRange[1] - viewRange[0];
    const logicalRatio = viewRange[0] + cursorRatio * span;
    let closestIndex = Math.floor(logicalRatio * points.length);
    closestIndex = Math.max(0, Math.min(points.length - 1, closestIndex));
    
    setHoverIndex(closestIndex);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  // Hovered value selection
  const hoveredPoint = hoverIndex !== null ? chartData[hoverIndex] : null;
  const currentVal = hoveredPoint ? hoveredPoint.value : quote.price;

  // Percentage difference from the start of sparkline (useful for波段/基本面 returns assessment)
  const percentReturn = useMemo(() => {
    if (points.length < 2) return 0;
    const initialPrice = points[0];
    return ((currentVal - initialPrice) / initialPrice) * 100;
  }, [currentVal, points]);

  const trendLabel = resolveTrendSignLabel(quote.change, colorConvention);

  function resolveTrendSignLabel(change: number, convention: "taiwan" | "us") {
    if (change === 0) return "";
    if (convention === "taiwan") {
      return change > 0 ? "▲ 紅漲" : "▼ 綠跌";
    }
    return change > 0 ? "▲ 綠漲" : "▼ 紅跌";
  }

  // Generate distinct, robust labels for all active timeframe segments
  const getTimelineLabel = (idx: number) => {
    const total = points.length;
    const itemsAgo = total - 1 - idx;
    if (itemsAgo === 0) return "最新交易點";
    
    if (range === "1d" || range === "2d") {
      const minsAgo = itemsAgo * 5;
      if (minsAgo < 60) return `${minsAgo} 分鐘前`;
      const hrsAgo = Math.floor(minsAgo / 60);
      return `${hrsAgo} 小時前 ${minsAgo % 60} 分鐘前`;
    } else if (range === "3d" || range === "5d" || range === "1w") {
      const hrsAgo = Math.floor(itemsAgo * 0.5);
      if (hrsAgo === 0) return "數十分鐘前";
      return `${hrsAgo} 交易小時前`;
    } else if (range === "2w" || range === "3w" || range === "1m") {
      return `${itemsAgo} 小時前`;
    } else if (range === "2m" || range === "3m" || range === "4m" || range === "5m" || range === "6m" || range === "9m" || range === "ytd") {
      return `${itemsAgo} 天前`;
    } else if (range === "1y" || range === "2y" || range === "3y") {
      return `${itemsAgo} 週前`;
    } else if (range === "4y" || range === "5y" || range === "10y" || range === "15y" || range === "20y" || range === "all") {
      const yearsAgo = Math.floor(itemsAgo / 12);
      const monthsAgo = itemsAgo % 12;
      return yearsAgo > 0 ? `${yearsAgo}年 ${monthsAgo}個月前` : `${monthsAgo}個月前`;
    } else {
      return `${itemsAgo} 個點前`;
    }
  };

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4 shadow-lg transition-all relative" ref={containerRef}>
      
      {/* Title & Stats Meta panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#30363D] pb-3.5">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#58A6FF] bg-[#58A6FF]/10 px-2 py-0.5 rounded border border-[#58A6FF]/20 uppercase">
              {quote.symbol}
            </span>
            <span className="text-zinc-400 font-serif italic text-xs">即時走勢追蹤</span>
            {quote.isModelFallback && (
              <span className="text-[10px] font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-1.5 rounded">
                離線備份數據
              </span>
            )}
            
            {/* Timeframe slider selector added in direct response to user request for 'more precise slider' */}
            <div className="flex flex-col ml-0 md:ml-4 grow max-w-sm mt-3 md:mt-0 gap-1.5">
               <div className="flex justify-between items-center px-1">
                 <span className="text-[10px] text-zinc-500 font-mono">時間軸精度調整</span>
                 <span className="text-[11px] font-bold text-[#58A6FF]">{range === "custom" ? "自訂區間" : ({ "1d": "1日", "2d": "2日", "3d": "3日", "5d": "5日", "1w": "1週", "2w": "2週", "3w": "3週", "1m": "1個月", "2m": "2個月", "3m": "3個月", "4m": "4個月", "5m": "5個月", "6m": "6個月", "9m": "9個月", "ytd": "今年以來", "1y": "1年", "2y": "2年", "3y": "3年", "4y": "4年", "5y": "5年", "10y": "10年", "15y": "15年", "20y": "20年", "all": "全部" } as Record<string,string>)[range]}</span>
               </div>
               <div className="flex items-center gap-3">
                 <input 
                   type="range" 
                   min="0" 
                   max="23" 
                   step="1"
                   value={["1d", "2d", "3d", "5d", "1w", "2w", "3w", "1m", "2m", "3m", "4m", "5m", "6m", "9m", "ytd", "1y", "2y", "3y", "4y", "5y", "10y", "15y", "20y", "all"].indexOf(range) >= 0 ? ["1d", "2d", "3d", "5d", "1w", "2w", "3w", "1m", "2m", "3m", "4m", "5m", "6m", "9m", "ytd", "1y", "2y", "3y", "4y", "5y", "10y", "15y", "20y", "all"].indexOf(range) : 15}
                   onChange={(e) => {
                     const opts = ["1d", "2d", "3d", "5d", "1w", "2w", "3w", "1m", "2m", "3m", "4m", "5m", "6m", "9m", "ytd", "1y", "2y", "3y", "4y", "5y", "10y", "15y", "20y", "all"] as const;
                     onRangeChange(opts[parseInt(e.target.value)]);
                   }}
                   className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer accent-[#58A6FF] outline-none"
                 />
                 <button
                   onClick={() => {
                      if (range !== "custom") {
                        const today = new Date().toISOString().split("T")[0];
                        const lastMonth = new Date();
                        lastMonth.setMonth(lastMonth.getMonth() - 1);
                        const lastMonthStr = lastMonth.toISOString().split("T")[0];
                        onRangeChange("custom", lastMonthStr, today);
                      }
                   }}
                   className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${range === 'custom' ? 'bg-[#58A6FF]/20 text-[#58A6FF] border-[#58A6FF]/40' : 'bg-transparent text-zinc-500 border-zinc-700 hover:text-zinc-300 hover:border-zinc-500'}`}
                 >
                   自訂區間
                 </button>
               </div>
            </div>
            
            {range === "custom" && (
                <div className="flex w-full md:w-auto items-center gap-1.5 md:ml-1 md:pl-1 md:border-l border-[#30363D] mt-2 md:mt-0">
                  <input 
                    type="date" 
                    id="startDate"
                    defaultValue={startDate}
                    className="flex-1 md:flex-none bg-[#010409] border border-[#30363D] text-[#C9D1D9] text-[16px] md:text-[10px] rounded px-2 md:px-1 py-1.5 md:py-0.5 outline-none focus:border-[#58A6FF] min-h-[40px] md:min-h-0"
                    onChange={(e) => {
                      const endStr = (document.getElementById("endDate") as HTMLInputElement)?.value;
                      if (e.target.value && endStr) {
                         onRangeChange("custom", e.target.value, endStr);
                      }
                    }}
                  />
                  <span className="text-[#8B949E] text-[10px]">-</span>
                  <input 
                    type="date" 
                    id="endDate"
                    defaultValue={endDate}
                    className="flex-1 md:flex-none bg-[#010409] border border-[#30363D] text-[#C9D1D9] text-[16px] md:text-[10px] rounded px-2 md:px-1 py-1.5 md:py-0.5 outline-none focus:border-[#58A6FF] min-h-[40px] md:min-h-0"
                    onChange={(e) => {
                      const startStr = (document.getElementById("startDate") as HTMLInputElement)?.value;
                      if (e.target.value && startStr) {
                         onRangeChange("custom", startStr, e.target.value);
                      }
                    }}
                  />
                </div>
              )}
            {/* Loading status spinner */}
            {isLoading && (
              <span className="flex items-center gap-1 text-[11px] text-[#58A6FF] font-mono ml-2 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                載入中...
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
            {quote.displayName}
            <span className="text-xs text-zinc-500 font-mono font-medium">({quote.currency})</span>
          </h3>
        </div>

        {/* Dynamic Display value based on Hover Index */}
        <div className="flex items-baseline gap-2 text-right md:-mt-1">
          <span className="text-xs text-zinc-500 font-mono uppercase">
            {hoveredPoint ? `[第 ${hoverIndex + 1} 點] 點選估值:` : "當前即時價:"}
          </span>
          <span className="text-xl font-mono font-bold text-zinc-100 tracking-tight">
            {currentVal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xs font-mono font-semibold ${percentReturn >= 0 ? (colorConvention === 'taiwan' ? 'text-rose-400' : 'text-emerald-400') : (colorConvention === 'taiwan' ? 'text-emerald-400' : 'text-rose-400')}`}>
            ({percentReturn >= 0 ? "+" : ""}{percentReturn.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Main SVG Coordinate chart */}
      {points.length === 0 ? (
        <div className="h-44 flex items-center justify-center border border-[#30363D] bg-[#010409]/40 rounded-lg text-zinc-500 italic">
          無走勢數據，請嘗試其他標的
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="relative group w-full mb-5"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {/* Top Y-axis metrics label indicators */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 text-[9px] font-mono text-zinc-500 pointer-events-none z-10 bg-[#161B22]/80 px-1.5 py-0.5 rounded border border-[#30363D]/40">
            <div>HIGH: <span className="text-zinc-300 font-semibold">{maxVal.toLocaleString()}</span></div>
            <div>LOW: <span className="text-zinc-300 font-semibold">{minVal.toLocaleString()}</span></div>
          </div>
          
          {/* Y Axis Guide Lines & Labels */}
          {yTicks.map((t, i) => (
             <div key={i} className="absolute right-0 pointer-events-none flex items-center pr-1 h-0 z-10" style={{ top: `${t.y}px` }}>
                <span className="text-[10px] font-mono text-zinc-500 bg-[#010409]/80 px-1 rounded">{t.val.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}</span>
             </div>
          ))}

          <svg
            className="w-full h-44 overflow-hidden bg-[#010409]/60 rounded-t-lg border border-[#30363D] cursor-crosshair block"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            id={`interactive-chart-svg-${quote.symbol.replace(".", "-")}`}
            style={{ touchAction: 'none' }}
          >
            <defs>
              <linearGradient id={`active-chart-gradient-${quote.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#30363D" strokeDasharray="3,3" strokeWidth="1" />
            <line x1={width / 4} y1="0" x2={width / 4} y2={height} stroke="#30363D" strokeDasharray="3,3" strokeWidth="0.5" />
            <line x1={width / 2} y1="0" x2={width / 2} y2={height} stroke="#30363D" strokeDasharray="3,3" strokeWidth="0.5" />
            <line x1={(width * 3) / 4} y1="0" x2={(width * 3) / 4} y2={height} stroke="#30363D" strokeDasharray="3,3" strokeWidth="0.5" />

            {/* Gradient Fill */}
            <path d={fillPath} fill={`url(#active-chart-gradient-${quote.symbol})`} />

            {/* Moving Averages */}
            {visibleMAs.ma60 && movingAveragesPaths.ma60Path && (
              <path
                d={movingAveragesPaths.ma60Path}
                fill="none"
                stroke="#3B82F6" // blue-500
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {visibleMAs.ma20 && movingAveragesPaths.ma20Path && (
              <path
                d={movingAveragesPaths.ma20Path}
                fill="none"
                stroke="#A855F7" // purple-500
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {visibleMAs.ma10 && movingAveragesPaths.ma10Path && (
              <path
                d={movingAveragesPaths.ma10Path}
                fill="none"
                stroke="#F59E0B" // amber-500
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {visibleMAs.ma5 && movingAveragesPaths.ma5Path && (
              <path
                d={movingAveragesPaths.ma5Path}
                fill="none"
                stroke="#EC4899" // pink-500
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Point Details visible when zoomed in */}
            {(() => {
              const viewWidth = viewRange[1] - viewRange[0];
              const logicalCount = Math.max(points.length, 1);
              const pointsInView = logicalCount * viewWidth;
              if (pointsInView < 40) { // Only show dots when zoomed in enough to see details
                return chartData.map((p, i) => {
                  const idxRatio = (p.index + 0.5) / logicalCount;
                  if (idxRatio >= viewRange[0] - 0.05 && idxRatio <= viewRange[1] + 0.05) {
                    return (
                      <circle 
                        key={i} 
                        cx={p.x} 
                        cy={p.y} 
                        r="1.25" 
                        fill={color} 
                        className="opacity-70"
                      />
                    );
                  }
                  return null;
                });
              }
              return null;
            })()}

            {/* Price Line */}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interlaced Hover Line Crosshair */}
            {hoveredPoint && (
              <>
                {/* Vertical slider line */}
                <line
                  x1={hoveredPoint.x}
                  y1={0}
                  x2={hoveredPoint.x}
                  y2={height}
                  stroke={color}
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />

                {/* Horizontal projection line */}
                <line
                  x1={0}
                  y1={hoveredPoint.y}
                  x2={width}
                  y2={hoveredPoint.y}
                  stroke="#30363D"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                />

                {/* Pulsing focal point */}
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="3.5"
                  fill="#0B0E14"
                  stroke={color}
                  strokeWidth="2.5"
                />
              </>
            )}

            {/* Pulsing live rate point at extreme right */}
            {chartData.length > 0 && !hoveredPoint && (
              <circle
                cx={chartData[chartData.length - 1].x}
                cy={chartData[chartData.length - 1].y}
                r="1.5"
                fill={color}
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Volume Chart SVG */}
          <svg
            className={`w-full h-16 overflow-hidden ${showRSI ? 'bg-[#010409]/90 border-x border-b border-[#30363D]' : 'bg-[#010409]/80 rounded-b-lg border-x border-b border-[#30363D]'} cursor-crosshair block`}
            viewBox={`0 0 ${width} 40`}
            style={{ touchAction: 'none' }}
          >
            {/* Grid Line */}
            <line x1="0" y1="20" x2={width} y2="20" stroke="#30363D" strokeDasharray="3,3" strokeWidth="0.5" />
            
            {/* Volume Bars */}
            {volumeData.map((d, idx) => {
               if (idx >= points.length) return null;
               
               const logicalCount = Math.max(points.length, 1);
               const idxRatio = (idx + 0.5) / logicalCount;
               // Filter out rects that are completely out of view for performance
               if (idxRatio < viewRange[0] - 0.05 || idxRatio > viewRange[1] + 0.05) return null;

               const xCenter = getX(idx);
               const visiblePointCount = Math.max((viewRange[1] - viewRange[0]) * logicalCount, 1);
               const rectW = width / visiblePointCount;
               const rectH = (d.vol / maxVolume) * 40;
               const rectX = xCenter - rectW / 2;
               
               let barColor = d.isUp 
                 ? (colorConvention === "taiwan" ? "fill-rose-500/80" : "fill-emerald-500/80") 
                 : (colorConvention === "taiwan" ? "fill-emerald-500/80" : "fill-rose-500/80");

               if (quote.change === 0) barColor = "fill-zinc-500/80";

               const isHovered = hoveredPoint && hoveredPoint.index === idx;
               if (isHovered) {
                 barColor = d.isUp 
                   ? (colorConvention === "taiwan" ? "fill-rose-400" : "fill-emerald-400") 
                   : (colorConvention === "taiwan" ? "fill-emerald-400" : "fill-rose-400");
               }

               return (
                  <rect 
                    key={`vol-${idx}`}
                    x={rectX}
                    y={40 - rectH}
                    width={Math.max(rectW * 0.8, 1)}
                    height={rectH}
                    className={`${barColor} transition-colors`}
                  />
               )
            })}

            {/* Interlaced Hover Vertical Line in Volume */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1={0}
                x2={hoveredPoint.x}
                y2={40}
                stroke={color}
                strokeOpacity="0.4"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
            )}
          </svg>

          {/* X Axis Time Labels */}
          {xTicks.length > 0 && (
            <div className="absolute left-0 bottom-[-20px] w-full h-[20px] pointer-events-none z-10 block overflow-visible">
                {xTicks.map((t, i) => (
                   <span 
                     key={i} 
                     className="absolute text-[9px] font-mono text-zinc-500 px-1 -translate-x-1/2 whitespace-nowrap"
                     style={{ left: `${(t.x / width) * 100}%` }}
                   >
                     {t.label}
                   </span>
                ))}
            </div>
          )}

          {/* RSI Chart SVG */}
          {showRSI && (
            <div className="relative">
              <div className="absolute top-1 left-2 flex gap-2 text-[9px] font-mono text-zinc-500 pointer-events-none z-10">
                <span>RSI(14)</span>
                {hoveredPoint && rsiData.find(d => d.index === hoveredPoint.index) && (
                  <span className={(rsiData.find(d => d.index === hoveredPoint.index)!.rsi > 70) ? "text-rose-400" : (rsiData.find(d => d.index === hoveredPoint.index)!.rsi < 30) ? "text-emerald-400" : "text-amber-400"}>
                    {rsiData.find(d => d.index === hoveredPoint.index)!.rsi.toFixed(2)}
                  </span>
                )}
              </div>
              <svg
                className="w-full h-16 overflow-hidden bg-[#010409]/95 rounded-b-lg border-x border-b border-[#30363D] cursor-crosshair block mt-0"
                viewBox={`0 0 ${width} 40`}
                style={{ touchAction: 'none' }}
              >
                {/* 70/30 Grid Lines */}
                <line x1="0" y1="12" x2={width} y2="12" stroke="#ef4444" strokeOpacity="0.3" strokeDasharray="2,2" strokeWidth="0.5" />
                <line x1="0" y1="28" x2={width} y2="28" stroke="#10b981" strokeOpacity="0.3" strokeDasharray="2,2" strokeWidth="0.5" />
                
                {/* RSI Line */}
                <path
                  d={rsiPath}
                  fill="none"
                  stroke="#FBBF24" // amber-400
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interlaced Hover Vertical Line in RSI */}
                {hoveredPoint && (
                  <line
                    x1={hoveredPoint.x}
                    y1={0}
                    x2={hoveredPoint.x}
                    y2={40}
                    stroke={color}
                    strokeOpacity="0.4"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                  />
                )}
              </svg>
            </div>
          )}

          {/* Dynamic hover follow annotation */}
          {hoveredPoint && (
            <div 
               className="absolute bg-[#161B22]/90 backdrop-blur-sm border border-[#30363D] text-[9.5px] font-mono text-zinc-300 p-2 rounded shadow-xl pointer-events-none z-30 flex flex-col gap-1 min-w-[120px]"
               style={{ 
                  left: Math.min(hoveredPoint.x + 15, width - 130),
                  top: Math.max(hoveredPoint.y - 45, 10) 
               }}
            >
              <div className="flex items-center gap-1.5 border-b border-[#30363D] pb-1 mb-0.5">
                 <Clock className="w-3" />
                 <span>{getTimelineLabel(hoveredPoint.index)}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                 <span className="text-zinc-500">收盤價</span>
                 <span className="font-bold text-[#58A6FF]">{hoveredPoint.value}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                 <span className="text-zinc-500">成交量</span>
                 <span className="text-zinc-300 font-bold">{Math.round(volumeData[hoveredPoint.index]?.vol || 0).toLocaleString()}</span>
              </div>
              {visibleMAs.ma5 && (
                 <div className="flex justify-between items-center gap-4">
                    <span className="text-zinc-500">5MA</span>
                    <span className="text-pink-500">{(movingAveragesData.ma5[hoveredPoint.index]?.value || 0).toFixed(2)}</span>
                 </div>
              )}
              {visibleMAs.ma10 && (
                 <div className="flex justify-between items-center gap-4">
                    <span className="text-zinc-500">10MA</span>
                    <span className="text-amber-500">{(movingAveragesData.ma10[hoveredPoint.index]?.value || 0).toFixed(2)}</span>
                 </div>
              )}
              {visibleMAs.ma20 && (
                 <div className="flex justify-between items-center gap-4">
                    <span className="text-zinc-500">20MA</span>
                    <span className="text-purple-500">{(movingAveragesData.ma20[hoveredPoint.index]?.value || 0).toFixed(2)}</span>
                 </div>
              )}
              {visibleMAs.ma60 && (
                 <div className="flex justify-between items-center gap-4">
                    <span className="text-zinc-500">60MA</span>
                    <span className="text-blue-500">{(movingAveragesData.ma60[hoveredPoint.index]?.value || 0).toFixed(2)}</span>
                 </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MA Legend & Dynamic Display */}
      {points.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-400 mt-2 select-none">
          <button 
            onClick={() => setVisibleMAs(prev => ({ ...prev, ma5: !prev.ma5 }))}
            className={`flex items-center gap-1.5 cursor-pointer hover:text-zinc-200 transition-colors ${!visibleMAs.ma5 && 'opacity-40'}`}
          >
            <span className="w-3 h-0.5 bg-pink-500 block"></span>
            <span>五日線 (5MA)</span>
          </button>
          <button 
            onClick={() => setVisibleMAs(prev => ({ ...prev, ma10: !prev.ma10 }))}
            className={`flex items-center gap-1.5 cursor-pointer hover:text-zinc-200 transition-colors ${!visibleMAs.ma10 && 'opacity-40'}`}
          >
            <span className="w-3 h-0.5 bg-amber-500 block"></span>
            <span>十日線 (10MA)</span>
          </button>
          <button 
            onClick={() => setVisibleMAs(prev => ({ ...prev, ma20: !prev.ma20 }))}
            className={`flex items-center gap-1.5 cursor-pointer hover:text-zinc-200 transition-colors ${!visibleMAs.ma20 && 'opacity-40'}`}
          >
            <span className="w-3 h-0.5 border-b-2 border-dashed border-purple-500 block"></span>
            <span>二十日線 (20MA)</span>
          </button>
          <button 
            onClick={() => setVisibleMAs(prev => ({ ...prev, ma60: !prev.ma60 }))}
            className={`flex items-center gap-1.5 cursor-pointer hover:text-zinc-200 transition-colors ${!visibleMAs.ma60 && 'opacity-40'}`}
          >
            <span className="w-3 h-0.5 border-b-2 border-dashed border-blue-500 block"></span>
            <span>季線 (60MA)</span>
          </button>
          <button 
            onClick={() => setShowRSI(prev => !prev)}
            className={`flex items-center gap-1.5 cursor-pointer hover:text-zinc-200 transition-colors ${!showRSI && 'opacity-40'}`}
          >
            <span className="w-3 h-0.5 bg-amber-400 block"></span>
            <span>RSI (14)</span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            {(() => {
              const latestPrice = points[points.length - 1] || quote.price;
              const ma20Data = movingAveragesData.ma20;
              const ma20Val = ma20Data.length > 0 ? ma20Data[ma20Data.length - 1].value : null;
              const bias20 = ma20Val ? ((latestPrice - ma20Val) / ma20Val) * 100 : 0;
              const biasColor = bias20 >= 0 
                ? (colorConvention === "taiwan" ? "text-rose-400" : "text-emerald-400")
                : (colorConvention === "taiwan" ? "text-emerald-400" : "text-rose-400");
              return (
                <span className={`${biasColor} bg-[#161B22]/50 px-1.5 py-0.5 rounded border border-[#30363D]`}>
                  20T乖離率: {bias20 > 0 ? "+" : ""}{bias20.toFixed(2)}%
                </span>
              );
            })()}
            <span className="text-zinc-400 bg-[#161B22]/50 px-1.5 py-0.5 rounded border border-[#30363D]">
              盈利率(Est): {(quote.peRatio ? (100 / quote.peRatio).toFixed(2) : "0.00")}%
            </span>
          </div>
        </div>
      )}

      {/* Live Trading Metrics Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono select-none">
        <div className="bg-[#010409]/60 p-2.5 rounded border border-[#30363D] space-y-0.5">
          <div className="text-zinc-500 text-[9px] uppercase">開盤價 (Open)</div>
          <div className="text-[#C9D1D9] font-bold text-[11px]">{quote.open !== undefined ? quote.open.toLocaleString() : "N/A"}</div>
        </div>
        <div className="bg-[#010409]/60 p-2.5 rounded border border-[#30363D] space-y-0.5">
          <div className="text-zinc-500 text-[9px] uppercase">昨收價 (Prev Close)</div>
          <div className="text-[#C9D1D9] font-bold text-[11px]">{quote.previousClose !== undefined ? quote.previousClose.toLocaleString() : "N/A"}</div>
        </div>
        <div className="bg-[#010409]/60 p-2.5 rounded border border-[#30363D] space-y-0.5">
          <div className="text-zinc-500 text-[9px] uppercase">總成交量 (Volume)</div>
          <div className="text-[#C9D1D9] font-bold text-[11px]">{quote.volume !== undefined ? quote.volume.toLocaleString() : "N/A"}</div>
        </div>
        <div className="bg-[#010409]/60 p-2.5 rounded border border-[#30363D] space-y-0.5">
          <div className="text-zinc-500 text-[9px] uppercase">52週最高 (52W High)</div>
          <div className="text-[#C9D1D9] font-bold text-[11px]">{quote.fiftyTwoWeekHigh.toLocaleString()}</div>
        </div>
        <div className="bg-[#010409]/60 p-2.5 rounded border border-[#30363D] space-y-0.5">
          <div className="text-zinc-500 text-[9px] uppercase">52週最低 (52W Low)</div>
          <div className="text-[#C9D1D9] font-bold text-[11px]">{quote.fiftyTwoWeekLow.toLocaleString()}</div>
        </div>
        <div className="bg-[#010409]/60 p-2.5 rounded border border-[#30363D] space-y-0.5">
          <div className="text-zinc-500 text-[9px] uppercase">每股盈餘 (EPS)</div>
          <div className="text-[#C9D1D9] font-bold text-[11px]">{quote.eps ? `$${quote.eps}` : "N/A"}</div>
        </div>
        <div className="bg-[#010409]/60 p-2.5 rounded border border-[#30363D] space-y-0.5">
          <div className="text-zinc-500 text-[9px] uppercase">本益比等級 (P/E)</div>
          <div className="text-[#C9D1D9] font-bold text-[11px]">{quote.peRatio ? `${quote.peRatio} 倍` : "N/A"}</div>
        </div>
        <div className="bg-[#010409]/60 p-2.5 rounded border border-[#30363D] space-y-0.5">
          <div className="text-zinc-500 text-[9px] uppercase">目標股價 (Est. Target)</div>
          <div className="text-[#C9D1D9] font-bold text-[11px]">{quote.targetPrice ? `$${quote.targetPrice}` : "N/A"}</div>
        </div>
      </div>

    </div>
  );
}
