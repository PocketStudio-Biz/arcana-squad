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
  shadow.scale.set(0.42, 0.035, 0.42);
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
  ring.scale.set(0.58, 0.58, 0.58);
  g.add(ring);

  const body = new THREE.Group();
  add(body, GEO.sphereHi, robe, 0, 0.5, 0.02, 0.22, 0.16, 0.19);
  add(body, GEO.sphereHi, robe, 0, 0.82, 0.04, 0.28, 0.32, 0.2);
  add(body, GEO.cyl, gold, 0, 0.62, 0.03, 0.23, 0.05, 0.18);
  add(body, GEO.octa, trim, 0, 0.62, 0.2, 0.08, 0.08, 0.055);
  add(body, GEO.cyl, dark, -0.09, 0.24, 0.04, 0.062, 0.46, 0.062);
  add(body, GEO.cyl, dark, 0.09, 0.24, 0.04, 0.062, 0.46, 0.062);
  add(body, GEO.sphere, dark, -0.09, 0.03, 0.1, 0.09, 0.045, 0.13);
  add(body, GEO.sphere, dark, 0.09, 0.03, 0.1, 0.09, 0.045, 0.13);
  add(body, GEO.sphere, robe, 0, 0.78, -0.16, 0.3, 0.36, 0.12);
  add(body, GEO.sphere, gold, -0.26, 0.94, 0.04, 0.1, 0.08, 0.09);
  add(body, GEO.sphere, gold, 0.26, 0.94, 0.04, 0.1, 0.08, 0.09);
  add(body, GEO.cyl, robe, -0.32, 0.66, 0.06, 0.052, 0.42, 0.052, 0, 0, 0.5);
  add(body, GEO.cyl, robe, 0.32, 0.66, 0.06, 0.052, 0.42, 0.052, 0, 0, -0.4);
  add(body, GEO.sphere, fur, -0.4, 0.44, 0.14, 0.06, 0.055, 0.06);
  add(body, GEO.sphere, fur, 0.41, 0.46, 0.15, 0.06, 0.055, 0.06);

  if (h.weaponKind === "staff" || h.weaponKind === "wand") {
    add(body, GEO.cone, robe, 0, 1.12, -0.04, 0.3, 0.42, 0.3);
  }
  if (h.form === "turtle") {
    add(body, GEO.sphere, mat(0x2a4a22, { rough: 0.7, metal: 0.28 }), 0, 0.74, -0.16, 0.34, 0.24, 0.24);
    add(body, GEO.octa, gold, 0, 0.9, -0.28, 0.09, 0.09, 0.07);
    add(body, GEO.octa, gold, -0.14, 0.72, -0.28, 0.06, 0.06, 0.05);
    add(body, GEO.octa, gold, 0.14, 0.72, -0.28, 0.06, 0.06, 0.05);
  }
  if (h.form === "dragon" || h.form === "lizard") {
    add(body, GEO.cone, robe, -0.38, 0.86, -0.12, 0.1, 0.62, 0.26, 0.2, 0, 1.15);
    add(body, GEO.cone, robe, 0.38, 0.86, -0.12, 0.1, 0.62, 0.26, 0.2, 0, -1.15);
    add(body, GEO.cone, fur, 0, 0.5, -0.36, 0.08, 0.7, 0.12, 1.15, 0, 0);
  }
  if (h.form === "lynx" || h.form === "otter" || h.form === "fox" || h.form === "wolf") {
    add(body, GEO.cone, fur, 0, 0.42, -0.32, 0.07, 0.55, 0.1, 1.05, 0, 0);
  }

  const head = new THREE.Group();
  head.position.set(0, 1.18, 0.06);
  speciesHead(h.form, head, fur, gold, trim, dark);
  body.add(head);

  if (id !== "world") {
    const dual = h.weaponKind === "blades";
    const wpn = new THREE.Group();
    wpn.position.set(dual ? 0.34 : 0.3, 0.4, 0.12);
    wpn.rotation.z = -0.22;
    heroWeapon(h.weaponKind, wpn, gold, trim, dark);
    body.add(wpn);
    if (dual) {
      const left = new THREE.Group();
      left.position.set(-0.34, 0.4, 0.12);
      left.rotation.z = 0.22;
      heroWeapon(h.weaponKind, left, gold, trim, dark);
      body.add(left);
    }
  }

  // Six-Path model sheet details. These only affect the playable Circle heroes;
  // bosses and the wider Major Arcana roster keep their existing shared rig.
  if (id === "fool") {
    add(body, GEO.cone, robe, 0, 1.43, -0.02, 0.29, 0.42, 0.29);
    for (const [x, y, z] of [[0.54, 1.52, 0.1], [-0.46, 1.62, -0.12], [0.02, 1.92, 0.05]]) {
      add(body, GEO.octa, trim, x, y, z, 0.09, 0.09, 0.09);
    }
    add(body, GEO.octa, gold, 0.34, 1.4, 0.18, 0.13, 0.13, 0.13);
  } else if (id === "swords") {
    for (const x of [-0.58, 0.58]) {
      add(body, GEO.cone, trim, x, 1.08, -0.08, 0.07, 0.55, 0.22, 0, 0, -x * 0.8);
    }
  } else if (id === "pentacles") {
    add(body, GEO.torus, gold, 0, 0.84, 0.23, 0.16, 0.16, 0.05, Math.PI / 2);
    add(body, GEO.octa, trim, 0, 0.84, 0.28, 0.11, 0.11, 0.04);
    add(body, GEO.octa, gold, 0.48, 1.1, 0.16, 0.15, 0.15, 0.05);
  } else if (id === "wands") {
    const ember = mat(0xff6a20, { emissive: 0xff4010, eInt: 1.25, rough: 0.36 });
    for (const x of [-0.46, 0.46]) {
      add(body, GEO.cone, dark, x, 1.0, -0.15, 0.15, 0.72, 0.28, 0.08, 0, -x * 0.85);
    }
    add(body, GEO.sphere, ember, -0.57, 1.32, 0.1, 0.13, 0.18, 0.13);
    add(body, GEO.cone, gold, -0.57, 1.47, 0.1, 0.08, 0.24, 0.08);
  } else if (id === "cups") {
    const shell = mat(0x5b8a53, { rough: 0.68, metal: 0.22 });
    add(body, GEO.sphere, shell, 0, 0.86, -0.27, 0.42, 0.3, 0.25);
    add(body, GEO.torus, gold, 0, 0.86, -0.49, 0.28, 0.28, 0.055, Math.PI / 2);
    add(body, GEO.octa, trim, 0.33, 1.08, 0.25, 0.1, 0.14, 0.08);
  } else if (id === "world") {
    const wing = mat(0x2c6a35, { rough: 0.5, metal: 0.15, emissive: 0x15391d, eInt: 0.34 });
    for (const x of [-0.54, 0.54]) {
      add(body, GEO.cone, wing, x, 1.02, -0.16, 0.14, 0.88, 0.3, 0.12, 0, -x * 0.82);
    }
    add(body, GEO.cyl, gold, 0.42, 0.88, 0.16, 0.045, 1.55, 0.045);
    add(body, GEO.sphere, robe, 0.42, 1.74, 0.16, 0.15, 0.15, 0.15);
    add(body, GEO.sphere, wing, 0.42, 1.48, 0.16, 0.15, 0.15, 0.15);
    add(body, GEO.octa, gold, 0.42, 1.74, 0.16, 0.08, 0.08, 0.08);
  }

  g.add(body);

  const muzzle = new THREE.Object3D();
  muzzle.position.set(0.2, 1.16, 0.52);
  g.add(muzzle);

  g.userData.muzzle = muzzle;
  g.userData.body = body;
  g.userData.ring = ring;
  g.userData.bob = body;
  g.scale.setScalar(1.18);
  return g;
}

