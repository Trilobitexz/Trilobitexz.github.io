async function run() {
  try {
    const res = await fetch("https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL");
    const data = await res.json();
    
    let countAll = 0;
    let countFiltered = 0;
    
    const formatted = data.map(item => {
      countAll++;
      const volume = parseInt(item.TradeVolume);
      const value = parseInt(item.TradeValue);
      // Filter out small stocks (less than 2000 shares traded OR less than 100 million NTD value)
      if (volume < 2000000 || value < 100000000) return null;
      countFiltered++;
      const isNegative = item.Change.startsWith('-');
      const absChange = parseFloat(item.Change.replace('-', '').replace('+', ''));
      const change = isNegative ? -absChange : absChange;
      const closing = parseFloat(item.ClosingPrice);
      
      let prevClose = closing - change;
      let changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
      
      return {
        symbol: `${item.Code}.TW`,
        name: item.Name,
        price: item.ClosingPrice,
        change: change,
        changePercent: changePercent,
        changePercentStr: changePercent > 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`
      };
    }).filter(q => q && q.price && q.prevClose !== 0 && !isNaN(q.changePercent));
    console.log(`Total: ${countAll}, Filtered: ${countFiltered}`);
    formatted.sort((a,b) => b.changePercent - a.changePercent);
    const topGainers = formatted.slice(0, 50);
    const bottomLosers = [...formatted].sort((a,b) => a.changePercent - b.changePercent).slice(0, 50);
    
    console.log("Gainers:", topGainers.slice(0, 5));
    console.log("Losers:", bottomLosers.slice(0, 5));
    
  } catch(e) { console.error(e.message); }
}
run();
