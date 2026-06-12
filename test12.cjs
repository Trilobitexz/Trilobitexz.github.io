const http = require('http');

setTimeout(() => {
  http.get('http://localhost:3000/api/stocks/quote/2330.TW?range=1y', res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log("Result:", data));
  }).on('error', console.error);
}, 2000);
