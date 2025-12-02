// Complete TypeScript port of the Python Topaz simulation engine
// This implements all features from app.py

import {
  PRODUCTS,
  AREAS,
  MARKET_STATISTICS,
  MIN_ASSEMBLY_TIME,
  MIN_MACHINING_TIME,
  MATERIAL_PER_UNIT,
  MACHINE_HOURS_PER_SHIFT,
  MACHINISTS_PER_MACHINE,
  WORKER_HOURS,
  SCRAP_VALUE,
  SERVICING_CHARGE,
  SUPERVISION_COST_PER_SHIFT,
  PRODUCTION_OVERHEAD_PER_MACHINE,
  MACHINE_RUNNING_COST_PER_HOUR,
  PRODUCTION_PLANNING_COST_PER_UNIT,
  VEHICLE_CAPACITY,
  JOURNEY_TIME_DAYS,
  FLEET_FIXED_COST_PER_VEHICLE,
  OWN_VEHICLE_RUNNING_COST_PER_DAY,
  HIRED_VEHICLE_COST_PER_DAY,
  MAX_VEHICLE_DAYS_PER_QUARTER,
  FACTORY_STORAGE_CAPACITY,
  FIXED_QUARTERLY_WAREHOUSE_COST,
  FIXED_QUARTERLY_ADMIN_COST,
  COST_PER_ORDER,
  VARIABLE_EXTERNAL_STORAGE_COST,
  PRODUCT_STORAGE_COST,
  SUPPLIERS,
  RECRUITMENT_COST,
  DISMISSAL_COST,
  TRAINING_COST,
  ASSEMBLY_MIN_WAGE_RATE,
  MIN_SALES_SALARY_PER_QUARTER,
  MIN_MANAGEMENT_BUDGET,
  MACHINE_COST,
  MACHINE_DEPOSIT,
  VEHICLE_COST,
  MACHINE_DEPRECIATION_RATE,
  VEHICLE_DEPRECIATION_RATE,
  TAX_RATE,
  CREDIT_CONTROL_COST_PER_UNIT,
  INTEREST_RATE_DEPOSIT_SPREAD,
  INTEREST_RATE_OVERDRAFT_SPREAD,
  INTEREST_RATE_LOAN_SPREAD,
  PRODUCT_STOCK_VALUATION,
  BASE_GDP,
  BASE_UNEMPLOYMENT,
  BASE_CB_RATE,
  BASE_MATERIAL_PRICE,
  MAX_TRAINEES_PER_CATEGORY_PER_QUARTER,
  SALES_OFFICE_COST_RATE,
  SALESPERSON_EXPENSES,
  COMPETITOR_INFO_COST,
  MARKET_SHARES_INFO_COST,
  CONTRACTED_MAINTENANCE_RATE,
  FIXED_OVERHEADS_PER_QUARTER,
  type Product,
  type Area,
} from "./constants";

import type {
  Economy,
  Decisions,
  CompanyState,
  ProductImprovement,
  MaterialOrder,
  MachineOrder,
  ProductAreaKey,
  ManagementReport,
} from "./types";

import { makeKey, parseKey } from "./types";

// Seeded RNG for deterministic behavior
class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  random(): number {
    return this.next();
  }

  uniform(min: number, max: number): number {
    return min + (max - min) * this.random();
  }

  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.random() * arr.length)];
  }

  randint(min: number, max: number): number {
    return Math.floor(this.uniform(min, max + 1));
  }

  normal(mean: number, std: number): number {
    // Box-Muller transform
    const u1 = this.random();
    const u2 = this.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + std * z;
  }
}

// Helper function to create empty ProductAreaKey record
function createEmptyProductAreaRecord(): Record<ProductAreaKey, number> {
  const result: Partial<Record<ProductAreaKey, number>> = {};
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      result[makeKey(product, area)] = 0;
    }
  }
  return result as Record<ProductAreaKey, number>;
}

// Helper functions
function createDefaultEconomy(): Economy {
  return {
    quarter: 1,
    year: 1,
    gdp: BASE_GDP,
    unemployment: BASE_UNEMPLOYMENT,
    cb_rate: BASE_CB_RATE,
    material_price: BASE_MATERIAL_PRICE,
  };
}

