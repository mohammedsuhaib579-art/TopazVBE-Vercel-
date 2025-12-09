"use client";

import type { CompanyState } from "../lib/types";

interface CompetitorInfoProps {
  competitors: CompanyState[];
  playerCompanyIndex: number;
}

export default function CompetitorInfo({ competitors, playerCompanyIndex }: CompetitorInfoProps) {
  // Filter out the player's own company
  const competitorList = competitors.filter((_, idx) => idx !== playerCompanyIndex);

  if (competitorList.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">📊 Competitor Information</h2>
        <p className="mb-4 text-sm text-slate-400">
          Intelligence report on competitor companies (Purchased for £5,000)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="px-4 py-2 text-left text-slate-300">Company</th>
                <th className="px-4 py-2 text-right text-slate-300">Share Price</th>
                <th className="px-4 py-2 text-right text-slate-300">Net Worth</th>
                <th className="px-4 py-2 text-right text-slate-300">Cash</th>
                <th className="px-4 py-2 text-right text-slate-300">Employees</th>
                <th className="px-4 py-2 text-right text-slate-300">Machines</th>
              </tr>
            </thead>
            <tbody>
              {competitorList.map((company, idx) => {
                const netWorth = (company.share_price * company.shares_outstanding) + company.reserves;
                const totalEmployees = company.salespeople + company.assembly_workers + company.machinists;
                
                return (
                  <tr key={idx} className="border-b border-slate-700">
                    <td className="px-4 py-2 text-slate-300">
                      {company.name || `Company ${idx + 1}`}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-400">
                      £{company.share_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-400">
                      £{netWorth.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-400">
                      £{company.cash.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-400">
                      {totalEmployees}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-400">
                      {company.machines}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

