import { Choice } from "@/data/scenarios";

interface ChoiceButtonProps {
  choice: Choice;
  index: number;
  disabled?: boolean;
  onSelect: (choice: Choice) => void;
}

/**
 * A tappable response option. Quality is intentionally NOT revealed before the
 * player chooses — feedback comes only after, so the decision stays genuine.
 */
export default function ChoiceButton({
  choice,
  index,
  disabled,
  onSelect,
}: ChoiceButtonProps) {
  const letter = String.fromCharCode(65 + index); // A, B, C…

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(choice)}
      className="group flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-night-soft/80 px-4 py-3.5 text-left transition
        hover:border-rescue-blue/60 hover:bg-night-panel active:scale-[0.99]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-rescue-blue
        disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15
          text-xs font-semibold text-slate-300 transition group-hover:border-rescue-blue/60 group-hover:text-white"
      >
        {letter}
      </span>
      <span className="text-[15px] leading-snug text-slate-100">
        {choice.text}
      </span>
    </button>
  );
}
