import type { EnemyKind, HeroId } from "./types";
import type { CardKind } from "./meshes";

export type FireOpts = {
  color?: number;
  dmg?: number;
  life?: number;
  r?: number;
  burn?: boolean;
  pierce?: number;
  homing?: boolean;
  delay?: number;
  kind?: CardKind;
  ox?: number;
  oz?: number;
  y?: number;
};

export type BossState = {
  bossId: HeroId;
  x: number;
  z: number;
  r: number;
  hp: number;
  maxHp: number;
  dmg: number;
  speed: number;
  atk: number;
  ai: number;
  mode: number;
  dashT: number;
  dvx: number;
  dvz: number;
  phase: number;
  moveName: string;
  yaw: number;
};

export type BossApi = {
  t: number;
  px: number;
  pz: number;
  half: number;
  minions: number;
  color: number;
  accent: number;
  fire: (ang: number, speed: number, opts?: FireOpts) => void;
  warn: (x: number, z: number, color: number) => void;
  float: (text: string) => void;
  dash: (vx: number, vz: number, time: number) => void;
  teleport: (x: number, z: number) => void;
  spawn: (kind: EnemyKind, x: number, z: number) => void;
  heal: (amt: number) => void;
  spark: (x: number, z: number, color: number) => void;
  trauma: (n: number) => void;
};

export function bossHpMul(id: HeroId): number {
  switch (id) {
    case "wanderer":
      return 0.88;
    case "magician":
      return 1.02;
    case "priestess":
      return 0.96;
    case "empress":
      return 1.12;
    case "emperor":
      return 1.3;
    case "hierophant":
      return 1.14;
    case "lovers":
      return 0.94;
    case "chariot":
      return 1.06;
    case "strength":
      return 1.4;
    case "hermit":
      return 1.1;
    case "wheel":
      return 1.0;
    case "justice":
      return 1.08;
    case "hanged":
      return 0.9;
    case "death":
      return 1.26;
    case "temperance":
      return 1.12;
    case "devil":
      return 1.2;
    case "tower":
      return 0.88;
    case "star":
      return 1.0;
    case "moon":
      return 1.02;
    case "sun":
      return 1.16;
    case "judgement":
      return 1.22;
    case "dragon":
      return 1.55;
    default:
      return 1;
  }
}

export function bossRange(id: HeroId): number {
  switch (id) {
    case "hermit":
      return 9.2;
    case "priestess":
      return 7.6;
    case "magician":
      return 6.4;
    case "tower":
      return 6.8;
    case "star":
      return 6.2;
    case "emperor":
      return 4.6;
    case "hierophant":
      return 5.2;
    case "chariot":
      return 1.35;
    case "strength":
      return 1.5;
    case "death":
      return 2.1;
    case "hanged":
      return 5.5;
    default:
      return 3.15;
  }
}

export function bossSpeedMul(id: HeroId): number {
  switch (id) {
    case "chariot":
      return 1.75;
    case "wanderer":
      return 1.5;
    case "death":
      return 1.2;
    case "tower":
      return 1.15;
    case "hermit":
      return 0.42;
    case "strength":
      return 0.68;
    case "emperor":
      return 0.72;
    case "hanged":
      return 0.5;
    case "hierophant":
      return 0.7;
    case "priestess":
      return 0.85;
    default:
      return 1;
  }
}

function angTo(px: number, pz: number, x: number, z: number) {
  return Math.atan2(px - x, pz - z);
}

function ring(api: BossApi, e: BossState, n: number, speed: number, opts?: FireOpts, spin = 0) {
  for (let k = 0; k < n; k++) api.fire((k / n) * Math.PI * 2 + spin, speed, opts);
}

function fan(api: BossApi, e: BossState, px: number, pz: number, n: number, spread: number, speed: number, opts?: FireOpts) {
  const base = angTo(px, pz, e.x, e.z);
  for (let i = 0; i < n; i++) {
    const a = n === 1 ? base : base - spread / 2 + (spread * i) / Math.max(1, n - 1);
    api.fire(a, speed, opts);
  }
}

