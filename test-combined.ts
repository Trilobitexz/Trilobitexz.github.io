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
    
    const combined = [];
    
    for (const item of twseData) {
      combined.push({
        code: item.Code,
        name: item.Name,
        priceStr: item.ClosingPrice,
        changeStr: item.Change,
        volume: parseInt(item.TradeVolume || "0"),
        value: parseInt(item.TradeValue || "0"),
        suffix: '.TW'
      });
    }
    
    for (const item of tpexData) {
      combined.push({
        code: item.SecuritiesCompanyCode,
        name: item.CompanyName,
        priceStr: item.Close,
        changeStr: item.Change,
        volume: parseInt(item.TradingShares || "0"),
        value: parseInt(item.TransactionAmount || "0"),
        suffix: '.TWO'
      });
    }
    
    const formatted = combined.map(item => {
      const isActivelyManagedETF = item.name.includes("主動");
      // filter out low volume unless it is an active ETF
      if (!isActivelyManagedETF && (item.volume < 2000000 && item.value < 50000000)) return null;
      if (!item.priceStr || !item.changeStr) return null;
      
      const isNegative = item.changeStr.startsWith('-');
      const absChangeStr = item.changeStr.replace('-', '').replace('+', '');
      const absChange = parseFloat(absChangeStr);
      if (isNaN(absChange)) return null;

      const change = isNegative ? -absChange : absChange;
      const closing = parseFloat(item.priceStr);
      if (isNaN(closing) || closing === 0) return null;
      
      let prevClose = closing - change;
      let changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
      
      return {
        symbol: `${item.code}${item.suffix}`,
        name: item.name,
        price: closing.toFixed(2),
        changePercent: changePercent,
        changePercentStr: changePercent > 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`
      };
    }).filter(q => q !== null && !isNaN(q.changePercent));
    
    formatted.sort((a,b) => b.changePercent - a.changePercent);
    const topGainers = formatted.filter(q => q.changePercent > 0).slice(0, 50);
    const bottomLosers = [...formatted].sort((a,b) => a.changePercent - b.changePercent).filter(q => q.changePercent < 0).slice(0, 50);
    
    console.log("Gainers:", topGainers.slice(0, 5));
    console.log("Losers:", bottomLosers.slice(0, 5));
    const activeEtfs = formatted.filter(q => q.name.includes('主動'));
    console.log("Active ETFs length:", activeEtfs.length);
  } catch(e) { console.error(e.message); }
}
run();
