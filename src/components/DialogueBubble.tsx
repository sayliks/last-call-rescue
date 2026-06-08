import { ReactNode } from "react";

export type BubbleSpeaker = "npc" | "player" | "system";

interface DialogueBubbleProps {
  speaker: BubbleSpeaker;
  children: ReactNode;
  /** Small label above the bubble (e.g. caller name or "You"). */
  name?: string;
}

const speakerStyles: Record<BubbleSpeaker, string> = {
  npc: "self-start bg-night-panel text-slate-100 rounded-2xl rounded-bl-sm",
  player:
    "self-end bg-rescue-blue/90 text-white rounded-2xl rounded-br-sm shadow-lg shadow-rescue-blue/20",
  system:
    "self-center bg-white/5 text-slate-300 text-sm italic rounded-xl border border-white/10",
};

/**
 * A single chat bubble in the call transcript.
 * NPC messages sit left, the player's chosen line sits right, and system
 * notes (feedback / status) sit centered.
 */
export default function DialogueBubble({
  speaker,
  children,
  name,
}: DialogueBubbleProps) {
  return (
    <div
      className={`flex flex-col gap-1 max-w-[85%] animate-bubble-in ${
        speaker === "player"
          ? "items-end self-end"
          : speaker === "system"
            ? "items-center self-center max-w-[92%]"
            : "items-start self-start"
      }`}
    >
      {name && speaker !== "system" && (
        <span className="px-1 text-[11px] uppercase tracking-wide text-slate-400">
          {name}
        </span>
      )}
      <div className={`px-4 py-2.5 leading-relaxed ${speakerStyles[speaker]}`}>
        {children}
      </div>
    </div>
  );
}
