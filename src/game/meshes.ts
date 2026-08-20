import * as THREE from "three";
import type { EnemyKind, HeroForm, HeroId, WeaponKind } from "./types";
import { HERO_BY_ID } from "./heroes";

export const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 12, 10),
  sphereHi: new THREE.SphereGeometry(1, 18, 14),
  cone: new THREE.ConeGeometry(1, 1, 10),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
  cylR: new THREE.CylinderGeometry(1, 0.7, 1, 12),
  torus: new THREE.TorusGeometry(1, 0.18, 8, 16),
  octa: new THREE.OctahedronGeometry(1, 0),
  ico: new THREE.IcosahedronGeometry(1, 0),
  plane: new THREE.PlaneGeometry(1, 1),
  ring: new THREE.RingGeometry(0.7, 1, 24),
};

export function mat(
  color: number,
  opts: { metal?: number; rough?: number; emissive?: number; eInt?: number; flat?: boolean } = {},
) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: opts.metal ?? 0.15,
    roughness: opts.rough ?? 0.62,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.eInt ?? 0,
    flatShading: opts.flat ?? true,
  });
}

function add(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  rotX = 0,
  rotY = 0,
  rotZ = 0,
) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.rotation.set(rotX, rotY, rotZ);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function createHeroMesh(id: HeroId): THREE.Group {
  const h = HERO_BY_ID[id];
  const g = new THREE.Group();
  const gold = mat(0xd4af37, { metal: 0.82, rough: 0.22, emissive: 0x3a2808, eInt: 0.28 });
  const trim = mat(h.accent, { metal: 0.45, rough: 0.32, emissive: h.accent, eInt: 0.45 });
  const dark = mat(0x1a1218, { rough: 0.82 });
  const robe = mat(h.color, { rough: 0.52, metal: 0.12, emissive: h.color, eInt: 0.22 });
  const fur = speciesFur(h.form);

  const shadow = new THREE.Mesh(
    GEO.sphere,
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false }),
  );
  shadow.scale.set(0.38, 0.035, 0.38);
  shadow.position.y = 0.02;
  g.add(shadow);

  const ring = new THREE.Mesh(
    GEO.ring,
    new THREE.MeshBasicMaterial({
      color: h.accent,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;
  ring.scale.set(0.55, 0.55, 0.55);
  g.add(ring);

  const body = new THREE.Group();
  add(body, GEO.sphere, robe, 0, 0.36, 0, 0.2, 0.14, 0.16);
  add(body, GEO.sphere, robe, 0, 0.62, 0.02, 0.24, 0.26, 0.18);
  add(body, GEO.cyl, gold, 0, 0.5, 0.12, 0.08, 0.04, 0.08);
  add(body, GEO.cyl, dark, -0.09, 0.18, 0.02, 0.065, 0.32, 0.065);
  add(body, GEO.cyl, dark, 0.09, 0.18, 0.02, 0.065, 0.32, 0.065);
  add(body, GEO.sphere, dark, -0.09, 0.04, 0.08, 0.08, 0.045, 0.11);
  add(body, GEO.sphere, dark, 0.09, 0.04, 0.08, 0.08, 0.045, 0.11);
  add(body, GEO.cyl, robe, -0.26, 0.58, 0.02, 0.05, 0.32, 0.05, 0, 0, 0.45);
  add(body, GEO.cyl, robe, 0.26, 0.58, 0.02, 0.05, 0.32, 0.05, 0, 0, -0.35);

  const head = new THREE.Group();
  head.position.set(0, 0.95, 0.04);
  speciesHead(h.form, head, fur, gold, trim, dark);
  body.add(head);

  const wpn = new THREE.Group();
  wpn.position.set(0.32, 0.42, 0.1);
  wpn.rotation.z = -0.25;
  heroWeapon(h.weaponKind, wpn, gold, trim, dark);
  body.add(wpn);
  g.add(body);

  const muzzle = new THREE.Object3D();
  muzzle.position.set(0.2, 0.95, 0.42);
  g.add(muzzle);

  g.userData.muzzle = muzzle;
  g.userData.body = body;
  g.userData.ring = ring;
  g.userData.bob = body;
  return g;
}

const FUR: Record<HeroForm, number> = {
  otter: 0x8b5a32,
  eagle: 0x3a2a18,
  lynx: 0xc4a06a,
  lizard: 0x4a8a32,
  raven: 0x141418,
  panda: 0xc45a28,
  deer: 0xb8894a,
  cockatoo: 0xf2efe4,
  owl: 0xc8b090,
  fox: 0xc45a28,
  lion: 0xd4a04a,
  bull: 0x4a3020,
  swan: 0xf2f0ea,
  wolf: 0x8a94a0,
  bear: 0x5a3a22,
  turtle: 0x3a6a3a,
  dolphin: 0x6a8aaa,
  jackal: 0xc9a227,
  bat: 0x2a2030,
  horse: 0x2a2218,
  crane: 0xf0ece4,
  ram: 0x5a4030,
  raccoon: 0x6a5a48,
  rooster: 0xc43c1c,
  dragon: 0x2a8a4a,
};

function speciesFur(form: HeroForm) {
  return mat(FUR[form] ?? 0x8b5a32, { rough: 0.78 });
}

function speciesHead(
  form: HeroForm,
  head: THREE.Group,
  fur: THREE.Material,
  gold: THREE.Material,
  trim: THREE.Material,
  dark: THREE.Material,
) {
  const eyeW = mat(0xf4f0e8);
  const eyeB = mat(0x111111);
  add(head, GEO.sphere, fur, 0, 0, 0, 0.28, 0.26, 0.26);

  const ears = (spread: number, h: number, s: number, inner?: THREE.Material) => {
    add(head, GEO.sphere, fur, -spread, h, -0.02, s, s * 1.15, s * 0.7);
    add(head, GEO.sphere, fur, spread, h, -0.02, s, s * 1.15, s * 0.7);
    if (inner) {
      add(head, GEO.sphere, inner, -spread, h, 0.04, s * 0.5, s * 0.55, s * 0.3);
      add(head, GEO.sphere, inner, spread, h, 0.04, s * 0.5, s * 0.55, s * 0.3);
    }
  };
  const eyes = (glow?: THREE.Material) => {
    add(head, GEO.sphere, eyeW, -0.09, 0.04, 0.2, 0.05, 0.055, 0.04);
    add(head, GEO.sphere, eyeW, 0.09, 0.04, 0.2, 0.05, 0.055, 0.04);
    add(head, GEO.sphere, glow ?? eyeB, -0.09, 0.04, 0.24, 0.025, 0.03, 0.02);
    add(head, GEO.sphere, glow ?? eyeB, 0.09, 0.04, 0.24, 0.025, 0.03, 0.02);
  };

  if (form === "otter" || form === "deer") {
    ears(0.2, 0.18, 0.1, mat(0xd8a070));
    add(head, GEO.sphere, fur, 0, -0.04, 0.2, 0.16, 0.12, 0.2);
    add(head, GEO.sphere, dark, 0, -0.02, 0.36, 0.05, 0.04, 0.05);
    eyes();
    if (form === "deer") {
      add(head, GEO.cone, gold, -0.12, 0.34, -0.04, 0.03, 0.28, 0.03);
      add(head, GEO.cone, gold, 0.12, 0.34, -0.04, 0.03, 0.28, 0.03);
    } else {
      add(head, GEO.cone, mat(0x3a1a6a), 0, 0.22, -0.02, 0.22, 0.28, 0.22);
    }
  } else if (form === "eagle" || form === "cockatoo" || form === "owl" || form === "raven" || form === "swan" || form === "crane" || form === "rooster") {
    const beak = form === "raven" ? dark : gold;
    add(head, GEO.sphere, form === "raven" || form === "eagle" ? (form === "raven" ? dark : mat(0xf2efe4)) : fur, 0, 0.04, 0.02, 0.26, 0.22, 0.24);
    add(head, GEO.cone, beak, 0, -0.02, 0.32, 0.08, 0.28, 0.08, Math.PI / 2, 0, 0);
    add(head, GEO.sphere, eyeB, -0.09, 0.06, 0.2, 0.035, 0.04, 0.03);
    add(head, GEO.sphere, eyeB, 0.09, 0.06, 0.2, 0.035, 0.04, 0.03);
    add(head, GEO.cone, fur, -0.34, 0.1, -0.04, 0.12, 0.5, 0.28, 0, 0, 1.1);
    add(head, GEO.cone, fur, 0.34, 0.1, -0.04, 0.12, 0.5, 0.28, 0, 0, -1.1);
    if (form === "cockatoo") add(head, GEO.cone, mat(0xf2d080), 0, 0.32, -0.04, 0.08, 0.28, 0.12);
    if (form === "rooster") add(head, GEO.cone, mat(0xc43c1c, { emissive: 0x801010, eInt: 0.3 }), 0, 0.32, 0, 0.08, 0.22, 0.08);
  } else if (form === "lynx" || form === "fox" || form === "lion" || form === "wolf" || form === "jackal") {
    ears(0.2, 0.26, 0.11, mat(0xe8c090));
    if (form === "lynx") {
      add(head, GEO.cone, fur, -0.2, 0.4, -0.02, 0.05, 0.16, 0.05);
      add(head, GEO.cone, fur, 0.2, 0.4, -0.02, 0.05, 0.16, 0.05);
    }
    add(head, GEO.sphere, fur, 0, -0.02, 0.18, 0.14, 0.12, 0.16);
    eyes(form === "lynx" ? mat(0xc9a227) : undefined);
    if (form === "lion") add(head, GEO.sphere, mat(0xa07030), 0, 0.02, -0.08, 0.38, 0.32, 0.3);
  } else if (form === "lizard" || form === "dragon") {
    add(head, GEO.sphere, fur, 0, 0, 0.08, 0.24, 0.2, 0.32);
    add(head, GEO.cone, form === "dragon" ? gold : mat(0x2e6a22, { emissive: 0x1a4a10, eInt: 0.3 }), 0, 0.22, -0.04, 0.08, 0.28, 0.12);
    add(head, GEO.sphere, mat(0xf0e060, { emissive: 0xa08010, eInt: 0.5 }), -0.1, 0.04, 0.28, 0.04, 0.04, 0.03);
    add(head, GEO.sphere, mat(0xf0e060, { emissive: 0xa08010, eInt: 0.5 }), 0.1, 0.04, 0.28, 0.04, 0.04, 0.03);
    if (form === "dragon") {
      add(head, GEO.cone, gold, -0.16, 0.28, -0.04, 0.05, 0.22, 0.05);
      add(head, GEO.cone, gold, 0.16, 0.28, -0.04, 0.05, 0.22, 0.05);
    }
  } else if (form === "panda" || form === "raccoon" || form === "bear") {
    const cream = mat(0xf2e6d0);
    ears(0.2, 0.2, 0.12, cream);
    add(head, GEO.sphere, form === "bear" ? fur : cream, 0, -0.04, 0.16, 0.16, 0.14, 0.18);
    add(head, GEO.sphere, dark, -0.12, 0.06, 0.18, 0.07, 0.05, 0.05);
    add(head, GEO.sphere, dark, 0.12, 0.06, 0.18, 0.07, 0.05, 0.05);
    eyes();
  } else if (form === "bull" || form === "ram") {
    ears(0.18, 0.12, 0.08);
    add(head, GEO.sphere, fur, 0, -0.04, 0.2, 0.18, 0.14, 0.2);
    add(head, GEO.cyl, gold, -0.28, 0.22, -0.02, 0.04, 0.32, 0.04, 0, 0, 0.7);
    add(head, GEO.cyl, gold, 0.28, 0.22, -0.02, 0.04, 0.32, 0.04, 0, 0, -0.7);
    eyes();
  } else if (form === "turtle") {
    add(head, GEO.sphere, mat(0x5a7a3a), 0, 0.02, -0.06, 0.34, 0.18, 0.28);
    add(head, GEO.sphere, fur, 0, -0.02, 0.18, 0.16, 0.12, 0.2);
    eyes();
  } else if (form === "dolphin") {
    add(head, GEO.sphere, fur, 0, 0.04, 0.16, 0.22, 0.16, 0.28);
    add(head, GEO.cone, fur, 0, 0.28, -0.04, 0.06, 0.22, 0.1);
    add(head, GEO.sphere, eyeB, -0.08, 0.04, 0.26, 0.03, 0.03, 0.03);
    add(head, GEO.sphere, eyeB, 0.08, 0.04, 0.26, 0.03, 0.03, 0.03);
  } else if (form === "bat") {
    add(head, GEO.cone, fur, -0.28, 0.18, -0.02, 0.18, 0.08, 0.28, 0, 0, 0.4);
    add(head, GEO.cone, fur, 0.28, 0.18, -0.02, 0.18, 0.08, 0.28, 0, 0, -0.4);
    add(head, GEO.cone, dark, 0, -0.02, 0.3, 0.05, 0.18, 0.05, Math.PI / 2);
    eyes(trim);
  } else if (form === "horse") {
    add(head, GEO.sphere, fur, 0, 0, 0.18, 0.16, 0.14, 0.28);
    add(head, GEO.sphere, dark, 0, -0.04, 0.4, 0.06, 0.05, 0.06);
    ears(0.14, 0.22, 0.08);
    eyes();
  } else {
    ears(0.2, 0.18, 0.1);
    eyes();
  }
}

function heroWeapon(
  kind: WeaponKind,
  w: THREE.Group,
  gold: THREE.Material,
  trim: THREE.Material,
  dark: THREE.Material,
) {
  if (kind === "staff" || kind === "scepter") {
    add(w, GEO.cyl, dark, 0, 0.2, 0, 0.035, 1.1, 0.035);
    add(w, GEO.torus, gold, 0, 0.78, 0, 0.16, 0.16, 0.16, Math.PI / 2);
    add(w, GEO.octa, trim, 0, 0.78, 0, 0.12, 0.12, 0.12);
  } else if (kind === "blades" || kind === "scythe") {
    add(w, GEO.box, gold, kind === "scythe" ? 0.05 : -0.18, 0.15, 0.1, 0.05, 0.7, 0.12);
    if (kind === "blades") add(w, GEO.box, gold, 0.22, 0.15, 0.1, 0.05, 0.7, 0.12);
  } else if (kind === "coin" || kind === "orb") {
    add(w, GEO.cyl, gold, 0.05, 0.2, 0.15, 0.22, 0.05, 0.22, Math.PI / 2, 0, 0);
    add(w, GEO.octa, trim, 0.05, 0.2, 0.18, 0.1, 0.1, 0.04);
  } else if (kind === "wand" || kind === "lantern") {
    add(w, GEO.cyl, dark, 0, 0.15, 0, 0.04, 1.0, 0.04);
    const fire = mat(0xff6a20, { emissive: 0xff4a00, eInt: 1.2, rough: 0.4 });
    add(w, GEO.sphere, fire, 0, 0.72, 0, 0.14, 0.18, 0.14);
    add(w, GEO.sphere, mat(0xffe080, { emissive: 0xffc040, eInt: 1.4 }), 0, 0.78, 0, 0.07, 0.09, 0.07);
  } else if (kind === "chalice") {
    add(w, GEO.cyl, gold, 0, 0.05, 0.1, 0.05, 0.25, 0.05);
    add(w, GEO.cylR, trim, 0, 0.32, 0.1, 0.14, 0.22, 0.14);
    add(w, GEO.cyl, gold, 0, 0.18, 0.1, 0.16, 0.04, 0.16);
  } else if (kind === "batons") {
    add(w, GEO.cyl, gold, -0.16, 0.2, 0.1, 0.04, 0.7, 0.04);
    add(w, GEO.cyl, gold, 0.2, 0.2, 0.1, 0.04, 0.7, 0.04);
    add(w, GEO.torus, trim, 0.02, 0.55, 0.1, 0.22, 0.22, 0.22, Math.PI / 2);
  } else if (kind === "bow") {
    add(w, GEO.torus, gold, 0, 0.25, 0.1, 0.28, 0.28, 0.28, 0, 0, Math.PI / 2);
    add(w, GEO.cyl, trim, 0, 0.25, 0.1, 0.02, 0.5, 0.02);
  } else if (kind === "spear") {
    add(w, GEO.cyl, dark, 0, 0.2, 0, 0.03, 1.2, 0.03);
    add(w, GEO.cone, gold, 0, 0.85, 0, 0.08, 0.22, 0.08);
  } else if (kind === "horn") {
    add(w, GEO.cone, gold, 0, 0.3, 0.1, 0.08, 0.7, 0.12, 0.4);
    add(w, GEO.torus, trim, 0, 0.05, 0.1, 0.12, 0.12, 0.12, Math.PI / 2);
  } else if (kind === "rope") {
    add(w, GEO.torus, gold, 0, 0.25, 0.1, 0.2, 0.2, 0.2);
    add(w, GEO.cyl, dark, 0, 0.45, 0.1, 0.03, 0.5, 0.03);
  } else if (kind === "scroll") {
    add(w, GEO.cyl, trim, 0, 0.2, 0.1, 0.08, 0.45, 0.08, Math.PI / 2);
    add(w, GEO.cyl, gold, 0, 0.2, 0.1, 0.09, 0.08, 0.09, Math.PI / 2);
  }
}

export function createEnemyMesh(kind: EnemyKind, tint = 0x6a3a88): THREE.Group {
  const g = new THREE.Group();
  const body = mat(tint, { rough: 0.7, emissive: tint, eInt: 0.12 });
  const dark = mat(0x1a1018);
  const gold = mat(0xd4af37, { metal: 0.8, rough: 0.25 });

  if (kind === "wisp") {
    add(g, GEO.sphere, body, 0, 0.55, 0, 0.32, 0.4, 0.32);
    add(g, GEO.sphere, mat(0xf2e8ff, { emissive: 0xc8a0ff, eInt: 1.4 }), 0, 0.62, 0.18, 0.12, 0.12, 0.08);
  } else if (kind === "scarab") {
    add(g, GEO.sphere, body, 0, 0.28, 0, 0.38, 0.22, 0.5);
    add(g, GEO.sphere, gold, 0, 0.38, 0.28, 0.18, 0.14, 0.18);
    add(g, GEO.box, dark, -0.32, 0.32, 0, 0.08, 0.04, 0.5);
    add(g, GEO.box, dark, 0.32, 0.32, 0, 0.08, 0.04, 0.5);
  } else if (kind === "brute") {
    add(g, GEO.box, body, 0, 0.7, 0, 0.9, 1.2, 0.7);
    add(g, GEO.box, gold, 0, 1.2, 0.2, 0.7, 0.18, 0.5);
    add(g, GEO.sphere, dark, -0.18, 1.15, 0.4, 0.1, 0.1, 0.08);
    add(g, GEO.sphere, dark, 0.18, 1.15, 0.4, 0.1, 0.1, 0.08);
  } else if (kind === "mage") {
    add(g, GEO.cylR, body, 0, 0.55, 0, 0.32, 0.9, 0.32);
    add(g, GEO.cone, dark, 0, 1.2, 0, 0.34, 0.5, 0.34);
    add(g, GEO.sphere, mat(0xff6a40, { emissive: 0xff4010, eInt: 0.9 }), 0.28, 0.7, 0.2, 0.12, 0.12, 0.12);
  } else {
    add(g, GEO.box, gold, 0, 1.1, 0, 1.1, 2.0, 0.8);
  }

  const bar = new THREE.Group();
  bar.position.set(0, kind === "brute" ? 1.7 : kind === "mage" ? 1.6 : 1.15, 0);
  const bg = new THREE.Mesh(GEO.box, new THREE.MeshBasicMaterial({ color: 0x220808 }));
  bg.scale.set(0.7, 0.07, 0.07);
  const fg = new THREE.Mesh(GEO.box, new THREE.MeshBasicMaterial({ color: 0xc4453c }));
  fg.scale.set(0.68, 0.05, 0.08);
  fg.position.z = 0.01;
  bar.add(bg, fg);
  g.add(bar);
  g.userData.hpBar = bar;
  g.userData.hpFg = fg;
  return g;
}

export function createAnubis(scale = 1, decorative = false): THREE.Group {
  const g = new THREE.Group();
  const gold = mat(0xd4af37, { metal: 0.88, rough: 0.2, emissive: 0x3a2808, eInt: 0.18 });
  const teal = mat(0x2a7a6c, { metal: 0.35, rough: 0.4, emissive: 0x0a3a32, eInt: 0.25 });
  const dark = mat(0x2a2218, { metal: 0.4, rough: 0.5 });
  const stone = mat(0xb8b0a0, { metal: 0.1, rough: 0.8 });

  add(g, GEO.box, gold, 0, 1.15, 0, 1.15, 1.5, 0.7);
  add(g, GEO.box, gold, -0.28, 0.28, 0.05, 0.38, 0.55, 0.4);
  add(g, GEO.box, gold, 0.28, 0.28, 0.05, 0.38, 0.55, 0.4);
  add(g, GEO.box, stone, -0.55, 1.15, 0, 0.32, 1.1, 0.38);
  add(g, GEO.box, stone, 0.55, 1.15, 0, 0.32, 1.1, 0.38);
  for (let i = 0; i < 6; i++) {
    const m = i % 2 === 0 ? gold : teal;
    add(g, GEO.box, m, 0, 1.95 - i * 0.12, 0.38, 0.95, 0.12, 0.12);
  }
  add(g, GEO.box, gold, 0, 2.15, 0.15, 0.7, 0.55, 0.7);
  add(g, GEO.box, gold, 0, 2.05, 0.55, 0.32, 0.28, 0.45);
  add(g, GEO.box, gold, -0.28, 2.55, 0.05, 0.16, 0.45, 0.12);
  add(g, GEO.box, gold, 0.28, 2.55, 0.05, 0.16, 0.45, 0.12);
  add(g, GEO.sphere, dark, -0.16, 2.2, 0.5, 0.07, 0.07, 0.05);
  add(g, GEO.sphere, dark, 0.16, 2.2, 0.5, 0.07, 0.07, 0.05);

  if (!decorative) {
    const bar = new THREE.Group();
    bar.position.set(0, 3.15, 0);
    const bg = new THREE.Mesh(GEO.box, new THREE.MeshBasicMaterial({ color: 0x220808 }));
    bg.scale.set(1.6, 0.1, 0.08);
    const fg = new THREE.Mesh(GEO.box, new THREE.MeshBasicMaterial({ color: 0xc4453c }));
    fg.scale.set(1.55, 0.07, 0.09);
    bar.add(bg, fg);
    g.add(bar);
    g.userData.hpBar = bar;
    g.userData.hpFg = fg;
  }

  g.scale.setScalar(scale);
  return g;
}

export type Obstacle = { x: number; z: number; r: number };

export async function loadTextures() {
  const loader = new THREE.TextureLoader();
  const load = (url: string) =>
    new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  const [floor, sand, wall] = await Promise.all([
    load("/textures/floor.jpg"),
    load("/textures/sand.jpg"),
    load("/textures/wall.jpg"),
  ]);
  for (const t of [floor, sand, wall]) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
  }
  floor.repeat.set(6, 6);
  sand.repeat.set(16, 16);
  wall.repeat.set(3, 1);
  return { floor, sand, wall };
}

export function createSandPlane(tex: THREE.Texture) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.96, metalness: 0.04 }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = -0.14;
  m.receiveShadow = true;
  return m;
}

