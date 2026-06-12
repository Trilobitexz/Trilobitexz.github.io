import fs from 'fs';

const file = fs.readFileSync('server.ts', 'utf8');
const lines = file.split('\n');

// Find the line index containing "rat// --- AI Industry Chain" which was corrupted (should be around 1317)
let startIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('rat// --- AI Industry Chain Analyzer ---')) {
    startIndex = i;
    break;
  }
}

// Find the line index of '// weekly for 1 Year'
let endIndex = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('// weekly for 1 Year')) {
    endIndex = i;
    break;
  }
}

if (startIndex !== -1 && endIndex !== -1) {
  const newLines = `    rationality = \`AI評分給予 \${score.toFixed(1)} 分的高分。依據綜合評估：該公司最新損益表呈現毛利率與淨利率雙升、未來營收成長潛能明確，且目前股價未見過度溢價，技術波動度維持穩健向上趨勢。\`;
  } else if (hashVal > 60) {
    score = 6.5 + (hashVal % 20) / 10;
    rationality = \`AI評分給予 \${score.toFixed(1)} 分。綜合評估顯示：損益呈現中規中矩的成長，評價面合理但略顯微幅溢價，市場尚未見到強烈的未來成長催化劑，技術走勢與波動度皆屬中庸。\`;
  } else if (hashVal > 30) {
    score = 4.5 + (hashVal % 20) / 10;
    rationality = \`AI評分給予 \${score.toFixed(1)} 分的偏低評價。主因是：損益表中營業利益見到降溫跡象，目前股價相對於未來一年獲利已顯得溢價，且近期技術面波動度加劇、潛藏下行風險。\`;
  } else {
    score = 2.0 + (hashVal % 20) / 10;
    rationality = \`AI評分僅給予 \${score.toFixed(1)} 分。關鍵警訊在於：連續兩季損益惡化，股價嚴重溢價偏離基本價值，法人頻繁拋售導致技術面處於高波動的弱勢破底階段。\`;
  }

  return {
    isMockData: true,
    fundamentalScore: parseFloat(score.toFixed(1)),
    technicalOutlook: [
      \`目前股價技術指標顯示短線處於\${score > 6 ? '強勢整理' : '弱勢下探'}階段。\`,
      \`近期法人籌碼動向顯示\${score > 5 ? '穩定買超' : '持續調節'}跡象。\`
    ],
    recentDevelopments: [
      \`本月 \${name} (\${symbol}) 營運動能有所變化，市場對其展望褒貶不一。\`,
      \`總經環境如利率與地緣政治對其未來供應鏈帶來影響。\`
    ],
    strengths: [
      \`研發實力與市場份額在某些次領域仍具一定優勢。\`,
      \`若未來利空出盡，具備本益比修復潛能。\`
    ],
    risks: [
      \`同業競爭對手正加劇削價壓力，可能稀釋毛利率。\`,
      \`若總體經濟放緩，其營收可能受終端需求疲軟影響。\`
    ],
    analystSummary: \`\${rationality} 綜合看來，對於波段投資人，建議\${score > 7 ? '逢回拉回找尋佈局點位' : '保持觀望，等待財報指引或技術面反轉訊號出現'}。\`,
    sourceLinks: [
      {
        title: "Yahoo 股市 - 即時重大財經彙整",
        url: \`https://tw.stock.yahoo.com/q?s=\${encodeURIComponent(symbol.split('.')[0])}\`
      }
    ]
  };
}

// --- MOCK & HELPER UTILITIES ---

/**
 * Generate a simulated sparkline for custom/fallback stocks
 */
function createFallbackSparkline(currentPrice: number, high: number, low: number, seedString: string, range = "1y"): number[] {
  let points = 52; // default 52 points
  if (range === "1d") {
    points = 48; // intraday (e.g., 5 min chunks)
  } else if (range === "5d") {
    points = 40; // 5-day hourly chunks
  } else if (range === "1m") {
    points = 30; // daily for 1 Month
  } else if (range === "6m") {
    points = 60; // 6 Months
  } else if (range === "1y") {
    points = 52; // weekly for 1 Year`;

  lines.splice(startIndex, endIndex - startIndex + 1, newLines);

  fs.writeFileSync('server.ts', lines.join('\n'));
  console.log('Fixed block between ' + startIndex + ' and ' + endIndex);
} else {
  console.log('Could not find start or end index', startIndex, endIndex);
}
