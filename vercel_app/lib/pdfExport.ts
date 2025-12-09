// PDF Export utility for Management Reports
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ManagementReport } from "./types";
import { PRODUCTS, AREAS } from "./constants";
import { makeKey } from "./types";

export function exportReportToPDF(report: ManagementReport, companyName: string): void {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("Management Report", 14, 20);
  doc.setFontSize(12);
  doc.text(`${companyName} - Year ${report.year}, Quarter ${report.quarter}`, 14, 30);
  
  let yPos = 40;
  
  // Key Financial Metrics
  doc.setFontSize(14);
  doc.text("Financial Summary", 14, yPos);
  yPos += 10;
  
  const financialData = [
    ["Revenue", `£${report.revenue.toLocaleString()}`],
    ["Cost of Sales", `£${report.cost_of_sales.toLocaleString()}`],
    ["Gross Profit", `£${report.gross_profit.toLocaleString()}`],
    ["Total Overheads", `£${report.total_overheads.toLocaleString()}`],
    ["EBITDA", `£${report.ebitda.toLocaleString()}`],
    ["Net Profit", `£${report.net_profit.toLocaleString()}`],
    ["Cash", `£${report.cash.toLocaleString()}`],
    ["Net Worth", `£${report.net_worth.toLocaleString()}`],
    ["Share Price", `£${report.share_price.toFixed(2)}`],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value"]],
    body: financialData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  // Sales by Product and Area
  doc.setFontSize(14);
  doc.text("Sales by Product and Area", 14, yPos);
  yPos += 10;
  
  const salesData: string[][] = [];
  salesData.push(["Product", "Area", "Sales"]);
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      const key = makeKey(product, area);
      const sales = report.sales[key] || 0;
      if (sales > 0) {
        salesData.push([product, area, sales.toString()]);
      }
    }
  }
  
  autoTable(doc, {
    startY: yPos,
    head: [salesData[0]],
    body: salesData.slice(1),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  // New Orders
  doc.setFontSize(14);
  doc.text("New Orders by Product and Area", 14, yPos);
  yPos += 10;
  
  const ordersData: string[][] = [];
  ordersData.push(["Product", "Area", "New Orders"]);
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      const key = makeKey(product, area);
      const orders = report.new_orders[key] || 0;
      if (orders > 0) {
        ordersData.push([product, area, orders.toString()]);
      }
    }
  }
  
  autoTable(doc, {
    startY: yPos,
    head: [ordersData[0]],
    body: ordersData.slice(1),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  // Stocks and Backlog
  doc.setFontSize(14);
  doc.text("Stocks and Backlog", 14, yPos);
  yPos += 10;
  
  const stockData: string[][] = [];
  stockData.push(["Product", "Area", "Stocks", "Backlog"]);
  for (const product of PRODUCTS) {
    for (const area of AREAS) {
      const key = makeKey(product, area);
      const stock = report.stocks[key] || 0;
      const backlog = report.backlog[key] || 0;
      if (stock > 0 || backlog > 0) {
        stockData.push([product, area, stock.toString(), backlog.toString()]);
      }
    }
  }
  
  autoTable(doc, {
    startY: yPos,
    head: [stockData[0]],
    body: stockData.slice(1),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  // Resources
  doc.setFontSize(14);
  doc.text("Resources", 14, yPos);
  yPos += 10;
  
  const resourcesData = [
    ["Machines", report.machines.toString()],
    ["Vehicles", report.vehicles.toString()],
    ["Salespeople", report.salespeople.toString()],
    ["Assembly Workers", report.assembly_workers.toString()],
    ["Machinists", report.machinists.toString()],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [["Resource", "Quantity"]],
    body: resourcesData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  // Save PDF
  const fileName = `${companyName}_Year${report.year}_Q${report.quarter}.pdf`;
  doc.save(fileName);
}

export function exportAllReportsToPDF(reports: ManagementReport[]): void {
  // Export each report as a separate PDF
  reports.forEach((report, index) => {
    const companyName = report.company || `Company ${index + 1}`;
    exportReportToPDF(report, companyName);
  });
}

