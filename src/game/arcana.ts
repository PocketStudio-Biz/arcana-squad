import type { HeroId } from "./types";

export type MinorSuit = "wands" | "cups" | "swords" | "pentacles";
export type CourtRank = "page" | "knight" | "queen" | "king";
export type PipRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type MinorRank = PipRank | CourtRank;

export type MinorCard = {
  suit: MinorSuit;
  rank: MinorRank;
  title: string;
  roman: string;
  blurb: string;
  skill: string;
  skillBlurb: string;
  skillCd: number;
  effect: string;
};

export type Resonance = "match" | "oppose" | "wild";

export type RoomMods = {
  quotaMul: number;
  capAdd: number;
  hpMul: number;
  speedMul: number;
  goldMul: number;
  mageBias: number;
  pairSpawn: boolean;
  pipsMax: number;
  court: CourtRank | null;
  climaxMul: number;
  delayShots: boolean;
  color: number;
  css: string;
};

const SUIT_META: Record<MinorSuit, { name: string; color: number; css: string; oppose: MinorSuit }> = {
  wands: { name: "Wands", color: 0xc43c1c, css: "#e07040", oppose: "cups" },
  cups: { name: "Cups", color: 0x2a6db5, css: "#7ec8e8", oppose: "wands" },
  swords: { name: "Swords", color: 0x3a6ad4, css: "#9bb8ff", oppose: "pentacles" },
  pentacles: { name: "Pentacles", color: 0x3d8b4a, css: "#e8c456", oppose: "swords" },
};

const ROMAN: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X",
};

function pip(
  suit: MinorSuit,
  rank: PipRank,
  blurb: string,
  skill: string,
  skillBlurb: string,
  skillCd: number,
  effect: string,
): MinorCard {
  const name = SUIT_META[suit].name;
  return {
    suit,
    rank,
    title: rank === 1 ? `Ace of ${name}` : `${rank} of ${name}`,
    roman: ROMAN[rank] ?? `${rank}`,
    blurb,
    skill,
    skillBlurb,
    skillCd,
    effect,
  };
}

function court(
  suit: MinorSuit,
  rank: CourtRank,
  blurb: string,
  skill: string,
  skillBlurb: string,
  skillCd: number,
  effect: string,
): MinorCard {
  const name = SUIT_META[suit].name;
  const word = rank[0]!.toUpperCase() + rank.slice(1);
  return {
    suit,
    rank,
    title: `${word} of ${name}`,
    roman: word.slice(0, 2).toUpperCase(),
    blurb,
    skill,
    skillBlurb,
    skillCd,
    effect,
  };
}

/** 22-room story spread. Each card rhymes with that room's Major Arcana boss. */
export const STORY_SPREAD: MinorCard[] = [
  pip("wands", 1, "The spark. Climax comes fast.", "Spark", "A tight cone of fire and a burst of speed.", 5.5, "spark"),
  pip("swords", 1, "Will cuts first.", "First Cut", "One giant piercing bolt, then two side cuts.", 5.8, "first-cut"),
  pip("cups", 2, "They arrive in pairs.", "Twin Bond", "Two homing chalices and a sip of health.", 6.2, "twin-bond"),
  court("pentacles", "queen", "A queen of earth heals the pack.", "Garden", "Coins bloom. A shield. A root of health.", 7.4, "garden"),
  court("wands", "king", "A king of fire holds the floor.", "Throne Fire", "Four burning columns in a royal cross.", 7.8, "throne"),
  court("pentacles", "page", "Messengers flood the temple.", "Dispatch", "A pentacle ring. Gold pulls in.", 6.4, "dispatch"),
  court("cups", "knight", "A knight of cups charges the heart.", "Heart Charge", "Dash through, four cups seeking hearts.", 6.6, "heart-charge"),
  court("swords", "knight", "A knight of air spears the line.", "Spear Line", "Six stacked piercing swords.", 6.5, "spear-line"),
  pip("wands", 9, "Endurance. The wave does not yield.", "Last Stand", "A ward and nine burning sentries.", 7.2, "last-stand"),
  pip("swords", 4, "Restless stillness. Slow, heavy cuts.", "Still Cut", "The room slows. Four delayed blades fall.", 7.6, "still-cut"),
  pip("pentacles", 2, "The wheel juggles two weights.", "Juggle", "Two heavy coins that punch through.", 6.3, "juggle"),
  pip("swords", 2, "Balance. Twin lines, no middle.", "Cross", "A plus of air, then an X.", 6.4, "cross"),
  pip("cups", 4, "A pause. Then the pour.", "The Pour", "Rain on the four nearest foes.", 7.0, "pour"),
  pip("swords", 10, "Ruin. The longest cut.", "Ruin", "Ten swords hang, then fall on the path.", 8.2, "ruin"),
  court("cups", "queen", "A queen of water mends what you burn.", "Tide Mercy", "A deep heal and a choir of homing cups.", 7.5, "tide-mercy"),
  pip("wands", 7, "Desire holds the high ground.", "High Ground", "A knockback ring of willfire.", 6.8, "high-ground"),
  pip("wands", 10, "Burden. The tower is too much to carry.", "Burden", "Ten slow, heavy, burning seals.", 8.0, "burden"),
  pip("cups", 1, "Hope. Climax comes as a tide.", "Hope Spring", "Heal, then seven cups in a hex.", 5.6, "hope-spring"),
  pip("cups", 7, "Illusion. Shots hang, then fall.", "Mirage", "Seven false cups that turn true and home.", 7.1, "mirage"),
  pip("wands", 4, "Joy of fire. The sun is a hearth.", "Hearth", "A shield, a sip of health, a hearth-ring.", 6.6, "hearth"),
  court("swords", "king", "A king of air delivers the verdict.", "Verdict", "A delayed giant blade on the nearest foe.", 7.4, "verdict"),
  pip("pentacles", 10, "The kingdom. Every coin, every root.", "Kingdom", "Coin storm, two shields, a fat gold ring.", 8.4, "kingdom"),
];

