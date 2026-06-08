"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StoredResult, clearResult, loadResult } from "@/lib/game-engine";
import ResultReport from "@/components/ResultReport";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<StoredResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setResult(loadResult());
    setReady(true);
  }, []);

  function handleRestart() {
    clearResult();
    router.push("/game");
  }

  // No result in session (e.g. opened directly or after a refresh-clear).
  if (ready && !result) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-5 text-center">
        <p className="text-2xl" aria-hidden>
          📭
        </p>
        <h1 className="mt-3 text-lg font-semibold text-slate-100">
          No call to review yet
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Start a scenario to receive your rescue debrief.
        </p>
        <Link
          href="/game"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-rescue-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-rescue-red/90"
        >
          Start a call
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <header className="mb-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-rescue-red">
          Last Call Rescue
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-50">Call Debrief</h1>
      </header>

      {!ready || !result ? (
        <div className="space-y-4" aria-hidden>
          <div className="h-40 animate-pulse rounded-3xl bg-white/5" />
          <div className="h-24 animate-pulse rounded-3xl bg-white/5" />
        </div>
      ) : (
        <ResultReport result={result} />
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleRestart}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rescue-red px-6 py-3.5 text-sm font-semibold text-white
            shadow-lg shadow-rescue-red/30 transition hover:bg-rescue-red/90 active:scale-[0.99]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-rescue-red"
        >
          <span aria-hidden>↻</span> Try another call
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-6 py-3 text-sm text-slate-300 transition hover:bg-white/5"
        >
          Back to home
        </Link>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
        For public education only. Not medical advice and not a replacement for
        professional emergency guidance.
      </p>
    </main>
  );
}
