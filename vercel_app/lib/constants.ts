// All constants from Python app.py - Tables 1-23

export const PRODUCTS = ["Product 1", "Product 2", "Product 3"] as const;
export const AREAS = ["South", "West", "North", "Export"] as const;

export type Product = (typeof PRODUCTS)[number];
export type Area = (typeof AREAS)[number];

// Table 1: Market Statistics
export const MARKET_STATISTICS: Record<Area, {
  managerial: number;
  supervisory: number;
  other: number;
  total: number;
  outlets: number;
}> = {
  South: { managerial: 1_000_000, supervisory: 2_000_000, other: 4_000_000, total: 7_000_000, outlets: 3000 },
  West: { managerial: 1_000_000, supervisory: 1_000_000, other: 2_000_000, total: 4_000_000, outlets: 2000 },
  North: { managerial: 1_000_000, supervisory: 3_000_000, other: 9_000_000, total: 13_000_000, outlets: 4000 },
  Export: { managerial: 10_000_000, supervisory: 15_000_000, other: 55_000_000, total: 80_000_000, outlets: 20_000 },
};

// Table 2: Marketing Costs
export const SALESPERSON_EXPENSES = 3000; // per quarter
export const COMPETITOR_INFO_COST = 5000; // per quarter
export const MARKET_SHARES_INFO_COST = 5000; // per quarter

// Table 3: Manufacturing Parameters
export const MIN_MACHINING_TIME: Record<Product, number> = {
  "Product 1": 60.0,
  "Product 2": 75.0,
  "Product 3": 120.0,
};
export const MIN_ASSEMBLY_TIME: Record<Product, number> = {
  "Product 1": 100.0,
  "Product 2": 150.0,
  "Product 3": 300.0,
};
export const MATERIAL_PER_UNIT: Record<Product, number> = {
  "Product 1": 1.0,
  "Product 2": 2.0,
  "Product 3": 3.0,
};

// Table 4: Maintenance Costs
export const CONTRACTED_MAINTENANCE_RATE = 60.0; // £ per hour
export const UNCONTRACTED_MAINTENANCE_RATE = 120.0; // £ per hour

// Table 5: Maximum Hours Available per Machine Per Quarter
export const MACHINE_HOURS_PER_SHIFT: Record<number, number> = {
  1: 576,
  2: 1068,
  3: 1602,
};
export const MACHINISTS_PER_MACHINE: Record<number, number> = {
  1: 4,
  2: 8,
  3: 12,
};

// Table 6: Valuation of Rejected Products (Scrap Value)
export const SCRAP_VALUE: Record<Product, number> = {
  "Product 1": 20.0,
  "Product 2": 40.0,
  "Product 3": 60.0,
};

// Table 7: Guarantee Servicing Charges
export const SERVICING_CHARGE: Record<Product, number> = {
  "Product 1": 60.0,
  "Product 2": 120.0,
  "Product 3": 200.0,
};

// Table 8: Production Costs
export const SUPERVISION_COST_PER_SHIFT = 10_000;
export const PRODUCTION_OVERHEAD_PER_MACHINE = 2000;
export const MACHINE_RUNNING_COST_PER_HOUR = 7;
export const PRODUCTION_PLANNING_COST_PER_UNIT = 1;

// Table 9: Standard Vehicle Capacity
export const VEHICLE_CAPACITY: Record<Product, number> = {
  "Product 1": 40,
  "Product 2": 40,
  "Product 3": 20,
};

// Table 10: Return Journey Times
export const JOURNEY_TIME_DAYS: Record<Area, number> = {
  South: 1,
  West: 2,
  North: 4,
  Export: 6,
};

// Table 11: Transport Costs
export const FLEET_FIXED_COST_PER_VEHICLE = 7000; // per quarter
export const OWN_VEHICLE_RUNNING_COST_PER_DAY = 50;
export const HIRED_VEHICLE_COST_PER_DAY = 200;
export const MAX_VEHICLE_DAYS_PER_QUARTER = 60;

// Table 12: Warehousing and Purchasing
export const FACTORY_STORAGE_CAPACITY = 2000; // units
export const FIXED_QUARTERLY_WAREHOUSE_COST = 3750;
export const FIXED_QUARTERLY_ADMIN_COST = 3250;
export const COST_PER_ORDER = 750;
export const VARIABLE_EXTERNAL_STORAGE_COST = 1.50; // per unit
export const PRODUCT_STORAGE_COST = 2.0; // per unit per quarter

// Table 14: Material Suppliers' Terms of Trade
export const SUPPLIERS: Record<number, {
  discount: number;
  delivery_charge: number;
  min_delivery: number;
  min_order: number;
  deliveries: string | number;
}> = {
  0: { discount: 0.0, delivery_charge: 0, min_delivery: 1, min_order: 1, deliveries: "just_in_time" },
  1: { discount: 0.10, delivery_charge: 200, min_delivery: 1, min_order: 1, deliveries: "multiple" },
  2: { discount: 0.15, delivery_charge: 300, min_delivery: 1000, min_order: 10_000, deliveries: "multiple" },
  3: { discount: 0.30, delivery_charge: 100, min_delivery: 0, min_order: 50_000, deliveries: 12 },
};

