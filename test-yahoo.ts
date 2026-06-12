import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();

async function run() {
  try {
    const q1 = await yahooFinance.quote("TX=F"); 
    console.log("TX=F:", q1?.regularMarketPrice);
    const q2 = await yahooFinance.quote("^TWII");
    console.log("^TWII:", q2?.regularMarketPrice);
  } catch(e) { console.log("Failed to fetch."); }
}
run();