function createDefaultCompanyState(name: string): CompanyState {
  return {
    name,
    shares_outstanding: 1_000_000.0,
    share_price: 1.0,
    property_value: 500_000.0,
    machines: 10,
    machines_ordered: [],
    machine_efficiency: 1.0,
    vehicles: 5,
    vehicles_age_quarters: [0, 0, 0, 0, 0],
    machine_ages_quarters: Array(10).fill(0),
    machine_values: Array(10).fill(MACHINE_COST),
    material_stock: 5_000.0,
    material_orders: [],
    stocks: createEmptyProductAreaRecord(),
    backlog: createEmptyProductAreaRecord(),
    salespeople: 10,
    assembly_workers: 40,
    machinists: 40,
    salespeople_in_training: 0,
    assembly_workers_in_training: 0,
    salespeople_pending_recruitment: 0,
    assembly_workers_pending_recruitment: 0,
    salespeople_to_dismiss_next_quarter: 0,
    assembly_workers_to_dismiss_next_quarter: 0,
    sales_salary: MIN_SALES_SALARY_PER_QUARTER,
    sales_commission_rate: 0.0,
    assembly_wage_rate: ASSEMBLY_MIN_WAGE_RATE,
    cash: 200_000.0,
    overdraft: 0.0,
    unsecured_loan: 0.0,
    reserves: 0.0,
    tax_liability: 0.0,
    taxable_profit_accumulated: 0.0,
    debtors: 0.0,
    creditors: 0.0,
    creditors_by_category: {},
    product_improvements: [],
    product_star_ratings: { "Product 1": 3, "Product 2": 3, "Product 3": 3 },
    product_dev_accumulated: { "Product 1": 0, "Product 2": 0, "Product 3": 0 },
    product_dev_projects_active: { "Product 1": false, "Product 2": false, "Product 3": false },
    last_shift_level: 1,
    strike_weeks_next_quarter: 0,
    absenteeism_hours: 0.0,
    last_report: {},
    machine_breakdown_hours: 0.0,
    opening_cash: 200_000.0,
    opening_overdraft: 0.0,
    opening_loan: 0.0,
    opening_debtors: 0.0,
    opening_creditors: 0.0,
  };
}

// Main Simulation class
export class Simulation {
  public economy: Economy;
  public companies: CompanyState[];
  public history: ManagementReport[];
  public material_prices_history: number[];
  public n_players: number;
  private rng: SeededRNG;

  constructor(n_companies: number = 8, seed: number = 42) {
    this.rng = new SeededRNG(seed);
    this.economy = createDefaultEconomy();
    this.companies = Array.from({ length: n_companies }, (_, i) =>
      createDefaultCompanyState(`Company ${i + 1}`)
    );
    this.history = [];
    this.material_prices_history = [BASE_MATERIAL_PRICE];
    this.n_players = 1;
  }

  // ========== ECONOMY ==========

  advanceEconomy(): void {
    this.economy.quarter += 1;
    if (this.economy.quarter > 4) {
      this.economy.quarter = 1;
      this.economy.year += 1;
    }

    const shock = this.rng.normal(0, 1.5);
    this.economy.gdp = Math.max(80, this.economy.gdp * (1 + shock / 100));

    const u_shock = this.rng.normal(0, 0.3);
    this.economy.unemployment = Math.min(
      15,
      Math.max(2, this.economy.unemployment + u_shock - shock / 40)
    );

    const rate_target = 2.5 + (this.economy.gdp - BASE_GDP) / 40;
    this.economy.cb_rate = Math.max(
      0.25,
      0.75 * this.economy.cb_rate + 0.25 * rate_target
    );

    this.economy.material_price = Math.max(
      60,
      this.economy.material_price *
        (1 + (this.economy.cb_rate - 2.5) / 200 + this.rng.normal(0, 0.01))
    );
  }

  // ========== DEMAND & MARKETING ==========

