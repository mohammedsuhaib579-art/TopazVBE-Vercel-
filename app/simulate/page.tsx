"use client";

import { useState } from "react";

type PlayerConfig = {
  humans: number;
};

export default function SimulatePage() {
  const [config, setConfig] = useState<PlayerConfig>({ humans: 1 });
  const [isRunning, setIsRunning] = useState(false);
  const [resultSummary, setResultSummary] = useState<string | null>(null);

  const handleRunQuarter = async () => {
    setIsRunning(true);
    setResultSummary(null);
    try {
      // Placeholder – here you would POST decisions to an API route
      // that wraps your Python/Topaz simulation logic.
      await new Promise((resolve) => setTimeout(resolve, 800));
      setResultSummary(
        "Quarter simulated (stub). Hook this button up to an API route that calls the Topaz engine."
      );
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
          This page mirrors the Streamlit experience: start from a clean onboarding
          panel, choose your player setup, then move through Marketing → Operations →
          People → Finance decisions with clear groupings.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[2fr_3fr]">
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-semibold text-slate-100">
            Game Setup
          </h2>
          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-slate-300">
                <span>Number of human players</span>
                <span className="rounded-full bg-slate-800 px-3 py-0.5 text-[11px] text-slate-200">
                  {config.humans} selected
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={8}
                value={config.humans}
                onChange={(e) =>
                  setConfig({ humans: Number(e.target.value) })
                }
                className="w-full accent-primary-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Solo vs AI</span>
                <span>Full multi‑player</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-900 p-3">
                <div className="text-slate-400">Human players</div>
                <div className="mt-1 text-xl font-semibold text-slate-50">
                  {config.humans}
                </div>
              </div>
              <div className="rounded-xl bg-slate-900 p-3">
                <div className="text-slate-400">AI companies</div>
                <div className="mt-1 text-xl font-semibold text-slate-50">
                  {aiPlayers}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              With 1 human player, the remaining 7 companies are controlled by AI.
              With 2–8 humans, the table is entirely player‑driven.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-semibold text-slate-100">
            Decision canvas (high‑level)
          </h2>
          <p className="text-xs text-slate-300">
            In a full port, this panel becomes a multi‑tab form mirroring your
            Streamlit expanders: prices & advertising, production & materials, HR,
            fixed assets, and information purchases. For now, the button below is
            wired to a stub so the front‑end is deployable to Vercel immediately.
          </p>
          <button
            onClick={handleRunQuarter}
            disabled={isRunning}
            className="inline-flex items-center justify-center rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? "Running quarter…" : "Run quarter (stub)"}
          </button>
          {resultSummary && (
            <p className="mt-2 text-xs text-emerald-300">{resultSummary}</p>
          )}
        </div>
      </section>
    </main>
  );
}


