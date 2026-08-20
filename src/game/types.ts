export type HeroId =
  | "fool"
  | "swords"
  | "pentacles"
  | "wands"
  | "cups"
  | "world"
  | "earth"
  | "pocket"
  | "wanderer"
  | "magician"
  | "priestess"
  | "empress"
  | "emperor"
  | "hierophant"
  | "lovers"
  | "chariot"
  | "strength"
  | "hermit"
  | "wheel"
  | "justice"
  | "hanged"
  | "death"
  | "temperance"
  | "devil"
  | "tower"
  | "star"
  | "moon"
  | "sun"
  | "judgement"
  | "dragon";

export type HeroPack = "circle" | "major";

export type HeroForm =
  | "otter"
  | "eagle"
  | "lynx"
  | "lizard"
  | "raven"
  | "panda"
  | "deer"
  | "cockatoo"
  | "owl"
  | "fox"
  | "lion"
  | "bull"
  | "swan"
  | "wolf"
  | "bear"
  | "turtle"
  | "dolphin"
  | "jackal"
  | "bat"
  | "horse"
  | "crane"
  | "ram"
  | "raccoon"
  | "rooster"
  | "dragon";

export type WeaponKind =
  | "staff"
  | "blades"
  | "coin"
  | "wand"
  | "chalice"
  | "batons"
  | "bow"
  | "spear"
  | "lantern"
  | "scythe"
  | "horn"
  | "orb"
  | "rope"
  | "scroll"
  | "scepter";

export type EnemyKind = "wisp" | "scarab" | "brute" | "mage" | "boss";

export type PowerId =
  | "multishot"
  | "shield"
  | "speed"
  | "rapid"
  | "pierce"
  | "homing"
  | "orbit"
  | "heal"
  | "giant"
  | "magnet"
  | "vamp"
  | "fork";

export type GameEvent =
  | { type: "hud" }
  | { type: "pick"; choices: PowerId[] }
  | { type: "over"; score: number; rooms: number; heroId: HeroId; coins: number; won?: boolean }
  | { type: "float"; text: string; color: string; x: number; y: number }
  | { type: "toast"; text: string };

export type HudSnap = {
  hp: number;
  maxHp: number;
  lives: number;
  score: number;
  coins: number;
  room: number;
  elapsed: number;
  heroId: HeroId;
  shield: number;
  shieldMax: number;
  stacks: Partial<Record<PowerId, number>>;
  bossHp: number;
  bossMax: number;
  combo: number;
};

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  getX: () => number;
  getZ: () => number;
  getScore: () => number;
  getRoom: () => number;
  getHp: () => number;
  getLives: () => number;
  isOver: () => boolean;
  isPicking: () => boolean;
  setKeys?: (codes: string[]) => void;
  setStick?: (x: number, y: number) => void;
  advance?: (seconds: number) => void;
  autoMove?: () => void;
  forceVictory?: () => void;
  ascendSquad?: () => void;
  pickPower?: (id: PowerId) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}
