import { SCORE_KEYS, SCORE_LABELS } from "@/lib/game-engine";
import { Scores } from "@/data/scenarios";

interface ScorePanelProps {
  scores: Scores;
  /** Compact variant for the in-call header; full variant for the result page. */
  variant?: "compact" | "full";
}

function barColor(value: number): string {
  if (value >= 70) return "bg-rescue-green";
  if (value >= 45) return "bg-rescue-amber";
  return "bg-rescue-red";
}

/**
 * Visualizes the three rescue skills. Used both as a slim HUD during the call
 * and as a detailed breakdown in the debrief.
 */
export default function ScorePanel({ scores, variant = "compact" }: ScorePanelProps) {
  const compact = variant === "compact";

  return (
    <div
      className={
        compact
          ? "flex items-center gap-3"
          : "grid gap-4 sm:grid-cols-3"
      }
    >
      {SCORE_KEYS.map((key) => {
        const label = SCORE_LABELS[key];
        const value = scores[key];
        return (
          <div
            key={key}
            className={compact ? "flex-1 min-w-0" : "rounded-2xl bg-night-soft/70 p-4 border border-white/10"}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span
                className={`flex items-center gap-1 ${
                  compact ? "text-[11px]" : "text-sm"
                } text-slate-300`}
              >
                <span aria-hidden>{label.icon}</span>
                <span className="truncate">
                  {compact ? label.en : `${label.en} · ${label.zh}`}
                </span>
              </span>
              <span
                className={`tabular-nums ${
                  compact ? "text-[11px]" : "text-base font-semibold"
                } text-slate-100`}
              >
                {value}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor(value)}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
