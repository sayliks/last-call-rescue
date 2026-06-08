import Link from "next/link";
import { scenarios } from "@/data/scenarios";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-10">
      {/* Hero */}
      <section className="flex flex-1 flex-col justify-center text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-night-panel ring-1 ring-rescue-red/30">
          <span className="text-4xl" aria-hidden>
            📞
          </span>
        </div>

        <p className="text-sm font-medium uppercase tracking-[0.2em] text-rescue-red">
          Last Call Rescue
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-50">
          最后一通电话
        </h1>
        <p className="mt-3 text-base text-slate-300">
          AI Emergency Response Simulator
        </p>

        <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
          Step into the dispatcher&apos;s seat. Answer a call from someone in
          danger, ask the right questions, and make calm decisions that keep
          them safe until help arrives.
        </p>

        <Link
          href="/game"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-rescue-red px-8 py-4 text-base font-semibold text-white
            shadow-lg shadow-rescue-red/30 transition hover:bg-rescue-red/90 active:scale-[0.98]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-rescue-red focus-visible:ring-offset-2 focus-visible:ring-offset-night"
        >
          <span aria-hidden>▶</span> Answer the Call
        </Link>

        {/* Scenario preview */}
        <div className="mt-8">
          <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">
            {scenarios.length} scenarios to practice
          </p>
          <div className="flex justify-center gap-2">
            {scenarios.map((s) => (
              <span
                key={s.id}
                className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300"
              >
                <span aria-hidden>{s.icon}</span>
                {s.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Social impact */}
      <section className="mt-10 rounded-2xl border border-white/10 bg-night-soft/60 p-5">
        <h2 className="text-sm font-semibold text-slate-100">
          Why this matters
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          In an emergency, the minutes before responders arrive can decide an
          outcome — yet most people have never practiced what to do. Last Call
          Rescue turns life-saving basics into a calm, repeatable rehearsal, so
          good instincts feel familiar when they matter most.
        </p>
      </section>

      {/* Disclaimer */}
      <footer className="mt-6 text-center">
        <p className="text-xs leading-relaxed text-slate-500">
          For public education only. This game does not provide medical advice
          and does not replace professional emergency guidance. In a real
          emergency, call your local emergency number immediately.
        </p>
      </footer>
    </main>
  );
}