  demandForProduct(
    company: CompanyState,
    decisions: Decisions,
    product: Product,
    area: Area,
    all_companies?: CompanyState[],
    all_decisions?: Decisions[]
  ): number {
    const market_stats = MARKET_STATISTICS[area];
    const base_population_factor = market_stats.total / 7_000_000.0;

    const seasonal_factor = 1.0 + (this.economy.quarter === 4 ? 0.1 : 0.0);
    const gdp_factor = this.economy.gdp / BASE_GDP;

    const base_demand = 1000 * base_population_factor * seasonal_factor * gdp_factor;

    const price =
      area === "Export"
        ? decisions.prices_export[product]
        : decisions.prices_home[product];

    const ref_price = 100 + 20 * PRODUCTS.indexOf(product);
    const price_factor = Math.exp(-0.015 * (price - ref_price));

    const advKey = makeKey(product, area);
    const adv_total =
      (decisions.advertising_trade_press[advKey] || 0) +
      (decisions.advertising_support[advKey] || 0) +
      (decisions.advertising_merchandising[advKey] || 0);
    const adv_factor = 1 + 0.0003 * Math.sqrt(Math.max(0, adv_total));

    const q_factor = decisions.assembly_time[product] / MIN_ASSEMBLY_TIME[product];
    const quality_factor = Math.min(1.4, 0.7 + 0.7 * q_factor);

    const star_rating = company.product_star_ratings[product] || 3;
    const star_factor = 0.8 + (star_rating / 5.0) * 0.4;

    const dev_accumulated = company.product_dev_accumulated[product] || 0.0;
    const dev_factor = 1 + 0.0001 * Math.log1p(Math.max(0, dev_accumulated));

    const salespeople_in_area = decisions.salespeople_allocation[area] || 0;
    const salespeople_factor = 1 + 0.02 * salespeople_in_area;

    const credit_factor = 1 + (decisions.credit_days - 30) / 200.0;

    const backlogKey = makeKey(product, area);
    const backlog = company.backlog[backlogKey] || 0;
    const delivery_factor = Math.max(0.6, 1 - backlog / 4000.0);

    const stock = company.stocks[backlogKey] || 0;
    const availability_factor = Math.min(1.1, 0.9 + stock / 2000.0);

    const company_attractiveness =
      price_factor *
      adv_factor *
      quality_factor *
      star_factor *
      dev_factor *
      salespeople_factor *
      credit_factor *
      delivery_factor *
      availability_factor;

    if (
      all_companies &&
      all_decisions &&
      all_companies.length > 1 &&
      all_decisions.length === all_companies.length
    ) {
      const competitor_attractiveness: number[] = [];
      for (let i = 0; i < all_companies.length; i++) {
        const comp = all_companies[i];
        const dec = all_decisions[i];

        if (comp === company) {
          competitor_attractiveness.push(company_attractiveness);
        } else {
          const comp_price =
            area === "Export"
              ? dec.prices_export[product]
              : dec.prices_home[product];
          const comp_price_factor = Math.exp(-0.015 * (comp_price - ref_price));

          const comp_advKey = makeKey(product, area);
          const comp_adv_total =
            (dec.advertising_trade_press[comp_advKey] || 0) +
            (dec.advertising_support[comp_advKey] || 0) +
            (dec.advertising_merchandising[comp_advKey] || 0);
          const comp_adv_factor = 1 + 0.0003 * Math.sqrt(Math.max(0, comp_adv_total));

          const comp_q_factor = dec.assembly_time[product] / MIN_ASSEMBLY_TIME[product];
          const comp_quality_factor = Math.min(1.4, 0.7 + 0.7 * comp_q_factor);

          const comp_star_rating = comp.product_star_ratings[product] || 3;
          const comp_star_factor = 0.8 + (comp_star_rating / 5.0) * 0.4;

          const comp_salespeople = dec.salespeople_allocation[area] || 0;
          const comp_salespeople_factor = 1 + 0.02 * comp_salespeople;

          const comp_credit_factor = 1 + (dec.credit_days - 30) / 200.0;

          const comp_backlogKey = makeKey(product, area);
          const comp_backlog = comp.backlog[comp_backlogKey] || 0;
          const comp_delivery_factor = Math.max(0.6, 1 - comp_backlog / 4000.0);

          const comp_stock = comp.stocks[comp_backlogKey] || 0;
          const comp_availability_factor = Math.min(1.1, 0.9 + comp_stock / 2000.0);

          const comp_attractiveness =
            comp_price_factor *
            comp_adv_factor *
            comp_quality_factor *
            comp_star_factor *
            comp_salespeople_factor *
            comp_credit_factor *
            comp_delivery_factor *
            comp_availability_factor;

          competitor_attractiveness.push(comp_attractiveness);
        }
      }

      const total_attractiveness = competitor_attractiveness.reduce((a, b) => a + b, 0);
      let market_share = 0.05;
      if (total_attractiveness > 0) {
        market_share = company_attractiveness / total_attractiveness;
        market_share = Math.max(0.05, Math.min(0.95, market_share));
      } else {
        market_share = 1.0 / all_companies.length;
      }

      const total_market_demand = base_demand * all_companies.length;
      return Math.max(0, total_market_demand * market_share);
    }

    return Math.max(0, base_demand * company_attractiveness);
  }

  // ========== PRODUCT DEVELOPMENT ==========

