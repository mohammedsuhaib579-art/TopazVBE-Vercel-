import Link from "next/link";

const features = [
  {
    title: "Guided Onboarding",
    body: "Step-by-step flows that start simple and progressively unlock full Topaz-style complexity."
  },
  {
    title: "Deep Simulation",
    body: "Demand, production, and finance mechanics that mirror your original Python engine."
  },
  {
    title: "Gamified Learning",
    body: "Scores, badges, and debrief prompts that turn decisions into sticky learning."
  }
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col gap-10">
      <section className="grid gap-10 md:grid-cols-[3fr_2fr] md:items-center">
        <div className="space-y-6">
          <div className="pill">Topaz‑VBE • Vercel Edition</div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Leftovers Business Simulation
          </h1>
          <p className="max-w-xl text-balance text-base text-slate-300 sm:text-lg">
            Run a manufacturing company through quarters of competition, shocks, and
            trade‑offs. Make marketing, operations, people, and finance calls—and watch
            how they move share price, cash, and risk.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/simulate"
              className="inline-flex items-center justify-center rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-600"
            >
              Launch Simulation
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-slate-500"
            >
              How it works
            </a>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
            <span>Multi‑player capable</span>
            <span>AI competitors (backend)</span>
            <span>Optimised for Vercel</span>
          </div>
        </div>

        <div className="card-gradient relative overflow-hidden">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-black/10 blur-3xl" />
          <div className="relative flex h-full flex-col gap-4 p-6">
            <h2 className="text-lg font-semibold">Quarter Snapshot</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-xs text-white/70">Share Price</div>
                <div className="text-xl font-semibold">£1.24</div>
                <div className="text-xs text-emerald-200">+12% vs last Q</div>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-xs text-white/70">Net Profit</div>
                <div className="text-xl font-semibold">£420k</div>
                <div className="text-xs text-emerald-200">Healthy margin</div>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-xs text-white/70">People / ESG</div>
                <div className="text-xl font-semibold">82 / 100</div>
                <div className="text-xs text-amber-100">Training‑heavy strategy</div>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-xs text-white/70">Risk</div>
                <div className="text-xl font-semibold">Moderate</div>
                <div className="text-xs text-sky-100">Within overdraft limit</div>
              </div>
            </div>
            <p className="mt-1 text-xs text-white/80">
              Under the hood, this front‑end talks to a serverless engine that mirrors
              your original Topaz decision logic.
            </p>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8"
      >
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl mb-2">
            📖 How It Works
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Learn how to play and master the Leftovers Business Simulation
          </p>
        </div>

        <div className="space-y-8">
          {/* Game Overview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span> Game Overview
            </h3>
            <p className="text-slate-300 mb-4">
              You control a manufacturing company competing in a dynamic market. Each quarter, you make strategic decisions across four key areas that directly impact your company's performance, market share, and ultimately, your share price.
            </p>
            <p className="text-slate-300">
              The game runs in quarters, and you compete against other companies (AI-controlled or human players). Your goal is to maximize your <strong className="text-white">share price</strong> through smart decision-making.
            </p>
          </div>

          {/* Decision Categories */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚙️</span> Decision Categories
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-primary-400 mb-2">1. Marketing Decisions</h4>
                  <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                    <li>Set prices for home and export markets</li>
                    <li>Allocate advertising budget (Trade Press, Support, Merchandising)</li>
                    <li>Invest in product development</li>
                    <li>Allocate salespeople to different market areas</li>
                    <li>Set credit terms for customers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-400 mb-2">2. Operations & Production</h4>
                  <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                    <li>Choose shift level (affects machine hours and workforce)</li>
                    <li>Order materials from suppliers</li>
                    <li>Schedule production deliveries</li>
                    <li>Set maintenance hours for machines</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-primary-400 mb-2">3. Personnel Management</h4>
                  <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                    <li>Recruit, train, or dismiss salespeople</li>
                    <li>Recruit, train, or dismiss assembly workers</li>
                    <li>Set wage rates and salaries</li>
                    <li>Manage workforce capacity</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-400 mb-2">4. Finance & Strategy</h4>
                  <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                    <li>Set dividend payments (Q1 and Q3 only)</li>
                    <li>Order or sell machines and vehicles</li>
                    <li>Purchase market intelligence</li>
                    <li>Manage cash flow and debt</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* How Winners Are Decided */}
          <div className="rounded-2xl border border-primary-500/30 bg-gradient-to-br from-slate-900/80 to-primary-900/20 p-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏆</span> How Winners Are Decided
            </h3>
            <p className="text-slate-300 mb-4">
              The winner is determined by the <strong className="text-white">highest share price</strong> at the end of the game. Share price is calculated each quarter using this formula:
            </p>
            <div className="bg-slate-950/50 rounded-lg p-4 mb-4 border border-slate-700">
              <p className="text-sm text-slate-400 mb-2">Share Price Formula:</p>
              <p className="text-primary-300 font-mono text-sm">
                Share Price = max(0.1, 50% × Previous Price + 30% × (Net Worth ÷ Shares) + 5 × Earnings Per Share + 3 × Dividends Per Share)
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-emerald-400 mb-2">Key Factors That Boost Share Price:</h4>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong>Net Worth:</strong> Higher net worth (assets minus liabilities) increases share price. Build valuable assets like machines, vehicles, and inventory.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong>Earnings Per Share (EPS):</strong> Higher profits directly boost share price. Maximize revenue while controlling costs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong>Dividends Per Share (DPS):</strong> Paying dividends (in Q1 and Q3) rewards shareholders and increases share price. Balance dividends with reinvestment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong>Momentum:</strong> Previous share price matters (50% weight), so consistent performance builds value over time.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Competitive Market */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
              <span className="text-2xl">🌐</span> Competitive Market Dynamics
            </h3>
            <p className="text-slate-300 mb-4">
              Your decisions directly affect market share and sales:
            </p>
            <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
              <li><strong>Pricing Strategy:</strong> Lower prices can increase sales volume but reduce profit margins. Higher prices may reduce volume but improve margins.</li>
              <li><strong>Advertising:</strong> Higher advertising spending can capture market share from competitors, but costs money.</li>
              <li><strong>Product Quality:</strong> Investing in product development improves customer demand and allows premium pricing.</li>
              <li><strong>Sales Force:</strong> Allocating more salespeople to high-demand areas increases sales potential.</li>
              <li><strong>Competitor Actions:</strong> Other companies' pricing, advertising, and quality decisions affect your market share.</li>
            </ul>
          </div>

          {/* Winning Strategy Tips */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900/80 to-amber-900/20 p-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span> Winning Strategy Tips
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-400">Short-Term Tactics</h4>
                <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                  <li>Balance price and volume to maximize revenue</li>
                  <li>Invest in advertising to capture market share</li>
                  <li>Maintain adequate inventory to meet demand</li>
                  <li>Pay dividends in Q1 and Q3 to boost share price</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-400">Long-Term Strategy</h4>
                <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                  <li>Invest in product development for quality advantage</li>
                  <li>Build production capacity (machines, workers)</li>
                  <li>Maintain healthy cash flow and avoid excessive debt</li>
                  <li>Train and retain skilled workforce</li>
                  <li>Monitor competitors and adapt your strategy</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Game Flow */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔄</span> Game Flow
            </h3>
            <ol className="text-sm text-slate-300 space-y-3 list-decimal list-inside">
              <li><strong>Select Players:</strong> Choose single-player (vs AI) or multiplayer (2-8 human players)</li>
              <li><strong>Make Decisions:</strong> Fill out decision forms for Marketing, Operations, Personnel, and Finance</li>
              <li><strong>Save Decisions:</strong> Save your decisions (in multiplayer, all players must save before proceeding)</li>
              <li><strong>Run Quarter:</strong> The simulation processes all decisions and calculates results</li>
              <li><strong>Review Results:</strong> View detailed management reports showing sales, profits, share price, and more</li>
              <li><strong>Repeat:</strong> Continue to the next quarter and refine your strategy</li>
              <li><strong>Win:</strong> The company with the highest share price at the end wins!</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}


