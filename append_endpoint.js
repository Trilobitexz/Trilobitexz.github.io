import fs from 'fs';

let file = fs.readFileSync('server.ts', 'utf8');

// Insert the endpoint at the bottom right before 'async function startServer()'
const endpointCode = `
// --- AI Industry Chain Analyzer ---
app.post("/api/stocks/ai-chain", async (req, res) => {
  const { csvData, mode, symbols } = req.body;
  if (!csvData && mode === "manual") {
    return res.status(400).json({ error: "CSV data is required" });
  }
  if (!symbols && mode === "auto") {
    return res.status(400).json({ error: "Symbols are required for auto mode" });
  }

  if (!ai) {
    return res.status(500).json({ error: "Gemini API is not configured" });
  }

  try {
    const basePrompt = \`你是一位資深 AI 產業鏈投資分析師 + 投資教練。你面對的是想投資 AI 產業鏈、但剛開始學投資的小白。 要求：所有解釋要通俗；每個專業名詞後面用括號給一句大白話；不堆術語；不學術冗長。用繁體中文輸出。

第一步：按 AI 產業鏈「核心 7 層 + 太空延伸層（共 8 層）」歸類
把分析的股票，歸到下面對應的層。只保留屬於這 8 層的 AI / 太空相關股票。
# 層級 這層是幹嘛的（大白話）
一 🎮 計算核心 Compute Core AI 的「大腦」，負責算帳（GPU/CPU/AI 專用晶片）
二 💾 儲存與記憶體 Memory & Storage 給大腦配的「短期記憶 + 倉庫」（HBM/DRAM/NAND/硬碟）
三 🌈 光通訊 Photonic / Optical ⭐ 晶片之間用「光」高速傳數據（比銅線快得多）
四 🌐 網路互聯 Networking 把成千上萬顆晶片連成一台「超級電腦」（交換晶片/設備）
五 🏭 半導體製造 Foundry & Equipment 真正「造晶片」的廠和設備（代工/封裝/設備/測試/材料/功率）
六 ⚡ 資料中心基礎設施 DC Infra 給機房供電、散熱、連接（電力/散熱/能源/連接器）、数据中心建造
七 💡 IP / 軟體 IP & Software 賣晶片「設計圖紙/授權」（CPU IP / 記憶體 IP，難被替代）
八 🚀 太空 / 衛星 Space & Satellite（延伸層） AI 往天上延伸：衛星互聯網、發射基建、太空數據、未來太空算力

第二步：標記「四大瓶頸」🔥
當前 2026 Q2 四大卡脖子環節： ① CoWoS 封裝　② HBM 三巨頭　③ 3nm/2nm 製程　④ 資料中心電力
凡直接受益於以上任一瓶頸的票，在公司名後打 🔥 並註明卡哪個瓶頸。

第三步：給每隻票一個「小白評級」
綜合考慮：估值貴不貴 · 強不強勢 · 賺錢能力 · 回本能力 · 現金流是否健康。給出檔位：
🟢 強烈關注：又好又相對合理，或正卡在四大瓶頸上
🔵 關注：是好票，但現在偏貴，等回調
🟡 觀望：基本面一般 / 暫時看不清
🔴 迴避：基本面弱，或屬於會被 AI 替代的軟體股

輸出格式規定：
請務必只輸出純 JSON 格式，不要包含任何 markdown code block (例如 \\\`\\\`\\\`json) 標記。
JSON 格式必須嚴格如下：
{
  "layers": [
    {
      "layerIndex": 1,
      "layerName": "🎮 計算核心 Compute Core",
      "layerDescription": "AI 的「大腦」，負責算帳（GPU/CPU/AI 專用晶片）",
      "stocks": [
        {
          "symbol": "例如 NVDA",
          "companyDescription": "公司做什麼的大白話 例如 輝達，晶片龍頭",
          "bottleneck": "如果卡四大瓶頸，寫明哪個瓶頸（例如 '🔥 CoWoS 封裝'），沒有就留空字串",
          "rating": "強烈關注 / 關注 / 觀望 / 迴避（僅限這四種）",
          "whyGood": "為什麼好：護城河最關鍵1-2點",
          "valuation": "估值貴嗎？為什麼",
          "status": "現狀點評，領漲/落後原因",
          "risks": "要注意的風險",
          "action": "想買怎麼操作"
        }
      ],
      "footnote": "如果這層有特殊說明，放在這裡，例如太空層的 SpaceX 提示"
    }
  ],
  "avoidList": [
     {
       "symbol": "XXXX",
       "reason": "剔除原因"
     }
  ],
  "nextSteps": [
     "第一步建議",
     "第二步建議",
     "第三步建議"
  ]
}\`;

    const prompt = mode === "auto"
      ? \`\${basePrompt}\\n\\n輸入說明：
用戶希望全自動獲取分析，請你 **務必利用 Google Search** 針對以下股票代碼清單，自動搜尋「[股票代碼] Investing.com 分析師 目標價 公允價值 本益比」等關鍵字，以取得來自 InvestingPro 或其他專業財經平台的最新真實專業數據。
取得數據後，請對這些股票進行上述的八層 AI 產業鏈分析。硬規則：只能從我提供的股票代碼清單裡挑選，不要自行添加。

【需自動搜尋與分析的股票代碼】：
\${symbols}\`
      : \`\${basePrompt}\\n\\n輸入說明：
我會提供一份從 InvestingPro / Pro+ 股票篩選器導出的 Excel/CSV 表格。請優先用表格裡的估值、利潤率、漲幅、現金流等數據，接著，你 **必須利用 Google Search** 針對表格內的股票進行延展搜尋（如搜尋「XXX investing.com 分析」、「XXX 最新財報與法人目標價預測」等），以取得更多 InvestingPro 等專業財經平台上的即時估值、未來 EPS 增長預測與分析師報告，來補足表格中可能缺乏的深度產業鏈分析。 硬規則：只能從我提供的表格裡選股，不要自行添加表格外的股票；利用搜尋到的最新專業資料補強缺失的指標。

【InvestingPro 導出表格資料】：
\${csvData}\`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const outputText = response.text || "{}";
    const cleanJson = outputText.replace(/\\\`\\\`(json)?\\n?/g, "").replace(/\\\`\\\`/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    res.json(parsed);
  } catch (err: any) {
    console.error("AI Chain Analysis error:", err);
    res.status(500).json({ error: "處理失敗，請確認表格內容格式或稍後再試。" });
  }
});

// --- MAIN ROUTE SERVER SETUP & VITE MIDDLEWARE ---
`;

file = file.replace('// --- MAIN ROUTE SERVER SETUP & VITE MIDDLEWARE ---', endpointCode);

fs.writeFileSync('server.ts', file);
console.log('Appended endpoint');
