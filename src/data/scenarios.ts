// ============================================================================
// Last Call Rescue — Scenario data & shared types
//
// All game content lives here as plain TypeScript so the MVP needs no database.
// To add a scenario, append a new `Scenario` object to the `scenarios` array.
// ============================================================================

/** The three skills the player is scored on across a call. */
export type ScoreKey = "calmness" | "judgment" | "knowledge";

/** A snapshot of the player's three scores (each clamped 0–100 by the engine). */
export type Scores = Record<ScoreKey, number>;

/** Rough quality of a choice — drives feedback tone and result coloring. */
export type ChoiceQuality = "good" | "ok" | "bad";

export interface Choice {
  id: string;
  /** Button label the player taps. */
  text: string;
  /** Score changes applied when this choice is picked. Omit keys for 0. */
  effects: Partial<Scores>;
  quality: ChoiceQuality;
  /** Short in-call feedback shown right after choosing (the dispatcher's view). */
  feedback: string;
}

export interface Round {
  id: string;
  /** Caller / NPC lines shown as incoming chat bubbles, in order. */
  npcMessages: string[];
  /** A short prompt above the choices, framing the decision. */
  prompt: string;
  choices: Choice[];
}

export interface Scenario {
  id: string;
  /** English title. */
  title: string;
  /** Chinese title. */
  titleZh: string;
  /** Emoji used as a lightweight icon (keeps the MVP asset-free). */
  icon: string;
  /** One-line description for the scenario picker. */
  summary: string;
  /** Who is calling — shown in the phone header. */
  caller: string;
  /** Where the emergency is happening — shown under the caller name. */
  location: string;
  /** A safety-forward learning goal, surfaced in the debrief. */
  learningGoal: string;
  rounds: Round[];
}

