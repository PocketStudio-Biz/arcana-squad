import type { PowerId } from "./types";

export type PowerDef = {
  id: PowerId;
  name: string;
  blurb: string;
  color: string;
  icon: string;
  tag: string;
};

export const POWERS: Record<PowerId, PowerDef> = {
  multishot: {
    id: "multishot",
    name: "Split Path",
    blurb: "Fire an extra projectile.",
    color: "#e8c456",
    icon: "//",
    tag: "SHOT",
  },
  shield: {
    id: "shield",
    name: "Circle of Warding",
    blurb: "Gain two shield charges.",
    color: "#5ec8e8",
    icon: "◉",
    tag: "WARD",
  },
  speed: {
    id: "speed",
    name: "Wind at the Heels",
    blurb: "Move 14% faster.",
    color: "#d4e8ff",
    icon: "⌁",
    tag: "WIND",
  },
  rapid: {
    id: "rapid",
    name: "Quickened Will",
    blurb: "Fire 18% more often.",
    color: "#f0c070",
    icon: "✦",
    tag: "WILL",
  },
  pierce: {
    id: "pierce",
    name: "Through Illusion",
    blurb: "Shots pierce one more foe.",
    color: "#c9a227",
    icon: "↑",
    tag: "PIERCE",
  },
  homing: {
    id: "homing",
    name: "Seeking Fate",
    blurb: "Projectiles curve toward enemies.",
    color: "#7b4de0",
    icon: "◎",
    tag: "SEEK",
  },
  orbit: {
    id: "orbit",
    name: "The Circle",
    blurb: "An orbiting shard guards you.",
    color: "#efe6c9",
    icon: "◌",
    tag: "ORBIT",
  },
  heal: {
    id: "heal",
    name: "Chalice Rest",
    blurb: "Restore a large amount of health.",
    color: "#5ecf8a",
    icon: "♥",
    tag: "REST",
  },
  giant: {
    id: "giant",
    name: "Heavy Seal",
    blurb: "Bigger, harder-hitting shots.",
    color: "#c44528",
    icon: "■",
    tag: "SEAL",
  },
  magnet: {
    id: "magnet",
    name: "Gold Tide",
    blurb: "Coins pull toward you from farther.",
    color: "#e8c456",
    icon: "¤",
    tag: "GOLD",
  },
  vamp: {
    id: "vamp",
    name: "Blood of Cups",
    blurb: "Heal on hit.",
    color: "#c4453c",
    icon: "†",
    tag: "BLOOD",
  },
  fork: {
    id: "fork",
    name: "Forked Road",
    blurb: "Side shots at a wider angle.",
    color: "#2a6db5",
    icon: "Y",
    tag: "FORK",
  },
};

export const CORE_POWERS: PowerId[] = ["multishot", "shield", "speed"];
export const ALL_POWERS = Object.keys(POWERS) as PowerId[];

export function rollChoices(stacks: Partial<Record<PowerId, number>>): PowerId[] {
  const pool = ALL_POWERS.filter((id) => {
    const n = stacks[id] ?? 0;
    if (id === "heal") return true;
    if (id === "multishot") return n < 6;
    if (id === "orbit") return n < 6;
    if (id === "shield") return n < 5;
    if (id === "speed") return n < 6;
    if (id === "rapid") return n < 5;
    return n < 4;
  });
  const picks: PowerId[] = [];
  const core = CORE_POWERS.filter((id) => pool.includes(id) && Math.random() < 0.55);
  if (core.length && Math.random() < 0.85) picks.push(core[Math.floor(Math.random() * core.length)]!);
  const rest = pool.filter((id) => !picks.includes(id));
  while (picks.length < 3 && rest.length) {
    const i = Math.floor(Math.random() * rest.length);
    picks.push(rest.splice(i, 1)[0]!);
  }
  return picks;
}