export function minorForRoom(room: number): MinorCard {
  return STORY_SPREAD[(Math.max(1, room) - 1) % STORY_SPREAD.length]!;
}

export function heroMinorSuit(id: HeroId): MinorSuit | "wild" {
  if (id === "wands") return "wands";
  if (id === "cups") return "cups";
  if (id === "swords") return "swords";
  if (id === "pentacles") return "pentacles";
  return "wild";
}

export function resonanceOf(hero: HeroId, suit: MinorSuit): Resonance {
  const hs = heroMinorSuit(hero);
  if (hs === "wild") return "wild";
  if (hs === suit) return "match";
  if (SUIT_META[hs].oppose === suit) return "oppose";
  return "wild";
}

export function suitColor(suit: MinorSuit): number {
  return SUIT_META[suit].color;
}

export function suitCss(suit: MinorSuit): string {
  return SUIT_META[suit].css;
}

export function roomMods(card: MinorCard): RoomMods {
  const meta = SUIT_META[card.suit];
  const mods: RoomMods = {
    quotaMul: 1,
    capAdd: 0,
    hpMul: 1,
    speedMul: 1,
    goldMul: 1,
    mageBias: 0,
    pairSpawn: false,
    pipsMax: 10,
    court: null,
    climaxMul: 1,
    delayShots: false,
    color: meta.color,
    css: meta.css,
  };
  if (card.suit === "wands") {
    mods.speedMul = 1.08;
    mods.hpMul = 0.96;
  } else if (card.suit === "cups") {
    mods.mageBias = 0.08;
  } else if (card.suit === "swords") {
    mods.speedMul = 1.14;
    mods.hpMul = 0.9;
  } else {
    mods.hpMul = 1.16;
    mods.goldMul = 1.2;
    mods.speedMul = 0.92;
  }

  const r = card.rank;
  if (r === "page") {
    mods.court = "page";
    mods.capAdd = 2;
    mods.quotaMul = 1.08;
  } else if (r === "knight") {
    mods.court = "knight";
    mods.quotaMul = 1.12;
  } else if (r === "queen") {
    mods.court = "queen";
    mods.mageBias += 0.12;
  } else if (r === "king") {
    mods.court = "king";
    mods.hpMul *= 1.08;
    mods.quotaMul = 1.15;
  } else if (r === 1) {
    mods.pipsMax = 5;
    mods.climaxMul = 1.35;
    mods.quotaMul = 0.92;
  } else if (r === 2) {
    mods.pairSpawn = true;
  } else if (r === 4) {
    mods.speedMul *= 0.88;
    mods.hpMul *= 1.12;
  } else if (r === 7) {
    mods.delayShots = true;
    mods.mageBias += 0.1;
  } else if (r === 9) {
    mods.quotaMul = 1.22;
    mods.capAdd = 1;
  } else if (r === 10) {
    mods.quotaMul = 1.35;
    mods.capAdd = 2;
    mods.climaxMul = 1.4;
  } else {
    mods.quotaMul = 1 + (r - 5) * 0.04;
  }
  return mods;
}
