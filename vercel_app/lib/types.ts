// TypeScript types matching Python dataclasses

import type { Product, Area } from "./constants";

export type ProductAreaKey = `${Product}|${Area}`;

export type EconomyStrength = "Strong" | "Moderate" | "Weak";

export interface Economy {
  quarter: number;
  year: number;
  gdp: number;
  unemployment: number;
  cb_rate: number; // for next quarter
  material_price: number; // per 1000 units, for next quarter
  strength: EconomyStrength; // Economy strength level
}

export interface ProductImprovement {
  product: Product;
  type: "MAJOR" | "MINOR";
  quarter_reported: number;
  year_reported: number;
  implemented: boolean;
}

export interface MaterialOrder {
  quantity: number;
  supplier: number;
  num_deliveries: number;
  order_quarter: number;
  order_year: number;
  delivery_quarter: number;
  delivery_year: number;
  base_price_per_1000: number;
}

export interface MachineOrder {
  quantity: number;
  order_quarter: number;
  order_year: number;
  deposit_paid: boolean;
  installed: boolean;
  available_quarter: number | null;
}

export interface Decisions {
  // Product improvements
  implement_major_improvement: Record<Product, boolean>;
  
  // Prices
  prices_export: Record<Product, number>;
  prices_home: Record<Product, number>;
  
  // Promotion (advertising) - three types per product per area
  advertising_trade_press: Record<ProductAreaKey, number>;
  advertising_support: Record<ProductAreaKey, number>;
  advertising_merchandising: Record<ProductAreaKey, number>;
  
  // Assembly time per product
  assembly_time: Record<Product, number>;
  
  // Salespeople allocation
  salespeople_allocation: Record<Area, number>;
  
  // Salespeople remuneration
  sales_salary_per_quarter: number;
  sales_commission_percent: number;
  
  // Assembly worker wage rate
  assembly_wage_rate: number;
  
  // Shift level
  shift_level: number;
  
  // Management budget
  management_budget: number;
  
  // Maintenance
  maintenance_hours_per_machine: number;
  
  // Dividend
  dividend_per_share: number; // pence per share
  
  // Credit terms
  credit_days: number;
  
  // Vehicles
  vans_to_buy: number;
  vans_to_sell: number;
  
  // Information purchases
  buy_competitor_info: boolean;
  buy_market_shares: boolean;
  
  // Deliveries (production schedule)
  deliveries: Record<ProductAreaKey, number>;
  
  // Product development
  product_development: Record<Product, number>;
  
  // Salespeople
  recruit_sales: number;
  dismiss_sales: number;
  train_sales: number;
  
  // Assembly workers
  recruit_assembly: number;
  dismiss_assembly: number;
  train_assembly: number;
  
  // Materials
  materials_quantity: number;
  materials_supplier: number;
  materials_num_deliveries: number;
  
  // Machines
  machines_to_sell: number;
  machines_to_order: number;
}

export interface CompanyState {
  name: string;
  
  // Share capital
  shares_outstanding: number;
  share_price: number;
  
  // Fixed assets
  property_value: number;
  machines: number;
  machines_ordered: MachineOrder[];
  machine_efficiency: number; // 0-1
  vehicles: number;
  vehicles_age_quarters: number[];
  
  // Individual machine tracking
  machine_ages_quarters: number[];
  machine_values: number[];
  
  // Inventory
  material_stock: number;
  material_orders: MaterialOrder[];
  stocks: Record<ProductAreaKey, number>;
  backlog: Record<ProductAreaKey, number>;
  
  // Personnel
  salespeople: number;
  assembly_workers: number;
  machinists: number;
  
  // Personnel in training/pending
  salespeople_in_training: number;
  assembly_workers_in_training: number;
  salespeople_pending_recruitment: number;
  assembly_workers_pending_recruitment: number;
  
  // Personnel leaving
  salespeople_to_dismiss_next_quarter: number;
  assembly_workers_to_dismiss_next_quarter: number;
  
  // Pay rates
  sales_salary: number;
  sales_commission_rate: number;
  assembly_wage_rate: number;
  
