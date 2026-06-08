# Last Call Rescue · 最后一通电话

**AI Emergency Response Simulator** — a public-welfare interactive narrative game.

You play the dispatcher. A call comes in from someone in danger. You ask the
right questions, choose calm and safe actions across a few rounds, and receive
a rescue outcome plus an AI-style debrief. It's a low-stakes way to rehearse
the basics of staying calm and helping safely until professionals arrive.

> ⚠️ **For public education only.** This game does not provide medical advice
> and does not replace professional emergency guidance. In a real emergency,
> contact your local emergency number immediately.

---

## Features

- 📞 **Phone-call style UI** — an immersive chat/call interface, mobile-first.
- 🎭 **3 branching scenarios** — campus heatstroke, an elderly fall at home, and
  a fire evacuation.
- 📊 **Three-skill scoring** — Calmness (冷静), Judgment (判断), and Knowledge
  (急救知识), tracked live during the call.
- 🤖 **AI debrief** — an empathetic, specific review of your call. Runs locally
  in demo mode with **no API key required**, behind a swappable interface.
- 🎯 **Three endings** — Rescue Successful / Partial Rescue / Critical Delay,
  derived from your performance.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **No database** — scenario content lives in `src/data/scenarios.ts`;
  the game → result handoff uses `sessionStorage`.

## Getting started

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

## Project structure

```text
src/
├─ app/
│  ├─ page.tsx          # Home: title, start button, social impact, disclaimer
│  ├─ game/page.tsx     # Scenario picker + live call
│  └─ result/page.tsx   # Ending, scores, AI debrief, restart
├─ components/
│  ├─ PhoneCallScreen.tsx   # Call header + transcript + choices (the centerpiece)
│  ├─ DialogueBubble.tsx    # One chat bubble (npc / player / system)
│  ├─ ChoiceButton.tsx      # A tappable response option
│  ├─ ScorePanel.tsx        # Three-skill bars (compact HUD + full breakdown)
│  └─ ResultReport.tsx      # Ending banner + scores + AI debrief
├─ data/
│  └─ scenarios.ts      # All game content + shared types
├─ lib/
│  ├─ game-engine.ts    # Pure scoring / rounds / endings + session persistence
│  └─ ai-review.ts      # Mockable AI debrief provider
└─ styles/
   └─ globals.css       # Tailwind layers + theme touches
```

## How it works

1. **`data/scenarios.ts`** holds everything the game says. Each `Scenario` has
   3–5 `Round`s; each round has NPC messages, a prompt, and 2–3 `Choice`s. Every
   choice carries `effects` (score deltas), a `quality` (`good`/`ok`/`bad`), and
   short `feedback`.
2. **`lib/game-engine.ts`** is pure logic: it applies a choice (clamping scores
   to 0–100), records the decision, advances the round, and — at the end —
   derives the ending from the average score, the weakest dimension, and how
   many risky choices were made. It also saves/loads the result via
   `sessionStorage` so no backend is needed.
3. **`lib/ai-review.ts`** turns the finished call into a supportive debrief.
   The `MockReviewProvider` builds this locally from your actual decisions.

## Adding a scenario

Append a new object to the `scenarios` array in `src/data/scenarios.ts`,
following the existing shape (give it 3–5 rounds, each with 2–3 choices). It
will appear automatically on the home page and in the picker — no other changes
needed.

## Wiring a real AI later

The app never calls the AI directly; it goes through `getReviewProvider()` in
`src/lib/ai-review.ts`. To go live:

1. Implement a class satisfying the `ReviewProvider` interface (a single
   `generateDebrief(request)` method) that calls your endpoint and returns a
   `Debrief`.
2. Return it from `getReviewProvider()` — for example, gated on an env flag:

   ```ts
   if (process.env.NEXT_PUBLIC_USE_AI === "1") return new ApiReviewProvider();
   ```

Nothing else in the UI changes. Keep the `disclaimer` field populated and avoid
medical overclaiming in prompts and outputs.

## Design notes

- **Serious but emotional** dark palette with restrained emergency accents
  (red / amber / green), a subtle warm glow, and a live "call" pulse.
- **Mobile-first**: a single phone-width column; on larger screens the call sits
  in a centered phone frame.
- **Safety-forward content**: choices reward calm, getting the person to safety,
  and handing off to professionals — and never claim to diagnose or treat.

## License

Built as a hackathon MVP for public-welfare education. Use and adapt freely for
non-commercial educational purposes.
