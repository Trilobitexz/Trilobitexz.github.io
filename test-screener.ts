import yfLib from "yahoo-finance2";
const YFConstructor = (yfLib as any).default || yfLib;
const yahooFinance = new YFConstructor({suppressNotices: ['yahooSurvey']});

async function run() {
  const symbols = [];
  for (let i = 1101; i <= 3000; i++) symbols.push(`${i}.TW`);
  const chunks = [];
  for (let i = 0; i < symbols.length; i += 200) chunks.push(symbols.slice(i, i + 200));
  
  try {
    const p = chunks.map(chunk => yahooFinance.quote(chunk));
    console.time("fetch");
    const results = await Promise.all(p);
    console.timeEnd("fetch");
    console.log("Total received:", results.flat().length);
  } catch(e) { console.error(e.message); }
}
run();
