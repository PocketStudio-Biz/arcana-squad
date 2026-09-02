import type { HeroId, PowerId } from "@/game/types";
import type { ArcanaCard, ArcanaFamily } from "@/lib/arcana";

export type ArcanaGameplayCard = ArcanaCard & {
  powerId: PowerId;
  secondaryPowerId?: PowerId;
  tier: 1 | 2 | 3;
};

const familyPower: Record<Exclude<ArcanaFamily, "major">, PowerId[]> = {
  swords: ["speed", "pierce", "homing", "multishot"],
  pentacles: ["magnet", "shield", "giant", "heal"],
  wands: ["rapid", "giant", "fork", "multishot"],
  cups: ["heal", "vamp", "shield", "orbit"],
};

const minorMeanings: Record<Exclude<ArcanaFamily, "major">, string[]> = {
  swords: [
    "clarity and a new idea", "difficult choice", "heartbreak and truth", "rest and recovery",
    "conflict and consequence", "transition and leaving difficulty", "strategy and hidden action",
    "restriction and perspective", "anxiety and mental pressure", "painful ending and release",
    "curiosity and new information", "swift action and conviction", "clear judgment and independence", "disciplined truth and authority",
  ],
  pentacles: [
    "material opportunity and grounding", "balancing resources", "craft and collaboration", "stability and holding on",
    "scarcity and support", "giving and receiving", "patience and investment", "practice and mastery",
    "independence and earned comfort", "lasting abundance and legacy", "study and practical beginnings", "steady work and reliability",
    "nurture and material care", "stewardship and durable success",
  ],
  wands: [
    "creative spark and initiative", "planning and future direction", "expansion and momentum", "celebration and stable fire",
    "competition and friction", "recognition and confidence", "defense and persistence", "speed and fast movement",
    "resilience and final effort", "burden and responsibility", "discovery and playful courage", "bold pursuit and intensity",
    "creative independence and warmth", "vision and charismatic leadership",
  ],
  cups: [
    "emotional opening and connection", "partnership and mutuality", "friendship and celebration", "withdrawal and reevaluation",
    "grief and what remains", "memory and tenderness", "choices and imagination", "walking away toward meaning",
    "satisfaction and emotional reward", "belonging and shared joy", "sensitivity and intuitive news", "romance and emotional movement",
    "compassion and emotional steadiness", "mature feeling and calm authority",
  ],
};

const rankLabels = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "page", "knight", "queen", "king"] as const;
const displayRanks = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"] as const;

function tierForIndex(index: number): 1 | 2 | 3 {
  if (index >= 11) return 3;
  if (index >= 6) return 2;
  return 1;
}

function makeMinor(family: Exclude<ArcanaFamily, "major">): ArcanaGameplayCard[] {
  return rankLabels.map((rank, index) => {
    const powerId = familyPower[family][index % familyPower[family].length]!;
    const secondaryPowerId = tierForIndex(index) === 3
      ? familyPower[family][(index + 1) % familyPower[family].length]
      : undefined;
    return {
      id: `${family}-${rank}`,
      name: `${displayRanks[index]} of ${family[0]!.toUpperCase()}${family.slice(1)}`,
      family,
      rank: rank === "ace" || rank === "page" || rank === "knight" || rank === "queen" || rank === "king"
        ? rank
        : Number(rank),
      meaning: minorMeanings[family][index]!,
      gameplayEffect: `Begins the run with ${powerId}${secondaryPowerId ? ` and ${secondaryPowerId}` : ""}.`,
      rarity: tierForIndex(index) === 3 ? "court" : tierForIndex(index) === 2 ? "uncommon" : "common",
      unlocked: false,
      artAsset: `/cards/${family}-${rank}.jpg`,
      powerId,
      secondaryPowerId,
      tier: tierForIndex(index),
    };
  });
}

