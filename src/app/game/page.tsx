"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Scenario, scenarios } from "@/data/scenarios";
import {
  GameState,
  createInitialState,
  saveResult,
} from "@/lib/game-engine";
import PhoneCallScreen from "@/components/PhoneCallScreen";

type Phase =
  | { step: "select" }
  | { step: "call"; scenario: Scenario; state: GameState };

export default function GamePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ step: "select" });

  const startScenario = useCallback((scenario: Scenario) => {
    setPhase({ step: "call", scenario, state: createInitialState(scenario) });
  }, []);

  const handleStateChange = useCallback((next: GameState) => {
    setPhase((prev) =>
      prev.step === "call" ? { ...prev, state: next } : prev,
    );
  }, []);

  const handleFinished = useCallback(
    (finalState: GameState) => {
      saveResult(finalState);
      // Small delay matches the "preparing debrief" copy in the call screen.
      window.setTimeout(() => router.push("/result"), 700);
    },
    [router],
  );

  if (phase.step === "select") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8">
        <header className="mb-6">
          <Link
            href="/"
            className="text-sm text-slate-400 transition hover:text-slate-200"
          >
            ← Home
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-50">
            Choose a call
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Each scenario is a short, branching emergency. Pick one to begin.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          {scenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => startScenario(s)}
              className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-night-soft/70 p-4 text-left transition
                hover:border-rescue-red/50 hover:bg-night-panel active:scale-[0.99]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-rescue-red"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-night-panel text-2xl">
                {s.icon}
              </span>
              <span className="min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className="font-semibold text-slate-100">
                    {s.title}
                  </span>
                  <span className="text-xs text-slate-500">{s.titleZh}</span>
                </span>
                <span className="mt-1 block text-sm leading-snug text-slate-400">
                  {s.summary}
                </span>
              </span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-slate-500">
          For public education only — not medical advice, and not a substitute
          for professional emergency guidance.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col">
      {/* The phone frame fills the viewport on mobile for an immersive call. */}
      <div className="flex h-screen flex-col bg-night/40 sm:my-4 sm:h-[calc(100vh-2rem)] sm:rounded-3xl sm:border sm:border-white/10 sm:shadow-2xl sm:shadow-black/40 overflow-hidden">
        <PhoneCallScreen
          scenario={phase.scenario}
          state={phase.state}
          onStateChange={handleStateChange}
          onFinished={handleFinished}
        />
      </div>
    </main>
  );
}
