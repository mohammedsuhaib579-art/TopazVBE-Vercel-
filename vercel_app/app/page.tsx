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
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Built to run smoothly on Vercel
            </h2>
            <p className="max-w-2xl text-sm text-slate-300">
              Next.js App Router, serverless API routes, and Tailwind UI give you fast
              deploys, edge caching, and modern UX while keeping your simulation logic
              intact on the backend.
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


