import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const fallbackFunc = `
async function fetchRealYahooNewsFallback(symbols: string[], names: Record<string, string>) {
  const result: any[] = [];
  try {
    for (const sym of symbols.slice(0, 5)) {
      const q = sym.split('.')[0];
      const res = await fetch(\`https://query2.finance.yahoo.com/v1/finance/search?q=\${encodeURIComponent(q)}&newsCount=5\`);
      if (res.ok) {
         const data = await res.json();
         if (data && data.news && data.news.length > 0) {
           data.news.forEach((n: any, idx: number) => {
             result.push({
               symbol: sym,
               title: n.title,
               source: n.publisher || "Yahoo Finance",
               url: n.link,
               time: new Date((n.providerPublishTime || Math.floor(Date.now()/1000))*1000).toLocaleString(),
               summaryPoints: [
                 "即時新聞自動擷取",
                 "詳細內容請點擊下方原始連結閱讀完整報導"
               ],
               sentiment: "neutral",
               isFallback: true
             });
           });
         }
      }
    }
  } catch (e) {
    console.warn("Fallback direct yahoo fetch failed", e);
  }
  
  if (result.length === 0) {
     return generateSimulatedNews(symbols, names);
  }
  return result;
}
`;

content = content.replace('function generateSimulatedNews', fallbackFunc + '\nfunction generateSimulatedNews');

content = content.replace(
  /const sim = generateSimulatedNews\(symbols, names\);/,
  `const sim = await fetchRealYahooNewsFallback(symbols, names);`
);
content = content.replace(
  /const simulated = generateSimulatedNews\(symbols, names\);/,
  `const simulated = await fetchRealYahooNewsFallback(symbols, names);`
);

fs.writeFileSync('server.ts', content);
