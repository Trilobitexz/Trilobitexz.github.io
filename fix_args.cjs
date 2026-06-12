const fs = require('fs');

let file = fs.readFileSync('server.ts', 'utf8');

file = file.replace('function generateSmartFallbackStock(symbol: string): any {', 'function generateSmartFallbackStock(symbol: string, ...args: any[]): any {');

fs.writeFileSync('server.ts', file);
