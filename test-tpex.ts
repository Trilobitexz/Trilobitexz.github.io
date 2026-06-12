async function run() {
  try {
    const [twseRes, tpexRes] = await Promise.all([
      fetch("https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL").catch(() => null),
      fetch("https://www.tpex.org.tw/openapi/v1/tpex_mainboard_quotes").catch(() => null)
    ]);
    
    let twseData = [];
    if (twseRes && twseRes.ok) twseData = await twseRes.json();
    
    let tpexData = [];
    if (tpexRes && tpexRes.ok) tpexData = await tpexRes.json();
    
    console.log(`TWSE items: ${twseData.length}, TPEx items: ${tpexData.length}`);
    if (tpexData.length > 0) {
      console.log(tpexData[0]);
    }
  } catch(e) { console.error(e.message); }
}
run();
