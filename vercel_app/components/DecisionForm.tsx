"use client";

import { useState, useRef } from "react";
import type { Decisions, ProductAreaKey } from "../lib/types";
import { PRODUCTS, AREAS, MIN_ASSEMBLY_TIME, MIN_MANAGEMENT_BUDGET, ASSEMBLY_MIN_WAGE_RATE, MIN_SALES_SALARY_PER_QUARTER, SUPPLIERS, MACHINE_HOURS_PER_SHIFT, MACHINISTS_PER_MACHINE } from "../lib/constants";
import { makeKey } from "../lib/types";
import { parseExcelToDecisions } from "../lib/excelImport";

// Helper to create empty advertising/deliveries object with all ProductAreaKey combinations
function createProductAreaRecord(defaultValue: number = 0): Record<ProductAreaKey, number> {
  const result: Partial<Record<ProductAreaKey, number>> = {};
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      result[makeKey(product, area)] = defaultValue;
    }
  }
  return result as Record<ProductAreaKey, number>;
}

interface DecisionFormProps {
  companyName: string;
  sharePrice: number;
  netWorth: number;
  cash: number;
  employees: number;
  machines: number;
  salespeople: number;
  assemblyWorkers: number;
  productStarRatings: Record<string, number>;
  productDevAccumulated: Record<string, number>;
  currentQuarter: number;
  creditworthiness: number;
  onSubmit: (decisions: Decisions) => void;
  onRunQuarter?: () => void;
  onSubmitSinglePlayer?: (decisions: Decisions) => void;
  isRunning?: boolean;
  allDecisionsReady?: boolean;
}