export function createStarfield() {
  const geo = new THREE.BufferGeometry();
  const n = 900;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 90;
    pos[i * 3 + 1] = 6 + Math.random() * 22;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 90;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0xe8d8a0,
      size: 0.07,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    }),
  );
  const g = new THREE.Group();
  g.add(pts);
  return g;
}

export function createDungeon(
  size: number,
  textures: { floor: THREE.Texture; wall: THREE.Texture; sand: THREE.Texture },
  room: number,
) {
  const group = new THREE.Group();
  const half = size / 2;
  const obstacles: Obstacle[] = [];

  const floorTex = textures.floor.clone();
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(size / 1.7, size / 1.7);
  floorTex.needsUpdate = true;
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.5,
      metalness: 0.22,
      emissive: 0x4a1820,
      emissiveIntensity: 0.22,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ map: textures.wall, roughness: 0.78, metalness: 0.12 });
  const wallH = 2.35;
  const thick = 0.6;
  const wall = (x: number, z: number, sx: number, sz: number) => {
    const m = new THREE.Mesh(GEO.box, wallMat);
    m.position.set(x, wallH / 2, z);
    m.scale.set(sx, wallH, sz);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  };
  wall(0, -half - thick / 2, size + thick * 2, thick);
  wall(0, half + thick / 2, size + thick * 2, thick);
  wall(-half - thick / 2, 0, thick, size);
  wall(half + thick / 2, 0, thick, size);

  const gold = mat(0xd4af37, { metal: 0.85, rough: 0.22, emissive: 0x3a2808, eInt: 0.18 });
  const stone = mat(0x5a3828, { rough: 0.82 });
  const seed = (s: number) => {
    const x = Math.sin(s * 12.9898 + room * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const count = 3 + (room % 4);
  for (let i = 0; i < count; i++) {
    const a = seed(i * 3.17) * Math.PI * 2;
    const d = 2.4 + seed(i * 9.1) * (half - 4.2);
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (Math.hypot(x, z) < 2.4) continue;
    add(group, GEO.cyl, stone, x, 0.7, z, 0.42, 1.4, 0.42);
    add(group, GEO.cyl, gold, x, 1.42, z, 0.48, 0.12, 0.48);
    obstacles.push({ x, z, r: 0.55 });
  }

  const corners: [number, number][] = [
    [-half + 1.15, -half + 1.15],
    [half - 1.15, -half + 1.15],
    [-half + 1.15, half - 1.15],
    [half - 1.15, half - 1.15],
  ];
  const fire = mat(0xff6a20, { emissive: 0xff4010, eInt: 1.15, rough: 0.4 });
  for (const [x, z] of corners) {
    add(group, GEO.cyl, gold, x, 0.38, z, 0.16, 0.76, 0.16);
    add(group, GEO.sphere, fire, x, 0.92, z, 0.14, 0.18, 0.14);
    obstacles.push({ x, z, r: 0.32 });
  }

  if (room % 5 === 0) {
    const statue = createAnubis(0.35, true);
    statue.position.set(0, 0, -half + 1.6);
    group.add(statue);
    obstacles.push({ x: 0, z: -half + 1.6, r: 0.7 });
  }

  return { group, obstacles, half };
}

export function createBulletMesh(color: number, _team: "player" | "enemy", kind: CardKind = "major") {
  const m = new THREE.Mesh(
    CARD_GEO,
    new THREE.MeshBasicMaterial({
      map: cardTexture(kind, color),
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  m.castShadow = false;
  m.userData.kind = kind;
  return m;
}

export function createSparkMesh(color: number) {
  const m = new THREE.Mesh(
    GEO.octa,
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    }),
  );
  m.scale.set(0.09, 0.12, 0.09);
  return m;
}

export function createCoinMesh() {
  const m = new THREE.Mesh(
    GEO.cyl,
    mat(0xe8c456, { metal: 0.9, rough: 0.18, emissive: 0x5a3a08, eInt: 0.45 }),
  );
  m.scale.set(0.16, 0.045, 0.16);
  m.rotation.x = Math.PI / 2;
  return m;
}

export function createOrbitMesh(color: number, kind: CardKind = "major") {
  const m = createBulletMesh(color, "player", kind);
  m.scale.set(0.45, 0.45, 0.45);
  return m;
}

const CARD_GEO = new THREE.PlaneGeometry(0.28, 0.42);
const cardTexCache = new Map<string, THREE.CanvasTexture>();

export type CardKind = "swords" | "wands" | "cups" | "pentacles" | "major" | "chaos";

export function suitToCard(suit: string, element: string): CardKind {
  const s = `${suit} ${element}`.toLowerCase();
  if (s.includes("sword") || s.includes("air") || s.includes("wind")) return "swords";
  if (s.includes("wand") || s.includes("fire")) return "wands";
  if (s.includes("cup") || s.includes("water")) return "cups";
  if (s.includes("pent") || s.includes("earth")) return "pentacles";
  if (s.includes("chaos")) return "chaos";
  return "major";
}

export function tintCardMesh(mesh: THREE.Mesh, kind: CardKind, color: number) {
  const matl = mesh.material as THREE.MeshBasicMaterial;
  matl.map = cardTexture(kind, color);
  matl.color.setHex(0xffffff);
  matl.needsUpdate = true;
}

function cardTexture(kind: CardKind, hex: number): THREE.CanvasTexture {
  const key = `${kind}-${hex}`;
  const hit = cardTexCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 240;
  const ctx = c.getContext("2d")!;
  const r = (hex >> 16) & 255;
  const gc = (hex >> 8) & 255;
  const b = hex & 255;
  ctx.fillStyle = "#07050c";
  ctx.fillRect(0, 0, 160, 240);
  ctx.strokeStyle = "#e8c456";
  ctx.lineWidth = 10;
  roundRect(ctx, 6, 6, 148, 228, 14);
  ctx.stroke();
  ctx.fillStyle = `rgba(${r},${gc},${b},0.45)`;
  roundRect(ctx, 16, 16, 128, 208, 10);
  ctx.fill();
  ctx.strokeStyle = "#f3e6b0";
  ctx.lineWidth = 3;
  roundRect(ctx, 16, 16, 128, 208, 10);
  ctx.stroke();
  ctx.fillStyle = "#f8eec0";
  ctx.strokeStyle = "#f8eec0";
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.translate(80, 120);
  drawSuit(ctx, kind);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  cardTexCache.set(key, tex);
  return tex;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rad: number) {
  g.beginPath();
  g.moveTo(x + rad, y);
  g.arcTo(x + w, y, x + w, y + h, rad);
  g.arcTo(x + w, y + h, x, y + h, rad);
  g.arcTo(x, y + h, x, y, rad);
  g.arcTo(x, y, x + w, y, rad);
  g.closePath();
}

function drawSuit(g: CanvasRenderingContext2D, kind: CardKind) {
  if (kind === "swords") {
    g.rotate(-0.4);
    g.beginPath();
    g.moveTo(0, -70);
    g.lineTo(0, 70);
    g.moveTo(-12, -52);
    g.lineTo(12, -52);
    g.stroke();
    g.rotate(0.85);
    g.beginPath();
    g.moveTo(0, -70);
    g.lineTo(0, 70);
    g.moveTo(-12, -52);
    g.lineTo(12, -52);
    g.stroke();
  } else if (kind === "wands") {
    g.beginPath();
    g.moveTo(0, 70);
    g.lineTo(0, -30);
    g.stroke();
    g.beginPath();
    g.arc(0, -52, 22, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(-18, -40);
    g.lineTo(0, -78);
    g.lineTo(18, -40);
    g.fill();
  } else if (kind === "cups") {
    g.beginPath();
    g.moveTo(-28, -20);
    g.quadraticCurveTo(-28, 18, 0, 22);
    g.quadraticCurveTo(28, 18, 28, -20);
    g.lineTo(-28, -20);
    g.fill();
    g.beginPath();
    g.moveTo(0, 22);
    g.lineTo(0, 48);
    g.moveTo(-18, 58);
    g.lineTo(18, 58);
    g.stroke();
  } else if (kind === "pentacles") {
    g.beginPath();
    g.arc(0, 0, 48, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
      const x = Math.cos(a) * 38;
      const y = Math.sin(a) * 38;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.stroke();
  } else if (kind === "chaos") {
    g.beginPath();
    g.moveTo(-20, -50);
    g.lineTo(8, 10);
    g.moveTo(20, -50);
    g.lineTo(-8, 10);
    g.moveTo(-28, 18);
    g.lineTo(28, 18);
    g.stroke();
  } else {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(Math.cos(a) * 56, Math.sin(a) * 56);
      g.stroke();
    }
    g.beginPath();
    g.arc(0, 0, 16, 0, Math.PI * 2);
    g.fill();
  }
}


