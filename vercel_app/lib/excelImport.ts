// Excel Import utility for Decision Forms
import * as XLSX from "xlsx";
import type { Decisions, ProductAreaKey } from "./types";
import { PRODUCTS, AREAS } from "./constants";
import { makeKey } from "./types";

// Generate Excel template file for download
export function generateExcelTemplate(): void {
  const templateData: any[][] = [
    ["Decision Field", "Value", "Notes"],
    ["", "", ""],
    ["=== PRICES ===", "", ""],
    ["Product 1 Home Price", 100, "Price in £ per unit"],
    ["Product 2 Home Price", 120, "Price in £ per unit"],
    ["Product 3 Home Price", 140, "Price in £ per unit"],
    ["Product 1 Export Price", 110, "Price in £ per unit"],
    ["Product 2 Export Price", 132, "Price in £ per unit"],
    ["Product 3 Export Price", 154, "Price in £ per unit"],
    ["", "", ""],
    ["=== ASSEMBLY TIME ===", "", ""],
    ["Product 1 Assembly Time", 100, "Minutes per unit"],
    ["Product 2 Assembly Time", 150, "Minutes per unit"],
    ["Product 3 Assembly Time", 300, "Minutes per unit"],
    ["", "", ""],
    ["=== MAJOR IMPROVEMENTS ===", "", ""],
    ["Product 1 Major Improvement", false, "true/false"],
    ["Product 2 Major Improvement", false, "true/false"],
    ["Product 3 Major Improvement", false, "true/false"],
    ["", "", ""],
    ["=== PRODUCT DEVELOPMENT ===", "", ""],
    ["Product 1 Development", 0, "Budget in £"],
    ["Product 2 Development", 0, "Budget in £"],
    ["Product 3 Development", 0, "Budget in £"],
    ["", "", ""],
    ["=== SALESPEOPLE ALLOCATION ===", "", ""],
    ["Salespeople South", 2, "Number of salespeople"],
    ["Salespeople West", 2, "Number of salespeople"],
    ["Salespeople North", 3, "Number of salespeople"],
    ["Salespeople Export", 3, "Number of salespeople"],
    ["", "", ""],
    ["=== ADVERTISING (Trade Press) ===", "", ""],
  ];
  
  // Add advertising fields
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      templateData.push([`Trade Press ${product} ${area}`, 0, "Budget in £"]);
    }
  }
  
  templateData.push(["", "", ""]);
  templateData.push(["=== ADVERTISING (Support) ===", "", ""]);
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      templateData.push([`Support ${product} ${area}`, 0, "Budget in £"]);
    }
  }
  
  templateData.push(["", "", ""]);
  templateData.push(["=== ADVERTISING (Merchandising) ===", "", ""]);
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      templateData.push([`Merchandising ${product} ${area}`, 0, "Budget in £"]);
    }
  }
  
  templateData.push(["", "", ""]);
  templateData.push(["=== DELIVERIES ===", "", ""]);
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      templateData.push([`Delivery ${product} ${area}`, 0, "Units to deliver"]);
    }
  }
  
  templateData.push(["", "", ""]);
  templateData.push(["=== PERSONNEL ===", "", ""]);
  templateData.push(["Sales Salary", 2000, "£ per quarter"]);
  templateData.push(["Sales Commission %", 0, "Percentage"]);
  templateData.push(["Assembly Wage Rate", 8.5, "£ per hour"]);
  templateData.push(["Recruit Sales", 0, "Number to recruit"]);
  templateData.push(["Dismiss Sales", 0, "Number to dismiss"]);
  templateData.push(["Train Sales", 0, "Number to train"]);
  templateData.push(["Recruit Assembly", 0, "Number to recruit"]);
  templateData.push(["Dismiss Assembly", 0, "Number to dismiss"]);
  templateData.push(["Train Assembly", 0, "Number to train"]);
  
  templateData.push(["", "", ""]);
  templateData.push(["=== OPERATIONS ===", "", ""]);
  templateData.push(["Shift Level", 1, "1, 2, or 3"]);
  templateData.push(["Management Budget", 40000, "Budget in £"]);
  templateData.push(["Maintenance Hours", 40, "Hours per machine"]);
  
  templateData.push(["", "", ""]);
  templateData.push(["=== FINANCE ===", "", ""]);
  templateData.push(["Dividend Per Share", 0, "Pence per share"]);
  templateData.push(["Credit Days", 30, "Days"]);
  
  templateData.push(["", "", ""]);
  templateData.push(["=== VEHICLES ===", "", ""]);
  templateData.push(["Vans To Buy", 0, "Number"]);
  templateData.push(["Vans To Sell", 0, "Number"]);
  
  templateData.push(["", "", ""]);
  templateData.push(["=== INFORMATION ===", "", ""]);
  templateData.push(["Buy Competitor Info", false, "true/false"]);
  templateData.push(["Buy Market Shares", false, "true/false"]);
  
  templateData.push(["", "", ""]);
  templateData.push(["=== MATERIALS ===", "", ""]);
  templateData.push(["Materials Quantity", 5000, "Units"]);
  templateData.push(["Materials Supplier", 0, "Supplier number (0-2)"]);
  templateData.push(["Materials Deliveries", 1, "Number of deliveries"]);
  
  templateData.push(["", "", ""]);
  templateData.push(["=== MACHINES ===", "", ""]);
  templateData.push(["Machines To Order", 0, "Number"]);
  templateData.push(["Machines To Sell", 0, "Number"]);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(templateData);
  
  // Set column widths
  ws["!cols"] = [
    { wch: 35 }, // Decision Field
    { wch: 15 }, // Value
    { wch: 40 }, // Notes
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Decisions");
  
  // Generate file and download
  XLSX.writeFile(wb, "Topaz_Decision_Template.xlsx");
}