function cd(e: BossState, base: number) {
  return Math.max(0.42, base * (1 - e.phase * 0.16));
}

export function runBoss(e: BossState, dt: number, dist: number, api: BossApi) {
  e.phase = e.hp / e.maxHp < 0.35 ? 2 : e.hp / e.maxHp < 0.65 ? 1 : 0;
  e.atk -= dt;
  e.ai -= dt;
  if (e.atk > 0) return;
  switch (e.bossId) {
    case "wanderer":
      wanderer(e, dist, api);
      break;
    case "magician":
      magician(e, api);
      break;
    case "priestess":
      priestess(e, api);
      break;
    case "empress":
      empress(e, api);
      break;
    case "emperor":
      emperor(e, api);
      break;
    case "hierophant":
      hierophant(e, api);
      break;
    case "lovers":
      lovers(e, api);
      break;
    case "chariot":
      chariot(e, dist, api);
      break;
    case "strength":
      strength(e, api);
      break;
    case "hermit":
      hermit(e, api);
      break;
    case "wheel":
      wheel(e, api);
      break;
    case "justice":
      justice(e, api);
      break;
    case "hanged":
      hanged(e, api);
      break;
    case "death":
      death(e, dist, api);
      break;
    case "temperance":
      temperance(e, api);
      break;
    case "devil":
      devil(e, api);
      break;
    case "tower":
      tower(e, api);
      break;
    case "star":
      star(e, api);
      break;
    case "moon":
      moon(e, api);
      break;
    case "sun":
      sun(e, api);
      break;
    case "judgement":
      judgement(e, api);
      break;
    case "dragon":
      world(e, dist, api);
      break;
    default:
      ring(api, e, 8, 7, { kind: "major" });
      e.atk = 2;
      e.moveName = "Arcana";
  }
  api.trauma(0.22 + e.phase * 0.06);
}

function wanderer(e: BossState, dist: number, api: BossApi) {
  e.mode = (e.mode + 1) % 3;
  if (e.mode === 0) {
    e.moveName = "Leap";
    for (let i = 0; i < 8; i++) api.fire(Math.random() * Math.PI * 2, 6 + Math.random() * 5, { kind: "chaos", delay: Math.random() * 0.2 });
    const a = angTo(api.px, api.pz, e.x, e.z);
    api.dash(Math.sin(a) * 14, Math.cos(a) * 14, 0.38);
  } else if (e.mode === 1) {
    e.moveName = "The Path";
    api.spark(e.x, e.z, api.color);
    const ang = Math.random() * Math.PI * 2;
    const rad = 8 + Math.random() * 6;
    api.teleport(Math.sin(ang) * rad, Math.cos(ang) * rad);
    ring(api, e, 10, 8, { kind: "chaos" });
  } else {
    e.moveName = "Wildcard";
    fan(api, e, api.px, api.pz, 5, 0.9, 9, { kind: "chaos" });
  }
  e.atk = cd(e, 1.55);
}

function magician(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 4;
  if (e.mode === 0) {
    e.moveName = "Swords Align";
    fan(api, e, api.px, api.pz, 5, 0.42, 12, { kind: "swords", pierce: 2 });
  } else if (e.mode === 1) {
    e.moveName = "Will of Wands";
    fan(api, e, api.px, api.pz, 7, 0.85, 8, { kind: "wands", burn: true });
  } else if (e.mode === 2) {
    e.moveName = "Cup of Will";
    fan(api, e, api.px, api.pz, 3, 0.3, 7, { kind: "cups", homing: true });
  } else {
    e.moveName = "Pentacle Seal";
    ring(api, e, 8, 6.5, { kind: "pentacles", r: 0.24 });
    if (api.minions < 3) api.spawn("wisp", e.x + 2, e.z);
  }
  e.atk = cd(e, 1.45);
}

