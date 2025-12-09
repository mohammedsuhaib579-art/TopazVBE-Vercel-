// Enhanced simulation features: Economy strength, competitor strategies, random events, etc.

import type {
  Economy,
  EconomyStrength,
  CompetitorStrategy,
  RandomEvent,
  CompanyState,
  Decisions,
  SharePriceBreakdown,
  CashFlowStatement,
  WorkforceMetrics,
} from "./types";
import { PRODUCTS, AREAS, BASE_GDP, BASE_UNEMPLOYMENT, BASE_CB_RATE, BASE_MATERIAL_PRICE } from "./constants";
import { makeKey, type ProductAreaKey } from "./types";

// Helper to create empty ProductAreaKey record
function createEmptyProductAreaRecord(): Record<ProductAreaKey, number> {
  const result: Partial<Record<ProductAreaKey, number>> = {};
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      result[makeKey(product, area)] = 0;
    }
  }
  return result as Record<ProductAreaKey, number>;
}

// Helper to create empty Product record
function createEmptyProductRecord(): Record<"Product 1" | "Product 2" | "Product 3", number> {
  return {
    "Product 1": 0,
    "Product 2": 0,
    "Product 3": 0,
  };
}

// Economy strength modifiers
const ECONOMY_MODIFIERS: Record<EconomyStrength, {
  gdp_multiplier: number;
  unemployment_modifier: number;
  material_price_multiplier: number;
  demand_multiplier: number;
}> = {
  Strong: {
    gdp_multiplier: 1.15,
    unemployment_modifier: -2.0,
    material_price_multiplier: 0.95,
    demand_multiplier: 1.2,
  },
  Moderate: {
    gdp_multiplier: 1.0,
    unemployment_modifier: 0.0,
    material_price_multiplier: 1.0,
    demand_multiplier: 1.0,
  },
  Weak: {
    gdp_multiplier: 0.85,
    unemployment_modifier: +2.0,
    material_price_multiplier: 1.1,
    demand_multiplier: 0.8,
  },
};

// Determine economy strength based on GDP and unemployment
export function determineEconomyStrength(gdp: number, unemployment: number): EconomyStrength {
  const gdpRatio = gdp / BASE_GDP;
  const unemploymentRatio = unemployment / BASE_UNEMPLOYMENT;
  
  // Strong: High GDP, low unemployment
  if (gdpRatio > 1.1 && unemploymentRatio < 0.9) {
    return "Strong";
  }
  // Weak: Low GDP, high unemployment
  if (gdpRatio < 0.95 && unemploymentRatio > 1.1) {
    return "Weak";
  }
  // Otherwise Moderate
  return "Moderate";
}

// Apply economy strength modifiers to base values
export function applyEconomyStrength(
  economy: Economy,
  baseGdp: number,
  baseUnemployment: number,
  baseMaterialPrice: number
): void {
  const modifiers = ECONOMY_MODIFIERS[economy.strength];
  
  economy.gdp = baseGdp * modifiers.gdp_multiplier;
  economy.unemployment = Math.max(2, Math.min(15, baseUnemployment + modifiers.unemployment_modifier));
  economy.material_price = baseMaterialPrice * modifiers.material_price_multiplier;
}