  processProductDevelopment(
    company: CompanyState,
    decisions: Decisions,
    quarter: number,
    year: number
  ): Record<Product, string> {
    const outcomes: Record<Product, string> = {
      "Product 1": "NONE",
      "Product 2": "NONE",
      "Product 3": "NONE",
    };

    for (const product of PRODUCTS) {
      const spend = decisions.product_development[product] || 0.0;

      if (spend > 0) {
        company.product_dev_accumulated[product] =
          (company.product_dev_accumulated[product] || 0) + spend;
        company.product_dev_projects_active[product] = true;
      }

      const accumulated = company.product_dev_accumulated[product] || 0.0;

      if (accumulated > 0) {
        if (accumulated > 100_000 && this.rng.random() < 0.15) {
          const existing_major = company.product_improvements.some(
            (pi) => pi.product === product && pi.type === "MAJOR" && !pi.implemented
          );
          if (!existing_major) {
            company.product_improvements.push({
              product,
              type: "MAJOR",
              quarter_reported: quarter,
              year_reported: year,
              implemented: false,
            });
            outcomes[product] = "MAJOR";
            company.product_dev_accumulated[product] = 0.0;
          } else {
            outcomes[product] = "NONE";
          }
        } else if (accumulated > 30_000 && this.rng.random() < 0.3) {
          outcomes[product] = "MINOR";
          company.product_star_ratings[product] = Math.min(
            5,
            (company.product_star_ratings[product] || 3) + 0.1
          );
        } else {
          outcomes[product] = "NONE";
        }
      } else {
        outcomes[product] = "NONE";
      }

      if (accumulated === 0 && company.product_dev_projects_active[product]) {
        if (this.rng.random() < 0.1) {
          company.product_star_ratings[product] = Math.max(
            1,
            (company.product_star_ratings[product] || 3) - 0.1
          );
        }
      }
    }

    return outcomes;
  }

  implementMajorImprovements(
    company: CompanyState,
    decisions: Decisions
  ): Record<Product, number> {
    const write_offs: Record<Product, number> = {
      "Product 1": 0,
      "Product 2": 0,
      "Product 3": 0,
    };

    for (const product of PRODUCTS) {
      if (decisions.implement_major_improvement[product]) {
        const improvements_to_implement = company.product_improvements.filter(
          (pi) => pi.product === product && pi.type === "MAJOR" && !pi.implemented
        );

        if (improvements_to_implement.length > 0) {
          let total_stock = 0;
          for (const area of AREAS) {
            const key = makeKey(product, area);
            total_stock += company.stocks[key] || 0;
          }
          write_offs[product] = total_stock;

          for (const pi of improvements_to_implement) {
            pi.implemented = true;
          }

          company.product_star_ratings[product] = Math.min(
            5,
            (company.product_star_ratings[product] || 3) + 0.5
          );

          for (const area of AREAS) {
            const key = makeKey(product, area);
            company.stocks[key] = 0;
          }
        }
      }
    }

    return write_offs;
  }

  // ========== MATERIALS & SUPPLIERS ==========

  processMaterialOrder(
    company: CompanyState,
    decisions: Decisions,
    quarter: number,
    year: number
  ): MaterialOrder | null {
    const quantity = decisions.materials_quantity;
    const supplier = decisions.materials_supplier;
    let num_deliveries = decisions.materials_num_deliveries;

    if (quantity <= 0) return null;

    const supplier_info = SUPPLIERS[supplier];
    if (quantity < supplier_info.min_order) return null;

    let delivery_quarter = quarter + 2;
    let delivery_year = year;
    if (delivery_quarter > 4) {
      delivery_quarter -= 4;
      delivery_year += 1;
    }

    if (supplier === 0) {
      num_deliveries = 0;
    } else if (supplier === 3) {
      num_deliveries = 12;
    }

    const order: MaterialOrder = {
      quantity,
      supplier,
      num_deliveries,
      order_quarter: quarter,
      order_year: year,
      delivery_quarter,
      delivery_year,
      base_price_per_1000: this.economy.material_price,
    };

    company.material_orders.push(order);
    return order;
  }

  deliverMaterials(
    company: CompanyState,
    current_quarter: number,
    current_year: number,
    material_price_per_1000: number
  ): [number, number] {
    let delivered_qty = 0.0;
    let total_cost = 0.0;

    const orders_to_deliver = company.material_orders.filter(
      (mo) => mo.delivery_quarter === current_quarter && mo.delivery_year === current_year
    );

    for (const order of orders_to_deliver) {
      const supplier_info = SUPPLIERS[order.supplier];
      let qty = order.quantity;

      if (supplier_info.deliveries === "just_in_time" || order.num_deliveries === 0) {
        // Single delivery
      } else if (supplier_info.deliveries === 12) {
        qty = order.quantity / 12.0;
      } else if (order.num_deliveries > 0) {
        qty = order.quantity / order.num_deliveries;
      }

      const base_cost = qty * (order.base_price_per_1000 / 1000.0);
      const discount = base_cost * supplier_info.discount;
      const delivery_charge = supplier_info.delivery_charge;
      const cost = base_cost - discount + delivery_charge;

      delivered_qty += qty;
      total_cost += cost;
    }

    return [delivered_qty, total_cost];
  }

