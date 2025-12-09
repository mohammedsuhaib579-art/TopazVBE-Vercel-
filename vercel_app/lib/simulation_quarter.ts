// This file contains the main simulate_quarter_for_company method
// Split out due to size - imports from simulation.ts

import type {
  CompanyState,
  Decisions,
  ManagementReport,
  ProductAreaKey,
} from "./types";
import { makeKey } from "./types";
import { PRODUCTS, AREAS } from "./constants";
import {
  MIN_ASSEMBLY_TIME,
  MATERIAL_PER_UNIT,
  MACHINISTS_PER_MACHINE,
  WORKER_HOURS,
  SCRAP_VALUE,
  SERVICING_CHARGE,
  SUPERVISION_COST_PER_SHIFT,
  PRODUCTION_OVERHEAD_PER_MACHINE,
  MACHINE_RUNNING_COST_PER_HOUR,
  PRODUCTION_PLANNING_COST_PER_UNIT,
  PRODUCT_STOCK_VALUATION,
  MACHINE_DEPRECIATION_RATE,
  VEHICLE_DEPRECIATION_RATE,
  VEHICLE_COST,
  MACHINE_DEPOSIT,
  TAX_RATE,
  INTEREST_RATE_DEPOSIT_SPREAD,
  INTEREST_RATE_OVERDRAFT_SPREAD,
  INTEREST_RATE_LOAN_SPREAD,
  CREDIT_CONTROL_COST_PER_UNIT,
  SALESPERSON_EXPENSES,
  RECRUITMENT_COST,
  DISMISSAL_COST,
  TRAINING_COST,
  CONTRACTED_MAINTENANCE_RATE,
  FIXED_QUARTERLY_WAREHOUSE_COST,
  PRODUCT_STORAGE_COST,
  FACTORY_STORAGE_CAPACITY,
  VARIABLE_EXTERNAL_STORAGE_COST,
  FIXED_QUARTERLY_ADMIN_COST,
  COST_PER_ORDER,
  MIN_MANAGEMENT_BUDGET,
  COMPETITOR_INFO_COST,
  MARKET_SHARES_INFO_COST,
  FIXED_OVERHEADS_PER_QUARTER,
  MACHINE_HOURS_PER_SHIFT,
  BASE_GDP,
} from "./constants";
import type { Economy } from "./types";
import type { Simulation } from "./simulation";
import { calculateWorkforceMetrics } from "./simulation_enhanced";

