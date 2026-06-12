/**
 * Model Type Declarations for Minimalist Stock App
 */

export interface StockItem {
  symbol: string;
  name: string;
  englishName: string;
  category: string;
}

export interface StockQuote {
  symbol: string;
  displayName: string;
  price: number;
  change: number;
  changePercent: number;
  peRatio: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currency: string;
  sparkline: number[];
  sparklineTimestamps?: number[];
  isModelFallback: boolean;
  lastUpdated: string;
  volume?: number;
  open?: number;
  previousClose?: number;
  eps?: number | null;
  targetPrice?: number | null;
}

export interface PortfolioItem {
  id: string;
  symbol: string;
  shares: number;
  averageCost: number;
  addedAt: string;
}

export interface NewsItem {
  id?: string; // local client uuid mapping
  symbol: string;
  title: string;
  source: string;
  url: string;
  time: string;
  summaryPoints: string[];
  sentiment: "positive" | "neutral" | "negative";
  userIrrelevant?: boolean; // client-side flagged check
  isFallback?: boolean;
  quotaExceeded?: boolean;
}

export interface StockAnalysis {
  recentDevelopments: string[];
  strengths: string[];
  risks: string[];
  analystSummary: string;
  sourceLinks: { title: string; url: string }[];
  technicalOutlook?: string[];
  fundamentalScore?: number;
  isMockData?: boolean;
  isFallback?: boolean;
  quotaExceeded?: boolean;
}

export interface StrongStock {
  symbol: string;
  name: string;
  recentGain: string;
  reason: string;
  catalyst: string;
  category: "台股" | "美股";
}

export type ColorConvention = "taiwan" | "us";