  // ========== MACHINE PURCHASING ==========

  processMachineOrder(
    company: CompanyState,
    decisions: Decisions,
    quarter: number,
    year: number
  ): number {
    const requested = decisions.machines_to_order;
    if (requested <= 0) return 0;

    const creditworthiness = this.calculateCreditworthiness(company);
    const deposit_per_machine = MACHINE_DEPOSIT;
    const max_affordable = Math.floor(creditworthiness / deposit_per_machine);
    const actual_ordered = Math.min(requested, max_affordable);

    if (actual_ordered > 0) {
      let delivery_quarter = quarter + 2;
      let delivery_year = year;
      if (delivery_quarter > 4) {
        delivery_quarter -= 4;
        delivery_year += 1;
      }

      let available_quarter = delivery_quarter + 1;
      if (available_quarter > 4) {
        available_quarter -= 4;
        delivery_year += 1;
      }

      const order: MachineOrder = {
        quantity: actual_ordered,
        order_quarter: quarter,
        order_year: year,
        deposit_paid: false,
        installed: false,
        available_quarter,
      };

      company.machines_ordered.push(order);
    }

    return actual_ordered;
  }

  processMachineInstallations(
    company: CompanyState,
    quarter: number,
    year: number
  ): number {
    let installed_count = 0;

    for (const order of company.machines_ordered) {
      if (!order.installed) {
        let install_quarter = order.order_quarter + 2;
        let install_year = order.order_year;
        if (install_quarter > 4) {
          install_quarter -= 4;
          install_year += 1;
        }

        if (quarter === install_quarter && year === install_year) {
          for (let i = 0; i < order.quantity; i++) {
            company.machines += 1;
            company.machine_ages_quarters.push(0);
            company.machine_values.push(MACHINE_COST);
          }
          order.installed = true;
          installed_count += order.quantity;
        }
      }
    }

    return installed_count;
  }

  calculateCreditworthiness(company: CompanyState): number {
    const limit = this.calculateOverdraftLimit(company);
    const machine_order_commitment = company.machines_ordered
      .filter((mo) => !mo.installed)
      .reduce((sum) => sum + 100_000, 0);
    return Math.max(0.0, limit - company.overdraft - company.unsecured_loan - machine_order_commitment);
  }

  calculateOverdraftLimit(company: CompanyState): number {
    const product_stock_value = this.getProductStockValue(company);
    const machine_value = this.getMachineValue(company);
    const vehicle_value = this.getVehicleValue(company);
    const material_stock_value = this.getMaterialStockValue(company);

    const limit =
      1.0 * company.cash +
      1.0 * product_stock_value +
      0.5 * (machine_value + vehicle_value + material_stock_value + company.debtors) +
      0.25 * company.property_value -
      1.0 * (company.tax_liability + company.creditors);

    return Math.max(0.0, limit);
  }

  getMachineValue(company: CompanyState): number {
    return company.machine_values.reduce((sum, val) => sum + val, 0);
  }

  getVehicleValue(company: CompanyState): number {
    return company.vehicles_age_quarters.reduce((sum, age) => {
      const value = VEHICLE_COST * Math.pow(1 - VEHICLE_DEPRECIATION_RATE, age);
      return sum + value;
    }, 0);
  }

  getProductStockValue(company: CompanyState): number {
    let total = 0.0;
    for (const product of PRODUCTS) {
      for (const area of AREAS) {
        const key = makeKey(product, area);
        const qty = company.stocks[key] || 0;
        total += qty * PRODUCT_STOCK_VALUATION[product];
      }
    }
    return total;
  }

  getMaterialStockValue(company: CompanyState): number {
    return company.material_stock * (this.economy.material_price / 1000.0) * 0.5;
  }

  // ========== PERSONNEL ==========