// Competitor strategy implementations
export function generateCompetitorDecisions(
  company: CompanyState,
  strategy: CompetitorStrategy,
  rng: { random: () => number; uniform: (a: number, b: number) => number; choice: <T>(arr: readonly T[]) => T; randint: (a: number, b: number) => number }
): Partial<Decisions> {
  const base_price = 100;
  const decisions: Partial<Decisions> = {};
  
  switch (strategy) {
    case "aggressive":
      // Low prices, high advertising, rapid expansion
      decisions.prices_home = createEmptyProductRecord();
      decisions.prices_export = createEmptyProductRecord();
      PRODUCTS.forEach((p, i) => {
        decisions.prices_home![p] = base_price + 10 * i - 15 + rng.randint(-5, 5);
        decisions.prices_export![p] = decisions.prices_home![p] * 1.05;
      });
      
      decisions.advertising_trade_press = createEmptyProductAreaRecord();
      decisions.advertising_support = createEmptyProductAreaRecord();
      decisions.advertising_merchandising = createEmptyProductAreaRecord();
      PRODUCTS.forEach((p) => {
        AREAS.forEach((a) => {
          const key = makeKey(p, a);
          const val = rng.choice([15000, 20000, 25000]);
          decisions.advertising_trade_press![key] = val / 3;
          decisions.advertising_support![key] = val / 3;
          decisions.advertising_merchandising![key] = val / 3;
        });
      });
      
      decisions.product_development = createEmptyProductRecord();
      PRODUCTS.forEach((p) => {
        decisions.product_development![p] = rng.choice([10000, 15000, 20000]);
      });
      
      decisions.shift_level = rng.choice([2, 3]);
      decisions.recruit_sales = rng.choice([2, 3, 4]);
      decisions.recruit_assembly = rng.choice([4, 6, 8]);
      break;
      
    case "conservative":
      // High prices, low costs, steady growth
      decisions.prices_home = createEmptyProductRecord();
      decisions.prices_export = createEmptyProductRecord();
      PRODUCTS.forEach((p, i) => {
        decisions.prices_home![p] = base_price + 20 * i + 15 + rng.randint(-5, 5);
        decisions.prices_export![p] = decisions.prices_home![p] * 1.15;
      });
      
      decisions.advertising_trade_press = createEmptyProductAreaRecord();
      decisions.advertising_support = createEmptyProductAreaRecord();
      decisions.advertising_merchandising = createEmptyProductAreaRecord();
      PRODUCTS.forEach((p) => {
        AREAS.forEach((a) => {
          const key = makeKey(p, a);
          const val = rng.choice([0, 3000, 5000]);
          decisions.advertising_trade_press![key] = val / 3;
          decisions.advertising_support![key] = val / 3;
          decisions.advertising_merchandising![key] = val / 3;
        });
      });
      
      decisions.product_development = createEmptyProductRecord();
      PRODUCTS.forEach((p) => {
        decisions.product_development![p] = rng.choice([0, 3000, 5000]);
      });
      
      decisions.shift_level = 1;
      decisions.recruit_sales = rng.choice([0, 1]);
      decisions.recruit_assembly = rng.choice([0, 2]);
      break;
      
    case "quality_focused":
      // High quality, premium pricing
      decisions.prices_home = createEmptyProductRecord();
      decisions.prices_export = createEmptyProductRecord();
      PRODUCTS.forEach((p, i) => {
        decisions.prices_home![p] = base_price + 25 * i + 20 + rng.randint(-3, 3);
        decisions.prices_export![p] = decisions.prices_home![p] * 1.2;
      });
      
      decisions.assembly_time = createEmptyProductRecord();
      PRODUCTS.forEach((p) => {
        decisions.assembly_time![p] = MIN_ASSEMBLY_TIME[p] * rng.uniform(1.0, 1.1);
      });
      
      decisions.product_development = createEmptyProductRecord();
      PRODUCTS.forEach((p) => {
        decisions.product_development![p] = rng.choice([15000, 20000, 25000]);
      });
      
      decisions.shift_level = rng.choice([1, 2]);
      break;
      
    case "cost_leader":
      // Minimize costs, competitive pricing
      decisions.prices_home = createEmptyProductRecord();
      decisions.prices_export = createEmptyProductRecord();
      PRODUCTS.forEach((p, i) => {
        decisions.prices_home![p] = base_price + 12 * i - 10 + rng.randint(-3, 3);
        decisions.prices_export![p] = decisions.prices_home![p] * 1.08;
      });
      
      decisions.assembly_time = createEmptyProductRecord();
      PRODUCTS.forEach((p) => {
        decisions.assembly_time![p] = MIN_ASSEMBLY_TIME[p] * rng.uniform(1.2, 1.4);
      });
      
      decisions.shift_level = rng.choice([2, 3]);
      decisions.assembly_wage_rate = ASSEMBLY_MIN_WAGE_RATE;
      decisions.sales_salary_per_quarter = MIN_SALES_SALARY_PER_QUARTER;
      break;
      
    case "balanced":
    default:
      // Moderate approach - use default behavior
      decisions.prices_home = createEmptyProductRecord();
      decisions.prices_export = createEmptyProductRecord();
      PRODUCTS.forEach((p, i) => {
        decisions.prices_home![p] = base_price + 15 * i + rng.randint(-10, 10);
        decisions.prices_export![p] = decisions.prices_home![p] * 1.1;
      });
      
      decisions.advertising_trade_press = createEmptyProductAreaRecord();
      decisions.advertising_support = createEmptyProductAreaRecord();
      decisions.advertising_merchandising = createEmptyProductAreaRecord();
      PRODUCTS.forEach((p) => {
        AREAS.forEach((a) => {
          const key = makeKey(p, a);
          const val = rng.choice([0, 5000, 10000, 20000]);
          decisions.advertising_trade_press![key] = val / 3;
          decisions.advertising_support![key] = val / 3;
          decisions.advertising_merchandising![key] = val / 3;
        });
      });
      
      decisions.product_development = createEmptyProductRecord();
      PRODUCTS.forEach((p) => {
        decisions.product_development![p] = rng.choice([0, 5000, 10000]);
      });
      
      decisions.shift_level = rng.choice([1, 2, 3]);
      break;
  }
  
  return decisions;
}