function priestess(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 3;
  if (e.mode === 0) {
    e.moveName = "Veil";
    const side = e.x > 0 ? -api.half + 1.5 : api.half - 1.5;
    api.teleport(side, api.pz * 0.4);
    for (let i = 0; i < 4; i++) {
      api.fire(angTo(api.px, api.pz, e.x, e.z), 6.5, { kind: "cups", homing: true, delay: 0.15 * i });
    }
  } else if (e.mode === 1) {
    e.moveName = "Moon Scroll";
    for (const s of [-1, 1]) {
      api.fire(angTo(api.px, api.pz, e.x + s * 2.4, e.z), 7, {
        kind: "major",
        homing: true,
        ox: e.x + s * 2.4,
        oz: e.z,
      });
    }
  } else {
    e.moveName = "Secrets";
    for (let i = 0; i < 5; i++) {
      api.fire(angTo(api.px, api.pz, e.x, e.z) + (i - 2) * 0.2, 5, { kind: "cups", delay: 0.45, homing: true });
    }
  }
  e.atk = cd(e, 1.7);
}

function empress(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 3;
  if (e.mode === 0) {
    e.moveName = "Bloom";
    ring(api, e, 10, 5.2, { kind: "pentacles", r: 0.26, life: 3 });
    if (api.minions > 0) api.heal(14);
  } else if (e.mode === 1) {
    e.moveName = "Seed";
    if (api.minions < 4) {
      api.spawn("scarab", e.x + 2.2, e.z + 1.2);
      api.spawn("scarab", e.x - 2.2, e.z - 1.2);
    }
    fan(api, e, api.px, api.pz, 3, 0.4, 7, { kind: "pentacles" });
  } else {
    e.moveName = "Nurture";
    fan(api, e, api.px, api.pz, 6, 1.1, 6.5, { kind: "pentacles" });
    api.heal(8);
  }
  e.atk = cd(e, 1.85);
}

function emperor(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 3;
  if (e.mode === 0) {
    e.moveName = "Order";
    for (let k = 0; k < 4; k++) api.fire((k * Math.PI) / 2, 9, { kind: "wands", pierce: 1, r: 0.24 });
  } else if (e.mode === 1) {
    e.moveName = "Decree";
    for (let k = 0; k < 4; k++) api.fire((k * Math.PI) / 2 + Math.PI / 4, 9, { kind: "wands", pierce: 1, r: 0.24 });
  } else {
    e.moveName = "Foundation";
    ring(api, e, 12, 6, { kind: "wands", r: 0.28, burn: true });
  }
  e.atk = cd(e, 1.65);
}

function hierophant(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 3;
  if (e.mode === 0) {
    e.moveName = "Rite";
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + api.t;
      api.fire(a, 7.5, { kind: "major", ox: e.x + Math.sin(a) * 1.6, oz: e.z + Math.cos(a) * 1.6, delay: 0.12 });
    }
  } else if (e.mode === 1) {
    e.moveName = "Doctrine";
    fan(api, e, api.px, api.pz, 1, 0, 13, { kind: "major", pierce: 2, r: 0.26 });
    if (api.minions < 2) api.spawn("wisp", e.x, e.z + 2.4);
  } else {
    e.moveName = "Tradition";
    ring(api, e, 8, 6.2, { kind: "major" });
  }
  e.atk = cd(e, 1.75);
}

function lovers(e: BossState, api: BossApi) {
  e.moveName = "Two Paths";
  const a = angTo(api.px, api.pz, e.x, e.z);
  const pxp = Math.sin(a + Math.PI / 2);
  const pzp = Math.cos(a + Math.PI / 2);
  for (const s of [-1.5, 1.5]) {
    fan(
      api,
      { ...e, x: e.x + pxp * s, z: e.z + pzp * s },
      api.px,
      api.pz,
      3,
      0.28,
      10,
      { kind: "swords", ox: e.x + pxp * s, oz: e.z + pzp * s },
    );
  }
  e.atk = cd(e, 1.5);
}

