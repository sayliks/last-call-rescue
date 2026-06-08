// ============================================================================
// Last Call Rescue — Game engine
//
// Pure, framework-agnostic logic for running a scenario:
//   - tracks the current round and accumulated scores
//   - applies choice effects (clamped 0–100)
//   - records the player's decisions for the debrief
//   - derives an ending from the final scores
//
// Kept free of React/Next so it can be unit-tested or reused on a server later.
// ============================================================================

import {
  Choice,
  Round,
  Scenario,
  ScoreKey,
  Scores,
  getScenario,
} from "@/data/scenarios";

export const SCORE_KEYS: ScoreKey[] = ["calmness", "judgment", "knowledge"];

export const SCORE_LABELS: Record<ScoreKey, { en: string; zh: string; icon: string }> = {
  calmness: { en: "Calmness", zh: "冷静", icon: "🧘" },
  judgment: { en: "Judgment", zh: "判断", icon: "🧭" },
  knowledge: { en: "Knowledge", zh: "急救知识", icon: "📘" },
};

/** Everyone starts from a neutral-competent baseline. */
export const STARTING_SCORE = 50;

export type EndingType = "success" | "partial" | "failed";

export interface DecisionRecord {
  roundId: string;
  prompt: string;
  choiceText: string;
  quality: Choice["quality"];
  feedback: string;
}

export interface GameState {
  scenarioId: string;
  roundIndex: number;
  scores: Scores;
  decisions: DecisionRecord[];
  /** True once the player has answered the final round. */
  finished: boolean;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function createInitialState(scenario: Scenario): GameState {
  return {
    scenarioId: scenario.id,
    roundIndex: 0,
    scores: {
      calmness: STARTING_SCORE,
      judgment: STARTING_SCORE,
      knowledge: STARTING_SCORE,
    },
    decisions: [],
    finished: false,
  };
}

export function getCurrentRound(state: GameState): Round | undefined {
  const scenario = getScenario(state.scenarioId);
  return scenario?.rounds[state.roundIndex];
}

export function getTotalRounds(state: GameState): number {
  return getScenario(state.scenarioId)?.rounds.length ?? 0;
}

function applyEffects(scores: Scores, effects: Partial<Scores>): Scores {
  return {
    calmness: clamp(scores.calmness + (effects.calmness ?? 0)),
    judgment: clamp(scores.judgment + (effects.judgment ?? 0)),
    knowledge: clamp(scores.knowledge + (effects.knowledge ?? 0)),
  };
}

/**
 * Apply a choice for the current round and advance.
 * Returns a brand-new state object (never mutates the input) so React state
 * updates stay predictable.
 */
export function applyChoice(state: GameState, choice: Choice): GameState {
  const round = getCurrentRound(state);
  if (!round || state.finished) return state;

  const scores = applyEffects(state.scores, choice.effects);
  const decisions: DecisionRecord[] = [
    ...state.decisions,
    {
      roundId: round.id,
      prompt: round.prompt,
      choiceText: choice.text,
      quality: choice.quality,
      feedback: choice.feedback,
    },
  ];

  const nextIndex = state.roundIndex + 1;
  const finished = nextIndex >= getTotalRounds(state);

  return {
    ...state,
    roundIndex: finished ? state.roundIndex : nextIndex,
    scores,
    decisions,
    finished,
  };
}

export function averageScore(scores: Scores): number {
  const total = SCORE_KEYS.reduce((sum, key) => sum + scores[key], 0);
  return Math.round(total / SCORE_KEYS.length);
}

/**
 * Map final performance to an ending.
 * Uses both the average and the weakest dimension so that one badly-handled
 * area (e.g. a dangerous action) can pull the ending down.
 */
export function determineEnding(state: GameState): EndingType {
  const avg = averageScore(state.scores);
  const lowest = Math.min(...SCORE_KEYS.map((k) => state.scores[k]));
  const badCount = state.decisions.filter((d) => d.quality === "bad").length;

  if (avg >= 70 && lowest >= 55 && badCount === 0) return "success";
  if (avg >= 50 && badCount <= 1) return "partial";
  return "failed";
}

export const ENDING_META: Record<
  EndingType,
  { label: string; labelZh: string; tone: string; headline: string }
> = {
  success: {
    label: "Rescue Successful",
    labelZh: "成功救援",
    tone: "green",
    headline: "You kept them safe until help arrived.",
  },
  partial: {
    label: "Partial Rescue",
    labelZh: "部分成功",
    tone: "amber",
    headline: "Help arrived, but some moments could have gone better.",
  },
  failed: {
    label: "Critical Delay",
    labelZh: "救援受阻",
    tone: "red",
    headline: "The situation grew more dangerous than it needed to.",
  },
};

// ----------------------------------------------------------------------------
// Lightweight persistence (sessionStorage) so the game → result handoff works
// without a database. Safe to call on the server (guards on `window`).
// ----------------------------------------------------------------------------
const STORAGE_KEY = "lcr:last-result";

export interface StoredResult {
  scenarioId: string;
  scores: Scores;
  decisions: DecisionRecord[];
  ending: EndingType;
}

export function saveResult(state: GameState): StoredResult {
  const result: StoredResult = {
    scenarioId: state.scenarioId,
    scores: state.scores,
    decisions: state.decisions,
    ending: determineEnding(state),
  };
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch {
      // Storage may be unavailable (private mode); the result page handles null.
    }
  }
  return result;
}

export function loadResult(): StoredResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredResult) : null;
  } catch {
    return null;
  }
}

export function clearResult(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