  // Financial
  cash: number;
  overdraft: number;
  unsecured_loan: number;
  reserves: number;
  tax_liability: number;
  taxable_profit_accumulated: number;
  debtors: number;
  creditors: number;
  
  // Creditors tracking
  creditors_by_category: Record<string, number>;
  
  // Product improvements
  product_improvements: ProductImprovement[];
  product_star_ratings: Record<Product, number>;
  
  // Product development
  product_dev_accumulated: Record<Product, number>;
  product_dev_projects_active: Record<Product, boolean>;
  
  // Last shift level used
  last_shift_level: number;
  
  // Strike weeks
  strike_weeks_next_quarter: number;
  
  // Absenteeism
  absenteeism_hours: number;
  
  // Historical data
  last_report: Record<string, any>;
  
  // Machine breakdowns
  machine_breakdown_hours: number;
  
  // Opening balances
  opening_cash: number;
  opening_overdraft: number;
  opening_loan: number;
  opening_debtors: number;
  opening_creditors: number;
  
  // Workforce management
  workforce_morale: number; // 0-100, affects productivity and retention
  sales_retention_rate: number; // 0-1, probability of salespeople staying
  assembly_retention_rate: number; // 0-1, probability of assembly workers staying
  productivity_multiplier: number; // 0.8-1.2, affects output per worker
  
  // Competitor strategy (for AI companies)
  competitor_strategy?: CompetitorStrategy;
}

export type CompetitorStrategy = 
  | "aggressive"      // Low prices, high advertising, rapid expansion
  | "conservative"    // High prices, low costs, steady growth
  | "balanced"        // Moderate approach
  | "quality_focused" // High quality, premium pricing
  | "cost_leader";    // Minimize costs, competitive pricing

export interface RandomEvent {
  type: "market_crisis" | "regulatory_change" | "supply_shortage" | "economic_boom" | "labor_strike" | "technology_breakthrough";
  severity: "low" | "medium" | "high";
  description: string;
  quarter: number;
  year: number;
  effects: {
    gdp_modifier?: number;
    material_price_modifier?: number;
    demand_modifier?: number;
    cost_modifier?: number;
    affects_all_companies: boolean;
    affected_companies?: number[]; // If not all companies
  };
}

export interface ManagementReport {
  quarter: number;
  year: number;
  revenue: number;
  cost_of_sales: number;
  gross_profit: number;
  total_overheads: number;
  net_profit: number;
  share_price: number;
  cash: number;
  net_worth: number;
  machines: number;
  vehicles: number;
  salespeople: number;
  assembly_workers: number;
  machinists: number;
  sales: Record<ProductAreaKey, number>;
  new_orders: Record<ProductAreaKey, number>;
  backlog: Record<ProductAreaKey, number>;
  stocks: Record<ProductAreaKey, number>;
  product_dev_outcomes: Record<Product, string>;
  
  // Enhanced reporting
  share_price_breakdown?: SharePriceBreakdown;
  cash_flow_statement?: CashFlowStatement;
  workforce_metrics?: WorkforceMetrics;
  random_events?: RandomEvent[];
  [key: string]: any; // Allow additional fields
}

export interface SharePriceBreakdown {
  base_value: number;
  profit_contribution: number;
  growth_contribution: number;
  dividend_contribution: number;
  market_position_contribution: number;
  financial_health_contribution: number;
  total: number;
}

export interface CashFlowStatement {
  operating_cash_flow: number;
  investing_cash_flow: number;
  financing_cash_flow: number;
  net_change_in_cash: number;
  opening_cash: number;
  closing_cash: number;
  debt_service_cost: number;
  liquidity_ratio: number;
}

export interface WorkforceMetrics {
  morale: number;
  retention_rate: number;
  productivity: number;
  turnover_cost: number;
  training_effectiveness: number;
}

// Helper to create ProductAreaKey
export function makeKey(product: Product, area: Area): ProductAreaKey {
  return `${product}|${area}`;
}

// Helper to parse ProductAreaKey
export function parseKey(key: ProductAreaKey): [Product, Area] {
  const [product, area] = key.split("|") as [Product, Area];
  return [product, area];
}