export default function DecisionForm({
  companyName,
  sharePrice,
  netWorth,
  cash,
  employees,
  machines,
  salespeople,
  assemblyWorkers,
  productStarRatings,
  productDevAccumulated,
  currentQuarter,
  creditworthiness,
  onSubmit,
  onRunQuarter,
  onSubmitSinglePlayer,
  isRunning = false,
  allDecisionsReady = true,
}: DecisionFormProps) {
  // Initialize state with defaults
  const [decisions, setDecisions] = useState<Partial<Decisions>>({
    implement_major_improvement: { "Product 1": false, "Product 2": false, "Product 3": false },
    prices_home: { "Product 1": 100, "Product 2": 120, "Product 3": 140 },
    prices_export: { "Product 1": 110, "Product 2": 132, "Product 3": 154 },
    assembly_time: { "Product 1": MIN_ASSEMBLY_TIME["Product 1"], "Product 2": MIN_ASSEMBLY_TIME["Product 2"], "Product 3": MIN_ASSEMBLY_TIME["Product 3"] },
    salespeople_allocation: { South: 2, West: 2, North: 3, Export: 3 },
    sales_salary_per_quarter: MIN_SALES_SALARY_PER_QUARTER,
    sales_commission_percent: 0.0,
    assembly_wage_rate: ASSEMBLY_MIN_WAGE_RATE,
    shift_level: 1,
    management_budget: MIN_MANAGEMENT_BUDGET,
    maintenance_hours_per_machine: 40,
    dividend_per_share: 0.0,
    credit_days: 30,
    vans_to_buy: 0,
    vans_to_sell: 0,
    buy_competitor_info: false,
    buy_market_shares: false,
    deliveries: createProductAreaRecord(0),
    product_development: { "Product 1": 0, "Product 2": 0, "Product 3": 0 },
    recruit_sales: 0,
    dismiss_sales: 0,
    train_sales: 0,
    recruit_assembly: 0,
    dismiss_assembly: 0,
    train_assembly: 0,
    materials_quantity: 6000,
    materials_supplier: 0,
    materials_num_deliveries: 1,
    machines_to_sell: 0,
    machines_to_order: 0,
    advertising_trade_press: createProductAreaRecord(5000),
    advertising_support: createProductAreaRecord(5000),
    advertising_merchandising: createProductAreaRecord(5000),
  });

  const updateDecision = <K extends keyof Decisions>(key: K, value: Decisions[K]) => {
    setDecisions((prev) => ({ ...prev, [key]: value }));
  };

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportError(null);
    const result = await parseExcelToDecisions(file);
    
    if (result.success && result.decisions) {
      // Merge imported decisions with current state
      setDecisions((prev) => ({
        ...prev,
        ...result.decisions,
        // Merge nested objects properly
        prices_home: { ...prev.prices_home, ...result.decisions?.prices_home },
        prices_export: { ...prev.prices_export, ...result.decisions?.prices_export },
        assembly_time: { ...prev.assembly_time, ...result.decisions?.assembly_time },
        implement_major_improvement: { ...prev.implement_major_improvement, ...result.decisions?.implement_major_improvement },
        product_development: { ...prev.product_development, ...result.decisions?.product_development },
        salespeople_allocation: { ...prev.salespeople_allocation, ...result.decisions?.salespeople_allocation },
        advertising_trade_press: { ...prev.advertising_trade_press, ...result.decisions?.advertising_trade_press },
        advertising_support: { ...prev.advertising_support, ...result.decisions?.advertising_support },
        advertising_merchandising: { ...prev.advertising_merchandising, ...result.decisions?.advertising_merchandising },
        deliveries: { ...prev.deliveries, ...result.decisions?.deliveries },
      }));
      alert("Excel file imported successfully! Please review the values and submit.");
    } else {
      setImportError(result.error || "Failed to import Excel file");
      alert(`Import failed: ${result.error || "Unknown error"}`);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    // Ensure all required fields are set
    const fullDecisions: Decisions = {
      implement_major_improvement: decisions.implement_major_improvement || { "Product 1": false, "Product 2": false, "Product 3": false },
      prices_home: decisions.prices_home || { "Product 1": 100, "Product 2": 120, "Product 3": 140 },
      prices_export: decisions.prices_export || { "Product 1": 110, "Product 2": 132, "Product 3": 154 },
      advertising_trade_press: decisions.advertising_trade_press || createProductAreaRecord(5000),
      advertising_support: decisions.advertising_support || createProductAreaRecord(5000),
      advertising_merchandising: decisions.advertising_merchandising || createProductAreaRecord(5000),
      assembly_time: decisions.assembly_time || { "Product 1": MIN_ASSEMBLY_TIME["Product 1"], "Product 2": MIN_ASSEMBLY_TIME["Product 2"], "Product 3": MIN_ASSEMBLY_TIME["Product 3"] },
      salespeople_allocation: decisions.salespeople_allocation || { South: 2, West: 2, North: 3, Export: 3 },
      sales_salary_per_quarter: decisions.sales_salary_per_quarter || MIN_SALES_SALARY_PER_QUARTER,
      sales_commission_percent: decisions.sales_commission_percent || 0.0,
      assembly_wage_rate: decisions.assembly_wage_rate || ASSEMBLY_MIN_WAGE_RATE,
      shift_level: decisions.shift_level || 1,
      management_budget: decisions.management_budget || MIN_MANAGEMENT_BUDGET,
      maintenance_hours_per_machine: decisions.maintenance_hours_per_machine || 40,
      dividend_per_share: decisions.dividend_per_share || 0.0,
      credit_days: decisions.credit_days || 30,
      vans_to_buy: decisions.vans_to_buy || 0,
      vans_to_sell: decisions.vans_to_sell || 0,
      buy_competitor_info: decisions.buy_competitor_info || false,
      buy_market_shares: decisions.buy_market_shares || false,
      deliveries: decisions.deliveries || createProductAreaRecord(0),
      product_development: decisions.product_development || { "Product 1": 0, "Product 2": 0, "Product 3": 0 },
      recruit_sales: decisions.recruit_sales || 0,
      dismiss_sales: decisions.dismiss_sales || 0,
      train_sales: decisions.train_sales || 0,
      recruit_assembly: decisions.recruit_assembly || 0,
      dismiss_assembly: decisions.dismiss_assembly || 0,
      train_assembly: decisions.train_assembly || 0,
      materials_quantity: decisions.materials_quantity || 6000,
      materials_supplier: decisions.materials_supplier || 0,
      materials_num_deliveries: decisions.materials_num_deliveries || 1,
      machines_to_sell: decisions.machines_to_sell || 0,
      machines_to_order: decisions.machines_to_order || 0,
    };
    
    // For multiplayer: save decisions and call onRunQuarter if all ready
    // For single player: call onSubmitSinglePlayer to run immediately
    if (onRunQuarter) {
      onSubmit(fullDecisions); // Save this player's decisions
      // onRunQuarter will be called from parent when all ready
    } else if (onSubmitSinglePlayer) {
      onSubmitSinglePlayer(fullDecisions); // Single player mode - submit immediately
    } else {
      onSubmit(fullDecisions); // Fallback
    }
  };

  const [salesAllocRemaining, setSalesAllocRemaining] = useState(salespeople);

  // Calculate remaining salespeople
  const currentAlloc = decisions.salespeople_allocation || { South: 0, West: 0, North: 0, Export: 0 };
  const allocated = Object.values(currentAlloc).reduce((sum, val) => sum + val, 0);
  const remaining = salespeople - allocated;

  return (
    <div className="space-y-6">
      {/* Excel Import Button */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Import from Excel</h3>
            <p className="text-xs text-slate-400">Upload an Excel file to pre-fill all decision values</p>
            {importError && (
              <p className="mt-1 text-xs text-red-400">{importError}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateExcelTemplate}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            📥 Download Template
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelImport}
            className="hidden"
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            📊 Upload Excel File
          </label>
        </div>
      </div>
      
      {/* Company Header */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold">{companyName}</h2>
        <div className="mt-4 grid grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-xs opacity-80">Share Price</div>
            <div className="text-lg font-semibold">£{sharePrice.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs opacity-80">Net Worth</div>
            <div className="text-lg font-semibold">£{netWorth.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs opacity-80">Cash</div>
            <div className="text-lg font-semibold">£{cash.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs opacity-80">Employees</div>
            <div className="text-lg font-semibold">{employees}</div>
          </div>
          <div>
            <div className="text-xs opacity-80">Machines</div>
            <div className="text-lg font-semibold">{machines}</div>
          </div>
        </div>
      </div>

      {/* Section 1: Marketing Decisions */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="mb-4 text-lg font-semibold text-primary-400">📢 1. Marketing Decisions</h3>

        {/* Product Improvements */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Product Improvements</h4>
          <p className="mb-3 text-xs text-slate-400">
            Implement Major Improvements (will write off all stocks for that product)
          </p>
          <div className="mb-4 grid grid-cols-3 gap-4">
            {PRODUCTS.map((product) => (
              <div key={product} className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={decisions.implement_major_improvement?.[product] || false}
                    onChange={(e) =>
                      updateDecision("implement_major_improvement", {
                        ...decisions.implement_major_improvement,
                        [product]: e.target.checked,
                      } as Record<string, boolean>)
                    }
                    className="rounded"
                  />
                  Implement Major - {product}
                </label>
                <div className="text-xs text-slate-400">
                  ⭐ {(productStarRatings[product] || 3).toFixed(1)} stars
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prices, Credit Terms & Quality */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Prices, Credit Terms & Quality</h4>
          <div className="grid grid-cols-3 gap-4">
            {PRODUCTS.map((product, idx) => (
              <div key={product} className="space-y-3 rounded-lg bg-slate-900/50 p-3">
                <div className="font-semibold text-slate-100">{product}</div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Home price (£/unit)</label>
                  <input
                    type="number"
                    min={10}
                    max={400}
                    step={5}
                    value={decisions.prices_home?.[product] || 100 + 20 * idx}
                    onChange={(e) =>
                      updateDecision("prices_home", {
                        ...decisions.prices_home,
                        [product]: Number(e.target.value),
                      } as Record<string, number>)
                    }
                    className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Export price (£/unit)</label>
                  <input
                    type="number"
                    min={10}
                    max={400}
                    step={5}
                    value={decisions.prices_export?.[product] || (100 + 20 * idx) * 1.1}
                    onChange={(e) =>
                      updateDecision("prices_export", {
                        ...decisions.prices_export,
                        [product]: Number(e.target.value),
                      } as Record<string, number>)
                    }
                    className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">
                    Assembly time (mins/unit)
                  </label>
                  <input
                    type="number"
                    min={MIN_ASSEMBLY_TIME[product]}
                    max={MIN_ASSEMBLY_TIME[product] * 2}
                    step={10}
                    value={decisions.assembly_time?.[product] || MIN_ASSEMBLY_TIME[product]}
                    onChange={(e) =>
                      updateDecision("assembly_time", {
                        ...decisions.assembly_time,
                        [product]: Number(e.target.value),
                      } as Record<string, number>)
                    }
                    className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs text-slate-400">Credit days offered to retailers</label>
            <input
              type="number"
              min={15}
              max={90}
              step={5}
              value={decisions.credit_days || 30}
              onChange={(e) => updateDecision("credit_days", Number(e.target.value))}
              className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            />
          </div>
        </div>

        {/* Advertising (Three Types) */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">
            Advertising (Three Types) - £000 per quarter
          </h4>
          {PRODUCTS.map((product) => (
            <div key={product} className="mb-4">
              <div className="mb-2 font-semibold text-slate-100">{product}</div>
              <div className="grid grid-cols-4 gap-2">
                {AREAS.map((area) => {
                  const key = makeKey(product, area);
                  return (
                    <div key={area} className="space-y-2 rounded bg-slate-900/50 p-2">
                      <div className="text-xs text-slate-400">{area}</div>
                      <div>
                        <label className="mb-0.5 block text-[10px] text-slate-500">Trade Press</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={((decisions.advertising_trade_press?.[key] || 5000) / 1000).toFixed(1)}
                          onChange={(e) =>
                            updateDecision("advertising_trade_press", {
                              ...decisions.advertising_trade_press,
                              [key]: Number(e.target.value) * 1000,
                            } as Record<string, number>)
                          }
                          className="w-full rounded border border-slate-600 bg-slate-800 px-1 py-0.5 text-[10px] text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] text-slate-500">Support</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={((decisions.advertising_support?.[key] || 5000) / 1000).toFixed(1)}
                          onChange={(e) =>
                            updateDecision("advertising_support", {
                              ...decisions.advertising_support,
                              [key]: Number(e.target.value) * 1000,
                            } as Record<string, number>)
                          }
                          className="w-full rounded border border-slate-600 bg-slate-800 px-1 py-0.5 text-[10px] text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] text-slate-500">Merchandising</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={((decisions.advertising_merchandising?.[key] || 5000) / 1000).toFixed(1)}
                          onChange={(e) =>
                            updateDecision("advertising_merchandising", {
                              ...decisions.advertising_merchandising,
                              [key]: Number(e.target.value) * 1000,
                            } as Record<string, number>)
                          }
                          className="w-full rounded border border-slate-600 bg-slate-800 px-1 py-0.5 text-[10px] text-slate-100"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Product Development */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Product Development</h4>
          <div className="grid grid-cols-3 gap-4">
            {PRODUCTS.map((product) => (
              <div key={product} className="space-y-2">
                <div className="text-xs text-slate-400">
                  Accumulated: £{(productDevAccumulated[product] || 0).toLocaleString()}
                </div>
                <label className="block text-xs text-slate-400">Dev spend (£000)</label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  step={5}
                  value={((decisions.product_development?.[product] || 0) / 1000).toFixed(0)}
                  onChange={(e) =>
                    updateDecision("product_development", {
                      ...decisions.product_development,
                      [product]: Number(e.target.value) * 1000,
                    } as Record<string, number>)
                  }
                  className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Salespeople Allocation */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Salespeople Allocation</h4>
          <p className="mb-3 text-xs text-slate-400">
            You currently have <strong>{salespeople}</strong> salespeople. Remaining: {remaining}
          </p>
          <div className="grid grid-cols-4 gap-4">
            {AREAS.map((area, idx) => (
              <div key={area}>
                {idx === AREAS.length - 1 ? (
                  <div className="rounded bg-slate-900/50 p-3 text-center">
                    <div className="text-xs text-slate-400">{area}</div>
                    <div className="text-lg font-semibold text-slate-100">{remaining}</div>
                  </div>
                ) : (
                  <>
                    <label className="mb-1 block text-xs text-slate-400">Salespeople in {area}</label>
                    <input
                      type="number"
                      min={0}
                      max={salespeople - allocated + (currentAlloc[area] || 0)}
                      step={1}
                      value={currentAlloc[area] || 0}
                      onChange={(e) => {
                        const newVal = Number(e.target.value);
                        const newAlloc = { ...currentAlloc, [area]: newVal };
                        updateDecision("salespeople_allocation", newAlloc as Record<string, number>);
                      }}
                      className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Operations & Production */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="mb-4 text-lg font-semibold text-green-400">🏭 2. Operations & Production Decisions</h3>

        {/* Shift Level & Maintenance */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Shift Level & Maintenance</h4>
          <div className="mb-4">
            <label className="mb-2 block text-xs text-slate-400">Shift level</label>
            <div className="flex gap-4">
              {[1, 2, 3].map((level) => (
                <label key={level} className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="radio"
                    name="shift_level"
                    value={level}
                    checked={decisions.shift_level === level}
                    onChange={() => updateDecision("shift_level", level)}
                    className="accent-primary-500"
                  />
                  Shift {level} ({MACHINE_HOURS_PER_SHIFT[level]}h/machine, {MACHINISTS_PER_MACHINE[level]} machinists)
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Contracted maintenance hours per machine
            </label>
            <input
              type="number"
              min={0}
              max={200}
              step={5}
              value={decisions.maintenance_hours_per_machine || 40}
              onChange={(e) => updateDecision("maintenance_hours_per_machine", Number(e.target.value))}
              className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            />
          </div>
        </div>

        {/* Materials Ordering */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Materials Ordering</h4>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Material Supplier</label>
              <select
                value={decisions.materials_supplier || 0}
                onChange={(e) => {
                  const supplier = Number(e.target.value);
                  updateDecision("materials_supplier", supplier);
                  if (supplier === 0 || supplier === 3) {
                    updateDecision("materials_num_deliveries", supplier === 0 ? 0 : 12);
                  }
                }}
                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
              >
                {[0, 1, 2, 3].map((num) => {
                  const sup = SUPPLIERS[num];
                  return (
                    <option key={num} value={num}>
                      Supplier {num}: {sup.discount * 100}% discount, Min order: {sup.min_order.toLocaleString()}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">
                Materials order quantity (units) – for quarter after next
              </label>
              <input
                type="number"
                min={0}
                max={50000}
                step={500}
                value={decisions.materials_quantity || 6000}
                onChange={(e) => updateDecision("materials_quantity", Number(e.target.value))}
                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
              />
            </div>
            {(decisions.materials_supplier || 0) !== 0 && (decisions.materials_supplier || 0) !== 3 && (
              <div>
                <label className="mb-1 block text-xs text-slate-400">Number of deliveries</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  step={1}
                  value={decisions.materials_num_deliveries || 1}
                  onChange={(e) => updateDecision("materials_num_deliveries", Number(e.target.value))}
                  className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                />
              </div>
            )}
          </div>
        </div>

        {/* Delivery Schedule */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">
            Delivery Schedule (units to deliver next quarter)
          </h4>
          {PRODUCTS.map((product) => (
            <div key={product} className="mb-4">
              <div className="mb-2 font-semibold text-slate-100">{product}</div>
              <div className="grid grid-cols-4 gap-2">
                {AREAS.map((area) => {
                  const key = makeKey(product, area);
                  return (
                    <div key={area}>
                      <label className="mb-1 block text-xs text-slate-400">{area}</label>
                      <input
                        type="number"
                        min={0}
                        max={10000}
                        step={50}
                        value={decisions.deliveries?.[key] || 0}
                        onChange={(e) =>
                          updateDecision("deliveries", {
                            ...decisions.deliveries,
                            [key]: Number(e.target.value),
                          } as Record<string, number>)
                        }
                        className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-2 text-xs text-slate-400">
            Total units to deliver:{" "}
            {Object.values(decisions.deliveries || {}).reduce((sum, val) => sum + (val || 0), 0).toLocaleString()}
          </div>
        </div>
      </section>

      {/* Section 3: Personnel Decisions */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="mb-4 text-lg font-semibold text-yellow-400">👥 3. Personnel Decisions</h3>

        {/* Salespeople */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Salespeople</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Recruit salespeople</label>
              <input
                type="number"
                min={0}
                max={20}
                step={1}
                value={decisions.recruit_sales || 0}
                onChange={(e) => updateDecision("recruit_sales", Number(e.target.value))}
                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Dismiss salespeople</label>
              <input
                type="number"
                min={0}
                max={salespeople}
                step={1}
                value={decisions.dismiss_sales || 0}
                onChange={(e) => updateDecision("dismiss_sales", Number(e.target.value))}
                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Train salespeople (max 9)</label>
              <input
                type="number"
                min={0}
                max={9}
                step={1}
                value={decisions.train_sales || 0}
                onChange={(e) => updateDecision("train_sales", Number(e.target.value))}
                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Sales salary per quarter (£)</label>
              <input
                type="number"
                min={MIN_SALES_SALARY_PER_QUARTER}
                max={50000}
                step={500}
                value={decisions.sales_salary_per_quarter || MIN_SALES_SALARY_PER_QUARTER}
                onChange={(e) => updateDecision("sales_salary_per_quarter", Number(e.target.value))}
                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Sales commission (%)</label>
              <input
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={decisions.sales_commission_percent || 0}
                onChange={(e) => updateDecision("sales_commission_percent", Number(e.target.value))}
                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Assembly Workers */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Assembly Workers</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Recruit assembly workers</label>
              <input
                type="number"
                min={0}
                max={50}
                step={1}
                value={decisions.recruit_assembly || 0}
                onChange={(e) => updateDecision("recruit_assembly", Number(e.target.value))}
                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Dismiss assembly workers</label>
              <input
                type="number"
                min={0}
                max={assemblyWorkers}
                step={1}
                value={decisions.dismiss_assembly || 0}
                onChange={(e) => updateDecision("dismiss_assembly", Number(e.target.value))}
                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Train assembly workers (max 9)</label>
              <input
                type="number"
                min={0}
                max={9}
                step={1}
                value={decisions.train_assembly || 0}
                onChange={(e) => updateDecision("train_assembly", Number(e.target.value))}
                className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs text-slate-400">Assembly worker hourly wage rate (£)</label>
            <input
              type="number"
              min={ASSEMBLY_MIN_WAGE_RATE}
              max={50}
              step={0.5}
              value={decisions.assembly_wage_rate || ASSEMBLY_MIN_WAGE_RATE}
              onChange={(e) => updateDecision("assembly_wage_rate", Number(e.target.value))}
              className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            />
          </div>
        </div>
      </section>

      {/* Section 4: Finance Decisions */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="mb-4 text-lg font-semibold text-red-400">💰 4. Finance Decisions</h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-200">Dividends & Management</h4>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Dividend per share (pence) - Q1 and Q3 only
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={decisions.dividend_per_share || 0}
                  onChange={(e) => updateDecision("dividend_per_share", Number(e.target.value))}
                  disabled={currentQuarter !== 1 && currentQuarter !== 3}
                  className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100 disabled:opacity-50"
                />
                {currentQuarter !== 1 && currentQuarter !== 3 && (
                  <p className="mt-1 text-xs text-slate-500">Dividends can only be paid in Q1 and Q3</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Management budget (£)</label>
                <input
                  type="number"
                  min={MIN_MANAGEMENT_BUDGET}
                  max={200000}
                  step={5000}
                  value={decisions.management_budget || MIN_MANAGEMENT_BUDGET}
                  onChange={(e) => updateDecision("management_budget", Number(e.target.value))}
                  className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-200">Fixed Assets</h4>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">
                  Machines to order (requires creditworthiness check)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  value={decisions.machines_to_order || 0}
                  onChange={(e) => updateDecision("machines_to_order", Number(e.target.value))}
                  className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Creditworthiness: £{creditworthiness.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Machines to sell</label>
                <input
                  type="number"
                  min={0}
                  max={machines}
                  step={1}
                  value={decisions.machines_to_sell || 0}
                  onChange={(e) => updateDecision("machines_to_sell", Number(e.target.value))}
                  className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Vehicles to buy</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  value={decisions.vans_to_buy || 0}
                  onChange={(e) => updateDecision("vans_to_buy", Number(e.target.value))}
                  className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Vehicles to sell</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={1}
                  value={decisions.vans_to_sell || 0}
                  onChange={(e) => updateDecision("vans_to_sell", Number(e.target.value))}
                  className="w-full rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-200">Information Purchases</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={decisions.buy_competitor_info || false}
                onChange={(e) => updateDecision("buy_competitor_info", e.target.checked)}
                className="rounded"
              />
              Buy Competitor Information (£5,000)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={decisions.buy_market_shares || false}
                onChange={(e) => updateDecision("buy_market_shares", e.target.checked)}
                className="rounded"
              />
              Buy Market Shares Information (£5,000)
            </label>
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleSubmit}
          className="rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {onRunQuarter ? "💾 Save My Decisions" : "🚀 Submit All Decisions and Run Quarter"}
        </button>
        {onRunQuarter && (
          <button
            onClick={onRunQuarter}
            disabled={!allDecisionsReady || isRunning}
            className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-green-500/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? "⏳ Running..." : "🚀 Run Quarter (All Players Ready)"}
          </button>
        )}
      </div>
    </div>
  );
}