  processPersonnelRecruitment(
    company: CompanyState,
    decisions: Decisions,
    economy: Economy,
    all_companies: CompanyState[]
  ): { sales_recruited: number; assembly_recruited: number } {
    const unemployment_factor = economy.unemployment / BASE_UNEMPLOYMENT;
    let sales_recruited = 0;
    let assembly_recruited = 0;

    if (decisions.recruit_sales > 0) {
      const avg_wage_ratio = company.sales_salary / MIN_SALES_SALARY_PER_QUARTER;
      const success_rate = Math.min(
        0.9,
        0.3 + 0.3 * unemployment_factor + 0.2 * avg_wage_ratio
      );
      sales_recruited = Math.min(
        decisions.recruit_sales,
        Math.floor(decisions.recruit_sales * success_rate + this.rng.random())
      );
      company.salespeople_pending_recruitment += sales_recruited;
    }

    if (decisions.recruit_assembly > 0) {
      const avg_wage_ratio = company.assembly_wage_rate / ASSEMBLY_MIN_WAGE_RATE;
      const success_rate = Math.min(
        0.9,
        0.4 + 0.3 * unemployment_factor + 0.2 * avg_wage_ratio
      );
      assembly_recruited = Math.min(
        decisions.recruit_assembly,
        Math.floor(decisions.recruit_assembly * success_rate + this.rng.random())
      );
      company.assembly_workers_pending_recruitment += assembly_recruited;
    }

    return { sales_recruited, assembly_recruited };
  }

  processPersonnelTraining(
    company: CompanyState,
    decisions: Decisions
  ): { sales_trained: number; assembly_trained: number } {
    const sales_training = Math.min(
      decisions.train_sales,
      MAX_TRAINEES_PER_CATEGORY_PER_QUARTER
    );
    const assembly_training = Math.min(
      decisions.train_assembly,
      MAX_TRAINEES_PER_CATEGORY_PER_QUARTER
    );

    company.salespeople_in_training += sales_training;
    company.assembly_workers_in_training += assembly_training;

    return { sales_trained: sales_training, assembly_trained: assembly_training };
  }

  processPersonnelAvailability(company: CompanyState): void {
    company.salespeople +=
      company.salespeople_pending_recruitment + company.salespeople_in_training;
    company.assembly_workers +=
      company.assembly_workers_pending_recruitment +
      company.assembly_workers_in_training;

    company.salespeople_pending_recruitment = 0;
    company.salespeople_in_training = 0;
    company.assembly_workers_pending_recruitment = 0;
    company.assembly_workers_in_training = 0;
  }

  processPersonnelDismissals(company: CompanyState, decisions: Decisions): void {
    if (decisions.dismiss_sales > 0) {
      const actual = Math.min(decisions.dismiss_sales, company.salespeople);
      company.salespeople_to_dismiss_next_quarter = actual;
    }

    if (decisions.dismiss_assembly > 0) {
      const actual = Math.min(decisions.dismiss_assembly, company.assembly_workers);
      company.assembly_workers_to_dismiss_next_quarter = actual;
    }
  }

  applyPersonnelDismissals(company: CompanyState): void {
    company.salespeople = Math.max(
      0,
      company.salespeople - company.salespeople_to_dismiss_next_quarter
    );
    company.assembly_workers = Math.max(
      0,
      company.assembly_workers - company.assembly_workers_to_dismiss_next_quarter
    );

    company.salespeople_to_dismiss_next_quarter = 0;
    company.assembly_workers_to_dismiss_next_quarter = 0;
  }

  // ========== PRODUCTION CAPACITY ==========

  productionCapacity(
    company: CompanyState,
    decisions: Decisions
  ): [number, number] {
    const shift = decisions.shift_level;
    const hours_per_machine = MACHINE_HOURS_PER_SHIFT[shift] || 576;
    const total_machine_hours = company.machines * hours_per_machine;

    const maint = decisions.maintenance_hours_per_machine;
    const maintenance_factor = Math.min(1.1, 0.9 + maint / 200.0);
    const eff = Math.min(1.0, company.machine_efficiency * maintenance_factor);
    const effective_machine_hours = total_machine_hours * eff;

    let max_units_by_machining = 0;
    for (const product of PRODUCTS) {
      const mach_time_hours = MIN_MACHINING_TIME[product] / 60.0;
      max_units_by_machining += effective_machine_hours / mach_time_hours;
    }

    const worker_hours_data = WORKER_HOURS[shift] || WORKER_HOURS[1];
    const max_hours_per_worker =
      worker_hours_data.basic +
      worker_hours_data.saturday +
      worker_hours_data.sunday;

    const strike_weeks = company.strike_weeks_next_quarter;
    const strike_hours_lost = strike_weeks * (worker_hours_data.basic / 12.0);
    const effective_hours_per_worker = max_hours_per_worker - strike_hours_lost;

    const total_assembly_hours = company.assembly_workers * effective_hours_per_worker;

    let max_units_by_assembly = 0;
    for (const product of PRODUCTS) {
      const assy_time_hours = decisions.assembly_time[product] / 60.0;
      max_units_by_assembly += total_assembly_hours / assy_time_hours;
    }

    return [max_units_by_machining, max_units_by_assembly];
  }

