export type ArcanaFamily = "major" | "swords" | "pentacles" | "wands" | "cups";

export type GuardianId = "turtle" | "otter" | "lizard" | "raven" | "lynx";

export type Guardian = {
  id: GuardianId;
  animal: string;
  tarotFamily: ArcanaFamily;
  element: string;
  magicLanguage: string[];
  gameplayRole: string;
  existingHeroId: "swords" | "pentacles" | "wands" | "cups" | "fool";
};

export type ArcanaCard = {
  id: string;
  name: string;
  family: ArcanaFamily;
  rank?: number | "ace" | "page" | "knight" | "queen" | "king";
  meaning: string;
  gameplayEffect: string;
  rarity?: string;
  unlocked: boolean;
  artAsset?: string;
};

export const GUARDIANS: readonly Guardian[] = [
  {
    id: "turtle",
    animal: "Turtle",
    tarotFamily: "swords",
    element: "Air",
    magicLanguage: ["wind", "air pressure", "telekinesis"],
    gameplayRole: "Precision, positioning, and space control",
    existingHeroId: "swords",
  },
  {
    id: "otter",
    animal: "Otter",
    tarotFamily: "pentacles",
    element: "Earth",
    magicLanguage: ["plants", "money", "growth", "resources"],
    gameplayRole: "Resource generation, growth, and building",
    existingHeroId: "pentacles",
  },
  {
    id: "lizard",
    animal: "Lizard",
    tarotFamily: "wands",
    element: "Fire",
    magicLanguage: ["fire", "heat", "smoke"],
    gameplayRole: "Pressure, damage, and tempo",
    existingHeroId: "wands",
  },
  {
    id: "raven",
    animal: "Raven",
    tarotFamily: "cups",
    element: "Water",
    magicLanguage: ["water", "cold", "intuition", "support"],
    gameplayRole: "Protection, redirection, and support",
    existingHeroId: "cups",
  },
  {
    id: "lynx",
    animal: "Lynx",
    tarotFamily: "major",
    element: "Cosmos",
    magicLanguage: ["cosmic", "shadow", "transformation", "wildcard"],
    gameplayRole: "Rule-bending, transformation, and cross-suit effects",
    existingHeroId: "fool",
  },
] as const;

export const WEBSITE_DESTINATIONS = [
  { id: "world-gate", label: "World Gate", purpose: "Entry point and game launch" },
  { id: "squad-codex", label: "Squad Codex", purpose: "Guardian and suit onboarding" },
  { id: "card-archive", label: "Card Archive", purpose: "Arcana collection and mechanics reference" },
  { id: "play", label: "Play", purpose: "New game, continue, daily draw, and current quest" },
  { id: "player-grimoire", label: "Player Grimoire", purpose: "Decks, progression, achievements, and settings" },
] as const;

export const GAME_FLOW = [
  "enter-world",
  "choose-guardian",
  "draw-opening-card",
  "encounter",
  "squad-interaction",
  "resolve-reading",
  "arcana-hub",
] as const;

export type GameFlowStep = (typeof GAME_FLOW)[number];