// Generate random events
export function generateRandomEvents(
  quarter: number,
  year: number,
  economyStrength: EconomyStrength,
  rng: { random: () => number; choice: <T>(arr: readonly T[]) => T }
): RandomEvent[] {
  const events: RandomEvent[] = [];
  const eventChance = 0.15; // 15% chance per quarter
  
  if (rng.random() < eventChance) {
    const eventTypes: RandomEvent["type"][] = [
      "market_crisis",
      "regulatory_change",
      "supply_shortage",
      "economic_boom",
      "labor_strike",
      "technology_breakthrough",
    ];
    
    const type = rng.choice(eventTypes);
    const severity = rng.choice(["low", "medium", "high"] as const);
    
    let description = "";
    const effects: RandomEvent["effects"] = {
      affects_all_companies: true,
    };
    
    switch (type) {
      case "market_crisis":
        description = `Market Crisis: Economic uncertainty affects consumer confidence`;
        effects.gdp_modifier = severity === "high" ? -0.15 : severity === "medium" ? -0.10 : -0.05;
        effects.demand_modifier = severity === "high" ? -0.20 : severity === "medium" ? -0.15 : -0.10;
        break;
      case "regulatory_change":
        description = `Regulatory Change: New regulations impact industry operations`;
        effects.cost_modifier = severity === "high" ? 0.10 : severity === "medium" ? 0.07 : 0.05;
        break;
      case "supply_shortage":
        description = `Supply Shortage: Material prices spike due to supply chain issues`;
        effects.material_price_modifier = severity === "high" ? 0.25 : severity === "medium" ? 0.15 : 0.10;
        break;
      case "economic_boom":
        description = `Economic Boom: Strong economic growth boosts demand`;
        effects.gdp_modifier = severity === "high" ? 0.15 : severity === "medium" ? 0.10 : 0.05;
        effects.demand_modifier = severity === "high" ? 0.20 : severity === "medium" ? 0.15 : 0.10;
        break;
      case "labor_strike":
        description = `Labor Strike: Workforce disruptions affect production`;
        effects.cost_modifier = severity === "high" ? 0.15 : severity === "medium" ? 0.10 : 0.05;
        // Randomly affects some companies
        if (rng.random() < 0.5) {
          effects.affects_all_companies = false;
          effects.affected_companies = [rng.choice([0, 1, 2, 3, 4, 5, 6, 7])];
        }
        break;
      case "technology_breakthrough":
        description = `Technology Breakthrough: New manufacturing techniques reduce costs`;
        effects.cost_modifier = severity === "high" ? -0.10 : severity === "medium" ? -0.07 : -0.05;
        break;
    }
    
    events.push({
      type,
      severity,
      description,
      quarter,
      year,
      effects,
    });
  }
  
  return events;
}