  // ========== TRANSPORT COSTS ==========

  calculateTransportCosts(
    company: CompanyState,
    decisions: Decisions,
    deliveries: Record<ProductAreaKey, number>
  ): [number, Record<string, number>] {
    const vehicle_days_per_area: Record<Area, number> = {
      South: 0,
      West: 0,
      North: 0,
      Export: 0,
    };

    for (const area of AREAS) {
      let total_units = 0;
      for (const product of PRODUCTS) {
        const key = makeKey(product, area);
        total_units += deliveries[key] || 0;
      }

      if (total_units === 0) {
        vehicle_days_per_area[area] = 0;
        continue;
      }

      // Simplified trip calculation
      let trips = 0;
      let remaining = total_units;
      while (remaining > 0) {
        let trip_capacity = 0;
        for (const product of PRODUCTS) {
          const key = makeKey(product, area);
          const qty = deliveries[key] || 0;
          if (qty > 0) {
            const capacity = VEHICLE_CAPACITY[product];
            if (trip_capacity + capacity <= 40) {
              const add_qty = Math.min(qty, 40 - trip_capacity);
              trip_capacity += capacity * (add_qty / VEHICLE_CAPACITY[product]);
              remaining -= add_qty;
            }
          }
        }
        trips += 1;
        if (remaining <= 0) break;
      }

      const journey_days = JOURNEY_TIME_DAYS[area];
      vehicle_days_per_area[area] = trips * journey_days;
    }

    const total_vehicle_days_required = Object.values(vehicle_days_per_area).reduce(
      (sum, days) => sum + days,
      0
    );

    const own_vehicle_capacity_days = company.vehicles * MAX_VEHICLE_DAYS_PER_QUARTER;
    const own_days = Math.min(own_vehicle_capacity_days, total_vehicle_days_required);
    const hired_days = Math.max(0, total_vehicle_days_required - own_days);

    const fleet_fixed_cost = company.vehicles * FLEET_FIXED_COST_PER_VEHICLE;
    const own_running_cost = own_days * OWN_VEHICLE_RUNNING_COST_PER_DAY;
    const hired_running_cost = hired_days * HIRED_VEHICLE_COST_PER_DAY;

    const total_cost = fleet_fixed_cost + own_running_cost + hired_running_cost;

    const details = {
      own_days,
      hired_days,
      fleet_fixed: fleet_fixed_cost,
      own_running: own_running_cost,
      hired_running: hired_running_cost,
    };

    return [total_cost, details];
  }

  netWorth(company: CompanyState): number {
    const assets =
      company.cash +
      company.property_value +
      this.getMachineValue(company) +
      this.getVehicleValue(company) +
      this.getProductStockValue(company) +
      this.getMaterialStockValue(company) +
      company.debtors;

    const liabilities =
      company.overdraft +
      company.unsecured_loan +
      company.tax_liability +
      company.creditors;

    return assets - liabilities;
  }

  // ========== MAIN QUARTERLY SIMULATION ==========

  simulateQuarterForCompany(
    company: CompanyState,
    decisions: Decisions,
    is_player: boolean,
    all_companies?: CompanyState[],
    all_decisions?: Decisions[]
  ): ManagementReport {
    // Import and call the main simulation function
    // Using dynamic import to avoid circular dependency
    const simQuarter = require("./simulation_quarter");
    return simQuarter.simulateQuarterForCompany(
      this,
      company,
      decisions,
      is_player,
      all_companies,
      all_decisions
    );
  }

  // ========== AI COMPETITOR DECISIONS ==========