// This is a helper function that will be called from Simulation class
export function simulateQuarterForCompany(
  sim: Simulation,
  company: CompanyState,
  decisions: Decisions,
  is_player: boolean,
  all_companies?: CompanyState[],
  all_decisions?: Decisions[]
): ManagementReport {
  const econ = sim["economy"]; // Access private economy
  const quarter = econ.quarter;
  const year = econ.year;

  // Store opening balances
  company.opening_cash = company.cash;
  company.opening_overdraft = company.overdraft;
  company.opening_loan = company.unsecured_loan;
  company.opening_debtors = company.debtors;
  company.opening_creditors = company.creditors;

  // 1. Apply personnel changes from previous quarters
  sim["applyPersonnelDismissals"](company);
  sim["processPersonnelAvailability"](company);

  // 2. Process machine installations
  const machines_installed = sim["processMachineInstallations"](company, quarter, year);

  // 3. Process material deliveries
  const [material_delivered_qty, material_cost] = sim["deliverMaterials"](
    company,
    quarter,
    year,
    econ.material_price
  );

  // 4. Process product development
  const dev_outcomes = sim["processProductDevelopment"](
    company,
    decisions,
    quarter,
    year
  );

  // 5. Implement major improvements
  const stock_write_offs = sim["implementMajorImprovements"](company, decisions);

  // 6. Process new orders
  sim["processMaterialOrder"](company, decisions, quarter, year);
  const machines_ordered = sim["processMachineOrder"](company, decisions, quarter, year);

  // 7. Process personnel decisions
  const personnel_results = sim["processPersonnelRecruitment"](
    company,
    decisions,
    econ,
    all_companies || []
  );
  const training_results = sim["processPersonnelTraining"](company, decisions);
  sim["processPersonnelDismissals"](company, decisions);
  
  // 7a. Update workforce metrics (morale, retention, productivity)
  const workforceMetrics = calculateWorkforceMetrics(company, decisions);
  company.workforce_morale = workforceMetrics.morale;
  company.sales_retention_rate = workforceMetrics.retention_rate;
  company.assembly_retention_rate = workforceMetrics.retention_rate;
  company.productivity_multiplier = workforceMetrics.productivity;

  // 8. Production planning and execution
  const planned_deliveries = decisions.deliveries;
  let total_planned_units = 0;
  for (const key in planned_deliveries) {
    total_planned_units += planned_deliveries[key as ProductAreaKey] || 0;
  }

  const [cap_mach, cap_assy] = sim["productionCapacity"](company, decisions);
  const max_units = Math.min(cap_mach, cap_assy);
  const capacity_ratio =
    total_planned_units > 0
      ? Math.min(1.0, max_units / total_planned_units)
      : 1.0;

  // Materials consumption
  let material_required = 0.0;
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      const key = makeKey(product, area);
      const qty = planned_deliveries[key] || 0;
      material_required += qty * MATERIAL_PER_UNIT[product];
    }
  }

  const material_opening = company.material_stock;
  const material_available = material_opening + material_delivered_qty;
  const material_used = Math.min(material_available, material_required * capacity_ratio);
  const material_closing = material_available - material_used;
  company.material_stock = material_closing;

  // Production per product/area
  const produced: Record<ProductAreaKey, number> = {} as Record<ProductAreaKey, number>;
  const rejects: Record<ProductAreaKey, number> = {} as Record<ProductAreaKey, number>;

  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      const key = makeKey(product, area);
      const planned_qty = planned_deliveries[key] || 0;
      const qty = Math.floor(planned_qty * capacity_ratio);

      const q_factor = decisions.assembly_time[product] / MIN_ASSEMBLY_TIME[product];
      const reject_rate = Math.max(0.01, 0.1 / Math.max(0.8, q_factor));
      const rejected = Math.floor(qty * reject_rate);
      const good = qty - rejected;

      produced[key] = good;
      rejects[key] = rejected;
    }
  }

  // 9. Demand and sales
  const new_orders: Record<ProductAreaKey, number> = {} as Record<
    ProductAreaKey,
    number
  >;
  const sales: Record<ProductAreaKey, number> = {} as Record<ProductAreaKey, number>;
  const backlog_new: Record<ProductAreaKey, number> = {} as Record<
    ProductAreaKey,
    number
  >;
  const stocks_new: Record<ProductAreaKey, number> = {} as Record<
    ProductAreaKey,
    number
  >;

  let revenue = 0.0;
  let debtors_increase = 0.0;

  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      const key = makeKey(product, area);

      const opening_stock = company.stocks[key] || 0;
      const opening_backlog = company.backlog[key] || 0;

      const demand_units = Math.floor(
        sim["demandForProduct"](
          company,
          decisions,
          product,
          area,
          all_companies,
          all_decisions
        )
      );
      new_orders[key] = demand_units;

      const available_units = opening_stock + (produced[key] || 0);
      const potential_sales = opening_backlog + demand_units;

      const sold = Math.min(available_units, potential_sales);
      sales[key] = sold;

      stocks_new[key] = available_units - sold;
      const unsatisfied_orders = Math.max(0, potential_sales - sold);
      const remaining_backlog = Math.floor(unsatisfied_orders * 0.5);
      backlog_new[key] = remaining_backlog;

      const price =
        area === "Export"
          ? decisions.prices_export[product]
          : decisions.prices_home[product];
      const sales_value = sold * price;
      revenue += sales_value;
      debtors_increase += sales_value;
    }
  }

  company.stocks = stocks_new;
  company.backlog = backlog_new;

  // Update debtors (simplified)
  company.debtors = debtors_increase * (decisions.credit_days / 90.0);

  // 10. Calculate all costs
  // Cost of sales
  const shift = decisions.shift_level;
  const worker_hours_data = WORKER_HOURS[shift] || WORKER_HOURS[1];
  const total_hours_per_worker =
    worker_hours_data.basic +
    worker_hours_data.saturday +
    worker_hours_data.sunday;
  const strike_hours_lost =
    company.strike_weeks_next_quarter * (worker_hours_data.basic / 12.0);
  const effective_hours = total_hours_per_worker - strike_hours_lost;

  // Calculate assembly hours worked (workers work full hours regardless of capacity)
  const productivity_multiplier = company.productivity_multiplier || 1.0;
  const assembly_hours_worked =
    company.assembly_workers * effective_hours * productivity_multiplier;
  const assembly_wages = assembly_hours_worked * company.assembly_wage_rate;
  
  // Note: Capacity ratio is applied to production output, not hours worked
  // Workers still work full hours, but produce less if capacity is constrained

  const machinist_count = company.machines * (MACHINISTS_PER_MACHINE[shift] || 4);
  const machinist_hours = cap_mach;
  const machinist_premium = worker_hours_data.machinist_premium || 0;
  const machinist_wage_rate = company.assembly_wage_rate * (1 + machinist_premium);
  const machinist_wages = machinist_hours * machinist_wage_rate;

  const supervision_cost = SUPERVISION_COST_PER_SHIFT * shift;
  const production_overhead = PRODUCTION_OVERHEAD_PER_MACHINE * company.machines;
  const machine_running_cost = MACHINE_RUNNING_COST_PER_HOUR * cap_mach;
  const production_planning_cost = PRODUCTION_PLANNING_COST_PER_UNIT * total_planned_units;

  const production_overheads =
    supervision_cost +
    production_overhead +
    machine_running_cost +
    production_planning_cost;

  // Apply cost modifier from random events
  const costModifier = (company as any).currentCostModifier || 1.0;
  const cost_of_sales = (material_cost + assembly_wages + machinist_wages + production_overheads) * costModifier;

  // Operating expenses
  let ads_cost = 0;
  for (const key in decisions.advertising_trade_press) {
    ads_cost +=
      (decisions.advertising_trade_press[key as ProductAreaKey] || 0) +
      (decisions.advertising_support[key as ProductAreaKey] || 0) +
      (decisions.advertising_merchandising[key as ProductAreaKey] || 0);
  }

  let prod_dev_cost = 0;
  for (const product of PRODUCTS) {
    prod_dev_cost += decisions.product_development[product] || 0;
  }

  const salespeople_salary_cost = company.salespeople * decisions.sales_salary_per_quarter;
  const sales_commission_cost = revenue * (decisions.sales_commission_percent / 100.0);
  const salesperson_expenses = company.salespeople * SALESPERSON_EXPENSES;

  const recruit_cost_sales =
    personnel_results.sales_recruited * RECRUITMENT_COST["Salesperson"];
  const recruit_cost_assembly =
    personnel_results.assembly_recruited * RECRUITMENT_COST["Assembly worker"];
  const dismiss_cost_sales = decisions.dismiss_sales * DISMISSAL_COST["Salesperson"];
  const dismiss_cost_assembly =
    decisions.dismiss_assembly * DISMISSAL_COST["Assembly worker"];
  const train_cost_sales = training_results.sales_trained * TRAINING_COST["Salesperson"];
  const train_cost_assembly =
    training_results.assembly_trained * TRAINING_COST["Assembly worker"];

  const personnel_costs =
    recruit_cost_sales +
    recruit_cost_assembly +
    dismiss_cost_sales +
    dismiss_cost_assembly +
    train_cost_sales +
    train_cost_assembly;

  const contracted_hours = company.machines * decisions.maintenance_hours_per_machine;
  const maint_cost = contracted_hours * CONTRACTED_MAINTENANCE_RATE;

  let total_product_stock = 0;
  for (const key in stocks_new) {
    total_product_stock += stocks_new[key as ProductAreaKey] || 0;
  }
  const warehousing_cost =
    FIXED_QUARTERLY_WAREHOUSE_COST + PRODUCT_STORAGE_COST * total_product_stock;

  const external_storage = Math.max(0, material_closing - FACTORY_STORAGE_CAPACITY);
  const external_storage_cost = external_storage * VARIABLE_EXTERNAL_STORAGE_COST;

  const purchasing_cost = FIXED_QUARTERLY_ADMIN_COST + COST_PER_ORDER;
  const management_cost = Math.max(MIN_MANAGEMENT_BUDGET, decisions.management_budget);

  const [transport_cost, transport_details] = sim["calculateTransportCosts"](
    company,
    decisions,
    produced
  );

  let guarantee_cost = 0;
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      const key = makeKey(product, area);
      guarantee_cost += (rejects[key] || 0) * SERVICING_CHARGE[product];
    }
  }

  let info_cost = 0;
  if (decisions.buy_competitor_info) info_cost += COMPETITOR_INFO_COST;
  if (decisions.buy_market_shares) info_cost += MARKET_SHARES_INFO_COST;

  let write_off_cost = 0;
  for (const product of PRODUCTS) {
    write_off_cost += (stock_write_offs[product] || 0) * PRODUCT_STOCK_VALUATION[product];
  }

  const total_units_sold = Object.values(sales).reduce((sum, val) => sum + val, 0);
  const credit_control_cost = total_units_sold * CREDIT_CONTROL_COST_PER_UNIT;

  const total_overheads =
    ads_cost +
    prod_dev_cost +
    salespeople_salary_cost +
    sales_commission_cost +
    salesperson_expenses +
    personnel_costs +
    maint_cost +
    warehousing_cost +
    external_storage_cost +
    purchasing_cost +
    management_cost +
    transport_cost +
    guarantee_cost +
    info_cost +
    write_off_cost +
    credit_control_cost +
    FIXED_OVERHEADS_PER_QUARTER;

  const gross_profit = revenue - cost_of_sales;
  const ebitda = gross_profit - total_overheads;

  // Depreciation
  let machine_depreciation = 0.0;
  for (let i = 0; i < company.machine_values.length; i++) {
    const dep = company.machine_values[i] * MACHINE_DEPRECIATION_RATE;
    company.machine_values[i] -= dep;
    machine_depreciation += dep;
  }

  let vehicle_depreciation = 0.0;
  for (let i = 0; i < company.vehicles_age_quarters.length; i++) {
    const age = company.vehicles_age_quarters[i];
    const value = VEHICLE_COST * Math.pow(1 - VEHICLE_DEPRECIATION_RATE, age);
    const dep = value * VEHICLE_DEPRECIATION_RATE;
    vehicle_depreciation += dep;
    company.vehicles_age_quarters[i] = age + 1;
  }

  const total_depreciation = machine_depreciation + vehicle_depreciation;

  // Interest
  const deposit_rate = Math.max(
    0.0,
    (econ.cb_rate + INTEREST_RATE_DEPOSIT_SPREAD) / 100.0
  );
  const overdraft_rate = (econ.cb_rate + INTEREST_RATE_OVERDRAFT_SPREAD) / 100.0;
  const loan_rate = (econ.cb_rate + INTEREST_RATE_LOAN_SPREAD) / 100.0;

  const avg_cash = (company.opening_cash + company.cash) / 2.0;
  const avg_overdraft = (company.opening_overdraft + company.overdraft) / 2.0;
  const avg_loan = (company.opening_loan + company.unsecured_loan) / 2.0;

  const interest_received = Math.max(0.0, avg_cash) * deposit_rate / 4.0;
  const interest_paid = (avg_overdraft * overdraft_rate + avg_loan * loan_rate) / 4.0;

  const profit_before_tax = ebitda + interest_received - interest_paid - total_depreciation;

  // Tax
  company.taxable_profit_accumulated += profit_before_tax;
  let quarterly_tax = 0.0;
  if (quarter === 4) {
    const yearly_tax = Math.max(0.0, company.taxable_profit_accumulated * TAX_RATE);
    quarterly_tax = yearly_tax - company.tax_liability;
    company.tax_liability = yearly_tax;
    company.taxable_profit_accumulated = 0.0;
  }

  const net_profit = profit_before_tax - quarterly_tax;

  // Cash flow
  const cash_inflows = revenue * 0.7;
  const cash_outflows =
    cost_of_sales * 0.8 +
    prod_dev_cost * 1.0 +
    salespeople_salary_cost * 1.0 +
    sales_commission_cost * 1.0 +
    assembly_wages * 1.0 +
    machinist_wages * 1.0 +
    personnel_costs * 1.0 +
    warehousing_cost * 1.0 +
    management_cost * 1.0 +
    transport_cost * 0.5 +
    interest_paid * 1.0 +
    quarterly_tax * 1.0;

  const dividends = Math.min(
    decisions.dividend_per_share * company.shares_outstanding,
    Math.max(0.0, net_profit + company.reserves + company.cash)
  );

  const net_cash_flow = cash_inflows - cash_outflows - dividends;
  company.cash += net_cash_flow;

  if (company.cash < 0) {
    const needed = -company.cash;
    company.cash = 0.0;

    const overdraft_limit = sim["calculateOverdraftLimit"](company);
    const overdraft_available = Math.max(0, overdraft_limit - company.overdraft);
    const use_overdraft = Math.min(needed, overdraft_available);
    company.overdraft += use_overdraft;

    const remaining = needed - use_overdraft;
    if (remaining > 0) {
      company.unsecured_loan += remaining;
    }
  }

  const retained = net_profit - dividends;
  company.reserves += retained;

  // Update share price
  const nw = sim["netWorth"](company);
  const eps = net_profit / company.shares_outstanding;
  const dps = dividends / company.shares_outstanding;

  company.share_price = Math.max(
    0.1,
    0.5 * company.share_price + 0.3 * (nw / company.shares_outstanding) + 5 * eps + 3 * dps
  );

  // Update machine efficiency
  const maint_factor = Math.min(1.1, 0.9 + decisions.maintenance_hours_per_machine / 200.0);
  company.machine_efficiency = Math.min(1.0, company.machine_efficiency * maint_factor);
  company.last_shift_level = decisions.shift_level;

  // Build report
  const report: ManagementReport = {
    quarter,
    year,
    revenue,
    cost_of_sales,
    gross_profit,
    total_overheads,
    ebitda,
    interest_received,
    interest_paid,
    depreciation: total_depreciation,
    profit_before_tax,
    tax: quarterly_tax,
    net_profit,
    dividends,
    retained,
    cash: company.cash,
    overdraft: company.overdraft,
    loan: company.unsecured_loan,
    net_worth: nw,
    share_price: company.share_price,
    shift_level: decisions.shift_level,
    machine_efficiency: company.machine_efficiency,
    machines: company.machines,
    vehicles: company.vehicles,
    salespeople: company.salespeople,
    assembly_workers: company.assembly_workers,
    machinists: company.machinists,
    machines_installed,
    machines_ordered,
    materials_used: material_used,
    material_opening,
    material_closing,
    material_delivered: material_delivered_qty,
    material_on_order: company.material_orders.reduce(
      (sum, order) => sum + order.quantity,
      0
    ),
    stocks: stocks_new,
    backlog: backlog_new,
    sales,
    new_orders,
    deliveries: produced,
    rejects,
    product_dev_outcomes: dev_outcomes,
    stock_write_offs,
    scheduled: planned_deliveries,
    servicing_units: PRODUCTS.reduce((acc, p) => {
      let total = 0;
      for (const area of AREAS) {
        const key = makeKey(p, area);
        total += rejects[key] || 0;
      }
      acc[p] = total;
      return acc;
    }, {} as Record<string, number>),
    overhead_breakdown: {
      advertising: ads_cost,
      salespeople_salary: salespeople_salary_cost + sales_commission_cost,
      sales_office: salesperson_expenses * 0.5,
      guarantee_servicing: guarantee_cost,
      transport_fleet:
        (transport_details.fleet_fixed || 0) + (transport_details.own_running || 0),
      hired_transport: transport_details.hired_running || 0,
      product_research: prod_dev_cost,
      personnel_department: personnel_costs,
      maintenance: maint_cost,
      warehousing_purchasing: warehousing_cost + purchasing_cost,
      business_intelligence: info_cost,
      management_budget: management_cost,
      credit_control: credit_control_cost,
      other_miscellaneous: FIXED_OVERHEADS_PER_QUARTER + write_off_cost,
    },
    cost_of_sales_breakdown: {
      opening_stock_value: 0, // Would calculate from opening stocks
      materials_purchased: material_cost,
      assembly_wages,
      machinists_wages: machinist_wages,
      machine_running_costs: machine_running_cost,
      closing_stock_value: 0, // Would calculate from closing stocks
    },
    balance_sheet: {
      property_value: company.property_value,
      machine_values: sim["getMachineValue"](company),
      vehicle_values: sim["getVehicleValue"](company),
      product_stocks_value: sim["getProductStockValue"](company),
      material_stock_value: sim["getMaterialStockValue"](company),
      debtors: company.debtors,
      cash_invested: company.cash > 0 ? company.cash : 0,
      tax_assessed_due: company.tax_liability,
      creditors: company.creditors,
      overdraft: company.overdraft,
      unsecured_loans: company.unsecured_loan,
      ordinary_capital: company.shares_outstanding * 2.0,
      reserves: company.reserves,
    },
    cash_flow: {
      trading_receipts: revenue,
      trading_payments: cost_of_sales + total_overheads - total_depreciation,
      tax_paid: 0,
      interest_received,
      capital_receipts: 0,
      capital_payments: machines_ordered * MACHINE_DEPOSIT + decisions.vans_to_buy * VEHICLE_COST,
      interest_paid,
      dividend_paid: dividends,
      opening_cash: company.opening_cash,
      closing_cash: company.cash > 0 ? company.cash : 0,
      net_cash_flow: net_cash_flow,
    },
  };

  company.last_report = report;
  return report;
}

