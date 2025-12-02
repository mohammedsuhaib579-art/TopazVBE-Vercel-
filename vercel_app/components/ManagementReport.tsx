"use client";

import type { ManagementReport } from "../lib/types";
import { PRODUCTS, AREAS } from "../lib/constants";
import { parseKey } from "../lib/types";

interface ManagementReportProps {
  report: ManagementReport;
  companyName: string;
}

export default function ManagementReportDisplay({ report, companyName }: ManagementReportProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold">📋 Management Report</h2>
        <p className="mt-2 text-sm opacity-90">
          {companyName} - Year {report.year}, Quarter {report.quarter}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="text-xs text-slate-400">Revenue</div>
          <div className="text-xl font-semibold text-slate-100">£{report.revenue.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="text-xs text-slate-400">Net Profit</div>
          <div className="text-xl font-semibold text-slate-100">£{report.net_profit.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="text-xs text-slate-400">EBITDA</div>
          <div className="text-xl font-semibold text-slate-100">£{report.ebitda.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="text-xs text-slate-400">Cash</div>
          <div className="text-xl font-semibold text-slate-100">£{report.cash.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="text-xs text-slate-400">Share Price</div>
          <div className="text-xl font-semibold text-slate-100">£{report.share_price.toFixed(2)}</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Availability and Use of Resources */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <h3 className="mb-4 text-lg font-semibold text-slate-100">
              AVAILABILITY and USE OF RESOURCES
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Machines</h4>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Machines Available Last Quarter: {report.machines - (report.machines_installed || 0)}</div>
                  <div>Machines Available for Next Quarter: {report.machines}</div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Vehicles</h4>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Vehicles Available Last Quarter: {report.vehicles_available || 0}</div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Assembly Workers Hours</h4>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>
                    Total Hours Available Last Quarter: {report.assembly_hours_available?.toFixed(0) || 0}
                  </div>
                  <div>
                    Hours of Absenteeism/Sickness: {report.assembly_hours_absenteeism?.toFixed(0) || 0}
                  </div>
                  <div>Total Hours Worked Last Quarter: {report.assembly_hours_worked?.toFixed(0) || 0}</div>
                  <div>Notice of Strike Weeks Next Quarter: {report.strike_weeks_next || 0}</div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Machine Hours</h4>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>
                    Total Hours Available Last Quarter: {report.machine_hours_available?.toFixed(0) || 0}
                  </div>
                  <div>
                    Hours of Planned Maintenance: {report.machine_hours_maintenance?.toFixed(0) || 0}
                  </div>
                  <div>Total Hours Worked Last Quarter: {report.machine_hours_worked?.toFixed(0) || 0}</div>
                  <div>Average Machine Efficiency %: {((report.machine_efficiency || 0) * 100).toFixed(1)}</div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Material Units Used and Available</h4>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Opening Stock Available (units): {report.material_opening?.toLocaleString() || 0}</div>
                  <div>Delivered Last Quarter: {report.material_delivered?.toLocaleString() || 0}</div>
                  <div>Used Last Quarter: {report.materials_used?.toLocaleString() || 0}</div>
                  <div>Closing Stock at End of Quarter: {report.material_closing?.toLocaleString() || 0}</div>
                  <div>On Order for Next Quarter: {report.material_on_order?.toLocaleString() || 0}</div>
                  <div>
                    Total Available for Next Quarter:{" "}
                    {((report.material_closing || 0) + (report.material_on_order || 0)).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Personnel</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="px-2 py-1 text-left text-slate-300"></th>
                        <th className="px-2 py-1 text-right text-slate-300">At Start</th>
                        <th className="px-2 py-1 text-right text-slate-300">Recruits</th>
                        <th className="px-2 py-1 text-right text-slate-300">Trainees</th>
                        <th className="px-2 py-1 text-right text-slate-300">Dismissals</th>
                        <th className="px-2 py-1 text-right text-slate-300">Leavers</th>
                        <th className="px-2 py-1 text-right text-slate-300">Available Next</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-700">
                        <td className="px-2 py-1 text-slate-300">Sales</td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_opening?.sales || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_recruited?.sales || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_trained?.sales || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_dismissed?.sales || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_leavers?.sales || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_available_next?.sales || 0}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-700">
                        <td className="px-2 py-1 text-slate-300">Assembly</td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_opening?.assembly || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_recruited?.assembly || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_trained?.assembly || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_dismissed?.assembly || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_leavers?.assembly || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_available_next?.assembly || 0}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 text-slate-300">Machinists</td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_opening?.machinists || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_recruited?.machinists || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_trained?.machinists || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_dismissed?.machinists || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_leavers?.machinists || 0}
                        </td>
                        <td className="px-2 py-1 text-right text-slate-400">
                          {report.personnel_available_next?.machinists || 0}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Movements and Availability */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <h3 className="mb-4 text-lg font-semibold text-slate-100">
              PRODUCT MOVEMENTS and AVAILABILITY
            </h3>

            <div className="space-y-4 text-sm">
              {/* Quantities Table */}
              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Quantities</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="px-2 py-1 text-left text-slate-300"></th>
                        <th className="px-2 py-1 text-right text-slate-300">Scheduled</th>
                        <th className="px-2 py-1 text-right text-slate-300">Produced</th>
                        <th className="px-2 py-1 text-right text-slate-300">Rejected</th>
                        <th className="px-2 py-1 text-right text-slate-300">Serviced</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PRODUCTS.map((product) => {
                        let scheduled = 0;
                        let produced = 0;
                        let rejected = 0;
                        for (const area of AREAS) {
                          const key = parseKey(`${product}|${area}` as any);
                          scheduled += report.scheduled?.[`${key[0]}|${key[1]}` as any] || 0;
                          produced += report.deliveries?.[`${key[0]}|${key[1]}` as any] || 0;
                          rejected += report.rejects?.[`${key[0]}|${key[1]}` as any] || 0;
                        }
                        return (
                          <tr key={product} className="border-b border-slate-700">
                            <td className="px-2 py-1 text-slate-300">{product}</td>
                            <td className="px-2 py-1 text-right text-slate-400">{scheduled}</td>
                            <td className="px-2 py-1 text-right text-slate-400">{produced}</td>
                            <td className="px-2 py-1 text-right text-slate-400">{rejected}</td>
                            <td className="px-2 py-1 text-right text-slate-400">
                              {report.servicing_units?.[product] || 0}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivered To Table */}
              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Delivered to</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="px-2 py-1 text-left text-slate-300">Area</th>
                        {PRODUCTS.map((p) => (
                          <th key={p} className="px-2 py-1 text-right text-slate-300">
                            {p}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {AREAS.map((area) => (
                        <tr key={area} className="border-b border-slate-700">
                          <td className="px-2 py-1 text-slate-300">{area}</td>
                          {PRODUCTS.map((product) => {
                            const key = `${product}|${area}`;
                            return (
                              <td key={product} className="px-2 py-1 text-right text-slate-400">
                                {report.deliveries?.[key as any] || 0}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Orders From Table */}
              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Orders from</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="px-2 py-1 text-left text-slate-300">Area</th>
                        {PRODUCTS.map((p) => (
                          <th key={p} className="px-2 py-1 text-right text-slate-300">
                            {p}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {AREAS.map((area) => (
                        <tr key={area} className="border-b border-slate-700">
                          <td className="px-2 py-1 text-slate-300">{area}</td>
                          {PRODUCTS.map((product) => {
                            const key = `${product}|${area}`;
                            return (
                              <td key={product} className="px-2 py-1 text-right text-slate-400">
                                {report.new_orders?.[key as any] || 0}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sales To Table */}
              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Sales to</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="px-2 py-1 text-left text-slate-300">Area</th>
                        {PRODUCTS.map((p) => (
                          <th key={p} className="px-2 py-1 text-right text-slate-300">
                            {p}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {AREAS.map((area) => (
                        <tr key={area} className="border-b border-slate-700">
                          <td className="px-2 py-1 text-slate-300">{area}</td>
                          {PRODUCTS.map((product) => {
                            const key = `${product}|${area}`;
                            return (
                              <td key={product} className="px-2 py-1 text-right text-slate-400">
                                {report.sales?.[key as any] || 0}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Backlog Table */}
              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Order Backlog</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="px-2 py-1 text-left text-slate-300">Area</th>
                        {PRODUCTS.map((p) => (
                          <th key={p} className="px-2 py-1 text-right text-slate-300">
                            {p}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {AREAS.map((area) => (
                        <tr key={area} className="border-b border-slate-700">
                          <td className="px-2 py-1 text-slate-300">{area}</td>
                          {PRODUCTS.map((product) => {
                            const key = `${product}|${area}`;
                            return (
                              <td key={product} className="px-2 py-1 text-right text-slate-400">
                                {report.backlog?.[key as any] || 0}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Warehouse Stock Table */}
              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Warehouse Stock</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="px-2 py-1 text-left text-slate-300">Area</th>
                        {PRODUCTS.map((p) => (
                          <th key={p} className="px-2 py-1 text-right text-slate-300">
                            {p}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {AREAS.map((area) => (
                        <tr key={area} className="border-b border-slate-700">
                          <td className="px-2 py-1 text-slate-300">{area}</td>
                          {PRODUCTS.map((product) => {
                            const key = `${product}|${area}`;
                            return (
                              <td key={product} className="px-2 py-1 text-right text-slate-400">
                                {report.stocks?.[key as any] || 0}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Product Improvements */}
              <div>
                <h4 className="mb-2 font-semibold text-slate-200">Product Improvements</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="px-2 py-1 text-left text-slate-300"></th>
                        <th className="px-2 py-1 text-right text-slate-300">Improvements</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PRODUCTS.map((product) => (
                        <tr key={product} className="border-b border-slate-700">
                          <td className="px-2 py-1 text-slate-300">{product}</td>
                          <td className="px-2 py-1 text-right text-slate-400">
                            {report.product_dev_outcomes?.[product] || "NONE"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Overhead Cost Analysis */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">ACCOUNTS - Overhead Cost Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="px-2 py-1 text-left text-slate-300">Cost Item</th>
                  <th className="px-2 py-1 text-right text-slate-300">Amount in £</th>
                </tr>
              </thead>
              <tbody>
                {report.overhead_breakdown &&
                  Object.entries(report.overhead_breakdown).map(([item, amount]) => (
                    <tr key={item} className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">{item.replace(/_/g, " ")}</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{typeof amount === "number" ? amount.toLocaleString() : "0"}
                      </td>
                    </tr>
                  ))}
                <tr className="font-semibold">
                  <td className="px-2 py-1 text-slate-200">Total Overheads</td>
                  <td className="px-2 py-1 text-right text-slate-100">
                    £{report.total_overheads.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Profit and Loss Account */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">ACCOUNTS - Profit and Loss Account</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="px-2 py-1 text-left text-slate-300">Account Item</th>
                  <th className="px-2 py-1 text-right text-slate-300">Amount in £</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700">
                  <td className="px-2 py-1 text-slate-300">Sales Revenue</td>
                  <td className="px-2 py-1 text-right text-slate-400">£{report.revenue.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-2 py-1 text-slate-300">Cost of Sales</td>
                  <td className="px-2 py-1 text-right text-slate-400">
                    £{report.cost_of_sales.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-2 py-1 text-slate-300">Gross Profit</td>
                  <td className="px-2 py-1 text-right text-slate-400">
                    £{report.gross_profit.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-2 py-1 text-slate-300">Interest received</td>
                  <td className="px-2 py-1 text-right text-slate-400">
                    £{report.interest_received.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-2 py-1 text-slate-300">Interest Paid</td>
                  <td className="px-2 py-1 text-right text-slate-400">
                    £{report.interest_paid.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-2 py-1 text-slate-300">Overheads</td>
                  <td className="px-2 py-1 text-right text-slate-400">
                    £{report.total_overheads.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-2 py-1 text-slate-300">Depreciation</td>
                  <td className="px-2 py-1 text-right text-slate-400">
                    £{report.depreciation.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-2 py-1 text-slate-300">Tax Assessed</td>
                  <td className="px-2 py-1 text-right text-slate-400">£{report.tax.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-2 py-1 font-semibold text-slate-200">Net Profit/Loss</td>
                  <td className="px-2 py-1 text-right font-semibold text-slate-100">
                    £{report.net_profit.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-2 py-1 text-slate-300">Dividend Paid</td>
                  <td className="px-2 py-1 text-right text-slate-400">
                    £{report.dividends.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-1 text-slate-300">Transferred to Reserves</td>
                  <td className="px-2 py-1 text-right text-slate-400">
                    £{report.retained.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Balance Sheet and Cash Flow */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Balance Sheet */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">Balance Sheet</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="px-2 py-1 text-left text-slate-300">Item</th>
                  <th className="px-2 py-1 text-right text-slate-300">Amount in £</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700">
                  <td className="px-2 py-1 font-semibold text-slate-200">Assets:</td>
                  <td className="px-2 py-1"></td>
                </tr>
                {report.balance_sheet && (
                  <>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Value of Property</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.property_value?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Value of Machines</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.machine_values?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Value of Vehicles</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.vehicle_values?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Value of Product Stocks</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.product_stocks_value?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Value of Material Stock</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.material_stock_value?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Debtors</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.debtors?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Cash Invested</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.cash_invested?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 font-semibold text-slate-200">Liabilities:</td>
                      <td className="px-2 py-1"></td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Tax Assessed and Due</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.tax_assessed_due?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Creditors</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.creditors?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Overdraft</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.overdraft?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Unsecured Loans</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.unsecured_loans?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 font-semibold text-slate-200">Net Assets:</td>
                      <td className="px-2 py-1 text-right font-semibold text-slate-100">
                        £{report.net_worth.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 font-semibold text-slate-200">Funding:</td>
                      <td className="px-2 py-1"></td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Ordinary Capital</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.ordinary_capital?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1 text-slate-300">Reserves</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.balance_sheet.reserves?.toLocaleString() || "0"}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cash Flow Statement */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">Cash Flow Statement</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="px-2 py-1 text-left text-slate-300">Item</th>
                  <th className="px-2 py-1 text-right text-slate-300">Amount in £</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700">
                  <td className="px-2 py-1 font-semibold text-slate-200">Operating Activities:</td>
                  <td className="px-2 py-1"></td>
                </tr>
                {report.cash_flow && (
                  <>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Trading Receipts</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.cash_flow.trading_receipts?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Trading Payments</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        -£{Math.abs(report.cash_flow.trading_payments || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Tax Paid</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        -£{Math.abs(report.cash_flow.tax_paid || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 font-semibold text-slate-200">Investing Activities:</td>
                      <td className="px-2 py-1"></td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Interest Received</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.cash_flow.interest_received?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Capital Receipts</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        £{report.cash_flow.capital_receipts?.toLocaleString() || "0"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Capital Payments</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        -£{Math.abs(report.cash_flow.capital_payments || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 font-semibold text-slate-200">Financing Activities:</td>
                      <td className="px-2 py-1"></td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Interest Paid</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        -£{Math.abs(report.cash_flow.interest_paid || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-2 py-1 text-slate-300">Dividend Paid</td>
                      <td className="px-2 py-1 text-right text-slate-400">
                        -£{Math.abs(report.cash_flow.dividend_paid || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1 font-semibold text-slate-200">Net Cash Flow:</td>
                      <td className="px-2 py-1 text-right font-semibold text-slate-100">
                        £{report.cash_flow.net_cash_flow?.toLocaleString() || "0"}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

