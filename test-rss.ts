async function run() {
  const res = await fetch("https://query2.finance.yahoo.com/v1/finance/search?q=AAPL&newsCount=3");
  const json = await res.json();
  console.log(JSON.stringify(json.news, null, 2));
}
run();