// Table 15: Personnel Department Costs
export const RECRUITMENT_COST: Record<string, number> = {
  Salesperson: 1500,
  "Assembly worker": 1200,
  Machinist: 750,
};
export const DISMISSAL_COST: Record<string, number> = {
  Salesperson: 5000,
  "Assembly worker": 3000,
  Machinist: 1500,
};
export const TRAINING_COST: Record<string, number> = {
  Salesperson: 6000,
  "Assembly worker": 4500,
  Machinist: 0,
};

// Table 16: Maximum Hours per Quarter for each Production Worker
export const WORKER_HOURS: Record<number, {
  basic: number;
  saturday: number;
  sunday: number;
  machinist_premium: number;
}> = {
  1: { basic: 420, saturday: 84, sunday: 72, machinist_premium: 0 },
  2: { basic: 420, saturday: 42, sunday: 72, machinist_premium: 1/3 },
  3: { basic: 420, saturday: 42, sunday: 72, machinist_premium: 2/3 },
};

// Table 17: Minimum Hours and Pay
export const MACHINIST_MIN_HOURS = 400; // per quarter
export const ASSEMBLY_STRIKE_HOURS_PER_WEEK = 48;
export const ASSEMBLY_MIN_WAGE_RATE = 8.50; // £ per hour
export const UNSKILLED_SKILLED_RATIO = 0.65;
export const MIN_SALES_SALARY_PER_QUARTER = 2000;
export const MIN_MANAGEMENT_BUDGET = 40_000;

// Table 18: Fixed Assets
export const MACHINE_COST = 200_000;
export const MACHINE_DEPOSIT = 100_000; // 50% at order
export const VEHICLE_COST = 15_000;
export const MACHINE_DEPRECIATION_RATE = 0.025; // per quarter (2.5%)
export const VEHICLE_DEPRECIATION_RATE = 0.0625; // per quarter (6.25%)

// Table 20: Financial Parameters
export const TAX_RATE = 0.30; // 30% per annum
export const FIXED_OVERHEADS_PER_QUARTER = 10_000;
export const VARIABLE_OVERHEAD_RATE = 0.0025; // 0.25% per quarter
export const CREDIT_CONTROL_COST_PER_UNIT = 1.50;
export const INTEREST_RATE_DEPOSIT_SPREAD = -2.0; // bank rate - 2%
export const INTEREST_RATE_OVERDRAFT_SPREAD = 4.0; // bank rate + 4%
export const INTEREST_RATE_LOAN_SPREAD = 10.0; // bank rate + 10%

// Table 21: Stock Valuations
export const PRODUCT_STOCK_VALUATION: Record<Product, number> = {
  "Product 1": 80.0,
  "Product 2": 120.0,
  "Product 3": 200.0,
};

// Table 22: Timing of Payments to Creditors
export const PAYMENT_TIMING: Record<string, { next: number; after_next: number }> = {
  Advertising: { next: 0.0, after_next: 1.0 },
  Guarantee_Servicing: { next: 0.0, after_next: 1.0 },
  Hired_Transport: { next: 0.0, after_next: 1.0 },
  Product_Development: { next: 1.0, after_next: 0.0 },
  Personnel_Department: { next: 1.0, after_next: 0.0 },
  Maintenance: { next: 0.0, after_next: 1.0 },
  Warehousing_Purchasing: { next: 1.0, after_next: 0.0 },
  External_stockholding: { next: 0.0, after_next: 1.0 },
  Business_Intelligence: { next: 0.0, after_next: 1.0 },
  Other_Miscellaneous: { next: 0.0, after_next: 1.0 },
  Materials_Purchased: { next: 0.0, after_next: 1.0 },
  Machines_Purchased: { next: 0.5, after_next: 0.5 },
  Interest: { next: 1.0, after_next: 0.0 },
};

// Table 23: Customers' credit discount structure
export const CREDIT_DISCOUNTS: Array<{ range: [number, number]; discount: number }> = [
  { range: [0, 7], discount: 0.10 },
  { range: [8, 15], discount: 0.075 },
  { range: [16, 29], discount: 0.05 },
  { range: [30, 999], discount: 0.0 },
];

// Base economic values
export const BASE_GDP = 100.0;
export const BASE_UNEMPLOYMENT = 6.0;
export const BASE_CB_RATE = 3.0;
export const BASE_MATERIAL_PRICE = 100.0; // per 1000 units

// Training limitations
export const MAX_TRAINEES_PER_CATEGORY_PER_QUARTER = 9;

// Sales office cost (1% of orders value)
export const SALES_OFFICE_COST_RATE = 0.01;

