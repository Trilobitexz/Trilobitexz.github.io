export function createFallbackSparkline(currentPrice: number, high: number, low: number, seedString: string, range = "1y"): number[] {
  let points = 52;
  const mockData: number[] = [];
  const base = currentPrice;
  for (let i = 0; i < points; i++) {
    mockData.push(base * (1 + (Math.random() - 0.5) * 0.1));
  }
  return mockData;
}
