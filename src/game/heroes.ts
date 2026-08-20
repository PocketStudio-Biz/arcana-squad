import type { HeroForm, HeroId, HeroPack, WeaponKind } from "./types";

export type HeroDef = {
  id: HeroId;
  pack: HeroPack;
  roman: string;
  name: string;
  title: string;
  animal: string;
  form: HeroForm;
  element: string;
  suit: string;
  weapon: string;
  weaponKind: WeaponKind;
  phrase: string;
  meaning: string;
  color: number;
  accent: number;
  portrait: string;
  hp: number;
  speed: number;
  fireRate: number;
  damage: number;
  shots: number;
  projectileSpeed: number;
  passive: string;
  burn: boolean;
  wildcard: boolean;
  vamp: number;
  goldMul: number;
  startShield: number;
  startOrbits: number;
  startPierce: number;
};

function h(def: HeroDef): HeroDef {
  return def;
}

export const HEROES: HeroDef[] = [
  h({
    id: "fool", pack: "circle", roman: "0", name: "The Fool", title: "0 · The Fool",
    animal: "Lynx", form: "lynx", element: "Aether", suit: "Major Arcana",
    weapon: "Wildcard Staff", weaponKind: "staff",
    phrase: "Leap without fear. The path is what I become.",
    meaning: "Beginnings, spontaneity, unlimited potential.",
    color: 0x6b3fd4, accent: 0xe0c56a, portrait: "/cards/fool.jpg",
    hp: 92, speed: 7.4, fireRate: 0.26, damage: 13, shots: 1, projectileSpeed: 18,
    passive: "15% chance to fire a bonus wildcard shot.",
    burn: false, wildcard: true, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "swords", pack: "circle", roman: "⚔", name: "Swords", title: "Swords · Air",
    animal: "Turtle", form: "turtle", element: "Air", suit: "Swords",
    weapon: "Dual Blades", weaponKind: "blades",
    phrase: "I cut through illusion. Clarity is my blade.",
    meaning: "Intellect, truth, conflict, decision.",
    color: 0x2a5aa8, accent: 0xc0d4ff, portrait: "/cards/swords.jpg",
    hp: 88, speed: 6.8, fireRate: 0.22, damage: 11, shots: 2, projectileSpeed: 22,
    passive: "Starts with dual shot. Projectiles fly faster.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "pentacles", pack: "circle", roman: "★", name: "Pentacles", title: "Pentacles · Earth",
    animal: "Otter", form: "otter", element: "Earth", suit: "Pentacles",
    weapon: "Magic Coin", weaponKind: "coin",
    phrase: "I build what is real. From intention, I create.",
    meaning: "Material world, prosperity, manifestation.",
    color: 0x3d8b4a, accent: 0xe8c456, portrait: "/cards/pentacles.jpg",
    hp: 110, speed: 5.6, fireRate: 0.3, damage: 15, shots: 1, projectileSpeed: 16,
    passive: "Enemies drop 40% more gold.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1.4, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "wands", pack: "circle", roman: "🔥", name: "Wands", title: "Wands · Fire",
    animal: "Lizard", form: "lizard", element: "Fire", suit: "Wands",
    weapon: "Wand Staff", weaponKind: "wand",
    phrase: "I spark the flame. My will shapes the world.",
    meaning: "Creativity, willpower, action.",
    color: 0xc43c1c, accent: 0xffb040, portrait: "/cards/wands.jpg",
    hp: 96, speed: 6.2, fireRate: 0.28, damage: 17, shots: 1, projectileSpeed: 17,
    passive: "Shots burn. Enemies take damage over time.",
    burn: true, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "cups", pack: "circle", roman: "C", name: "Cups", title: "Cups · Water",
    animal: "Raven", form: "raven", element: "Water", suit: "Cups",
    weapon: "Sacred Chalice", weaponKind: "chalice",
    phrase: "I hold space for all. Love is my invocation.",
    meaning: "Emotion, intuition, healing.",
    color: 0x2a6db5, accent: 0xdce9ff, portrait: "/cards/cups.jpg",
    hp: 100, speed: 5.8, fireRate: 0.32, damage: 12, shots: 1, projectileSpeed: 16,
    passive: "8% lifesteal on every hit.",
    burn: false, wildcard: false, vamp: 0.08, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "world", pack: "circle", roman: "XXI", name: "The World", title: "XXI · The World",
    animal: "Rabbit", form: "panda", element: "Cosmos", suit: "Major Arcana",
    weapon: "Twin Batons", weaponKind: "batons",
    phrase: "I unite all paths. The circle is complete.",
    meaning: "Completion, unity, wholeness.",
    color: 0xc9a227, accent: 0xffffff, portrait: "/cards/world.jpg",
    hp: 104, speed: 6.3, fireRate: 0.25, damage: 14, shots: 1, projectileSpeed: 18,
    passive: "Starts with two orbiting shards.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 2, startPierce: 0,
  }),
  h({
    id: "earth", pack: "circle", roman: "🜃", name: "Earth Suit", title: "Earth Suit · Pentacles",
    animal: "Otter", form: "otter", element: "Earth", suit: "Pentacles",
    weapon: "Earth Seal", weaponKind: "coin",
    phrase: "I nurture and sustain. I create lasting roots.",
    meaning: "Grounding, stability, long-term success.",
    color: 0x1a7a6d, accent: 0xe8c456, portrait: "/cards/earth.jpg",
    hp: 120, speed: 5.2, fireRate: 0.34, damage: 13, shots: 1, projectileSpeed: 15,
    passive: "Starts with two shield charges.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 2, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "pocket", pack: "circle", roman: "✂", name: "Pocket", title: "Pocket · Chaos",
    animal: "Stylist", form: "fox", element: "Chaos", suit: "Chaos",
    weapon: "Shears of Color", weaponKind: "blades",
    phrase: "Cuts. Color. Chaos. Care.",
    meaning: "Precision, creativity, empathy, growth.",
    color: 0xe85a9a, accent: 0x7ad0ff, portrait: "/cards/pocket.jpg",
    hp: 96, speed: 7.0, fireRate: 0.24, damage: 13, shots: 2, projectileSpeed: 20,
    passive: "Dual shears. 15% wildcard color-shot.",
    burn: false, wildcard: true, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),

  h({
    id: "wanderer", pack: "major", roman: "0", name: "The Fool", title: "0 · The Fool",
    animal: "Fox", form: "fox", element: "Aether", suit: "Major Arcana",
    weapon: "Wanderer's Staff", weaponKind: "staff",
    phrase: "Leap without fear. The path is what I become.",
    meaning: "Beginnings, potential, freedom.",
    color: 0x7a3ad4, accent: 0xe8c456, portrait: "/cards/wanderer.jpg",
    hp: 90, speed: 7.6, fireRate: 0.27, damage: 12, shots: 1, projectileSpeed: 18,
    passive: "15% chance to fire a bonus wildcard shot.",
    burn: false, wildcard: true, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "magician", pack: "major", roman: "I", name: "The Magician", title: "I · The Magician",
    animal: "Cockatoo", form: "cockatoo", element: "Wind", suit: "Major Arcana",
    weapon: "Will Aligns", weaponKind: "wand",
    phrase: "I shape the wind, will aligns, and change begins.",
    meaning: "Intent, skill, manifestation.",
    color: 0xc9a227, accent: 0xfff4c8, portrait: "/cards/magician.jpg",
    hp: 94, speed: 6.6, fireRate: 0.24, damage: 14, shots: 1, projectileSpeed: 20,
    passive: "Shots fly true and pierce one extra foe.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 1,
  }),
  h({
    id: "priestess", pack: "major", roman: "II", name: "The High Priestess", title: "II · The High Priestess",
    animal: "Owl", form: "owl", element: "Water", suit: "Major Arcana",
    weapon: "Moon Scroll", weaponKind: "scroll",
    phrase: "I listen beyond the veil. Secrets reveal themselves.",
    meaning: "Intuition, mystery, inner wisdom.",
    color: 0x2a4a9a, accent: 0xc8d8ff, portrait: "/cards/priestess.jpg",
    hp: 98, speed: 5.9, fireRate: 0.3, damage: 13, shots: 1, projectileSpeed: 17,
    passive: "8% lifesteal. Auto-aim snaps a little faster.",
    burn: false, wildcard: false, vamp: 0.08, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "empress", pack: "major", roman: "III", name: "The Empress", title: "III · The Empress",
    animal: "Fox", form: "fox", element: "Earth", suit: "Major Arcana",
    weapon: "Pentacle Scepter", weaponKind: "scepter",
    phrase: "I create and I nurture. Life blooms in my care.",
    meaning: "Creation, nurture, abundance.",
    color: 0x2e8b4a, accent: 0xe8c456, portrait: "/cards/empress.jpg",
    hp: 108, speed: 5.7, fireRate: 0.31, damage: 14, shots: 1, projectileSpeed: 16,
    passive: "Enemies drop 25% more gold. Starts with one shield.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1.25, startShield: 1, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "emperor", pack: "major", roman: "IV", name: "The Emperor", title: "IV · The Emperor",
    animal: "Lion", form: "lion", element: "Fire", suit: "Major Arcana",
    weapon: "Flame Scepter", weaponKind: "scepter",
    phrase: "I build, I lead. Order is my foundation.",
    meaning: "Authority, structure, stability.",
    color: 0xb4321a, accent: 0xe8c456, portrait: "/cards/emperor.jpg",
    hp: 118, speed: 5.4, fireRate: 0.33, damage: 16, shots: 1, projectileSpeed: 16,
    passive: "Starts with two shield charges.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 2, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "hierophant", pack: "major", roman: "V", name: "The Hierophant", title: "V · The Hierophant",
    animal: "Bull", form: "bull", element: "Aether", suit: "Major Arcana",
    weapon: "Ritual Staff", weaponKind: "staff",
    phrase: "I teach, I guide. Truth is passed on.",
    meaning: "Tradition, belief, wisdom.",
    color: 0x5a2a8a, accent: 0xe8c456, portrait: "/cards/hierophant.jpg",
    hp: 112, speed: 5.3, fireRate: 0.32, damage: 15, shots: 1, projectileSpeed: 16,
    passive: "Starts with one orbiting shard.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 1, startPierce: 0,
  }),
  h({
    id: "lovers", pack: "major", roman: "VI", name: "The Lovers", title: "VI · The Lovers",
    animal: "Swans", form: "swan", element: "Wind", suit: "Major Arcana",
    weapon: "Harmony Bow", weaponKind: "bow",
    phrase: "I choose with my heart. Connection is my path.",
    meaning: "Love, choice, harmony.",
    color: 0xe8d8a0, accent: 0xffffff, portrait: "/cards/lovers.jpg",
    hp: 96, speed: 6.5, fireRate: 0.26, damage: 12, shots: 2, projectileSpeed: 19,
    passive: "Starts with dual shot.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "chariot", pack: "major", roman: "VII", name: "The Chariot", title: "VII · The Chariot",
    animal: "Wolves", form: "wolf", element: "Water", suit: "Major Arcana",
    weapon: "Chariot Spear", weaponKind: "spear",
    phrase: "I drive forward. Nothing can stop my will.",
    meaning: "Willpower, victory, movement.",
    color: 0x3a5a9a, accent: 0xc0d4ff, portrait: "/cards/chariot.jpg",
    hp: 100, speed: 7.2, fireRate: 0.23, damage: 13, shots: 1, projectileSpeed: 21,
    passive: "Moves faster. Shots fly farther.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "strength", pack: "major", roman: "VIII", name: "Strength", title: "VIII · Strength",
    animal: "Bear", form: "bear", element: "Earth", suit: "Major Arcana",
    weapon: "Infinite Grip", weaponKind: "scepter",
    phrase: "I lead with love. I am stronger within.",
    meaning: "Strength, courage, compassion.",
    color: 0x3d7a3a, accent: 0xe8c456, portrait: "/cards/strength.jpg",
    hp: 124, speed: 5.1, fireRate: 0.34, damage: 17, shots: 1, projectileSpeed: 15,
    passive: "Highest health. Starts with one shield.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 1, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "hermit", pack: "major", roman: "IX", name: "The Hermit", title: "IX · The Hermit",
    animal: "Turtle", form: "turtle", element: "Fire", suit: "Major Arcana",
    weapon: "Lantern Staff", weaponKind: "lantern",
    phrase: "I seek within. The light is already here.",
    meaning: "Solitude, seeking, wisdom.",
    color: 0x8a5a18, accent: 0xffc040, portrait: "/cards/hermit.jpg",
    hp: 114, speed: 4.9, fireRate: 0.36, damage: 18, shots: 1, projectileSpeed: 14,
    passive: "Heavy hits. Shots burn.",
    burn: true, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "wheel", pack: "major", roman: "X", name: "Wheel of Fortune", title: "X · Wheel of Fortune",
    animal: "Dolphin", form: "dolphin", element: "Water", suit: "Major Arcana",
    weapon: "Cosmic Wheel", weaponKind: "orb",
    phrase: "I flow with fate. Everything turns.",
    meaning: "Cycles, change, destiny.",
    color: 0x1a6a9a, accent: 0x7ad0ff, portrait: "/cards/wheel.jpg",
    hp: 96, speed: 6.7, fireRate: 0.28, damage: 13, shots: 1, projectileSpeed: 18,
    passive: "Starts with two orbiting shards.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 2, startPierce: 0,
  }),
  h({
    id: "justice", pack: "major", roman: "XI", name: "Justice", title: "XI · Justice",
    animal: "Jackal", form: "jackal", element: "Earth", suit: "Major Arcana",
    weapon: "Balance Blade", weaponKind: "blades",
    phrase: "I see clearly. I act with fairness.",
    meaning: "Truth, balance, accountability.",
    color: 0x3a6a3a, accent: 0xe8c456, portrait: "/cards/justice.jpg",
    hp: 102, speed: 6.4, fireRate: 0.24, damage: 14, shots: 1, projectileSpeed: 20,
    passive: "Critical clarity — shots pierce one foe.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 1,
  }),
  h({
    id: "hanged", pack: "major", roman: "XII", name: "The Hanged Man", title: "XII · The Hanged Man",
    animal: "Bat", form: "bat", element: "Wind", suit: "Major Arcana",
    weapon: "Sacred Rope", weaponKind: "rope",
    phrase: "I pause to see. A new view sets me free.",
    meaning: "Surrender, perspective, waiting.",
    color: 0x4a3050, accent: 0xe0b060, portrait: "/cards/hanged.jpg",
    hp: 92, speed: 6.9, fireRate: 0.25, damage: 12, shots: 1, projectileSpeed: 17,
    passive: "15% wildcard shot from inverted angles.",
    burn: false, wildcard: true, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "death", pack: "major", roman: "XIII", name: "Death", title: "XIII · Death",
    animal: "Horse", form: "horse", element: "Fire", suit: "Major Arcana",
    weapon: "Scythe Blade", weaponKind: "scythe",
    phrase: "I end to begin. Change is inevitable.",
    meaning: "Endings, transformation, renewal.",
    color: 0x6a1818, accent: 0xff6040, portrait: "/cards/death.jpg",
    hp: 100, speed: 6.1, fireRate: 0.29, damage: 18, shots: 1, projectileSpeed: 16,
    passive: "Scythe burns. High damage.",
    burn: true, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "temperance", pack: "major", roman: "XIV", name: "Temperance", title: "XIV · Temperance",
    animal: "Crane", form: "crane", element: "Aether", suit: "Major Arcana",
    weapon: "Harmony Vessels", weaponKind: "chalice",
    phrase: "I balance and I heal. Flow brings harmony.",
    meaning: "Balance, healing, moderation.",
    color: 0x3a6aaa, accent: 0xa8e0ff, portrait: "/cards/temperance.jpg",
    hp: 104, speed: 5.8, fireRate: 0.3, damage: 12, shots: 1, projectileSpeed: 16,
    passive: "10% lifesteal.",
    burn: false, wildcard: false, vamp: 0.1, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "devil", pack: "major", roman: "XV", name: "The Devil", title: "XV · The Devil",
    animal: "Ram", form: "ram", element: "Fire", suit: "Major Arcana",
    weapon: "Chain of Desire", weaponKind: "rope",
    phrase: "I see the chains. Awareness brings freedom.",
    meaning: "Shadow, temptation, bondage.",
    color: 0x8a2018, accent: 0xff9040, portrait: "/cards/devil.jpg",
    hp: 106, speed: 6.0, fireRate: 0.27, damage: 16, shots: 1, projectileSpeed: 17,
    passive: "Shots burn and hit harder.",
    burn: true, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "tower", pack: "major", roman: "XVI", name: "The Tower", title: "XVI · The Tower",
    animal: "Raccoon", form: "raccoon", element: "Water", suit: "Major Arcana",
    weapon: "Trumpet of Truth", weaponKind: "horn",
    phrase: "I break what is false. Truth strikes suddenly.",
    meaning: "Upheaval, revelation, collapse.",
    color: 0x1a4a7a, accent: 0x7ec8ff, portrait: "/cards/tower.jpg",
    hp: 90, speed: 6.6, fireRate: 0.22, damage: 15, shots: 1, projectileSpeed: 22,
    passive: "Sudden strikes — fastest projectiles.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "star", pack: "major", roman: "XVII", name: "The Star", title: "XVII · The Star",
    animal: "Otter", form: "otter", element: "Wind", suit: "Major Arcana",
    weapon: "Starwater Jar", weaponKind: "orb",
    phrase: "I trust the light. Hope guides me.",
    meaning: "Hope, inspiration, renewal.",
    color: 0x1a7a5a, accent: 0xa0ffe0, portrait: "/cards/star.jpg",
    hp: 98, speed: 6.8, fireRate: 0.28, damage: 12, shots: 1, projectileSpeed: 18,
    passive: "8% lifesteal. One orbiting shard.",
    burn: false, wildcard: false, vamp: 0.08, goldMul: 1, startShield: 0, startOrbits: 1, startPierce: 0,
  }),
  h({
    id: "moon", pack: "major", roman: "XVIII", name: "The Moon", title: "XVIII · The Moon",
    animal: "Lynx", form: "lynx", element: "Aether", suit: "Major Arcana",
    weapon: "Moon Lantern", weaponKind: "lantern",
    phrase: "I walk the night. Intuition sees what eyes can't.",
    meaning: "Illusion, intuition, subconscious.",
    color: 0x4a3a8a, accent: 0xd0c8ff, portrait: "/cards/moon.jpg",
    hp: 96, speed: 6.3, fireRate: 0.27, damage: 13, shots: 1, projectileSpeed: 17,
    passive: "Wildcard moonlight — 15% extra shot.",
    burn: false, wildcard: true, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "sun", pack: "major", roman: "XIX", name: "The Sun", title: "XIX · The Sun",
    animal: "Rooster", form: "rooster", element: "Fire", suit: "Major Arcana",
    weapon: "Solar Banner", weaponKind: "scepter",
    phrase: "I shine with joy. Life's warmth is mine.",
    meaning: "Joy, success, vitality.",
    color: 0xd47818, accent: 0xffe080, portrait: "/cards/sun.jpg",
    hp: 102, speed: 6.4, fireRate: 0.26, damage: 15, shots: 1, projectileSpeed: 18,
    passive: "Shots burn with solar fire.",
    burn: true, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "judgement", pack: "major", roman: "XX", name: "Judgement", title: "XX · Judgement",
    animal: "Eagle", form: "eagle", element: "Cosmos", suit: "Major Arcana",
    weapon: "Celestial Trumpet", weaponKind: "horn",
    phrase: "I call, the past is answered. A new dawn rises.",
    meaning: "Awakening, calling, rebirth.",
    color: 0xc9a227, accent: 0xfff0c0, portrait: "/cards/judgement.jpg",
    hp: 100, speed: 6.5, fireRate: 0.24, damage: 14, shots: 1, projectileSpeed: 20,
    passive: "Starts with dual shot.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 0, startPierce: 0,
  }),
  h({
    id: "dragon", pack: "major", roman: "XXI", name: "The World", title: "XXI · The World",
    animal: "Dragon", form: "dragon", element: "Cosmos", suit: "Major Arcana",
    weapon: "World Orb", weaponKind: "orb",
    phrase: "The circle is whole. I am one with all.",
    meaning: "Completion, wholeness, integration.",
    color: 0x2a8a4a, accent: 0xe8c456, portrait: "/cards/dragon.jpg",
    hp: 110, speed: 6.2, fireRate: 0.26, damage: 15, shots: 1, projectileSpeed: 18,
    passive: "Starts with two orbiting shards.",
    burn: false, wildcard: false, vamp: 0, goldMul: 1, startShield: 0, startOrbits: 2, startPierce: 0,
  }),
];

export const CIRCLE_HEROES = HEROES.filter((x) => x.pack === "circle");
export const MAJOR_HEROES = HEROES.filter((x) => x.pack === "major");

export const HERO_BY_ID: Record<HeroId, HeroDef> = Object.fromEntries(
  HEROES.map((hero) => [hero.id, hero]),
) as Record<HeroId, HeroDef>;