function chariot(e: BossState, dist: number, api: BossApi) {
  e.mode = (e.mode + 1) % 2;
  const a = angTo(api.px, api.pz, e.x, e.z);
  if (e.mode === 0) {
    e.moveName = "Charge";
    api.warn(api.px, api.pz, api.accent);
    api.dash(Math.sin(a) * 18, Math.cos(a) * 18, 0.48);
    for (let i = 0; i < 5; i++) {
      api.fire(a, 11 + i * 0.8, { kind: "swords", pierce: 1, delay: 0.04 * i });
    }
  } else {
    e.moveName = "Will";
    fan(api, e, api.px, api.pz, 5, 0.5, 12, { kind: "swords" });
  }
  e.atk = cd(e, 1.4);
}

function strength(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 2;
  if (e.mode === 0) {
    e.moveName = "Roar";
    ring(api, e, 14, 5.5, { kind: "pentacles", r: 0.28, life: 2.8 });
  } else {
    e.moveName = "Grip";
    fan(api, e, api.px, api.pz, 5, 0.7, 8, { kind: "pentacles", r: 0.3 });
  }
  e.atk = cd(e, 1.9);
}

function hermit(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 2;
  const a = angTo(api.px, api.pz, e.x, e.z);
  if (e.mode === 0) {
    e.moveName = "Lantern";
    api.warn(api.px, api.pz, 0xffc040);
    api.fire(a, 4, { kind: "wands", burn: true, r: 0.32, delay: 0.55, life: 3.2, dmg: e.dmg * 1.4 });
    api.fire(a, 14, { kind: "wands", burn: true, r: 0.22, delay: 0.55 });
  } else {
    e.moveName = "Inner Light";
    for (let i = 0; i < 4; i++) api.fire(a + (i - 1.5) * 0.12, 6, { kind: "wands", burn: true, delay: 0.2 * i });
  }
  e.atk = cd(e, 2.05);
}

function wheel(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 2;
  e.moveName = e.mode === 0 ? "Turn" : "Reverse";
  const dir = e.mode === 0 ? 1 : -1;
  const spin = api.t * 1.6 * dir;
  for (let k = 0; k < 12; k++) {
    api.fire(spin + k * 0.48, 5.5 + k * 0.28, { kind: "cups", life: 3.1 });
  }
  const a = angTo(api.px, api.pz, e.x, e.z) + Math.PI / 2;
  api.dash(Math.sin(a) * 7, Math.cos(a) * 7, 0.55);
  e.atk = cd(e, 1.6);
}

function justice(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 3;
  const a = angTo(api.px, api.pz, e.x, e.z);
  if (e.mode === 0) {
    e.moveName = "Scales";
    for (const s of [-0.28, 0.28]) {
      for (let i = 0; i < 4; i++) api.fire(a + s, 11 + i, { kind: "swords", pierce: 3 });
    }
  } else if (e.mode === 1) {
    e.moveName = "Verdict";
    api.warn(api.px, api.pz, api.accent);
    api.fire(a, 3, { kind: "swords", r: 0.36, delay: 0.65, pierce: 2, dmg: e.dmg * 1.5 });
  } else {
    e.moveName = "Balance";
    ring(api, e, 8, 8, { kind: "swords", pierce: 1 });
  }
  e.atk = cd(e, 1.55);
}

