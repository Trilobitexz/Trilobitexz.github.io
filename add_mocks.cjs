const fs = require('fs');

let file = fs.readFileSync('good_tail.txt', 'utf8');

const additionalMocks = `
function generateSmartFallbackStock(symbol: string): any {
  return {
    symbol,
    shortName: symbol.split('.')[0] + " 概念股",
    regularMarketPrice: 150 + Math.random() * 50,
    regularMarketChange: (Math.random() - 0.5) * 10,
    regularMarketChangePercent: (Math.random() - 0.5) * 5,
    regularMarketVolume: 1000000 + Math.random() * 5000000,
    fiftyTwoWeekHigh: 220,
    fiftyTwoWeekLow: 110,
    trailingPE: 15 + Math.random() * 10,
    marketCap: 50000000000,
    summaryProfile: {
      longBusinessSummary: \`\${symbol} 展現穩健的基本面，並隨著全球經濟復甦與新興科技的應用，積極切入 AI 供應鏈。\`
    }
  };
}

function generateSimulatedNews(symbols: string[], names: Record<string, string>): any[] {
  return symbols.slice(0, 3).map((sym, idx) => ({
    symbol: sym,
    title: \`\${names[sym] || sym} 展現出色的營運成長，獲法人上調目標價\`,
    source: "聯合新聞網",
    url: \`https://tw.stock.yahoo.com/q?s=\${encodeURIComponent(sym.split('.')[0])}\`,
    time: \`\${idx + 1} 小時前\`,
    summaryPoints: [
      "預期下階段將釋放更多產能",
      "受到新應用帶動，整體獲利有望雙位數成長"
    ],
    sentiment: "positive"
  }));
}

`;

file = file.replace('// --- MOCK & HELPER UTILITIES ---', '// --- MOCK & HELPER UTILITIES ---\n' + additionalMocks);

fs.writeFileSync('good_tail.txt', file);
