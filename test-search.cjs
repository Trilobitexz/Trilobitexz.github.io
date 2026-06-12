const yahooFinance = require('yahoo-finance2').default;
async function t() {
  const res = await yahooFinance.search('台積電');
  console.log(JSON.stringify(res.quotes[0]));
}
t();
