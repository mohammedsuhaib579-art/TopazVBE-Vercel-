import Link from "next/link";

const features = [
  {
    title: "Guided Onboarding",
    body: "Step-by-step flows that start simple and progressively unlock the full Topaz-style complexity.",
  },
  {
    title: "Deep Simulation",
    body: "Rich demand, production, and finance mechanics model real-world trade-offs over multiple quarters.",
  },
  {
    title: "Gamified Learning",
    body: "Scores, badges, and debrief prompts turn decisions into repeatable, coachable learning loops.",
  },
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
            Run a manufacturing company across markets, quarters, and shocks. Make
            marketing, production, people, and finance calls—and see how your strategy
            moves share price, cashflow, and risk.
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
            <span>Multi‑player ready</span>
            <span>AI competitors (server-side)</span>
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
                <div className="text-xs text-white/70">ESG / People</div>
                <div className="text-xl font-semibold">82 / 100</div>
                <div className="text-xs text-amber-100">Investing in training</div>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-xs text-white/70">Risk</div>
                <div className="text-xl font-semibold">Moderate</div>
                <div className="text-xs text-sky-100">Within overdraft limit</div>
              </div>
            </div>
            <p className="mt-1 text-xs text-white/80">
              Decisions run server‑side in a Topaz‑style engine and feed back rich
              analytics and debrief prompts.
            </p>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8"
      >
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Built for serious learning, not just clicks
            </h2>
            <p className="max-w-2xl text-sm text-slate-300">
              The Vercel version keeps the underlying Topaz dynamics, but wraps it in a
              modern, responsive interface with clear flows and multiplayer in mind.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <h3 className="text-sm font-semibold text-slate-50">{f.title}</h3>
              <p className="text-xs text-slate-300">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


