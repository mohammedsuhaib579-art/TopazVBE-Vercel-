import { NextResponse } from "next/server";
import { Simulation } from "../../../lib/simulation";
import type { Decisions, ProductAreaKey } from "../../../lib/types";
import { PRODUCTS, AREAS } from "../../../lib/constants";
import { makeKey } from "../../../lib/types";

type RequestBody = {
  players?: number;
  decisions?: Partial<Decisions> | Partial<Decisions>[]; // Can be single decision or array for multiplayer
  seed?: number;
};

// Helper to create empty advertising object with all ProductAreaKey combinations
function createEmptyAdvertising(): Record<ProductAreaKey, number> {
  const result: Partial<Record<ProductAreaKey, number>> = {};
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      result[makeKey(product, area)] = 0;
    }
  }
  return result as Record<ProductAreaKey, number>;
}

// Helper to convert simplified decisions to full Decisions format
function createFullDecisions(partial: Partial<Decisions>): Decisions {
  const defaultDecisions: Decisions = {
    implement_major_improvement: {
      "Product 1": false,
      "Product 2": false,
      "Product 3": false,
    },
    prices_home: {
      "Product 1": 100,
      "Product 2": 120,
      "Product 3": 140,
    },
    prices_export: {
      "Product 1": 110,
      "Product 2": 132,
      "Product 3": 154,
    },
    advertising_trade_press: createEmptyAdvertising(),
    advertising_support: createEmptyAdvertising(),
    advertising_merchandising: createEmptyAdvertising(),
    assembly_time: {
      "Product 1": 100,
      "Product 2": 150,
      "Product 3": 300,
    },
    salespeople_allocation: {
      South: 2,
      West: 2,
      North: 3,
      Export: 3,
    },
    sales_salary_per_quarter: 2000,
    sales_commission_percent: 0.0,
    assembly_wage_rate: 8.5,
    shift_level: 1,
    management_budget: 40000,
    maintenance_hours_per_machine: 40,
    dividend_per_share: 0.0,
    credit_days: 30,
    vans_to_buy: 0,
    vans_to_sell: 0,
    buy_competitor_info: false,
    buy_market_shares: false,
    deliveries: createEmptyAdvertising(), // Same structure as advertising
    product_development: {
      "Product 1": 0,
      "Product 2": 0,
      "Product 3": 0,
    },
    recruit_sales: 0,
    dismiss_sales: 0,
    train_sales: 0,
    recruit_assembly: 0,
    dismiss_assembly: 0,
    train_assembly: 0,
    materials_quantity: 5000,
    materials_supplier: 0,
    materials_num_deliveries: 1,
    machines_to_sell: 0,
    machines_to_order: 0,
  };

  // Merge with provided decisions
  return {
    ...defaultDecisions,
    ...partial,
    implement_major_improvement: {
      ...defaultDecisions.implement_major_improvement,
      ...(partial.implement_major_improvement || {}),
    },
    prices_home: {
      ...defaultDecisions.prices_home,
      ...(partial.prices_home || {}),
    },
    prices_export: {
      ...defaultDecisions.prices_export,
      ...(partial.prices_export || {}),
    },
    assembly_time: {
      ...defaultDecisions.assembly_time,
      ...(partial.assembly_time || {}),
    },
    salespeople_allocation: {
      ...defaultDecisions.salespeople_allocation,
      ...(partial.salespeople_allocation || {}),
    },
    product_development: {
      ...defaultDecisions.product_development,
      ...(partial.product_development || {}),
    },
    advertising_trade_press: {
      ...defaultDecisions.advertising_trade_press,
      ...(partial.advertising_trade_press || {}),
    },
    advertising_support: {
      ...defaultDecisions.advertising_support,
      ...(partial.advertising_support || {}),
    },
    advertising_merchandising: {
      ...defaultDecisions.advertising_merchandising,
      ...(partial.advertising_merchandising || {}),
    },
    deliveries: {
      ...defaultDecisions.deliveries,
      ...(partial.deliveries || {}),
    },
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const players = body.players ?? 1;
    const seed = body.seed ?? 42;

    // Create simulation
    const n_companies = players === 1 ? 8 : players;
    const sim = new Simulation(n_companies, seed);
    sim.n_players = players;

    // Handle decisions - can be single object or array
    let decisionsArray: Decisions[];
    if (Array.isArray(body.decisions)) {
      // Multiplayer mode - convert each decision
      decisionsArray = body.decisions.map(d => createFullDecisions(d));
    } else {
      // Single player mode
      const fullDecisions = createFullDecisions(body.decisions || {});
      decisionsArray = [fullDecisions];
    }

    // Run simulation
    const reports = sim.step(decisionsArray);

    return NextResponse.json({
      ok: true,
      players,
      reports,
      economy: sim.economy,
      randomEvents: sim.randomEvents || [],
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Simulation failed",
      },
      { status: 500 }
    );
  }
}