// ----------------------------------------------------------------------------
// Scenario 1 — Heatstroke on campus
// ----------------------------------------------------------------------------
const heatstroke: Scenario = {
  id: "heatstroke-campus",
  title: "Heatstroke on Campus",
  titleZh: "校园中暑",
  icon: "🥵",
  summary:
    "A student collapses during outdoor training on a scorching afternoon. A classmate is calling for help.",
  caller: "Lin (classmate)",
  location: "University sports field · 38°C",
  learningGoal:
    "Recognize heat illness, move the person to a cool place, and cool them while help is on the way.",
  rounds: [
    {
      id: "h1",
      npcMessages: [
        "Hello?? Is this emergency help?",
        "My classmate just dropped during the run. He's awake but really confused and his skin is burning hot.",
        "What do I do?! Everyone's panicking.",
      ],
      prompt: "How do you open the call?",
      choices: [
        {
          id: "h1a",
          text: "Take a breath with me. You're doing the right thing by calling. Are you safe where you are?",
          effects: { calmness: 10, judgment: 4 },
          quality: "good",
          feedback: "Grounding the caller first makes everything that follows clearer.",
        },
        {
          id: "h1b",
          text: "Quick — what's your exact location and is he breathing normally?",
          effects: { calmness: 2, judgment: 8, knowledge: 2 },
          quality: "ok",
          feedback: "Gathering facts is useful, though a panicked caller may need steadying first.",
        },
        {
          id: "h1c",
          text: "Just throw cold water on his face and slap him to wake him up.",
          effects: { calmness: -6, judgment: -8, knowledge: -6 },
          quality: "bad",
          feedback: "Slapping or startling a confused person can cause harm and wastes precious time.",
        },
      ],
    },
    {
      id: "h2",
      npcMessages: [
        "Okay... okay. We're on the field, full sun, no shade right here.",
        "He keeps mumbling and looks really red and sweaty.",
      ],
      prompt: "What's the first action you guide them to take?",
      choices: [
        {
          id: "h2a",
          text: "Move him into shade or indoors right now, and loosen any tight clothing.",
          effects: { judgment: 10, knowledge: 8, calmness: 2 },
          quality: "good",
          feedback: "Getting out of the heat is the single most important first step.",
        },
        {
          id: "h2b",
          text: "Have him keep running slowly to 'sweat it out'.",
          effects: { judgment: -10, knowledge: -8 },
          quality: "bad",
          feedback: "Continued exertion in heat makes heat illness worse.",
        },
        {
          id: "h2c",
          text: "Leave him lying in the sun but fan him with a shirt.",
          effects: { judgment: -2, knowledge: 1 },
          quality: "ok",
          feedback: "Fanning helps a little, but staying in direct sun undoes the benefit.",
        },
      ],
    },
    {
      id: "h3",
      npcMessages: [
        "We carried him under the bleachers, there's shade now.",
        "Someone has water bottles and there's ice in a cooler from practice.",
      ],
      prompt: "How do you guide them to cool him?",
      choices: [
        {
          id: "h3a",
          text: "Cool his skin with water and place cool packs at the neck, armpits, and groin. If fully alert, small sips of water are okay.",
          effects: { knowledge: 12, judgment: 6, calmness: 2 },
          quality: "good",
          feedback: "Targeting major blood vessels cools the body efficiently.",
        },
        {
          id: "h3b",
          text: "Pour the whole cooler of ice water over him as fast as possible.",
          effects: { knowledge: -2, judgment: -4 },
          quality: "ok",
          feedback: "Aggressive cooling can help athletes, but uncontrolled icing of a confused person needs care — steady cooling is safer for laypeople.",
        },
        {
          id: "h3c",
          text: "Force him to drink a full bottle quickly since he's dehydrated.",
          effects: { knowledge: -8, judgment: -6 },
          quality: "bad",
          feedback: "Forcing fluids into someone confused risks choking. Never force a drowsy person to drink.",
        },
      ],
    },
    {
      id: "h4",
      npcMessages: [
        "He's a bit calmer but still not really himself.",
        "Should we just drive him home and let him rest? The buses left already.",
      ],
      prompt: "What's your closing guidance?",
      choices: [
        {
          id: "h4a",
          text: "Keep cooling him and stay on the line — professional responders are coming to assess him. Don't send him home alone.",
          effects: { judgment: 10, calmness: 6, knowledge: 4 },
          quality: "good",
          feedback: "Altered awareness after heat exposure needs professional evaluation.",
        },
        {
          id: "h4b",
          text: "Sure, driving him home to rest sounds reasonable.",
          effects: { judgment: -10, knowledge: -6 },
          quality: "bad",
          feedback: "Sending a still-confused person away delays critical care.",
        },
        {
          id: "h4c",
          text: "Tell them to wait and 'see if he gets better' before deciding.",
          effects: { judgment: -4, calmness: -2 },
          quality: "ok",
          feedback: "Watchful waiting alone can let a serious condition progress.",
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// Scenario 2 — Elderly person falls at home
// ----------------------------------------------------------------------------
const elderlyFall: Scenario = {
  id: "elderly-fall",
  title: "A Fall at Home",
  titleZh: "老人在家跌倒",
  icon: "🏠",
  summary:
    "An older adult has fallen in the bathroom and can't get up. Their adult child is calling, frightened.",
  caller: "Mr. Zhao (son)",
  location: "Apartment 6B · bathroom floor",
  learningGoal:
    "Avoid moving someone who may be injured, check responsiveness, and keep them warm and calm until help arrives.",
  rounds: [
    {
      id: "f1",
      npcMessages: [
        "Please help, my mother fell in the bathroom!",
        "She's on the floor and says her hip hurts a lot. She can't stand up.",
        "Should I just lift her onto the bed?",
      ],
      prompt: "How do you respond to the urge to lift her?",
      choices: [
        {
          id: "f1a",
          text: "Please don't move her yet — moving a possible hip injury can make it worse. Let's check her first, together.",
          effects: { judgment: 10, knowledge: 8, calmness: 4 },
          quality: "good",
          feedback: "Avoiding movement protects a possible fracture or spinal injury.",
        },
        {
          id: "f1b",
          text: "Okay, lift her gently and quickly so she's more comfortable on the bed.",
          effects: { judgment: -10, knowledge: -8 },
          quality: "bad",
          feedback: "Lifting someone with a suspected hip injury can cause serious harm.",
        },
        {
          id: "f1c",
          text: "Ask her to try standing on her own to see if she really can't.",
          effects: { judgment: -4, knowledge: -4 },
          quality: "ok",
          feedback: "Pushing her to stand risks a second fall and worse injury.",
        },
      ],
    },
    {
      id: "f2",
      npcMessages: [
        "Okay, I won't move her.",
        "She's awake and talking, but she's scared and starting to shiver on the cold tiles.",
      ],
      prompt: "What do you guide him to do next?",
      choices: [
        {
          id: "f2a",
          text: "Place a blanket or towels over and under her where you can without moving her, and stay beside her talking calmly.",
          effects: { knowledge: 8, calmness: 8, judgment: 4 },
          quality: "good",
          feedback: "Warmth and reassurance prevent shock and keep her stable.",
        },
        {
          id: "f2b",
          text: "Leave her to grab supplies from another room quickly.",
          effects: { calmness: -4, judgment: -2 },
          quality: "ok",
          feedback: "Leaving a frightened, injured person alone can worsen panic — bring help to her instead.",
        },
        {
          id: "f2c",
          text: "Give her some painkillers and water to calm her down.",
          effects: { knowledge: -8, judgment: -4 },
          quality: "bad",
          feedback: "Medicating before assessment may cause harm and complicate care.",
        },
      ],
    },
    {
      id: "f3",
      npcMessages: [
        "She has a blanket now and feels a little better.",
        "Wait — there's a small cut on her arm and it's bleeding a bit.",
      ],
      prompt: "How do you handle the bleeding?",
      choices: [
        {
          id: "f3a",
          text: "Press a clean cloth gently but firmly on the cut to slow the bleeding. Keep her arm still.",
          effects: { knowledge: 10, judgment: 6 },
          quality: "good",
          feedback: "Direct pressure is the simple, effective way to control minor bleeding.",
        },
        {
          id: "f3b",
          text: "Tie something tightly above the cut as a tourniquet.",
          effects: { knowledge: -8, judgment: -4 },
          quality: "bad",
          feedback: "A tourniquet for a small cut is excessive and can cause harm.",
        },
        {
          id: "f3c",
          text: "Rinse it under the tap by moving her arm to the sink.",
          effects: { judgment: -4 },
          quality: "ok",
          feedback: "Moving her to a sink risks disturbing the hip injury — bring the cloth to her.",
        },
      ],
    },
    {
      id: "f4",
      npcMessages: [
        "The bleeding's slowing. She's calmer now and holding my hand.",
        "Do you think we still need anyone to come out? I don't want to make a fuss.",
      ],
      prompt: "What's your closing guidance?",
      choices: [
        {
          id: "f4a",
          text: "Yes — a fall with hip pain at her age needs an in-person check. Keep her still and warm; help is on the way.",
          effects: { judgment: 10, knowledge: 4, calmness: 4 },
          quality: "good",
          feedback: "Hip pain after a fall in older adults warrants professional assessment.",
        },
        {
          id: "f4b",
          text: "If she seems fine now, it's okay to skip it and see how she feels tomorrow.",
          effects: { judgment: -10, knowledge: -6 },
          quality: "bad",
          feedback: "Hidden fractures are common; delaying care can be dangerous.",
        },
        {
          id: "f4c",
          text: "Leave the decision entirely to him without advising.",
          effects: { judgment: -4, calmness: -2 },
          quality: "ok",
          feedback: "A frightened caller benefits from clear, calm guidance.",
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// Scenario 3 — Fire evacuation call
// ----------------------------------------------------------------------------
const fireEvacuation: Scenario = {
  id: "fire-evacuation",
  title: "Smoke in the Stairwell",
  titleZh: "火灾疏散",
  icon: "🔥",
  summary:
    "Smoke is filling an apartment building. A resident is trapped on an upper floor and calling for guidance.",
  caller: "Mei (resident)",
  location: "Apartment tower · 11th floor",
  learningGoal:
    "Decide whether to evacuate or shelter, stay low under smoke, and never use elevators in a fire.",
  rounds: [
    {
      id: "e1",
      npcMessages: [
        "There's smoke everywhere in the hallway!",
        "I'm on the 11th floor. I can smell it coming under my door.",
        "Should I run down the stairs right now??",
      ],
      prompt: "What's your first instruction?",
      choices: [
        {
          id: "e1a",
          text: "Wait — first feel the door and handle with the back of your hand. Is it hot, and is smoke coming in?",
          effects: { judgment: 10, knowledge: 8, calmness: 2 },
          quality: "good",
          feedback: "Checking the door tells you whether the escape route is survivable.",
        },
        {
          id: "e1b",
          text: "Yes, run down the stairs as fast as you can right now.",
          effects: { judgment: -8, knowledge: -6 },
          quality: "bad",
          feedback: "Charging into an unknown smoke-filled corridor can be deadly. Assess first.",
        },
        {
          id: "e1c",
          text: "Take the elevator down — it's faster than the stairs.",
          effects: { judgment: -12, knowledge: -10 },
          quality: "bad",
          feedback: "Never use elevators in a fire; they can trap you or open onto flames.",
        },
      ],
    },
    {
      id: "e2",
      npcMessages: [
        "The door handle is warm and there's thick smoke in the hallway.",
        "I don't think I can get through that.",
      ],
      prompt: "The hallway is not safe. What now?",
      choices: [
        {
          id: "e2a",
          text: "Then we shelter in place. Keep the door closed and seal the gaps with wet towels to block smoke.",
          effects: { knowledge: 12, judgment: 8, calmness: 4 },
          quality: "good",
          feedback: "Sealing yourself off from smoke buys vital time when exits are blocked.",
        },
        {
          id: "e2b",
          text: "Cover your face and push through the smoke anyway — it's your only chance.",
          effects: { judgment: -10, knowledge: -8, calmness: -2 },
          quality: "bad",
          feedback: "Thick smoke can incapacitate within seconds; pushing through is high risk.",
        },
        {
          id: "e2c",
          text: "Open the door a crack to look, then decide.",
          effects: { judgment: -4, knowledge: -2 },
          quality: "ok",
          feedback: "Opening a hot door can let smoke and heat flood in — keep it closed.",
        },
      ],
    },
    {
      id: "e3",
      npcMessages: [
        "Okay, door's shut and I'm stuffing wet towels at the bottom.",
        "The smoke is still seeping a little and it's getting harder to breathe.",
      ],
      prompt: "How do you help her breathe and be found?",
      choices: [
        {
          id: "e3a",
          text: "Stay low to the floor where the air is cleaner, and signal at the window with a bright cloth or light.",
          effects: { knowledge: 12, judgment: 6, calmness: 4 },
          quality: "good",
          feedback: "Clean air is near the floor; a window signal helps responders locate you.",
        },
        {
          id: "e3b",
          text: "Open the window wide and lean far out for fresh air.",
          effects: { knowledge: -6, judgment: -4 },
          quality: "ok",
          feedback: "A wide-open window can pull smoke toward you and risks a fall — open slightly and stay low.",
        },
        {
          id: "e3c",
          text: "Stand up and move around to find the freshest spot.",
          effects: { knowledge: -8, judgment: -4 },
          quality: "bad",
          feedback: "Smoke and heat rise — standing puts you in the most dangerous air.",
        },
      ],
    },
    {
      id: "e4",
      npcMessages: [
        "I'm low by the window with a towel over my mouth.",
        "I can hear sirens now. I'm so scared — please don't hang up.",
      ],
      prompt: "What's your closing guidance?",
      choices: [
        {
          id: "e4a",
          text: "I'm staying right here with you. Keep low, keep signaling — crews are on scene and know your floor.",
          effects: { calmness: 10, judgment: 6, knowledge: 2 },
          quality: "good",
          feedback: "Staying on the line and relaying her location keeps her safe and calm.",
        },
        {
          id: "e4b",
          text: "You should hang up now to save your phone battery.",
          effects: { calmness: -8, judgment: -6 },
          quality: "bad",
          feedback: "Staying connected lets responders pinpoint and reassure her.",
        },
        {
          id: "e4c",
          text: "Tell her to try shouting in the hallway so crews hear her.",
          effects: { judgment: -6, knowledge: -4 },
          quality: "bad",
          feedback: "Opening up to the smoky hallway undoes her safe shelter.",
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// Registry
// ----------------------------------------------------------------------------
export const scenarios: Scenario[] = [heatstroke, elderlyFall, fireEvacuation];

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

export function getDefaultScenario(): Scenario {
  return scenarios[0];
}