function hanged(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 2;
  if (e.mode === 0) {
    e.moveName = "Inversion";
    api.teleport(Math.max(-api.half + 2, Math.min(api.half - 2, api.px * 2 - e.x)), Math.max(-api.half + 2, Math.min(api.half - 2, api.pz * 2 - e.z)));
    ring(api, e, 6, 5, { kind: "chaos", delay: 0.5, homing: true });
  } else {
    e.moveName = "New View";
    const a = angTo(api.px, api.pz, e.x, e.z) + Math.PI;
    for (let i = 0; i < 7; i++) api.fire(a + (i - 3) * 0.18, 4, { kind: "chaos", delay: 0.4 + i * 0.05, homing: true });
  }
  e.atk = cd(e, 1.8);
}

function death(e: BossState, dist: number, api: BossApi) {
  e.mode = (e.mode + 1) % 2;
  const a = angTo(api.px, api.pz, e.x, e.z);
  if (e.mode === 0) {
    e.moveName = "Harvest";
    fan(api, e, api.px, api.pz, 7 + e.phase, 1.05, 9, { kind: "wands", burn: true, pierce: 1 });
  } else {
    e.moveName = "Inevitable";
    api.dash(Math.sin(a) * 16, Math.cos(a) * 16, 0.42);
    for (let i = 0; i < 6; i++) api.fire(a + Math.PI + (i - 2.5) * 0.15, 6, { kind: "wands", burn: true });
  }
  e.atk = cd(e, 1.35);
}

function temperance(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 2;
  const a = angTo(api.px, api.pz, e.x, e.z);
  if (e.mode === 0) {
    e.moveName = "Mix";
    api.fire(a - 0.18, 8, { kind: "wands", burn: true });
    api.fire(a + 0.18, 8, { kind: "cups", homing: true });
    api.heal(6);
  } else {
    e.moveName = "Flow";
    for (let k = 0; k < 10; k++) {
      api.fire((k / 10) * Math.PI * 2, 6.5, { kind: k % 2 ? "wands" : "cups", burn: k % 2 === 1 });
    }
    api.heal(10);
  }
  e.atk = cd(e, 1.7);
}

function devil(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 3;
  if (e.mode === 0) {
    e.moveName = "Chains";
    for (let i = 0; i < 3; i++) {
      api.fire(angTo(api.px, api.pz, e.x, e.z) + (i - 1) * 0.4, 4.2, { kind: "wands", homing: true, burn: true, life: 3.4, r: 0.22 });
    }
  } else if (e.mode === 1) {
    e.moveName = "Desire";
    ring(api, e, 10, 7, { kind: "wands", burn: true });
  } else {
    e.moveName = "Bondage";
    if (api.minions < 3) {
      api.spawn("wisp", e.x + 2.5, e.z);
      api.spawn("wisp", e.x - 2.5, e.z);
    }
    fan(api, e, api.px, api.pz, 4, 0.5, 8, { kind: "wands", burn: true });
  }
  e.atk = cd(e, 1.6);
}

function tower(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 3;
  if (e.mode === 0) {
    e.moveName = "Collapse";
    api.warn(api.px, api.pz, 0x7ec8ff);
    api.float("COLLAPSE");
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      api.fire(a, 8, { kind: "swords", ox: api.px, oz: api.pz, delay: 0.7, r: 0.24 });
    }
  } else if (e.mode === 1) {
    e.moveName = "Truth Strikes";
    fan(api, e, api.px, api.pz, 1, 0, 16, { kind: "swords", pierce: 2, r: 0.28 });
    fan(api, e, api.px, api.pz, 1, 0, 10, { kind: "swords", delay: 0.18 });
  } else {
    e.moveName = "Upheaval";
    for (let i = 0; i < 8; i++) {
      const edge = (i / 8) * Math.PI * 2;
      api.fire(edge + Math.PI, 9, {
        kind: "swords",
        ox: Math.sin(edge) * (api.half - 0.8),
        oz: Math.cos(edge) * (api.half - 0.8),
        delay: 0.2,
      });
    }
  }
  e.atk = cd(e, 1.5);
}