const majors: Array<[string, string, string, PowerId, PowerId?]> = [
  ["fool", "The Fool", "beginnings, freedom, and a leap into possibility", "speed", "multishot"],
  ["magician", "The Magician", "will, skill, and directed manifestation", "homing", "pierce"],
  ["high-priestess", "The High Priestess", "intuition, mystery, and inner knowing", "vamp", "shield"],
  ["empress", "The Empress", "creation, nurture, and abundance", "heal", "magnet"],
  ["emperor", "The Emperor", "structure, authority, and stability", "shield", "giant"],
  ["hierophant", "The Hierophant", "teaching, tradition, and shared meaning", "orbit", "shield"],
  ["lovers", "The Lovers", "choice, connection, and alignment", "multishot", "heal"],
  ["chariot", "The Chariot", "direction, discipline, and forward motion", "speed", "rapid"],
  ["strength", "Strength", "courage, restraint, and embodied power", "giant", "vamp"],
  ["hermit", "The Hermit", "solitude, searching, and inner guidance", "homing", "orbit"],
  ["wheel", "Wheel of Fortune", "cycles, change, and shifting conditions", "fork", "magnet"],
  ["justice", "Justice", "balance, accountability, and clear consequence", "pierce", "shield"],
  ["hanged-man", "The Hanged Man", "pause, surrender, and a changed perspective", "orbit", "homing"],
  ["death", "Death", "ending, transformation, and necessary release", "giant", "heal"],
  ["temperance", "Temperance", "integration, moderation, and useful combination", "heal", "rapid"],
  ["devil", "The Devil", "attachment, appetite, and confronting constraint", "vamp", "giant"],
  ["tower", "The Tower", "rupture, revelation, and unstable structures falling", "fork", "giant"],
  ["star", "The Star", "hope, renewal, and orientation toward possibility", "heal", "homing"],
  ["moon", "The Moon", "uncertainty, instinct, and moving through illusion", "homing", "vamp"],
  ["sun", "The Sun", "clarity, vitality, and visible success", "rapid", "multishot"],
  ["judgement", "Judgement", "reckoning, awakening, and answering a call", "pierce", "orbit"],
  ["world", "The World", "completion, integration, and the whole cycle", "orbit", "multishot"],
];

export const MAJOR_ARCANA: ArcanaGameplayCard[] = majors.map(([id, name, meaning, powerId, secondaryPowerId]) => ({
  id: `major-${id}`,
  name,
  family: "major",
  meaning,
  gameplayEffect: `Wildcard opening: ${powerId}${secondaryPowerId ? ` + ${secondaryPowerId}` : ""}.`,
  rarity: "major",
  unlocked: false,
  artAsset: `/cards/${id}.jpg`,
  powerId,
  secondaryPowerId,
  tier: 3,
}));

export const MINOR_ARCANA: ArcanaGameplayCard[] = [
  ...makeMinor("swords"),
  ...makeMinor("pentacles"),
  ...makeMinor("cups"),
  ...makeMinor("wands"),
];

export const ARCANA_DECK: readonly ArcanaGameplayCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];
export const ARCANA_BY_ID = Object.fromEntries(ARCANA_DECK.map((card) => [card.id, card])) as Record<string, ArcanaGameplayCard>;

export function familyForHero(heroId: HeroId): ArcanaFamily {
  if (heroId === "swords") return "swords";
  if (heroId === "pentacles" || heroId === "earth") return "pentacles";
  if (heroId === "wands") return "wands";
  if (heroId === "cups") return "cups";
  return "major";
}

export function drawOpeningArcana(heroId: HeroId, rng: () => number = Math.random): ArcanaGameplayCard {
  const family = familyForHero(heroId);
  // Core suit heroes mostly draw within their own language, while Major heroes draw wildcards.
  const useMajor = family === "major" || rng() < 0.18;
  const pool = useMajor ? MAJOR_ARCANA : MINOR_ARCANA.filter((card) => card.family === family);
  return pool[Math.floor(rng() * pool.length)]!;
}
