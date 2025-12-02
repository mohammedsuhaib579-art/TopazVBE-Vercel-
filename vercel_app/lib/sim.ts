// Very lightweight simulation that mimics some of the structure of your Python engine.
// This is not a full Topaz port, but it gives you real, deterministic behaviour
// that you can deploy on Vercel today.

export const PRODUCTS = ["Product 1", "Product 2", "Product 3"] as const;
export const AREAS = ["South", "West", "North", "Export"] as const;

export type Product = (typeof PRODUCTS)[number];
export type Area = (typeof AREAS)[number];

export type Decisions = {
  pricesHome: Record<Product, number>;
  pricesExport: Record<Product, number>;
  advertising: Record<Product, number>;
  creditDays: number;
};

export type QuarterResult = {
  revenueByProduct: Record<Product, number>;
  revenueByArea: Record<Area, number>;
  totalRevenue: number;
  netProfit: number;
  sharePrice: number;
  esgScore: number;
};

// Simple seeded RNG for deterministic behaviour without relying on Math.random.
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function runQuarter(
  players: number,
  decisions: Decisions,
  seed = 42
): QuarterResult {
  const rng = mulberry32(seed + players);

  const baseDemandByArea: Record<Area, number> = {
    South: 1_000,
    West: 800,
    North: 1_200,
    Export: 1_500
  };

  const revenueByProduct: Record<Product, number> = {
    "Product 1": 0,
    "Product 2": 0,
    "Product 3": 0
  };
  const revenueByArea: Record<Area, number> = {
    South: 0,
    West: 0,
    North: 0,
    Export: 0
  };

  let totalRevenue = 0;

  for (const p of PRODUCTS) {
    for (const a of AREAS) {
      const baseDemand = baseDemandByArea[a];
      const refPrice = 100 + 20 * PRODUCTS.indexOf(p);
      const price =
        a === "Export" ? decisions.pricesExport[p] : decisions.pricesHome[p];

      const priceFactor = Math.exp(-0.015 * (price - refPrice));
      const advFactor = 1 + 0.0004 * Math.sqrt(Math.max(0, decisions.advertising[p]));
      const creditFactor = 1 + (decisions.creditDays - 30) / 150;
      const noise = 0.9 + rng() * 0.2;

      const demandUnits = Math.max(
        0,
        baseDemand * priceFactor * advFactor * creditFactor * noise
      );
      const revenue = demandUnits * price;

      revenueByProduct[p] += revenue;
      revenueByArea[a] += revenue;
      totalRevenue += revenue;
    }
  }

  // Simple cost model and profit
  const variableCostRate = 0.55;
  const overhead = 150_000;
  const costOfSales = totalRevenue * variableCostRate + overhead;
  const netProfit = totalRevenue - costOfSales;

  // ESG-esque score: favour moderate credit terms and moderate advertising
  const avgPrice =
    (decisions.pricesHome["Product 1"] +
      decisions.pricesHome["Product 2"] +
      decisions.pricesHome["Product 3"]) /
    3;
  const advTotal =
    decisions.advertising["Product 1"] +
    decisions.advertising["Product 2"] +
    decisions.advertising["Product 3"];

  let esgScore = 70;
  if (decisions.creditDays >= 30 && decisions.creditDays <= 60) esgScore += 10;
  if (advTotal > 0 && advTotal < 300_000) esgScore += 5;
  if (avgPrice < 120) esgScore += 5;
  esgScore = Math.max(0, Math.min(100, esgScore));

  // Share price: base + scaled profit and a small ESG influence
  const baseSharePrice = 1.0;
  const sharePrice =
    baseSharePrice +
    netProfit / 500_000 +
    (esgScore - 50) / 500; // small ESG tilt

  return {
    revenueByProduct,
    revenueByArea,
    totalRevenue,
    netProfit,
    sharePrice,
    esgScore
  };
}


