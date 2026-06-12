import fs from 'fs';

let file = fs.readFileSync('server.ts', 'utf8');
const sparklineCode = `
function createFallbackSparkline(currentPrice: number, high: number, low: number, seedString: string, range = "1y"): number[] {
  let points = 52;
  const mockData: number[] = [];
  const base = currentPrice || 100;
  for (let i = 0; i < points; i++) {
    mockData.push(base * (1 + (Math.random() - 0.5) * 0.1));
  }
  return mockData;
}
`;

file = file.replace('// --- MAIN ROUTE SERVER SETUP & VITE MIDDLEWARE ---', sparklineCode + '\n// --- MAIN ROUTE SERVER SETUP & VITE MIDDLEWARE ---');

fs.writeFileSync('server.ts', file);
