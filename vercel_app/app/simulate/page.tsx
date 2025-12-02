"use client";

import { useState, useEffect } from "react";
import DecisionForm from "../../components/DecisionForm";
import ManagementReportDisplay from "../../components/ManagementReport";
import type { Decisions, ManagementReport } from "../../lib/types";

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
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [reports, setReports] = useState<ManagementReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [economy, setEconomy] = useState<ApiResponse["economy"] | null>(null);
  
  // Track current quarter (persists across API calls)
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [currentYear, setCurrentYear] = useState(1);

  // Store decisions for all players
  const [allPlayerDecisions, setAllPlayerDecisions] = useState<Map<number, Decisions>>(new Map());

  // Create default company states for all players
  const [companyStates, setCompanyStates] = useState<Map<number, {
    name: string;
    sharePrice: number;
    netWorth: number;
    cash: number;
    employees: number;
    machines: number;
    salespeople: number;
    assemblyWorkers: number;
    productStarRatings: Record<string, number>;
    productDevAccumulated: Record<string, number>;
    creditworthiness: number;
  }>>(new Map());

  // Track if player count is locked (locked once confirmed)
  const [playerCountLocked, setPlayerCountLocked] = useState(false);
  const [pendingPlayerSelection, setPendingPlayerSelection] = useState<number | null>(null);

  // Initialize company states
  useEffect(() => {
    const states = new Map();
    for (let i = 0; i < config.humans; i++) {
      states.set(i, {
        name: `Company ${i + 1}`,
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
    }
    setCompanyStates(states);
    // Reset selection when number of players changes (only if not locked)
    if (!playerCountLocked) {
      setSelectedPlayer(null);
      setPendingPlayerSelection(null);
    }
  }, [config.humans, playerCountLocked]);

  // Auto-select player 0 for single player mode (but don't lock yet)
  useEffect(() => {
    if (config.humans === 1 && selectedPlayer === null && !playerCountLocked) {
      setPendingPlayerSelection(0);
    }
  }, [config.humans, selectedPlayer, playerCountLocked]);

  // Scroll to top when selected player changes
  useEffect(() => {
    if (selectedPlayer !== null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedPlayer]);

  const handleSwitchCompany = (playerIdx: number) => {
    setSelectedPlayer(playerIdx);
  };

  const handlePlayerSelect = (playerIdx: number) => {
    setPendingPlayerSelection(playerIdx);
  };

  const handleConfirmSelection = () => {
    if (pendingPlayerSelection !== null) {
      setSelectedPlayer(pendingPlayerSelection);
      setPlayerCountLocked(true);
      setPendingPlayerSelection(null);
    }
  };

  const handleDecisionChange = (playerIdx: number, decisions: Decisions) => {
    const newDecisions = new Map(allPlayerDecisions);
    newDecisions.set(playerIdx, decisions);
    setAllPlayerDecisions(newDecisions);
    
    // Auto-advance to next company that hasn't saved decisions
    if (config.humans > 1) {
      // Find next company without decisions
      for (let i = 1; i < config.humans; i++) {
        const nextIdx = (playerIdx + i) % config.humans;
        if (!newDecisions.has(nextIdx)) {
          setSelectedPlayer(nextIdx);
          break;
        }
      }
    }
  };

  const handleRunQuarter = async (singlePlayerDecisions?: Decisions) => {
    setIsRunning(true);
    setReports(null);
    setError(null);

    try {
      // Build decisions array - one per company
      const decisionsArray: Decisions[] = [];
      
      if (config.humans === 1 && singlePlayerDecisions) {
        // Single player mode - use provided decisions
        decisionsArray.push(singlePlayerDecisions);
      } else {
        // Multiplayer mode - validate all decisions are present
        const missing: number[] = [];
        for (let i = 0; i < config.humans; i++) {
          if (!allPlayerDecisions.has(i)) {
            missing.push(i);
          }
        }
        if (missing.length > 0) {
          setError(`Missing decisions for companies: ${missing.map(i => `Company ${i + 1}`).join(", ")}`);
          setIsRunning(false);
          return;
        }
        
        // Collect all player decisions
        for (let i = 0; i < config.humans; i++) {
          const decisions = allPlayerDecisions.get(i);
          if (!decisions) {
            throw new Error(`Missing decisions for company ${i + 1}`);
          }
          decisionsArray.push(decisions);
        }
      }

      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: config.humans,
          decisions: decisionsArray,
        }),
      });

      const data = (await res.json()) as ApiResponse;

      if (!data.ok || !data.reports) {
        setError(data.error || "Simulation did not return valid results.");
      } else {
        setReports(data.reports);
        // Extract economy info from reports and update current quarter tracking
        if (data.reports.length > 0) {
          const firstReport = data.reports[0];
          // Update tracked quarter (this is the quarter that just ran)
          setCurrentQuarter(firstReport.quarter);
          setCurrentYear(firstReport.year);
          
          // Calculate next quarter for economy display
          let nextQuarter = firstReport.quarter + 1;
          let nextYear = firstReport.year;
          if (nextQuarter > 4) {
            nextQuarter = 1;
            nextYear += 1;
          }
          
          setEconomy({
            quarter: nextQuarter, // Show next quarter (what we're preparing for)
            year: nextYear,
            gdp: data.economy?.gdp ?? 100,
            unemployment: data.economy?.unemployment ?? 5.0,
            cb_rate: data.economy?.cb_rate ?? 5.0,
            material_price: data.economy?.material_price ?? 100,
          });
        } else if (data.economy) {
          setEconomy(data.economy);
        }

        // Update company states from reports
        const newStates = new Map();
        data.reports.forEach((report, idx) => {
          if (idx < config.humans) {
            newStates.set(idx, {
              name: report.company || `Company ${idx + 1}`,
              sharePrice: report.share_price,
              netWorth: report.net_worth,
              cash: report.cash,
              employees: (report.salespeople || 0) + (report.assembly_workers || 0) + (report.machinists || 0),
              machines: report.machines,
              salespeople: report.salespeople || 10,
              assemblyWorkers: report.assembly_workers || 40,
              productStarRatings: { "Product 1": 3, "Product 2": 3, "Product 3": 3 },
              productDevAccumulated: { "Product 1": 0, "Product 2": 0, "Product 3": 0 },
              creditworthiness: 500_000,
            });
          }
        });
        setCompanyStates(newStates);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation call failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const aiPlayers = config.humans === 1 ? 7 : 0;
  const currentCompanyState = selectedPlayer !== null ? companyStates.get(selectedPlayer) : null;

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
              onChange={(e) => {
                if (!playerCountLocked) {
                  setConfig({ humans: Number(e.target.value) });
                  setPendingPlayerSelection(null);
                  setSelectedPlayer(null);
                }
              }}
              disabled={playerCountLocked}
              className="w-full accent-primary-500 disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Solo vs AI</span>
              <span>Full multi‑player</span>
            </div>
            {playerCountLocked && (
              <p className="text-xs text-amber-400">
                ⚠️ Player count is locked. Reset to change.
              </p>
            )}
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
                <div>Preparing for: Year {economy.year}, Quarter {economy.quarter}</div>
                {reports && (
                  <div className="text-slate-500">Last completed: Year {currentYear}, Quarter {currentQuarter}</div>
                )}
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
        {playerCountLocked && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                setPlayerCountLocked(false);
                setSelectedPlayer(null);
                setPendingPlayerSelection(null);
                setAllPlayerDecisions(new Map());
                setReports(null);
                setError(null);
              }}
              className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
            >
              Reset Player Count
            </button>
          </div>
        )}
      </section>

      {/* Player Selection (Multiplayer - before confirmation) */}
      {config.humans > 1 && !playerCountLocked && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Select Your Company</h2>
          <p className="mb-4 text-sm text-slate-300">
            Choose which company you will control. Click "Confirm Selection" to lock your choice.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: config.humans }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handlePlayerSelect(idx)}
                className={`rounded-xl border-2 p-4 text-center transition ${
                  pendingPlayerSelection === idx
                    ? "border-primary-500 bg-primary-500/20"
                    : "border-slate-700 bg-slate-800 hover:border-primary-500 hover:bg-slate-700"
                }`}
              >
                <div className="text-lg font-semibold text-slate-100">Company {idx + 1}</div>
                <div className="mt-1 text-xs text-slate-400">
                  {pendingPlayerSelection === idx ? "Selected" : "Click to select"}
                </div>
              </button>
            ))}
          </div>
          {pendingPlayerSelection !== null && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleConfirmSelection}
                className="rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                ✓ Confirm Selection
              </button>
            </div>
          )}
        </section>
      )}

      {/* Player Selection (Single Player - before confirmation) */}
      {config.humans === 1 && !playerCountLocked && pendingPlayerSelection === 0 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Confirm Your Selection</h2>
          <p className="mb-4 text-sm text-slate-300">
            You will be controlling <span className="font-semibold text-primary-400">Company 1</span>. Click "Confirm Selection" to proceed.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleConfirmSelection}
              className="rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              ✓ Confirm Selection
            </button>
          </div>
        </section>
      )}

      {/* Company Switcher (Multiplayer only - after confirmation) */}
      {config.humans > 1 && selectedPlayer !== null && playerCountLocked && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Switch Company</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: config.humans }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleSwitchCompany(idx)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  selectedPlayer === idx
                    ? "bg-primary-500 text-white"
                    : allPlayerDecisions.has(idx)
                    ? "bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30"
                    : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Company {idx + 1}
                {allPlayerDecisions.has(idx) && " ✓"}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Decision Forms */}
      {!reports && currentCompanyState && selectedPlayer !== null && (
        <div className="space-y-6">
          {/* Show all player decision status for multiplayer */}
          {config.humans > 1 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-200">Decision Status</h3>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {Array.from({ length: config.humans }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 ${
                      allPlayerDecisions.has(idx)
                        ? "bg-green-500/20 border border-green-500/50"
                        : "bg-slate-800 border border-slate-700"
                    }`}
                  >
                    <div className="text-xs text-slate-400">Company {idx + 1}</div>
                    <div className={`mt-1 text-sm font-semibold ${
                      allPlayerDecisions.has(idx) ? "text-green-400" : "text-slate-500"
                    }`}>
                      {allPlayerDecisions.has(idx) ? "✓ Ready" : "Pending"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DecisionForm
            companyName={currentCompanyState.name}
            sharePrice={currentCompanyState.sharePrice}
            netWorth={currentCompanyState.netWorth}
            cash={currentCompanyState.cash}
            employees={currentCompanyState.employees}
            machines={currentCompanyState.machines}
            salespeople={currentCompanyState.salespeople}
            assemblyWorkers={currentCompanyState.assemblyWorkers}
            productStarRatings={currentCompanyState.productStarRatings}
            productDevAccumulated={currentCompanyState.productDevAccumulated}
            currentQuarter={economy?.quarter || 1}
            creditworthiness={currentCompanyState.creditworthiness}
            onSubmit={(decisions) => handleDecisionChange(selectedPlayer, decisions)}
            onRunQuarter={config.humans > 1 ? () => handleRunQuarter() : undefined}
            onSubmitSinglePlayer={config.humans === 1 ? handleRunQuarter : undefined}
            isRunning={isRunning}
            allDecisionsReady={config.humans > 1 ? Array.from({ length: config.humans }).every((_, i) => allPlayerDecisions.has(i)) : true}
          />
        </div>
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
                    <tr key={idx} className={`border-b border-slate-700 ${
                      idx === selectedPlayer ? "bg-primary-500/10" : ""
                    }`}>
                      <td className="px-4 py-2 text-slate-300">
                        {report.company || `Company ${idx + 1}`}
                        {idx === selectedPlayer && (
                          <span className="ml-2 text-xs text-primary-400">(You)</span>
                        )}
                      </td>
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

          {/* Detailed Management Report for Selected Company */}
          {selectedPlayer !== null && reports[selectedPlayer] && (
            <ManagementReportDisplay
              report={reports[selectedPlayer]}
              companyName={reports[selectedPlayer].company || `Company ${selectedPlayer + 1}`}
            />
          )}

          {/* Button to run next quarter */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setReports(null);
                setError(null);
                // Clear all saved decisions for the new quarter
                setAllPlayerDecisions(new Map());
                // Reset to Company 1 for the new quarter
                setSelectedPlayer(0);
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Keep player selection locked for next quarter
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