export function createBossMesh(id: HeroId): THREE.Group {
  const g = createHeroMesh(id);
  g.scale.setScalar(2.05);
  const bar = new THREE.Group();
  bar.position.set(0, 2.05, 0);
  const bg = new THREE.Mesh(GEO.box, new THREE.MeshBasicMaterial({ color: 0x220808 }));
  bg.scale.set(1.15, 0.08, 0.08);
  const fg = new THREE.Mesh(GEO.box, new THREE.MeshBasicMaterial({ color: 0xe8c456 }));
  fg.scale.set(1.1, 0.06, 0.09);
  fg.position.z = 0.01;
  bar.add(bg, fg);
  g.add(bar);
  g.userData.hpBar = bar;
  g.userData.hpFg = fg;
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
  rabbit: 0xe8d4b0,
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
  add(head, GEO.sphereHi, fur, 0, 0, 0, 0.29, 0.27, 0.27);

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
  } else if (form === "rabbit") {
    const cream = mat(0xf2e6d0);
    add(head, GEO.sphere, fur, -0.1, 0.38, -0.02, 0.06, 0.28, 0.07);
    add(head, GEO.sphere, fur, 0.1, 0.38, -0.02, 0.06, 0.28, 0.07);
    add(head, GEO.sphere, cream, -0.1, 0.38, 0.03, 0.03, 0.18, 0.03);
    add(head, GEO.sphere, cream, 0.1, 0.38, 0.03, 0.03, 0.18, 0.03);
    add(head, GEO.sphere, cream, 0, -0.04, 0.18, 0.12, 0.1, 0.12);
    eyes();
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
    add(w, GEO.cyl, dark, 0, -0.05, 0.08, 0.03, 0.28, 0.03);
    add(w, GEO.box, gold, 0, 0.28, 0.08, 0.05, 0.72, 0.11);
    if (kind === "scythe") add(w, GEO.box, gold, 0.12, 0.55, 0.08, 0.28, 0.08, 0.08);
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
  const body = mat(tint, { rough: 0.62, emissive: tint, eInt: 0.18 });
  const dark = mat(0x1a1018);
  const gold = mat(0xd4af37, { metal: 0.8, rough: 0.25, emissive: 0x3a2808, eInt: 0.2 });
  const glow = mat(0xf2e8ff, { emissive: tint, eInt: 1.2 });

  if (kind === "wisp") {
    add(g, GEO.sphereHi, body, 0, 0.62, 0, 0.28, 0.34, 0.28);
    add(g, GEO.sphere, glow, 0, 0.7, 0.16, 0.14, 0.14, 0.1);
    add(g, GEO.cone, body, 0, 0.28, 0, 0.16, 0.4, 0.16);
    add(g, GEO.sphere, gold, -0.08, 0.72, 0.2, 0.035, 0.04, 0.03);
    add(g, GEO.sphere, gold, 0.08, 0.72, 0.2, 0.035, 0.04, 0.03);
  } else if (kind === "scarab") {
    add(g, GEO.sphereHi, body, 0, 0.3, 0, 0.4, 0.22, 0.52);
    add(g, GEO.sphere, gold, 0, 0.4, 0.3, 0.16, 0.12, 0.16);
    add(g, GEO.sphere, dark, -0.08, 0.42, 0.4, 0.04, 0.04, 0.03);
    add(g, GEO.sphere, dark, 0.08, 0.42, 0.4, 0.04, 0.04, 0.03);
    for (const s of [-1, 1]) {
      add(g, GEO.cyl, dark, s * 0.34, 0.22, 0.12, 0.035, 0.28, 0.035, 0, 0, s * 0.9);
      add(g, GEO.cyl, dark, s * 0.34, 0.22, -0.08, 0.035, 0.28, 0.035, 0, 0, s * 0.9);
      add(g, GEO.cyl, dark, s * 0.3, 0.22, -0.26, 0.03, 0.24, 0.03, 0, 0, s * 0.95);
    }
  } else if (kind === "brute") {
    add(g, GEO.box, body, 0, 0.72, 0, 0.95, 1.15, 0.72);
    add(g, GEO.box, gold, 0, 1.22, 0.18, 0.78, 0.2, 0.55);
    add(g, GEO.sphereHi, dark, 0, 1.55, 0.08, 0.38, 0.32, 0.34);
    add(g, GEO.cone, gold, -0.22, 1.82, 0, 0.06, 0.28, 0.06);
    add(g, GEO.cone, gold, 0.22, 1.82, 0, 0.06, 0.28, 0.06);
    add(g, GEO.sphere, glow, -0.12, 1.58, 0.32, 0.06, 0.06, 0.05);
    add(g, GEO.sphere, glow, 0.12, 1.58, 0.32, 0.06, 0.06, 0.05);
    add(g, GEO.box, dark, -0.55, 0.7, 0.1, 0.28, 0.9, 0.28);
    add(g, GEO.box, dark, 0.55, 0.7, 0.1, 0.28, 0.9, 0.28);
  } else if (kind === "mage") {
    add(g, GEO.cylR, body, 0, 0.55, 0, 0.34, 0.95, 0.34);
    add(g, GEO.cone, dark, 0, 1.22, 0, 0.38, 0.55, 0.38);
    add(g, GEO.sphereHi, dark, 0, 1.05, 0.08, 0.22, 0.2, 0.22);
    add(g, GEO.sphere, glow, -0.08, 1.08, 0.22, 0.04, 0.045, 0.03);
    add(g, GEO.sphere, glow, 0.08, 1.08, 0.22, 0.04, 0.045, 0.03);
    add(g, GEO.cyl, gold, 0.32, 0.7, 0.12, 0.04, 1.05, 0.04);
    add(g, GEO.sphere, mat(0xff6a40, { emissive: 0xff4010, eInt: 1.1 }), 0.32, 1.28, 0.12, 0.12, 0.14, 0.12);
  } else if (kind === "court") {
    add(g, GEO.box, body, 0, 0.78, 0, 0.82, 1.25, 0.62);
    add(g, GEO.box, gold, 0, 1.35, 0.12, 0.7, 0.16, 0.5);
    add(g, GEO.sphereHi, dark, 0, 1.62, 0.06, 0.32, 0.28, 0.3);
    add(g, GEO.cone, gold, 0, 2.05, 0, 0.16, 0.42, 0.16);
    add(g, GEO.sphere, glow, -0.1, 1.64, 0.28, 0.05, 0.05, 0.04);
    add(g, GEO.sphere, glow, 0.1, 1.64, 0.28, 0.05, 0.05, 0.04);
    add(g, GEO.box, dark, -0.48, 0.7, 0.08, 0.24, 0.95, 0.24);
    add(g, GEO.box, dark, 0.48, 0.7, 0.08, 0.24, 0.95, 0.24);
    add(g, GEO.box, gold, 0, 0.85, 0.34, 0.55, 0.7, 0.08);
  } else {
    add(g, GEO.box, gold, 0, 1.1, 0, 1.1, 2.0, 0.8);
  }

  const barY = kind === "brute" || kind === "court" ? 2.15 : kind === "mage" ? 1.7 : kind === "scarab" ? 0.85 : 1.2;
  const bar = new THREE.Group();
  bar.position.set(0, barY, 0);
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
  const fallback = (hex: string) => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = hex;
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for (let i = 0; i < 8; i++) ctx.fillRect(i * 8, 0, 4, 64);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };
  const loader = new THREE.TextureLoader();
  const load = (url: string, hex: string) =>
    new Promise<THREE.Texture>((resolve) => {
      let settled = false;
      const done = (t: THREE.Texture) => {
        if (settled) return;
        settled = true;
        resolve(t);
      };
      const timer = window.setTimeout(() => done(fallback(hex)), 4000);
      loader.load(
        url,
        (t) => {
          window.clearTimeout(timer);
          done(t);
        },
        undefined,
        () => {
          window.clearTimeout(timer);
          done(fallback(hex));
        },
      );
    });
  const [floor, sand, wall] = await Promise.all([
    load("/textures/floor.jpg", "#5a3828"),
    load("/textures/sand.jpg", "#c4a574"),
    load("/textures/wall.jpg", "#6a4030"),
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
    new THREE.PlaneGeometry(160, 160),
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
    pos[i * 3] = (Math.random() - 0.5) * 160;
    pos[i * 3 + 1] = 8 + Math.random() * 28;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 160;
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
  const TILE = size / 3;

  const wallMat = new THREE.MeshStandardMaterial({ map: textures.wall, roughness: 0.78, metalness: 0.12 });
  const gold = mat(0xd4af37, { metal: 0.85, rough: 0.22, emissive: 0x3a2808, eInt: 0.18 });
  const stone = mat(0x5a3828, { rough: 0.82 });
  const grout = mat(0xc9a227, { metal: 0.7, rough: 0.35, emissive: 0x3a2808, eInt: 0.12 });

  for (let ix = 0; ix < 3; ix++) {
    for (let iz = 0; iz < 3; iz++) {
      const fx = (ix - 1) * TILE;
      const fz = (iz - 1) * TILE;
      const floorTex = textures.floor.clone();
      floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
      floorTex.repeat.set(TILE / 1.7, TILE / 1.7);
      floorTex.needsUpdate = true;
      const center = ix === 1 && iz === 1;
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(TILE - 0.18, TILE - 0.18),
        new THREE.MeshStandardMaterial({
          map: floorTex,
          roughness: 0.5,
          metalness: center ? 0.28 : 0.18,
          emissive: center ? 0x5a1c28 : 0x3a1420,
          emissiveIntensity: center ? 0.28 : 0.16,
        }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(fx, 0, fz);
      floor.receiveShadow = true;
      group.add(floor);
    }
  }
  for (const t of [-TILE / 2, TILE / 2]) {
    add(group, GEO.box, grout, t, 0.02, 0, 0.16, 0.04, size);
    add(group, GEO.box, grout, 0, 0.02, t, size, 0.04, 0.16);
  }

  const wallH = 2.55;
  const thick = 0.7;
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

  const seed = (s: number) => {
    const x = Math.sin(s * 12.9898 + room * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const joints: [number, number][] = [
    [-TILE / 2, -TILE / 2],
    [TILE / 2, -TILE / 2],
    [-TILE / 2, TILE / 2],
    [TILE / 2, TILE / 2],
  ];
  for (const [x, z] of joints) {
    add(group, GEO.cyl, stone, x, 0.85, z, 0.38, 1.7, 0.38);
    add(group, GEO.cyl, gold, x, 1.72, z, 0.46, 0.12, 0.46);
    obstacles.push({ x, z, r: 0.52 });
  }

  const count = 4 + (room % 3);
  for (let i = 0; i < count; i++) {
    const a = seed(i * 3.17) * Math.PI * 2;
    const d = 6 + seed(i * 9.1) * (half - 9);
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (Math.hypot(x, z) < 4.2) continue;
    if (obstacles.some((o) => Math.hypot(o.x - x, o.z - z) < 2.2)) continue;
    add(group, GEO.cyl, stone, x, 0.7, z, 0.42, 1.4, 0.42);
    add(group, GEO.cyl, gold, x, 1.42, z, 0.48, 0.12, 0.48);
    obstacles.push({ x, z, r: 0.55 });
  }

  const corners: [number, number][] = [
    [-half + 1.4, -half + 1.4],
    [half - 1.4, -half + 1.4],
    [-half + 1.4, half - 1.4],
    [half - 1.4, half - 1.4],
    [-half + 1.4, 0],
    [half - 1.4, 0],
    [0, -half + 1.4],
    [0, half - 1.4],
  ];
  const fire = mat(0xff6a20, { emissive: 0xff4010, eInt: 1.15, rough: 0.4 });
  for (const [x, z] of corners) {
    add(group, GEO.cyl, gold, x, 0.42, z, 0.16, 0.84, 0.16);
    add(group, GEO.sphere, fire, x, 1.0, z, 0.15, 0.2, 0.15);
    obstacles.push({ x, z, r: 0.34 });
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


