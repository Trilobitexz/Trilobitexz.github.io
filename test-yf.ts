import yfLib from "yahoo-finance2";
const YFConstructor = (yfLib as any).default || yfLib;
const yahooFinance = new YFConstructor({});

async function run() {
  try {
    const res = await yahooFinance.search("2330.TW", { newsCount: 3 });
    console.log(JSON.stringify(res.news, null, 2));
  } catch (e) { console.error(e); }
}
run();