// Input validation
export function validateDecisions(decisions: Partial<Decisions>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Price validation
  if (decisions.prices_home) {
    Object.entries(decisions.prices_home).forEach(([product, price]) => {
      if (price < 50 || price > 500) {
        errors.push(`${product} home price (${price}) is outside valid range (50-500)`);
      }
    });
  }
  
  if (decisions.prices_export) {
    Object.entries(decisions.prices_export).forEach(([product, price]) => {
      if (price < 50 || price > 500) {
        errors.push(`${product} export price (${price}) is outside valid range (50-500)`);
      }
    });
  }
  
  // Advertising validation
  const maxAdvertising = 50000;
  if (decisions.advertising_trade_press) {
    Object.entries(decisions.advertising_trade_press).forEach(([key, value]) => {
      if (value < 0 || value > maxAdvertising) {
        errors.push(`Advertising trade press for ${key} (${value}) is outside valid range (0-${maxAdvertising})`);
      }
    });
  }
  
  // Shift level validation
  if (decisions.shift_level !== undefined) {
    if (decisions.shift_level < 1 || decisions.shift_level > 3) {
      errors.push(`Shift level (${decisions.shift_level}) must be between 1 and 3`);
    }
  }
  
  // Personnel validation
  if (decisions.recruit_sales !== undefined && decisions.recruit_sales < 0) {
    errors.push(`Recruit sales (${decisions.recruit_sales}) cannot be negative`);
  }
  
  if (decisions.dismiss_sales !== undefined && decisions.dismiss_sales < 0) {
    errors.push(`Dismiss sales (${decisions.dismiss_sales}) cannot be negative`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Calculate share price breakdown
export function calculateSharePriceBreakdown(
  company: CompanyState,
  netProfit: number,
  revenue: number,
  dividendPerShare: number
): SharePriceBreakdown {
  const baseValue = 1.0;
  
  // Profit contribution (normalized)
  const profitContribution = Math.max(-0.5, Math.min(0.5, netProfit / 1_000_000));
  
  // Growth contribution (revenue growth)
  const growthRate = revenue > 0 ? (revenue - (company.last_report?.revenue || revenue)) / revenue : 0;
  const growthContribution = Math.max(-0.3, Math.min(0.3, growthRate * 2));
  
  // Dividend contribution
  const dividendContribution = Math.min(0.2, dividendPerShare * 10);
  
  // Market position (based on market share estimate)
  const marketPositionContribution = Math.max(-0.2, Math.min(0.2, (revenue / 10_000_000) - 0.5));
  
  // Financial health (cash, debt ratio)
  // Calculate net worth if not available: cash + assets - liabilities
  const estimatedNetWorth = company.cash + 
    (company.property_value || 500000) + 
    (company.machines || 0) * MACHINE_COST * 0.7 + // Depreciated machine value
    (company.vehicles || 0) * VEHICLE_COST * 0.7 - // Depreciated vehicle value
    company.overdraft - 
    company.unsecured_loan;
  const cashRatio = company.cash / Math.max(1, company.cash + company.overdraft + company.unsecured_loan);
  const debtRatio = (company.overdraft + company.unsecured_loan) / Math.max(1, estimatedNetWorth);
  const financialHealthContribution = (cashRatio - debtRatio) * 0.3;
  
  const total = baseValue + profitContribution + growthContribution + dividendContribution + 
                marketPositionContribution + financialHealthContribution;
  
  return {
    base_value: baseValue,
    profit_contribution: profitContribution,
    growth_contribution: growthContribution,
    dividend_contribution: dividendContribution,
    market_position_contribution: marketPositionContribution,
    financial_health_contribution: financialHealthContribution,
    total: Math.max(0.1, total), // Minimum share price
  };
}

// Calculate cash flow statement
export function calculateCashFlowStatement(
  company: CompanyState,
  operatingCashFlow: number,
  investingCashFlow: number,
  financingCashFlow: number
): CashFlowStatement {
  const netChange = operatingCashFlow + investingCashFlow + financingCashFlow;
  const debtServiceCost = (company.overdraft * INTEREST_RATE_OVERDRAFT_SPREAD / 100) +
                         (company.unsecured_loan * INTEREST_RATE_LOAN_SPREAD / 100);
  
  const liquidityRatio = company.cash / Math.max(1, company.overdraft + company.unsecured_loan);
  
  return {
    operating_cash_flow: operatingCashFlow,
    investing_cash_flow: investingCashFlow,
    financing_cash_flow: financingCashFlow,
    net_change_in_cash: netChange,
    opening_cash: company.opening_cash,
    closing_cash: company.cash,
    debt_service_cost: debtServiceCost,
    liquidity_ratio: liquidityRatio,
  };
}

// Calculate workforce metrics
export function calculateWorkforceMetrics(
  company: CompanyState,
  decisions: Decisions
): WorkforceMetrics {
  // Morale calculation (based on wages, management budget, training)
  const wageRatio = company.assembly_wage_rate / ASSEMBLY_MIN_WAGE_RATE;
  const salaryRatio = company.sales_salary / MIN_SALES_SALARY_PER_QUARTER;
  const managementRatio = decisions.management_budget / MIN_MANAGEMENT_BUDGET;
  const trainingRatio = (decisions.train_sales + decisions.train_assembly) / 
                        Math.max(1, company.salespeople + company.assembly_workers);
  
  const morale = Math.max(0, Math.min(100, 
    50 + 
    (wageRatio - 1) * 20 +
    (salaryRatio - 1) * 15 +
    (managementRatio - 1) * 10 +
    trainingRatio * 5
  ));
  
  // Retention rate (higher morale = higher retention)
  const retentionRate = 0.7 + (morale / 100) * 0.25;
  
  // Productivity multiplier (based on morale, training, experience)
  const productivity = 0.8 + (morale / 100) * 0.3 + trainingRatio * 0.1;
  
  // Turnover cost (recruitment + dismissal costs)
  const turnoverCost = (decisions.recruit_sales || 0) * RECRUITMENT_COST +
                      (decisions.dismiss_sales || 0) * DISMISSAL_COST +
                      (decisions.recruit_assembly || 0) * RECRUITMENT_COST +
                      (decisions.dismiss_assembly || 0) * DISMISSAL_COST;
  
  // Training effectiveness (based on training budget)
  const trainingEffectiveness = Math.min(1.0, trainingRatio * 2);
  
  return {
    morale,
    retention_rate: retentionRate,
    productivity: Math.max(0.8, Math.min(1.2, productivity)),
    turnover_cost: turnoverCost,
    training_effectiveness: trainingEffectiveness,
  };
}

// Import constants needed
import { 
  MIN_ASSEMBLY_TIME, 
  ASSEMBLY_MIN_WAGE_RATE, 
  MIN_SALES_SALARY_PER_QUARTER, 
  MIN_MANAGEMENT_BUDGET, 
  RECRUITMENT_COST, 
  DISMISSAL_COST, 
  INTEREST_RATE_OVERDRAFT_SPREAD, 
  INTEREST_RATE_LOAN_SPREAD,
  MACHINE_COST,
  VEHICLE_COST,
} from "./constants";