function star(e: BossState, api: BossApi) {
  e.moveName = "Hope";
  const a0 = angTo(api.px, api.pz, e.x, e.z);
  api.fire(a0, 7, { kind: "cups", homing: true });
  for (let k = 0; k < 6; k++) {
    api.fire(a0 + (k * Math.PI) / 3, 7.5, { kind: "cups", homing: true, delay: 0.08 * k });
  }
  api.heal(5);
  e.atk = cd(e, 1.65);
}

function moon(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 3;
  if (e.mode === 0) {
    e.moveName = "Illusion";
    for (let i = 0; i < 9; i++) api.fire(Math.random() * Math.PI * 2, 5 + Math.random() * 4, { kind: "chaos", delay: Math.random() * 0.4 });
  } else if (e.mode === 1) {
    e.moveName = "Night Walk";
    fan(api, e, api.px, api.pz, 5, 0.7, 7, { kind: "major", homing: true });
  } else {
    e.moveName = "Echo";
    api.warn(api.px, api.pz, 0xd0c8ff);
    for (let i = 0; i < 6; i++) {
      api.fire(angTo(api.px, api.pz, e.x, e.z) + (i - 2.5) * 0.2, 6, {
        kind: "chaos",
        ox: api.px,
        oz: api.pz,
        delay: 0.6,
        homing: true,
      });
    }
  }
  e.atk = cd(e, 1.55);
}

function sun(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 2;
  if (e.mode === 0) {
    e.moveName = "Radiance";
    ring(api, e, 16, 8, { kind: "wands", burn: true });
  } else {
    e.moveName = "Solar Banner";
    const a = angTo(api.px, api.pz, e.x, e.z);
    for (let i = 0; i < 4; i++) api.fire(a, 10 + i * 1.5, { kind: "wands", burn: true, pierce: 1 });
  }
  e.atk = cd(e, 1.5);
}

function judgement(e: BossState, api: BossApi) {
  e.mode = (e.mode + 1) % 3;
  if (e.mode === 0) {
    e.moveName = "Awaken";
    api.float("RISE");
    for (let k = 0; k < 14; k++) {
      api.fire((k / 14) * Math.PI * 2, 4.5, { kind: "major", ox: 0, oz: 0, delay: 0.55, r: 0.24 });
    }
  } else if (e.mode === 1) {
    e.moveName = "Trumpet";
    for (let i = -4; i <= 4; i++) {
      api.fire(0, 9, { kind: "major", ox: api.px + i * 1.1, oz: -api.half + 1.2, delay: 0.35 });
    }
  } else {
    e.moveName = "New Dawn";
    fan(api, e, api.px, api.pz, 6, 0.55, 11, { kind: "major" });
  }
  e.atk = cd(e, 1.7);
}

function world(e: BossState, dist: number, api: BossApi) {
  e.mode = (e.mode + 1) % 4;
  const kinds: CardKind[] = ["swords", "wands", "cups", "pentacles"];
  if (e.mode === 0) {
    e.moveName = "All Suits";
    for (let k = 0; k < 12; k++) api.fire((k / 12) * Math.PI * 2, 8, { kind: kinds[k % 4], pierce: 1, homing: k % 3 === 0 });
  } else if (e.mode === 1) {
    e.moveName = "The Circle";
    for (let k = 0; k < 14; k++) api.fire(api.t + k * 0.4, 5.5 + k * 0.22, { kind: kinds[k % 4] });
  } else if (e.mode === 2) {
    e.moveName = "Completion";
    const a = angTo(api.px, api.pz, e.x, e.z);
    api.dash(Math.sin(a) * 12, Math.cos(a) * 12, 0.4);
    ring(api, e, 8, 9, { kind: "major" });
  } else {
    e.moveName = "One With All";
    fan(api, e, api.px, api.pz, 5, 0.45, 11, { kind: "major", pierce: 1 });
    if (api.minions < 2) api.spawn("mage", e.x + 3, e.z);
  }
  e.atk = cd(e, 1.35);
}
