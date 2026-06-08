// ============================================================================
// Last Call Rescue — AI debrief layer (mockable)
//
// The game asks for a short, supportive "AI dispatcher debrief" after a call.
// For the MVP this is generated locally with no API key required. The real
// integration later only needs to implement `ReviewProvider` and be swapped in
// at `getReviewProvider()` — nothing else in the app changes.
// ============================================================================

import { getScenario } from "@/data/scenarios";
import {
  DecisionRecord,
  ENDING_META,
  EndingType,
  SCORE_KEYS,
  SCORE_LABELS,
  Scores,
  averageScore,
} from "@/lib/game-engine";

export interface ReviewRequest {
  scenarioId: string;
  scores: Scores;
  ending: EndingType;
  decisions: DecisionRecord[];
}

export interface Debrief {
  /** 1–2 sentence empathetic summary of how the call went. */
  summary: string;
  /** Concrete things the player did well. */
  strengths: string[];
  /** Gentle, specific suggestions for next time. */
  improvements: string[];
  /** The safety takeaway tied to this scenario's learning goal. */
  keyTakeaway: string;
  /** Always-on reminder that this is education, not professional guidance. */
  disclaimer: string;
  /** Identifies which engine produced the text — handy when wiring a real API. */
  source: "mock" | "api";
}

export interface ReviewProvider {
  generateDebrief(request: ReviewRequest): Promise<Debrief>;
}

export const SAFETY_DISCLAIMER =
  "This debrief is for public education only. It is not medical or emergency advice and does not replace professional responders. In a real emergency, contact your local emergency number immediately.";

// ----------------------------------------------------------------------------
// Mock provider — deterministic, content-aware, no network.
// ----------------------------------------------------------------------------
function pickStrengths(decisions: DecisionRecord[]): string[] {
  const good = decisions.filter((d) => d.quality === "good");
  if (good.length === 0) {
    return ["You stayed on the line and saw the call through to the end."];
  }
  return good.slice(0, 3).map((d) => d.feedback);
}

function pickImprovements(decisions: DecisionRecord[]): string[] {
  const weak = decisions.filter((d) => d.quality !== "good");
  if (weak.length === 0) {
    return ["Keep practicing — your instincts here were consistently strong."];
  }
  return weak.slice(0, 3).map((d) => d.feedback);
}

function summarize(
  ending: EndingType,
  scores: Scores,
  decisions: DecisionRecord[],
): string {
  const avg = averageScore(scores);
  const goodCount = decisions.filter((d) => d.quality === "good").length;
  const headline = ENDING_META[ending].headline;

  if (ending === "success") {
    return `${headline} You made ${goodCount} strong calls and kept your composure, scoring ${avg}/100 overall.`;
  }
  if (ending === "partial") {
    return `${headline} You got the essentials right in places (overall ${avg}/100); a few choices added avoidable risk.`;
  }
  return `${headline} Some decisions raised the danger for the caller (overall ${avg}/100). The good news: every point here is learnable.`;
}

/** Highlight the dimension that needs the most work, by name. */
function lowestDimensionNote(scores: Scores): string {
  let lowestKey = SCORE_KEYS[0];
  for (const key of SCORE_KEYS) {
    if (scores[key] < scores[lowestKey]) lowestKey = key;
  }
  const label = SCORE_LABELS[lowestKey];
  return `Your lowest dimension was ${label.en} (${label.zh}) at ${scores[lowestKey]}/100 — a good focus for next time.`;
}

export class MockReviewProvider implements ReviewProvider {
  async generateDebrief(request: ReviewRequest): Promise<Debrief> {
    const scenario = getScenario(request.scenarioId);
    const improvements = pickImprovements(request.decisions);
    improvements.push(lowestDimensionNote(request.scores));

    // Small delay so the UI can show a believable "AI is reviewing…" state.
    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
      summary: summarize(request.ending, request.scores, request.decisions),
      strengths: pickStrengths(request.decisions),
      improvements,
      keyTakeaway:
        scenario?.learningGoal ??
        "Stay calm, get the person to safety, and let professionals take over as soon as they arrive.",
      disclaimer: SAFETY_DISCLAIMER,
      source: "mock",
    };
  }
}

// ----------------------------------------------------------------------------
// Provider selection
//
// Today this always returns the mock. To go live later, implement an
// `ApiReviewProvider` that calls your endpoint and return it here when an
// env flag / key is present — e.g.:
//
//   if (process.env.NEXT_PUBLIC_USE_AI === "1") return new ApiReviewProvider();
//
// The rest of the app calls `generateDebrief` and is agnostic to the source.
// ----------------------------------------------------------------------------
let cachedProvider: ReviewProvider | null = null;

export function getReviewProvider(): ReviewProvider {
  if (!cachedProvider) {
    cachedProvider = new MockReviewProvider();
  }
  return cachedProvider;
}

export function generateDebrief(request: ReviewRequest): Promise<Debrief> {
  return getReviewProvider().generateDebrief(request);
}
