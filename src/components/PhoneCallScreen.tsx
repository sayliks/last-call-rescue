"use client";

import { useEffect, useRef, useState } from "react";
import { Choice, Scenario } from "@/data/scenarios";
import {
  GameState,
  applyChoice,
  getCurrentRound,
  getTotalRounds,
} from "@/lib/game-engine";
import DialogueBubble from "@/components/DialogueBubble";
import ChoiceButton from "@/components/ChoiceButton";
import ScorePanel from "@/components/ScorePanel";

interface PhoneCallScreenProps {
  scenario: Scenario;
  state: GameState;
  onStateChange: (next: GameState) => void;
  onFinished: (finalState: GameState) => void;
}

/** One line in the rendered transcript. */
type TranscriptEntry =
  | { kind: "npc"; text: string; name: string }
  | { kind: "player"; text: string }
  | { kind: "feedback"; text: string; quality: Choice["quality"] };

const FEEDBACK_PREFIX: Record<Choice["quality"], string> = {
  good: "✓ ",
  ok: "• ",
  bad: "! ",
};

/**
 * The phone-call interface: a chat transcript of the caller's messages and the
 * player's chosen replies, plus the current round's choices. All scoring lives
 * in the engine; this component only renders and forwards the chosen `Choice`.
 */
export default function PhoneCallScreen({
  scenario,
  state,
  onStateChange,
  onFinished,
}: PhoneCallScreenProps) {
  const round = getCurrentRound(state);
  const totalRounds = getTotalRounds(state);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [awaitingNext, setAwaitingNext] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Round IDs whose NPC messages are already in the transcript. A ref (not
  // state) keeps seeding idempotent even under Strict Mode's double-invoked
  // effects, so the opening messages never get appended twice.
  const seededRounds = useRef<Set<string>>(new Set());

  // Seed the NPC messages once per round, as we enter it.
  const npcKey = round?.id ?? "none";

  useEffect(() => {
    if (!round || seededRounds.current.has(round.id)) return;
    seededRounds.current.add(round.id);
    setTranscript((prev) => [
      ...prev,
      ...round.npcMessages.map((text) => ({
        kind: "npc" as const,
        text,
        name: scenario.caller,
      })),
    ]);
    setAwaitingNext(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npcKey]);

  // Keep the latest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [transcript]);

  function handleSelect(choice: Choice) {
    if (awaitingNext) return;

    // Show the player's line and the immediate dispatcher feedback.
    setTranscript((prev) => [
      ...prev,
      { kind: "player", text: choice.text },
      { kind: "feedback", text: choice.feedback, quality: choice.quality },
    ]);
    setAwaitingNext(true);

    const next = applyChoice(state, choice);

    // Brief beat so the player can read the feedback before advancing.
    window.setTimeout(() => {
      onStateChange(next);
      if (next.finished) {
        onFinished(next);
      }
    }, 850);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Call header */}
      <header className="flex items-center gap-3 border-b border-white/10 bg-night-soft/80 px-4 py-3 backdrop-blur">
        <div className="relative flex h-11 w-11 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-rescue-green/30 animate-pulse-ring" />
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-night-panel text-xl">
            {scenario.icon}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100">
            {scenario.caller}
          </p>
          <p className="truncate text-xs text-slate-400">{scenario.location}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-rescue-green">
            ● Live
          </p>
          <p className="text-xs tabular-nums text-slate-400">
            Round {Math.min(state.roundIndex + 1, totalRounds)} / {totalRounds}
          </p>
        </div>
      </header>

      {/* Score HUD */}
      <div className="border-b border-white/10 bg-night/60 px-4 py-2">
        <ScorePanel scores={state.scores} variant="compact" />
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="scroll-soft flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5"
      >
        {transcript.map((entry, i) => {
          if (entry.kind === "npc") {
            return (
              <DialogueBubble key={i} speaker="npc" name={entry.name}>
                {entry.text}
              </DialogueBubble>
            );
          }
          if (entry.kind === "player") {
            return (
              <DialogueBubble key={i} speaker="player" name="You (Dispatcher)">
                {entry.text}
              </DialogueBubble>
            );
          }
          return (
            <DialogueBubble key={i} speaker="system">
              <span
                className={
                  entry.quality === "good"
                    ? "text-rescue-green"
                    : entry.quality === "bad"
                      ? "text-rescue-red"
                      : "text-rescue-amber"
                }
              >
                {FEEDBACK_PREFIX[entry.quality]}
                {entry.text}
              </span>
            </DialogueBubble>
          );
        })}
      </div>

      {/* Choices / prompt */}
      <div className="border-t border-white/10 bg-night-soft/80 px-4 py-4">
        {round && !state.finished ? (
          <>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
              {round.prompt}
            </p>
            <div className="flex flex-col gap-2.5">
              {round.choices.map((choice, i) => (
                <ChoiceButton
                  key={choice.id}
                  choice={choice}
                  index={i}
                  disabled={awaitingNext}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="py-2 text-center text-sm text-slate-400">
            Call complete — preparing your debrief…
          </p>
        )}
      </div>
    </div>
  );
}
