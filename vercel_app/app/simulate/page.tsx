"use client";

import { useState } from "react";
import DecisionForm from "../../components/DecisionForm";
import ManagementReportDisplay from "../../components/ManagementReport";
import type { Decisions, ManagementReport } from "../../lib/types";
import { Simulation } from "../../lib/simulation";

type PlayerConfig = {
  humans: number;
};

type ApiResponse = {
  ok: boolean;
  reports?: ManagementReport[];
  economy?: {
    quarter: number;
    year: number;
    gdp: number;
    unemployment: number;
    cb_rate: number;
    material_price: number;
  };
  error?: string;
};

export default function SimulatePage() {
  const [config, setConfig] = useState<PlayerConfig>({ humans: 1 });
  const [isRunning, setIsRunning] = useState(false);
  const [reports, setReports] = useState<ManagementReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [economy, setEconomy] = useState<ApiResponse["economy"] | null>(null);

  // Create a default company state for the form (will be updated after first run)
  const [companyState, setCompanyState] = useState({
    name: "Company 1",
    sharePrice: 1.0,
    netWorth: 500_000,
    cash: 200_000,
    employees: 50,
    machines: 10,
    salespeople: 10,
    assemblyWorkers: 40,
    productStarRatings: { "Product 1": 3, "Product 2": 3, "Product 3": 3 },
    productDevAccumulated: { "Product 1": 0, "Product 2": 0, "Product 3": 0 },
    creditworthiness: 500_000,
  });

  const handleRunQuarter = async (decisions: Decisions) => {
    setIsRunning(true);
    setReports(null);
    setError(null);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: config.humans,
          decisions,
        }),
      });

      const data = (await res.json()) as ApiResponse;

      if (!data.ok || !data.reports) {
        setError(data.error || "Simulation did not return valid results.");
      } else {
        setReports(data.reports);
        if (data.economy) {
          setEconomy(data.economy);
        }

        // Update company state from first report for next quarter
        if (data.reports.length > 0) {
          const firstReport = data.reports[0];
          setCompanyState({
            name: firstReport.company || "Company 1",
            sharePrice: firstReport.share_price,
            netWorth: firstReport.net_worth,
            cash: firstReport.cash,
            employees: (firstReport.salespeople || 0) + (firstReport.assembly_workers || 0) + (firstReport.machinists || 0),
            machines: firstReport.machines,
            salespeople: firstReport.salespeople || 10,
            assemblyWorkers: firstReport.assembly_workers || 40,
            productStarRatings: { "Product 1": 3, "Product 2": 3, "Product 3": 3 }, // Would come from company state
            productDevAccumulated: { "Product 1": 0, "Product 2": 0, "Product 3": 0 }, // Would come from company state
            creditworthiness: 500_000, // Would calculate from report
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation call failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const aiPlayers = config.humans === 1 ? 7 : 0;

  return (
    <main className="flex flex-1 flex-col gap-8">
      <header className="space-y-3">
        <div className="pill">Simulation</div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Configure & run a quarter
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Complete Topaz-style business simulation with all decision areas: Marketing, Operations,
          Personnel, and Finance. Make your decisions and run the quarter to see detailed management
          reports.
        </p>
      </header>

      {/* Game Setup */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">Game Setup</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm text-slate-300">
              <span>Number of human players</span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                {config.humans} selected
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={8}
              value={config.humans}
              onChange={(e) => setConfig({ humans: Number(e.target.value) })}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Solo vs AI</span>
              <span>Full multi‑player</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-800 p-4">
              <div className="text-xs text-slate-400">Human players</div>
              <div className="mt-1 text-2xl font-semibold text-slate-50">{config.humans}</div>
            </div>
            <div className="rounded-xl bg-slate-800 p-4">
              <div className="text-xs text-slate-400">AI companies</div>
              <div className="mt-1 text-2xl font-semibold text-slate-50">{aiPlayers}</div>
            </div>
          </div>

          {economy && (
            <div className="rounded-xl bg-slate-800 p-4">
              <div className="mb-2 text-xs font-semibold text-slate-300">Current Economy</div>
              <div className="space-y-1 text-xs text-slate-400">
                <div>Year {economy.year}, Quarter {economy.quarter}</div>
                <div>GDP Index: {economy.gdp.toFixed(1)}</div>
                <div>Unemployment: {economy.unemployment.toFixed(1)}%</div>
                <div>Bank Rate: {economy.cb_rate.toFixed(2)}%</div>
                <div>Material Price: £{economy.material_price.toFixed(1)}</div>
              </div>
            </div>
          )}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          With 1 human player, the remaining 7 companies are controlled by AI. With 2–8 humans, the
          table is entirely player‑driven.
        </p>
      </section>

      {/* Decision Form */}
      {!reports && (
        <DecisionForm
          companyName={companyState.name}
          sharePrice={companyState.sharePrice}
          netWorth={companyState.netWorth}
          cash={companyState.cash}
          employees={companyState.employees}
          machines={companyState.machines}
          salespeople={companyState.salespeople}
          assemblyWorkers={companyState.assemblyWorkers}
          productStarRatings={companyState.productStarRatings}
          productDevAccumulated={companyState.productDevAccumulated}
          currentQuarter={economy?.quarter || 1}
          creditworthiness={companyState.creditworthiness}
          onSubmit={handleRunQuarter}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {reports && reports.length > 0 && (
        <div className="space-y-6">
          {/* All Companies Summary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-100">Results Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="px-4 py-2 text-left text-slate-300">Company</th>
                    <th className="px-4 py-2 text-right text-slate-300">Share Price</th>
                    <th className="px-4 py-2 text-right text-slate-300">Net Worth</th>
                    <th className="px-4 py-2 text-right text-slate-300">Revenue</th>
                    <th className="px-4 py-2 text-right text-slate-300">Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, idx) => (
                    <tr key={idx} className="border-b border-slate-700">
                      <td className="px-4 py-2 text-slate-300">{report.company || `Company ${idx + 1}`}</td>
                      <td className="px-4 py-2 text-right text-slate-400">
                        £{report.share_price.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-400">
                        £{report.net_worth.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-400">
                        £{report.revenue.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-400">
                        £{report.net_profit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Management Report for First Company */}
          <ManagementReportDisplay
            report={reports[0]}
            companyName={reports[0].company || "Company 1"}
          />

          {/* Button to run next quarter */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setReports(null);
                setError(null);
              }}
              className="rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              📊 Make Decisions for Next Quarter
            </button>
          </div>
        </div>
      )}

      {isRunning && (
        <div className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 p-8">
          <div className="text-center">
            <div className="mb-2 text-lg font-semibold text-slate-200">Running quarter…</div>
            <div className="text-sm text-slate-400">Processing all decisions and calculating results</div>
          </div>
        </div>
      )}
    </main>
  );
}