  autoDecisions(company: CompanyState): Decisions {
    const base_price = 100;
    const prices_home: Record<string, number> = {};
    PRODUCTS.forEach((p, i) => {
      prices_home[p] = base_price + 15 * i + this.rng.randint(-10, 10);
    });

    const prices_export: Record<string, number> = {};
    PRODUCTS.forEach((p) => {
      prices_export[p] = prices_home[p] * 1.1;
    });

    const assembly_time: Record<string, number> = {};
    PRODUCTS.forEach((p) => {
      assembly_time[p] = MIN_ASSEMBLY_TIME[p] * this.rng.uniform(1.0, 1.4);
    });

    const advertising_trade_press: Record<string, number> = {};
    const advertising_support: Record<string, number> = {};
    const advertising_merchandising: Record<string, number> = {};

    PRODUCTS.forEach((p) => {
      AREAS.forEach((a) => {
        const val = this.rng.choice([0, 5000, 10000, 20000]);
        const key = makeKey(p, a);
        advertising_trade_press[key] = val / 3;
        advertising_support[key] = val / 3;
        advertising_merchandising[key] = val / 3;
      });
    });

    const product_dev: Record<string, number> = {};
    PRODUCTS.forEach((p) => {
      product_dev[p] = this.rng.choice([0, 5000, 10000]);
    });

    const total_sales = company.salespeople;
    const base: Record<string, number> = { South: 1.0, West: 0.7, North: 1.3, Export: 1.2 };
    const total_base = Object.values(base).reduce((sum, val) => sum + val, 0);
    const sales_alloc: Record<string, number> = {};
    AREAS.forEach((a) => {
      sales_alloc[a] = Math.floor((total_sales * base[a]) / total_base);
    });

    let allocated = Object.values(sales_alloc).reduce((sum, val) => sum + val, 0);
    while (allocated < total_sales) {
      const area = this.rng.choice(AREAS);
      sales_alloc[area] += 1;
      allocated += 1;
    }

    const deliveries: Record<string, number> = {};
    PRODUCTS.forEach((p) => {
      AREAS.forEach((a) => {
        const key = makeKey(p, a);
        deliveries[key] = this.rng.randint(200, 1500);
      });
    });

    return {
      implement_major_improvement: { "Product 1": false, "Product 2": false, "Product 3": false },
      prices_home: prices_home as Record<"Product 1" | "Product 2" | "Product 3", number>,
      prices_export: prices_export as Record<"Product 1" | "Product 2" | "Product 3", number>,
      advertising_trade_press,
      advertising_support,
      advertising_merchandising,
      assembly_time: assembly_time as Record<"Product 1" | "Product 2" | "Product 3", number>,
      salespeople_allocation: sales_alloc as Record<"South" | "West" | "North" | "Export", number>,
      sales_salary_per_quarter: MIN_SALES_SALARY_PER_QUARTER,
      sales_commission_percent: 0.0,
      assembly_wage_rate: ASSEMBLY_MIN_WAGE_RATE,
      shift_level: this.rng.choice([1, 2, 3]),
      management_budget: this.rng.choice([40000, 50000, 60000]),
      maintenance_hours_per_machine: this.rng.choice([20, 40, 60]),
      dividend_per_share: this.rng.choice([0.0, 0.02, 0.04]),
      credit_days: this.rng.choice([30, 45, 60]),
      vans_to_buy: 0,
      vans_to_sell: 0,
      buy_competitor_info: false,
      buy_market_shares: false,
      deliveries,
      product_development: product_dev as Record<"Product 1" | "Product 2" | "Product 3", number>,
      recruit_sales: this.rng.choice([0, 1, 2]),
      dismiss_sales: 0,
      train_sales: 0,
      recruit_assembly: this.rng.choice([0, 2, 4]),
      dismiss_assembly: 0,
      train_assembly: this.rng.choice([0, 2, 4]),
      materials_quantity: this.rng.choice([4000, 6000, 8000]),
      materials_supplier: 0,
      materials_num_deliveries: 1,
      machines_to_sell: 0,
      machines_to_order: 0,
    };
  }

  // ========== PUBLIC API ==========

  step(player_decisions_list: Decisions[]): ManagementReport[] {
    const all_decisions: Decisions[] = [];

    for (let i = 0; i < this.companies.length; i++) {
      const company = this.companies[i];
      if (i < player_decisions_list.length && player_decisions_list[i]) {
        all_decisions.push(player_decisions_list[i]);
      } else {
        if (this.n_players === 1) {
          all_decisions.push(this.autoDecisions(company));
        } else {
          throw new Error(
            `Missing decision for company ${i} (${company.name}) but n_players=${this.n_players} > 1`
          );
        }
      }
    }

    const reports: ManagementReport[] = [];
    for (let i = 0; i < this.companies.length; i++) {
      const company = this.companies[i];
      const dec = all_decisions[i];
      const rep = this.simulateQuarterForCompany(
        company,
        dec,
        i < this.n_players,
        this.companies,
        all_decisions
      );
      reports.push({
        ...rep,
        company: company.name,
      });
    }

    this.history.push(...reports);
    this.advanceEconomy();
    return reports;
  }
}