export interface ExcelImportResult {
  success: boolean;
  decisions?: Partial<Decisions>;
  error?: string;
}

export function parseExcelToDecisions(file: File): Promise<ExcelImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        // Parse the Excel data into Decisions format
        const decisions: Partial<Decisions> = {};
        
        // Helper to find value in Excel by label
        const findValue = (label: string): any => {
          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (row && row[0] && String(row[0]).toLowerCase().includes(label.toLowerCase())) {
              return row[1] !== undefined && row[1] !== "" ? row[1] : null;
            }
          }
          return null;
        };
        
        // Helper to find numeric value
        const findNumeric = (label: string, defaultValue: number = 0): number => {
          const val = findValue(label);
          if (val === null || val === undefined || val === "") return defaultValue;
          const num = typeof val === "number" ? val : parseFloat(String(val));
          return isNaN(num) ? defaultValue : num;
        };
        
        // Helper to find boolean value
        const findBoolean = (label: string, defaultValue: boolean = false): boolean => {
          const val = findValue(label);
          if (val === null || val === undefined || val === "") return defaultValue;
          if (typeof val === "boolean") return val;
          const str = String(val).toLowerCase();
          return str === "true" || str === "yes" || str === "1" || str === "y";
        };
        
        // Prices
        decisions.prices_home = {
          "Product 1": findNumeric("Product 1 Home Price", 100),
          "Product 2": findNumeric("Product 2 Home Price", 120),
          "Product 3": findNumeric("Product 3 Home Price", 140),
        };
        
        decisions.prices_export = {
          "Product 1": findNumeric("Product 1 Export Price", 110),
          "Product 2": findNumeric("Product 2 Export Price", 132),
          "Product 3": findNumeric("Product 3 Export Price", 154),
        };
        
        // Assembly Time
        decisions.assembly_time = {
          "Product 1": findNumeric("Product 1 Assembly Time", 100),
          "Product 2": findNumeric("Product 2 Assembly Time", 150),
          "Product 3": findNumeric("Product 3 Assembly Time", 300),
        };
        
        // Major Improvements
        decisions.implement_major_improvement = {
          "Product 1": findBoolean("Product 1 Major Improvement"),
          "Product 2": findBoolean("Product 2 Major Improvement"),
          "Product 3": findBoolean("Product 3 Major Improvement"),
        };
        
        // Product Development
        decisions.product_development = {
          "Product 1": findNumeric("Product 1 Development", 0),
          "Product 2": findNumeric("Product 2 Development", 0),
          "Product 3": findNumeric("Product 3 Development", 0),
        };
        
        // Salespeople Allocation
        decisions.salespeople_allocation = {
          South: findNumeric("Salespeople South", 2),
          West: findNumeric("Salespeople West", 2),
          North: findNumeric("Salespeople North", 3),
          Export: findNumeric("Salespeople Export", 3),
        };
        
        // Advertising - try to find by pattern
        const createAdvertisingRecord = (type: string): Record<ProductAreaKey, number> => {
          const record: Partial<Record<ProductAreaKey, number>> = {};
          for (const product of PRODUCTS) {
            for (const area of AREAS) {
              const key = makeKey(product, area);
              const label = `${type} ${product} ${area}`;
              record[key] = findNumeric(label, 0);
            }
          }
          return record as Record<ProductAreaKey, number>;
        };
        
        decisions.advertising_trade_press = createAdvertisingRecord("Trade Press");
        decisions.advertising_support = createAdvertisingRecord("Support");
        decisions.advertising_merchandising = createAdvertisingRecord("Merchandising");
        
        // Deliveries
        decisions.deliveries = (() => {
          const record: Partial<Record<ProductAreaKey, number>> = {};
          for (const product of PRODUCTS) {
            for (const area of AREAS) {
              const key = makeKey(product, area);
              const label = `Delivery ${product} ${area}`;
              record[key] = findNumeric(label, 0);
            }
          }
          return record as Record<ProductAreaKey, number>;
        })();
        
        // Personnel
        decisions.sales_salary_per_quarter = findNumeric("Sales Salary", 2000);
        decisions.sales_commission_percent = findNumeric("Sales Commission %", 0);
        decisions.assembly_wage_rate = findNumeric("Assembly Wage Rate", 8.5);
        decisions.recruit_sales = findNumeric("Recruit Sales", 0);
        decisions.dismiss_sales = findNumeric("Dismiss Sales", 0);
        decisions.train_sales = findNumeric("Train Sales", 0);
        decisions.recruit_assembly = findNumeric("Recruit Assembly", 0);
        decisions.dismiss_assembly = findNumeric("Dismiss Assembly", 0);
        decisions.train_assembly = findNumeric("Train Assembly", 0);
        
        // Operations
        decisions.shift_level = findNumeric("Shift Level", 1);
        decisions.management_budget = findNumeric("Management Budget", 40000);
        decisions.maintenance_hours_per_machine = findNumeric("Maintenance Hours", 40);
        
        // Finance
        decisions.dividend_per_share = findNumeric("Dividend Per Share", 0);
        decisions.credit_days = findNumeric("Credit Days", 30);
        
        // Vehicles
        decisions.vans_to_buy = findNumeric("Vans To Buy", 0);
        decisions.vans_to_sell = findNumeric("Vans To Sell", 0);
        
        // Information
        decisions.buy_competitor_info = findBoolean("Buy Competitor Info");
        decisions.buy_market_shares = findBoolean("Buy Market Shares");
        
        // Materials
        decisions.materials_quantity = findNumeric("Materials Quantity", 5000);
        decisions.materials_supplier = findNumeric("Materials Supplier", 0);
        decisions.materials_num_deliveries = findNumeric("Materials Deliveries", 1);
        
        // Machines
        decisions.machines_to_order = findNumeric("Machines To Order", 0);
        decisions.machines_to_sell = findNumeric("Machines To Sell", 0);
        
        resolve({
          success: true,
          decisions,
        });
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : "Failed to parse Excel file",
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        error: "Failed to read file",
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
}

