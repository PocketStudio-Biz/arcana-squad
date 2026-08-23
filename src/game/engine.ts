import * as THREE from "three";
import type { EnemyKind, HeroId, HudSnap, PowerId } from "./types";
import { HERO_BY_ID, storyBoss } from "./heroes";
import { bossHpMul, bossRange, bossSpeedMul, runBoss, type BossApi, type BossState } from "./bosses";
import {
  minorForRoom,
  resonanceOf,
  roomMods,
  suitColor,
  type CourtRank,
  type MinorCard,
  type MinorSuit,
  type Resonance,
  type RoomMods,
} from "./arcana";
import { rollChoices } from "./powerups";
import { Input } from "./input";
import { AudioSys } from "./audio";
import {
  createBossMesh,
  createBulletMesh,
  createCoinMesh,
  createDungeon,
  createEnemyMesh,
  createHeroMesh,
  createOrbitMesh,
  createSandPlane,
  createSparkMesh,
  createStarfield,
  loadTextures,
  suitToCard,
  tintCardMesh,
  type CardKind,
  type Obstacle,
} from "./meshes";

export type EngineHooks = {
  onHud: (h: HudSnap) => void;
  onPick: (choices: PowerId[]) => void;
  onOver: (stats: { score: number; rooms: number; heroId: HeroId; coins: number; won?: boolean }) => void;
  onFloat: (text: string, color: string, sx: number, sy: number) => void;
};

type Bullet = {
  live: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  life: number;
  dmg: number;
  pierce: number;
  r: number;
  team: 0 | 1;
  mesh: THREE.Mesh;
  homing: boolean;
  burn: boolean;
  kind: CardKind;
  delay: number;
};

type Spark = {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  max: number;
};

type Enemy = {
  live: boolean;
  kind: EnemyKind;
  bossId?: HeroId;
  bossTitle?: string;
  x: number;
  z: number;
  vx: number;
  vz: number;
  r: number;
  hp: number;
  maxHp: number;
  yaw: number;
  speed: number;
  dmg: number;
  score: number;
  coins: number;
  flash: number;
  burn: number;
  atk: number;
  ai: number;
  mode: number;
  dashT: number;
  dvx: number;
  dvz: number;
  phase: number;
  moveName: string;
  suit: MinorSuit;
  court?: CourtRank;
  slow: number;
  mesh: THREE.Group;
};

type Coin = { live: boolean; x: number; z: number; mesh: THREE.Mesh; vy: number };

const THEMES = [0x6b3fd4, 0xc9a227, 0x3d8b4a, 0xc43c1c, 0x2a6db5, 0xc9a227, 0x1a7a6d];

export class ArcanaGame {
  readonly input = new Input();
  readonly audio = new AudioSys();

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private heroId: HeroId;
  private playerMesh!: THREE.Group;
  private dungeon?: THREE.Group;
  private stars: THREE.Group;
  private textures!: Awaited<ReturnType<typeof loadTextures>>;
  private dirLight: THREE.DirectionalLight;
  private playerLight: THREE.PointLight;
  private muzzleLight: THREE.PointLight;

  private px = 0;
  private pz = 0;
  private pvx = 0;
  private pvz = 0;
  private yaw = 0;
  private hp = 100;
  private maxHp = 100;
  private lives = 3;
  private iFrame = 0;
  private fireCd = 0;
  private shots = 1;
  private pierce = 0;
  private homing = false;
  private burn = false;
  private fork = false;
  private giant = 1;
  private speedMul = 1;
  private rateMul = 1;
  private dmgMul = 1;
  private magnet = 2.2;
  private vamp = 0;
  private goldMul = 1;
  private wildcard = false;
  private shield = 0;
  private shieldMax = 0;
  private orbits = 0;
  private orbitMeshes: THREE.Mesh[] = [];
  private stacks: Partial<Record<PowerId, number>> = {};

  private bullets: Bullet[] = [];
  private bulletPool: THREE.Mesh[] = [];
  private sparks: Spark[] = [];
  private sparkPool: THREE.Mesh[] = [];
  private enemies: Enemy[] = [];
  private coins: Coin[] = [];
  private coinPool: THREE.Mesh[] = [];
  private obstacles: Obstacle[] = [];
  private half = 8;

  private room = 1;
  private score = 0;
  private coinsN = 0;
  private combo = 0;
  private comboT = 0;
  private elapsed = 0;
  private freeze = 0;
  private trauma = 0;
  private picking = false;
  private over = false;
  private ascended = false;
  private paused = false;
  private kills = 0;
  private quota = 18;
  private bossSpawned = false;
  private bossDelay = 0;
  private spawnT = 0;
  private hudT = 0;
  private last = 0;
  private abilityCd = 2;
  private abilityMax = 6;
  private leapT = 0;
  private minor!: MinorCard;
  private mods!: RoomMods;
  private pips = 0;
  private courtSpawned = false;
  private resonate: Resonance = "wild";
  private minorCd = 2;
  private running = false;
  private disposed = false;
  private t = 0;
  private reduced = false;
  private camY = 32;
  private camZ = 26;
  private cx = 0;
  private cz = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private hooks: EngineHooks,
  ) {
    this.heroId = "fool";
    const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    const dprCap = coarse ? 1.5 : 2;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !coarse,
      alpha: false,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
      stencil: false,
      depth: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    this.renderer.setSize(canvas.clientWidth || 1280, canvas.clientHeight || 720, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.48;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x1a1016, 1);

    this.camera = new THREE.PerspectiveCamera(46, 16 / 9, 0.3, 520);
    this.camera.position.set(0, 32, 26);
    this.scene.fog = new THREE.FogExp2(0x221018, 0.0045);

    const hemi = new THREE.HemisphereLight(0xffe6d4, 0x8a3048, 1.45);
    this.scene.add(hemi);
    const map = coarse ? 512 : 1024;
    this.dirLight = new THREE.DirectionalLight(0xfff1dc, 1.95);
    this.dirLight.position.set(10, 22, 12);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.set(map, map);
    this.dirLight.shadow.camera.near = 2;
    this.dirLight.shadow.camera.far = 110;
    this.dirLight.shadow.camera.left = -30;
    this.dirLight.shadow.camera.right = 30;
    this.dirLight.shadow.camera.top = 30;
    this.dirLight.shadow.camera.bottom = -30;
    this.scene.add(this.dirLight);
    this.scene.add(this.dirLight.target);
    const rim = new THREE.DirectionalLight(0xd8c8ff, 0.9);
    rim.position.set(-8, 6, -10);
    this.scene.add(rim);

    this.playerLight = new THREE.PointLight(0xe8c456, 2.4, 12);
    this.scene.add(this.playerLight);
    this.muzzleLight = new THREE.PointLight(0xfff0c0, 0, 6);
    this.scene.add(this.muzzleLight);

    this.stars = createStarfield();
    this.scene.add(this.stars);

    this.reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }

  async boot(heroId: HeroId) {
    this.heroId = heroId;
    this.textures = await loadTextures();
    this.textures.floor.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.scene.add(createSandPlane(this.textures.sand));
    this.installHero(heroId);
    this.buildRoom(1);
    this.input.attach();
    this.bindControlsTest();
    this.running = true;
    this.last = performance.now();
    this.renderer.setAnimationLoop(this.tick);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("orientationchange", this.onResize);
    window.visualViewport?.addEventListener("resize", this.onResize);
    this.onResize();
    this.pushHud();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.running = false;
    this.renderer.setAnimationLoop(null);
    this.input.detach();
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("orientationchange", this.onResize);
    window.visualViewport?.removeEventListener("resize", this.onResize);
    if (window.__controlsTest) delete window.__controlsTest;
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
    this.renderer.dispose();
  }

  setPaused(v: boolean) {
    this.paused = v;
  }

  pickPower(id: PowerId) {
    this.applyPower(id);
    this.picking = false;
    this.audio.power();
    if (this.room >= 22) {
      this.victory();
      return;
    }
    this.room += 1;
    if (this.room >= 11) this.ascendSquad();
    this.buildRoom(this.room);
  }

  private installHero(id: HeroId) {
    const def = HERO_BY_ID[id];
    if (this.playerMesh) this.scene.remove(this.playerMesh);
    this.playerMesh = createHeroMesh(id);
    this.playerMesh.scale.setScalar(1.4);
    this.scene.add(this.playerMesh);
    this.maxHp = def.hp;
    this.hp = def.hp;
    this.shots = def.shots;
    this.speedMul = 1;
    this.rateMul = 1;
    this.dmgMul = 1;
    this.pierce = def.startPierce;
    this.homing = false;
    this.burn = def.burn;
    this.fork = false;
    this.giant = 1;
    this.magnet = 2.2;
    this.vamp = def.vamp;
    this.goldMul = def.goldMul;
    this.wildcard = def.wildcard;
    this.shield = def.startShield;
    this.shieldMax = def.startShield;
    this.orbits = def.startOrbits;
    this.stacks = {};
    if (def.startOrbits) this.stacks.orbit = def.startOrbits;
    if (def.startShield) this.stacks.shield = 1;
    this.rebuildOrbits();
    this.playerLight.color.setHex(def.color);
    this.abilityMax = def.abilityCd ?? 7;
    this.abilityCd = Math.min(2.2, this.abilityMax * 0.35);
    this.leapT = 0;
    this.lives = 3;
    this.score = 0;
    this.coinsN = 0;
    this.combo = 0;
    this.elapsed = 0;
    this.over = false;
    this.ascended = false;
    this.picking = false;
    this.px = 0;
    this.pz = 0;
    this.cx = 0;
    this.cz = 0;
  }

  private buildRoom(n: number) {
    if (this.dungeon) {
      this.scene.remove(this.dungeon);
    }
    for (const e of this.enemies) {
      e.live = false;
      e.mesh.visible = false;
      this.scene.remove(e.mesh);
    }
    this.enemies = [];
    this.kills = 0;
    this.minor = minorForRoom(n);
    this.mods = roomMods(this.minor);
    this.resonate = resonanceOf(this.heroId, this.minor.suit);
    this.pips = 0;
    this.courtSpawned = false;
    this.quota = Math.round((22 + n * 7) * this.mods.quotaMul);
    this.minorCd = Math.min(2.4, this.minor.skillCd * 0.38);
    this.bossSpawned = false;
    this.bossDelay = 0;
    const size = 48;
    const built = createDungeon(size, this.textures, n);
    this.dungeon = built.group;
    this.obstacles = built.obstacles;
    this.half = built.half - 0.7;
    this.scene.add(this.dungeon);
    this.px = 0;
    this.pz = 0;
    this.cx = 0;
    this.cz = 0;
    this.spawnT = 0.45;
    this.dirLight.target.position.set(0, 0, 0);
    this.dirLight.color.setHex(this.mods.color);
  }

  private tick = (time: number) => {
    if (this.disposed) return;
    const dt = Math.min(0.1, (time - this.last) / 1000 || 0.016);
    this.last = time;
    this.t += dt;
    if (!this.paused && !this.picking && !this.over) {
      if (this.freeze > 0) this.freeze -= dt;
      else this.update(dt);
    }
    this.render(dt);
    this.hudT += dt;
    if (this.hudT > 0.08) {
      this.hudT = 0;
      this.pushHud();
    }
  };

  private update(dt: number) {
    this.elapsed += dt;
    this.iFrame = Math.max(0, this.iFrame - dt);
    this.fireCd = Math.max(0, this.fireCd - dt);
    this.comboT = Math.max(0, this.comboT - dt);
    this.leapT = Math.max(0, this.leapT - dt);
    if (this.comboT <= 0) this.combo = 0;
    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    this.muzzleLight.intensity = Math.max(0, this.muzzleLight.intensity - dt * 28);

    const def = HERO_BY_ID[this.heroId];
    this.abilityCd -= dt;
    if (def.ability && this.abilityCd <= 0) {
      this.castAbility();
      this.abilityCd = this.abilityMax;
    }
    this.minorCd -= dt;
    if (this.minorCd <= 0) {
      this.castMinorSkill();
      this.minorCd = this.minor.skillCd;
    }
    const { ix, iy } = this.input.axes();
    const speed = def.speed * this.speedMul * (this.leapT > 0 ? 1.55 : 1);
    const wantX = ix * speed;
    const wantZ = -iy * speed;
    const k = 1 - Math.exp(-16 * dt);
    this.pvx += (wantX - this.pvx) * k;
    this.pvz += (wantZ - this.pvz) * k;
    this.px += this.pvx * dt;
    this.pz += this.pvz * dt;
    this.collideActor(this, 0.55);

    let nearest: Enemy | null = null;
    let nd = 1e9;
    for (const e of this.enemies) {
      if (!e.live) continue;
      const d = (e.x - this.px) * (e.x - this.px) + (e.z - this.pz) * (e.z - this.pz);
      if (d < nd) {
        nd = d;
        nearest = e;
      }
    }

    if (nearest) {
      this.yaw = Math.atan2(nearest.x - this.px, nearest.z - this.pz);
    } else if (Math.hypot(this.pvx, this.pvz) > 0.4) {
      this.yaw = Math.atan2(this.pvx, this.pvz);
    }

    if (nearest && nd < 18 * 18 && this.fireCd <= 0) {
      this.shoot();
      this.fireCd = def.fireRate / this.rateMul;
    }

    this.updateEnemies(dt);
    this.updateBullets(dt);
    this.updateSparks(dt);
    this.updateCoins(dt);
    this.updateOrbits(dt);
    this.spawnWaves(dt);

    if (
      !this.picking &&
      this.bossSpawned &&
      this.enemies.every((e) => !e.live)
    ) {
      this.roomClear();
    }
  }

  private shoot() {
    const def = HERO_BY_ID[this.heroId];
    const kind = suitToCard(def.suit, def.element);
    const muzzle = this.playerMesh.userData.muzzle as THREE.Object3D | undefined;
    let ox = this.px;
    let oy = 0.95;
    let oz = this.pz;
    if (muzzle) {
      this.playerMesh.updateMatrixWorld();
      const w = new THREE.Vector3();
      muzzle.getWorldPosition(w);
      ox = w.x;
      oy = w.y;
      oz = w.z;
    }
    const base = this.yaw + (this.heroId === "fool" ? (Math.random() - 0.5) * 0.12 : 0);
    const n = this.shots;
    const spread = (n - 1) * (this.heroId === "swords" ? 0.28 : 0.18);
    const speed = def.projectileSpeed * (this.heroId === "pentacles" ? 0.9 : 1);
    const dmg = def.damage * this.dmgMul * this.giant;
    const fireOne = (ang: number, dmgMul = 1) => {
      const b = this.allocBullet(0, def.color, kind);
      b.x = ox;
      b.y = oy;
      b.z = oz;
      b.vx = Math.sin(ang) * speed;
      b.vz = Math.cos(ang) * speed;
      b.life = this.heroId === "swords" ? 1.15 : 1.35;
      b.dmg = dmg * dmgMul;
      b.pierce = this.pierce;
      b.r = 0.16 * this.giant * (this.heroId === "pentacles" ? 1.25 : 1);
      b.homing = this.homing || this.heroId === "world";
      b.burn = this.burn;
      b.kind = kind;
      const sc = 0.55 * this.giant * (this.heroId === "pentacles" ? 1.2 : 1);
      b.mesh.scale.set(sc, sc, 0.55 * this.giant);
      b.mesh.rotation.set(0.15, ang, (Math.random() - 0.5) * 0.4);
    };
    for (let i = 0; i < n; i++) {
      const ang = base + (n === 1 ? 0 : -spread / 2 + (spread * i) / Math.max(1, n - 1));
      fireOne(ang);
    }
    if (this.fork) {
      fireOne(base - 0.42);
      fireOne(base + 0.42);
    }
    if (this.wildcard && Math.random() < (this.heroId === "fool" ? 0.22 : 0.15)) fireOne(base + (Math.random() - 0.5) * 0.6);
    // Action-eye fan of extra cards (visual + light chip damage)
    const fan = 3;
    for (let i = 0; i < fan; i++) {
      const a = base + (i - (fan - 1) / 2) * 0.2;
      this.spawnSpark(ox, oy, oz, Math.sin(a) * 8, 0.8 + Math.random() * 0.6, Math.cos(a) * 8, def.color, 0.22);
    }
    this.audio.shoot();
    this.muzzleLight.color.setHex(def.color);
    this.muzzleLight.intensity = 4.4;
    this.muzzleLight.position.set(ox, oy, oz);
    this.trauma = Math.min(1, this.trauma + 0.08);
  }

  private castAbility() {
    const def = HERO_BY_ID[this.heroId];
    const name = def.ability ?? "Arcana";
    this.float(name, "#e8c456", this.px, this.pz);
    this.audio.power();
    this.trauma = Math.min(1, this.trauma + 0.28);
    this.muzzleLight.color.setHex(def.color);
    this.muzzleLight.intensity = 6.5;
    this.muzzleLight.position.set(this.px, 1.1, this.pz);
    const dmg = def.damage * this.dmgMul * 0.85;
    const ring = (n: number, kind: CardKind, color: number, speed: number, extras: Partial<Pick<Bullet, "pierce" | "burn" | "homing" | "life" | "r">> = {}) => {
      for (let k = 0; k < n; k++) {
        const ang = (k / n) * Math.PI * 2 + this.t;
        const b = this.allocBullet(0, color, kind);
        b.x = this.px;
        b.y = 0.95;
        b.z = this.pz;
        b.vx = Math.sin(ang) * speed;
        b.vz = Math.cos(ang) * speed;
        b.life = extras.life ?? 1.15;
        b.dmg = dmg;
        b.pierce = extras.pierce ?? 0;
        b.r = extras.r ?? 0.2;
        b.homing = extras.homing ?? false;
        b.burn = extras.burn ?? false;
        b.kind = kind;
        b.mesh.scale.set(0.7, 0.7, 0.7);
      }
    };
    switch (this.heroId) {
      case "fool":
        this.leapT = 0.55;
        ring(10, "chaos", def.color, 11, { pierce: 1, life: 1.05 });
        break;
      case "swords": {
        for (const side of [-0.18, 0.18]) {
          for (let i = 0; i < 4; i++) {
            const ang = this.yaw + side;
            const b = this.allocBullet(0, def.color, "swords");
            b.x = this.px + Math.sin(this.yaw + Math.PI / 2) * side * 2;
            b.y = 1.0;
            b.z = this.pz + Math.cos(this.yaw + Math.PI / 2) * side * 2;
            b.vx = Math.sin(ang) * (16 + i * 1.4);
            b.vz = Math.cos(ang) * (16 + i * 1.4);
            b.life = 1.05;
            b.dmg = dmg * 1.15;
            b.pierce = 3;
            b.r = 0.2;
            b.kind = "swords";
            b.mesh.scale.set(0.75, 0.75, 0.75);
          }
        }
        break;
      }
      case "pentacles":
        ring(12, "pentacles", 0xe8c456, 8.5, { pierce: 1, r: 0.24 });
        this.magnet = Math.max(this.magnet, 5.5);
        for (let i = 0; i < 6; i++) {
          this.spawnCoin(this.px + (Math.random() - 0.5) * 2.2, this.pz + (Math.random() - 0.5) * 2.2);
        }
        break;
      case "wands":
        ring(14, "wands", 0xff6a20, 10, { burn: true, pierce: 1 });
        for (const e of this.enemies) {
          if (e.live && Math.hypot(e.x - this.px, e.z - this.pz) < 5.5) e.burn = Math.max(e.burn, 2.2);
        }
        break;
      case "cups":
        this.hp = Math.min(this.maxHp, this.hp + 22);
        this.float("+HP", "#5ec8e8", this.px, this.pz);
        ring(10, "cups", 0x5ec8e8, 9, { homing: true });
        for (const e of this.enemies) {
          if (!e.live) continue;
          const dx = e.x - this.px;
          const dz = e.z - this.pz;
          const d = Math.hypot(dx, dz) || 1;
          if (d < 6.5) {
            e.x += (dx / d) * 2.4;
            e.z += (dz / d) * 2.4;
          }
        }
        break;
      case "world": {
        const kinds: CardKind[] = ["swords", "wands", "cups", "pentacles", "major", "chaos"];
        for (let k = 0; k < 12; k++) {
          const kind = kinds[k % kinds.length]!;
          const ang = (k / 12) * Math.PI * 2;
          const b = this.allocBullet(0, def.color, kind);
          b.x = this.px;
          b.y = 1.05;
          b.z = this.pz;
          b.vx = Math.sin(ang) * 9.5;
          b.vz = Math.cos(ang) * 9.5;
          b.life = 1.35;
          b.dmg = dmg;
          b.pierce = 1;
          b.homing = true;
          b.kind = kind;
          b.mesh.scale.set(0.72, 0.72, 0.72);
        }
        break;
      }
      default:
        ring(8, "major", def.color, 9);
    }
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      this.spawnSpark(this.px, 1, this.pz, Math.sin(a) * 7, 2 + Math.random() * 2, Math.cos(a) * 7, def.accent, 0.4);
    }
  }

  private allocBullet(team: 0 | 1, color: number, kind: CardKind = "major"): Bullet {
    let mesh = this.bulletPool.pop();
    if (!mesh) mesh = createBulletMesh(color, team === 0 ? "player" : "enemy", kind);
    tintCardMesh(mesh, kind, color);
    mesh.visible = true;
    mesh.scale.set(1, 1, 1);
    this.scene.add(mesh);
    const b: Bullet = {
      live: true,
      x: 0,
      y: 0.8,
      z: 0,
      vx: 0,
      vz: 0,
      life: 1.2,
      dmg: 8,
      pierce: 0,
      r: 0.18,
      team,
      mesh,
      homing: false,
      burn: false,
      kind,
      delay: 0,
    };
    this.bullets.push(b);
    return b;
  }

  private freeBullet(b: Bullet) {
    b.live = false;
    b.mesh.visible = false;
    this.scene.remove(b.mesh);
    this.bulletPool.push(b.mesh);
  }

  private spawnSpark(x: number, y: number, z: number, vx: number, vy: number, vz: number, color: number, life = 0.28) {
    let mesh = this.sparkPool.pop();
    if (!mesh) mesh = createSparkMesh(color);
    (mesh.material as THREE.MeshBasicMaterial).color.setHex(color);
    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.9;
    mesh.visible = true;
    mesh.scale.setScalar(0.7 + Math.random() * 0.35);
    this.scene.add(mesh);
    this.sparks.push({ mesh, x, y, z, vx, vy, vz, life, max: life });
  }

  private updateSparks(dt: number) {
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i]!;
      s.life -= dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.z += s.vz * dt;
      s.vy -= 6 * dt;
      s.mesh.position.set(s.x, s.y, s.z);
      s.mesh.rotation.y += dt * 14;
      s.mesh.rotation.z += dt * 8;
      const matl = s.mesh.material as THREE.MeshBasicMaterial;
      matl.opacity = Math.max(0, s.life / s.max);
      if (s.life <= 0 || s.y < 0) {
        s.mesh.visible = false;
        this.scene.remove(s.mesh);
        this.sparkPool.push(s.mesh);
        this.sparks.splice(i, 1);
      }
    }
  }

  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]!;
      if (!b.live) {
        this.bullets.splice(i, 1);
        continue;
      }
      if (b.delay > 0) {
        b.delay -= dt;
        b.mesh.position.set(b.x, b.y, b.z);
        const pulse = 0.45 + Math.abs(Math.sin(this.t * 14)) * 0.12;
        b.mesh.scale.setScalar(pulse);
        b.mesh.lookAt(this.camera.position);
        continue;
      }
      if (b.homing) {
        if (b.team === 0) {
          let best: Enemy | null = null;
          let bd = 40;
          for (const e of this.enemies) {
            if (!e.live) continue;
            const d = Math.hypot(e.x - b.x, e.z - b.z);
            if (d < bd) {
              bd = d;
              best = e;
            }
          }
          if (best) {
            const ang = Math.atan2(best.x - b.x, best.z - b.z);
            const spd = Math.hypot(b.vx, b.vz) || 8;
            const tx = Math.sin(ang) * spd;
            const tz = Math.cos(ang) * spd;
            b.vx += (tx - b.vx) * Math.min(1, 6 * dt);
            b.vz += (tz - b.vz) * Math.min(1, 6 * dt);
          }
        } else {
          const ang = Math.atan2(this.px - b.x, this.pz - b.z);
          const spd = Math.hypot(b.vx, b.vz) || 8;
          const tx = Math.sin(ang) * spd;
          const tz = Math.cos(ang) * spd;
          b.vx += (tx - b.vx) * Math.min(1, 4.2 * dt);
          b.vz += (tz - b.vz) * Math.min(1, 4.2 * dt);
        }
      }
      b.x += b.vx * dt;
      b.z += b.vz * dt;
      b.life -= dt;
      b.mesh.position.set(b.x, b.y, b.z);
      b.mesh.lookAt(this.camera.position);
      b.mesh.rotateZ(this.t * 6);
      if (b.team === 0 && Math.random() < 0.28) {
        this.spawnSpark(b.x, b.y, b.z, (Math.random() - 0.5) * 1.2, 0.5, (Math.random() - 0.5) * 1.2, 0xe8c456, 0.14);
      }
      if (b.life <= 0 || Math.abs(b.x) > this.half + 1.2 || Math.abs(b.z) > this.half + 1.2) {
        this.freeBullet(b);
        this.bullets.splice(i, 1);
        continue;
      }
      if (this.hitObstacle(b.x, b.z, b.r * 0.6)) {
        this.freeBullet(b);
        this.bullets.splice(i, 1);
        continue;
      }
      if (b.team === 0) {
        for (const e of this.enemies) {
          if (!e.live) continue;
          if (Math.hypot(e.x - b.x, e.z - b.z) < e.r + b.r) {
            this.hurtEnemy(e, b.dmg, b.x, b.z, b.burn, b.kind);
            b.pierce -= 1;
            if (b.pierce < 0) {
              this.freeBullet(b);
              this.bullets.splice(i, 1);
              break;
            }
          }
        }
      } else if (this.iFrame <= 0 && Math.hypot(this.px - b.x, this.pz - b.z) < 0.45 + b.r) {
        this.hurtPlayer(b.dmg);
        this.freeBullet(b);
        this.bullets.splice(i, 1);
      }
    }
  }

  private updateEnemies(dt: number) {
    const sep = 1.15;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i]!;
      if (!e.live) continue;
      e.flash = Math.max(0, e.flash - dt * 8);
      if (e.burn > 0) {
        e.burn -= dt;
        e.hp -= 8 * dt;
        if (e.hp <= 0) this.killEnemy(e);
      }
      if (!e.live) continue;

      const dx = this.px - e.x;
      const dz = this.pz - e.z;
      const dist = Math.hypot(dx, dz) || 0.001;
      let ax = dx / dist;
      let az = dz / dist;
      for (let j = 0; j < this.enemies.length; j++) {
        if (i === j) continue;
        const o = this.enemies[j]!;
        if (!o.live) continue;
        const ox = e.x - o.x;
        const oz = e.z - o.z;
        const od = Math.hypot(ox, oz);
        if (od > 0.01 && od < sep + e.r + o.r) {
          ax += (ox / od) * 0.7;
          az += (oz / od) * 0.7;
        }
      }
      const al = Math.hypot(ax, az) || 1;
      ax /= al;
      az /= al;

      const stop =
        e.kind === "mage"
          ? 6.2
          : e.kind === "court" && e.court === "queen"
            ? 6.4
            : e.kind === "court" && e.court === "king"
              ? 3.6
            : e.kind === "court" && e.court === "knight"
              ? 1.4
            : e.kind === "boss" && e.bossId
              ? bossRange(e.bossId)
              : e.kind === "boss"
                ? 2.4
                : 0.9;
      e.slow = Math.max(0, e.slow - dt);
      const drag = e.slow > 0 ? 0.48 : 1;
      if (e.kind === "boss" && e.dashT > 0) {
        e.x += e.dvx * dt;
        e.z += e.dvz * dt;
        e.dashT -= dt;
      } else if (e.kind === "court" && e.dashT > 0) {
        e.x += e.dvx * dt;
        e.z += e.dvz * dt;
        e.dashT -= dt;
      } else if (dist > stop) {
        e.x += ax * e.speed * drag * dt;
        e.z += az * e.speed * drag * dt;
      }
      this.keepIn(e, e.r);
      e.yaw = Math.atan2(dx, dz);
      e.mesh.position.set(e.x, 0, e.z);
      e.mesh.rotation.y = e.yaw;
      const bob = e.kind === "wisp" ? Math.sin(this.t * 4 + i) * 0.12 : 0;
      e.mesh.position.y = bob;
      if (e.flash > 0) this.tintGroup(e.mesh, 0xffffff);
      else this.tintGroup(e.mesh, null);

      const bar = e.mesh.userData.hpBar as THREE.Group | undefined;
      const fg = e.mesh.userData.hpFg as THREE.Mesh | undefined;
      if (bar) bar.quaternion.copy(this.camera.quaternion);
      if (fg) fg.scale.x = 0.68 * Math.max(0.02, e.hp / e.maxHp);

      e.atk -= dt;
      if (e.kind === "mage" && dist < 9 && e.atk <= 0) {
        e.atk = 1.6;
        const b = this.allocBullet(1, suitColor(e.suit), e.suit);
        b.x = e.x;
        b.y = 0.8;
        b.z = e.z;
        const s = 9;
        b.vx = (dx / dist) * s;
        b.vz = (dz / dist) * s;
        b.dmg = e.dmg;
        b.life = 2.2;
        b.delay = this.mods.delayShots ? 0.45 : 0;
        b.homing = e.suit === "cups";
        b.burn = e.suit === "wands";
        b.kind = e.suit;
      }
      if (e.kind === "court") this.tickCourt(e, dist, dx, dz);
      if (e.kind === "boss" && e.bossId) {
        this.tickBoss(e, dt, dist);
      }

      if (this.iFrame <= 0 && dist < e.r + 0.55) {
        this.hurtPlayer(e.dmg);
        e.x -= ax * 0.6;
        e.z -= az * 0.6;
      }
    }
  }

  private hurtEnemy(e: Enemy, dmg: number, hx: number, hz: number, burn: boolean, kind: CardKind = "major") {
    if (this.resonate === "match") dmg *= 1.14;
    else if (this.resonate === "oppose") dmg *= 0.9;
    if (kind === "wands" && e.suit === "cups") {
      dmg *= 1.1;
      for (const o of this.enemies) {
        if (!o.live || o === e) continue;
        if (Math.hypot(o.x - e.x, o.z - e.z) < 1.8) {
          o.hp -= dmg * 0.28;
          o.flash = 1;
          if (o.hp <= 0) this.killEnemy(o);
        }
      }
      if (Math.random() < 0.2) this.float("STEAM", "#ffb080", e.x, e.z);
    } else if (kind === "cups" && e.suit === "wands") {
      dmg *= 1.28;
      e.burn = 0;
      if (Math.random() < 0.22) this.float("DOUSE", "#5ec8e8", e.x, e.z);
    } else if (kind === "swords" && e.suit === "pentacles") {
      dmg *= 1.35;
      if (Math.random() < 0.22) this.float("SHATTER", "#c0d4ff", e.x, e.z);
    } else if (kind === "pentacles" && e.suit === "swords") {
      e.slow = Math.max(e.slow, 1.15);
      if (Math.random() < 0.22) this.float("WEIGHT", "#e8c456", e.x, e.z);
    }
    e.hp -= dmg;
    e.flash = 1;
    const nx = e.x - hx;
    const nz = e.z - hz;
    const nl = Math.hypot(nx, nz) || 1;
    e.x += (nx / nl) * 0.28;
    e.z += (nz / nl) * 0.28;
    if (burn) e.burn = 1.4;
    if (this.vamp > 0) this.hp = Math.min(this.maxHp, this.hp + dmg * this.vamp);
    if (this.heroId === "pentacles" && Math.random() < 0.16) {
      this.spawnCoin(e.x + (Math.random() - 0.5) * 0.4, e.z + (Math.random() - 0.5) * 0.4);
    }
    if (this.heroId === "wands" && burn) {
      for (const o of this.enemies) {
        if (!o.live || o === e) continue;
        if (Math.hypot(o.x - e.x, o.z - e.z) < 1.55) o.burn = Math.max(o.burn, 0.85);
      }
    }
    if (this.heroId === "cups" && dmg > 4) {
      for (const o of this.enemies) {
        if (!o.live || o === e) continue;
        if (Math.hypot(o.x - e.x, o.z - e.z) < 1.7) {
          o.hp -= dmg * 0.32;
          o.flash = 1;
          if (o.hp <= 0) this.killEnemy(o);
        }
      }
    }
    this.audio.hit();
    this.float(`-${Math.round(dmg)}`, "#efe6c9", e.x, e.z);
    const col = HERO_BY_ID[this.heroId].color;
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2;
      this.spawnSpark(e.x, 0.9, e.z, Math.sin(a) * 5, 2 + Math.random() * 3, Math.cos(a) * 5, col, 0.35);
    }
    if (e.hp <= 0) this.killEnemy(e);
  }

  private killEnemy(e: Enemy) {
    e.live = false;
    e.mesh.visible = false;
    this.scene.remove(e.mesh);
    this.combo += 1;
    this.comboT = 1.4;
    const pts = Math.round(e.score * (1 + this.combo * 0.12));
    this.score += pts;
    this.audio.kill();
    this.freeze = this.reduced ? 0 : 0.04;
    this.trauma = Math.min(1, this.trauma + (e.kind === "boss" ? 0.55 : 0.2));
    const n = Math.max(1, Math.round(e.coins * this.goldMul * this.mods.goldMul));
    for (let i = 0; i < n; i++) this.spawnCoin(e.x + (Math.random() - 0.5), e.z + (Math.random() - 0.5));
    this.float(`+${pts}`, "#e8c456", e.x, e.z);
    if (e.kind !== "boss") {
      const gain = (e.kind === "court" ? 3 : 1) * (this.resonate === "match" ? 1.5 : this.resonate === "wild" ? 1.2 : 1);
      this.pips += gain;
      this.minorCd -= 0.4 * gain;
      if (this.pips >= this.mods.pipsMax) {
        this.pips = 0;
        this.minorCd = 0;
      }
    }
    if (e.kind === "boss") {
      for (const o of this.enemies) {
        if (o !== e && o.live) {
          o.live = false;
          o.mesh.visible = false;
          this.scene.remove(o.mesh);
        }
      }
      return;
    }
    this.kills += 1;
    if (!this.bossSpawned && this.kills >= this.quota && this.bossDelay <= 0) {
      this.bossDelay = 1.1;
      this.float("THE ARCANA AWAKENS", "#e8c456", this.px, this.pz);
    }
  }

  private hurtPlayer(dmg: number) {
    if (this.iFrame > 0) return;
    if (this.shield > 0) {
      this.shield -= 1;
      this.iFrame = 0.7;
      this.audio.hit();
      this.trauma = Math.min(1, this.trauma + 0.25);
      return;
    }
    this.hp -= dmg;
    this.iFrame = 1.05;
    this.audio.hurt();
    this.trauma = Math.min(1, this.trauma + 0.4);
    if (this.hp <= 0) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
      this.hp = this.maxHp;
      this.iFrame = 1.8;
    }
  }

  private spawnWaves(dt: number) {
    if (this.bossDelay > 0) {
      this.bossDelay -= dt;
      if (this.bossDelay <= 0 && !this.bossSpawned) {
        this.spawnEnemy("boss");
        this.bossSpawned = true;
      }
      return;
    }
    if (this.bossSpawned) return;
    if (this.kills >= this.quota) return;
    if (!this.courtSpawned && this.mods.court && this.kills >= this.quota * 0.42) {
      this.spawnCourt(this.mods.court);
      this.courtSpawned = true;
      this.spawnT = 0.6;
      return;
    }
    this.spawnT -= dt;
    if (this.spawnT > 0) return;
    const live = this.enemies.filter((e) => e.live).length;
    const cap = 6 + Math.min(8, Math.floor(this.room / 2)) + this.mods.capAdd;
    if (live >= cap) {
      this.spawnT = 0.22;
      return;
    }
    this.spawnEnemy(this.nextMinion());
    if (this.mods.pairSpawn && live + 1 < cap) this.spawnEnemy(this.nextMinion());
    const pace = Math.max(0.22, 0.78 - this.room * 0.018 - this.kills * 0.006);
    this.spawnT = pace;
  }

  private nextMinion(): EnemyKind {
    const p = this.quota <= 0 ? 1 : this.kills / this.quota;
    const r = this.room;
    if (this.mods.court === "page" && Math.random() < 0.22) return "wisp";
    if (p < 0.22) return "wisp";
    if (p < 0.45) return Math.random() < 0.55 ? "scarab" : "wisp";
    if (p < 0.7) {
      if (r >= 4 && Math.random() < 0.28) return "brute";
      return Math.random() < 0.65 ? "scarab" : "wisp";
    }
    const roll = Math.random();
    if (r >= 6 && roll < 0.28 + this.mods.mageBias) return "mage";
    if (r >= 3 && roll < 0.55) return "brute";
    if (roll < 0.82) return "scarab";
    return "wisp";
  }

  private spawnEnemy(kind: EnemyKind) {
    const roomScale = 1 + (this.room - 1) * 0.12;
    let x = 0;
    let z = 0;
    for (let t = 0; t < 12; t++) {
      const edge = Math.floor(Math.random() * 4);
      const u = (Math.random() * 2 - 1) * (this.half - 1.2);
      if (edge === 0) {
        x = u;
        z = -this.half + 1.1;
      } else if (edge === 1) {
        x = u;
        z = this.half - 1.1;
      } else if (edge === 2) {
        x = -this.half + 1.1;
        z = u;
      } else {
        x = this.half - 1.1;
        z = u;
      }
      if (Math.hypot(x - this.px, z - this.pz) > 8) break;
    }
    const tint = suitColor(this.minor.suit);
    const boss = kind === "boss" ? storyBoss(this.room) : null;
    const mesh = boss ? createBossMesh(boss.id) : createEnemyMesh(kind, tint);
    if (!boss) mesh.scale.setScalar(kind === "court" ? 1.35 : 1.05);
    this.scene.add(mesh);
    const stats =
      kind === "wisp"
        ? { hp: 22, r: 0.38, speed: 3.3, dmg: 7, score: 120, coins: 1 }
        : kind === "scarab"
          ? { hp: 38, r: 0.46, speed: 4.1, dmg: 8, score: 180, coins: 2 }
          : kind === "brute"
            ? { hp: 90, r: 0.7, speed: 2.1, dmg: 14, score: 320, coins: 3 }
            : kind === "mage"
              ? { hp: 48, r: 0.42, speed: 2.4, dmg: 10, score: 240, coins: 2 }
              : kind === "court"
                ? { hp: 160, r: 0.82, speed: 2.4, dmg: 13, score: 640, coins: 5 }
                : { hp: 340, r: 0.95, speed: 1.55, dmg: 16, score: 2200, coins: 14 };
    const mul = boss ? bossHpMul(boss.id) : 1;
    const e: Enemy = {
      live: true,
      kind,
      bossId: boss?.id,
      bossTitle: boss?.title,
      x,
      z,
      vx: 0,
      vz: 0,
      r: stats.r * (kind === "boss" ? 1.35 : 1.45),
      hp: Math.round(stats.hp * roomScale * (boss ? 1.15 * mul : this.mods.hpMul)),
      maxHp: Math.round(stats.hp * roomScale * (boss ? 1.15 * mul : this.mods.hpMul)),
      yaw: 0,
      speed: (stats.speed + this.room * 0.04) * (boss ? bossSpeedMul(boss.id) : this.mods.speedMul),
      dmg: Math.round(stats.dmg * (1 + this.room * 0.06)),
      score: Math.round(stats.score * (this.resonate === "oppose" ? 1.15 : 1)),
      coins: stats.coins,
      flash: 0,
      burn: 0,
      atk: boss ? 1.35 : 1.2,
      ai: 0,
      mode: 0,
      dashT: 0,
      dvx: 0,
      dvz: 0,
      phase: 0,
      moveName: "",
      suit: this.minor.suit,
      slow: 0,
      mesh,
    };
    mesh.position.set(x, 0, z);
    this.enemies.push(e);
    if (boss) this.float(boss.title, "#e8c456", x, z);
  }

  private placeAdd(kind: EnemyKind, x: number, z: number) {
    const live = this.enemies.filter((n) => n.live && n.kind !== "boss").length;
    if (live >= 7) return;
    const clampedX = Math.max(-this.half + 1.4, Math.min(this.half - 1.4, x));
    const clampedZ = Math.max(-this.half + 1.4, Math.min(this.half - 1.4, z));
    const tint = THEMES[(this.room - 1) % THEMES.length]!;
    const mesh = createEnemyMesh(kind, tint);
    mesh.scale.setScalar(1.05);
    this.scene.add(mesh);
    const stats =
      kind === "wisp"
        ? { hp: 22, r: 0.38, speed: 3.3, dmg: 7, score: 80, coins: 1 }
        : kind === "scarab"
          ? { hp: 38, r: 0.46, speed: 4.1, dmg: 8, score: 120, coins: 1 }
          : kind === "brute"
            ? { hp: 90, r: 0.7, speed: 2.1, dmg: 14, score: 200, coins: 2 }
            : { hp: 48, r: 0.42, speed: 2.4, dmg: 10, score: 160, coins: 1 };
    const roomScale = 1 + (this.room - 1) * 0.12;
    const e: Enemy = {
      live: true,
      kind,
      x: clampedX,
      z: clampedZ,
      vx: 0,
      vz: 0,
      r: stats.r * 1.35,
      hp: Math.round(stats.hp * roomScale * 0.85),
      maxHp: Math.round(stats.hp * roomScale * 0.85),
      yaw: 0,
      speed: stats.speed + this.room * 0.04,
      dmg: Math.round(stats.dmg * (1 + this.room * 0.05)),
      score: stats.score,
      coins: stats.coins,
      flash: 0,
      burn: 0,
      atk: 1.4,
      ai: 0,
      mode: 0,
      dashT: 0,
      dvx: 0,
      dvz: 0,
      phase: 0,
      moveName: "",
      suit: this.minor.suit,
      slow: 0,
      mesh,
    };
    mesh.position.set(clampedX, 0, clampedZ);
    this.enemies.push(e);
  }

  private spawnCourt(rank: CourtRank) {
    if (rank === "page") {
      this.float("Page of " + this.minor.title.split(" ").pop(), this.mods.css, this.px, this.pz);
      for (let i = 0; i < 4; i++) this.spawnEnemy("wisp");
      return;
    }
    const ang = Math.random() * Math.PI * 2;
    const x = Math.sin(ang) * (this.half - 2.2);
    const z = Math.cos(ang) * (this.half - 2.2);
    const tint = suitColor(this.minor.suit);
    const mesh = createEnemyMesh("court", tint);
    mesh.scale.setScalar(rank === "king" ? 1.55 : rank === "queen" ? 1.28 : 1.38);
    this.scene.add(mesh);
    const roomScale = 1 + (this.room - 1) * 0.12;
    const stats =
      rank === "king"
        ? { hp: 220, r: 0.95, speed: 1.7, dmg: 16, score: 900, coins: 8 }
        : rank === "queen"
          ? { hp: 150, r: 0.72, speed: 2.15, dmg: 12, score: 720, coins: 6 }
          : { hp: 170, r: 0.8, speed: 3.35, dmg: 14, score: 780, coins: 6 };
    const e: Enemy = {
      live: true,
      kind: "court",
      court: rank,
      x,
      z,
      vx: 0,
      vz: 0,
      r: stats.r * 1.4,
      hp: Math.round(stats.hp * roomScale * this.mods.hpMul),
      maxHp: Math.round(stats.hp * roomScale * this.mods.hpMul),
      yaw: 0,
      speed: stats.speed * this.mods.speedMul,
      dmg: Math.round(stats.dmg * (1 + this.room * 0.06)),
      score: stats.score,
      coins: stats.coins,
      flash: 0,
      burn: 0,
      atk: 0.8,
      ai: 0,
      mode: 0,
      dashT: 0,
      dvx: 0,
      dvz: 0,
      phase: 0,
      moveName: rank,
      suit: this.minor.suit,
      slow: 0,
      mesh,
    };
    mesh.position.set(x, 0, z);
    this.enemies.push(e);
    this.float(this.minor.title, this.mods.css, x, z);
    this.trauma = Math.min(1, this.trauma + 0.28);
  }

  private tickCourt(e: Enemy, dist: number, dx: number, dz: number) {
    if (e.atk > 0) return;
    const ang = Math.atan2(dx, dz);
    const col = suitColor(e.suit);
    if (e.court === "knight") {
      e.atk = 1.7;
      e.dvx = Math.sin(ang) * 16;
      e.dvz = Math.cos(ang) * 16;
      e.dashT = 0.42;
      for (let i = 0; i < 3; i++) {
        const b = this.allocBullet(1, col, e.suit);
        b.x = e.x;
        b.y = 1.1;
        b.z = e.z;
        b.vx = Math.sin(ang) * (10 + i * 2);
        b.vz = Math.cos(ang) * (10 + i * 2);
        b.dmg = e.dmg;
        b.kind = e.suit;
        b.burn = e.suit === "wands";
      }
    } else if (e.court === "queen") {
      e.atk = 2.1;
      for (const o of this.enemies) {
        if (o.live && o !== e && o.kind !== "boss") o.hp = Math.min(o.maxHp, o.hp + 10);
      }
      for (let i = -1; i <= 1; i++) {
        const b = this.allocBullet(1, col, e.suit);
        b.x = e.x;
        b.y = 1.2;
        b.z = e.z;
        b.vx = Math.sin(ang + i * 0.22) * 8;
        b.vz = Math.cos(ang + i * 0.22) * 8;
        b.dmg = e.dmg;
        b.homing = true;
        b.kind = e.suit;
      }
    } else {
      e.atk = 1.85;
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2;
        const b = this.allocBullet(1, col, e.suit);
        b.x = e.x;
        b.y = 1.3;
        b.z = e.z;
        b.vx = Math.sin(a) * 8.5;
        b.vz = Math.cos(a) * 8.5;
        b.dmg = e.dmg * 1.1;
        b.r = 0.24;
        b.kind = e.suit;
        b.pierce = 1;
      }
    }
  }

  private nearestEnemies(n: number) {
    return this.enemies
      .filter((e) => e.live)
      .sort((a, b) => Math.hypot(a.x - this.px, a.z - this.pz) - Math.hypot(b.x - this.px, b.z - this.pz))
      .slice(0, n);
  }

  private fireSuit(ang: number, speed: number, extra: Partial<Pick<Bullet, "burn" | "pierce" | "homing" | "delay" | "r" | "life" | "dmg">> & { ox?: number; oz?: number; y?: number } = {}) {
    const suit = this.minor.suit;
    const b = this.allocBullet(0, suitColor(suit), suit);
    b.x = extra.ox ?? this.px;
    b.y = extra.y ?? 1.05;
    b.z = extra.oz ?? this.pz;
    b.vx = Math.sin(ang) * speed;
    b.vz = Math.cos(ang) * speed;
    b.dmg = extra.dmg ?? HERO_BY_ID[this.heroId].damage * 0.95 * this.dmgMul * this.mods.climaxMul;
    b.life = extra.life ?? 1.35;
    b.kind = suit;
    b.burn = extra.burn ?? suit === "wands";
    b.pierce = extra.pierce ?? 0;
    b.homing = extra.homing ?? false;
    b.delay = extra.delay ?? 0;
    if (extra.r) b.r = extra.r;
  }

  private knockback(r: number, force: number) {
    for (const o of this.enemies) {
      if (!o.live) continue;
      const dx = o.x - this.px;
      const dz = o.z - this.pz;
      const d = Math.hypot(dx, dz) || 1;
      if (d < r) {
        o.x += (dx / d) * force;
        o.z += (dz / d) * force;
      }
    }
  }

  private castMinorSkill() {
    const card = this.minor;
    const yaw = this.yaw;
    this.float(card.skill, this.mods.css, this.px, this.pz);
    this.audio.power();
    this.trauma = Math.min(1, this.trauma + 0.28);
    this.muzzleLight.color.setHex(suitColor(card.suit));
    this.muzzleLight.intensity = 5.2;
    switch (card.effect) {
      case "spark":
        this.leapT = Math.max(this.leapT, 0.4);
        for (let i = 0; i < 5; i++) this.fireSuit(yaw + (i - 2) * 0.16, 12, { burn: true, pierce: 1 });
        break;
      case "first-cut":
        this.fireSuit(yaw, 16, { pierce: 4, r: 0.32, dmg: HERO_BY_ID[this.heroId].damage * 1.6 * this.dmgMul });
        this.fireSuit(yaw - 0.28, 13, { pierce: 2 });
        this.fireSuit(yaw + 0.28, 13, { pierce: 2 });
        break;
      case "twin-bond":
        this.hp = Math.min(this.maxHp, this.hp + 12);
        this.fireSuit(yaw - 0.4, 8, { homing: true, ox: this.px - 1.2 });
        this.fireSuit(yaw + 0.4, 8, { homing: true, ox: this.px + 1.2 });
        break;
      case "garden":
        this.hp = Math.min(this.maxHp, this.hp + 14);
        this.shield = Math.min(6, this.shield + 1);
        this.shieldMax = Math.max(this.shieldMax, this.shield);
        for (let i = 0; i < 6; i++) this.spawnCoin(this.px + (Math.random() - 0.5) * 2.4, this.pz + (Math.random() - 0.5) * 2.4);
        for (let k = 0; k < 8; k++) this.fireSuit((k / 8) * Math.PI * 2, 7, { r: 0.24 });
        break;
      case "throne":
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2;
          for (let i = 0; i < 3; i++) this.fireSuit(a, 8 + i * 2.2, { burn: true, pierce: 1 });
        }
        break;
      case "dispatch":
        this.magnet = Math.max(this.magnet, 6);
        for (let i = 0; i < 5; i++) this.spawnCoin(this.px + (Math.random() - 0.5) * 2, this.pz + (Math.random() - 0.5) * 2);
        for (let k = 0; k < 8; k++) this.fireSuit((k / 8) * Math.PI * 2, 8, { r: 0.22 });
        break;
      case "heart-charge":
        this.leapT = Math.max(this.leapT, 0.5);
        for (let i = 0; i < 4; i++) this.fireSuit(yaw + (i - 1.5) * 0.2, 9, { homing: true });
        break;
      case "spear-line":
        for (let i = 0; i < 6; i++) this.fireSuit(yaw, 12 + i * 1.3, { pierce: 3 });
        break;
      case "last-stand":
        this.shield = Math.min(6, this.shield + 1);
        this.shieldMax = Math.max(this.shieldMax, this.shield);
        for (let k = 0; k < 9; k++) this.fireSuit((k / 9) * Math.PI * 2, 7.5, { burn: true, delay: 0.08 * k });
        break;
      case "still-cut":
        for (const o of this.enemies) if (o.live) o.slow = Math.max(o.slow, 2.1);
        for (let i = 0; i < 4; i++) this.fireSuit(yaw + (i - 1.5) * 0.22, 6, { pierce: 2, delay: 0.45 });
        break;
      case "juggle":
        this.fireSuit(yaw - 0.5, 9, { pierce: 2, r: 0.28, homing: true });
        this.fireSuit(yaw + 0.5, 9, { pierce: 2, r: 0.28, homing: true });
        break;
      case "cross":
        for (let k = 0; k < 4; k++) this.fireSuit((k * Math.PI) / 2, 11, { pierce: 2 });
        for (let k = 0; k < 4; k++) this.fireSuit((k * Math.PI) / 2 + Math.PI / 4, 11, { pierce: 2, delay: 0.18 });
        break;
      case "pour":
        for (const t of this.nearestEnemies(4)) {
          this.fireSuit(Math.atan2(t.x - this.px, t.z - this.pz), 4, {
            ox: t.x,
            oz: t.z,
            delay: 0.55,
            homing: true,
            y: 1.6,
          });
        }
        break;
      case "ruin":
        for (let i = 0; i < 10; i++) {
          const ox = this.px + Math.sin(yaw) * (1.2 + i * 0.85);
          const oz = this.pz + Math.cos(yaw) * (1.2 + i * 0.85);
          this.fireSuit(yaw, 8, { ox, oz, delay: 0.12 * i, pierce: 1, y: 1.8 });
        }
        break;
      case "tide-mercy":
        this.hp = Math.min(this.maxHp, this.hp + 30);
        this.knockback(6.2, 2.2);
        for (let k = 0; k < 10; k++) this.fireSuit((k / 10) * Math.PI * 2, 8, { homing: true });
        break;
      case "high-ground":
        this.knockback(6.5, 2.6);
        for (let k = 0; k < 7; k++) this.fireSuit((k / 7) * Math.PI * 2, 9, { burn: true, pierce: 1 });
        break;
      case "burden":
        for (let k = 0; k < 10; k++) this.fireSuit((k / 10) * Math.PI * 2, 5.2, { burn: true, r: 0.3, life: 2.2, pierce: 1 });
        break;
      case "hope-spring":
        this.hp = Math.min(this.maxHp, this.hp + 22);
        for (let k = 0; k < 7; k++) this.fireSuit((k / 7) * Math.PI * 2, 8, { homing: true });
        break;
      case "mirage":
        for (let i = 0; i < 7; i++) {
          this.fireSuit(Math.random() * Math.PI * 2, 5, { delay: 0.25 + i * 0.08, homing: true });
        }
        break;
      case "hearth":
        this.shield = Math.min(6, this.shield + 1);
        this.shieldMax = Math.max(this.shieldMax, this.shield);
        this.hp = Math.min(this.maxHp, this.hp + 10);
        for (let k = 0; k < 8; k++) this.fireSuit((k / 8) * Math.PI * 2, 8, { burn: true });
        break;
      case "verdict": {
        const t = this.nearestEnemies(1)[0];
        const a = t ? Math.atan2(t.x - this.px, t.z - this.pz) : yaw;
        if (t) {
          for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            this.spawnSpark(t.x + Math.sin(ang) * 0.7, 0.3, t.z + Math.cos(ang) * 0.7, 0, 2, 0, suitColor("swords"), 0.45);
          }
        }
        this.fireSuit(a, 4, { delay: 0.7, pierce: 4, r: 0.38, dmg: HERO_BY_ID[this.heroId].damage * 2.1 * this.dmgMul, ox: t?.x, oz: t?.z });
        break;
      }
      case "kingdom":
        this.shield = Math.min(6, this.shield + 2);
        this.shieldMax = Math.max(this.shieldMax, this.shield);
        for (let i = 0; i < 12; i++) this.spawnCoin(this.px + (Math.random() - 0.5) * 4, this.pz + (Math.random() - 0.5) * 4);
        for (let k = 0; k < 12; k++) this.fireSuit((k / 12) * Math.PI * 2, 7.5, { r: 0.28, pierce: 1 });
        break;
      default:
        for (let k = 0; k < 8; k++) this.fireSuit((k / 8) * Math.PI * 2, 9);
    }
  }

  private tickBoss(e: Enemy, _dt: number, _dist: number) {
    if (!e.bossId) return;
    const def = HERO_BY_ID[e.bossId];
    const api: BossApi = {
      t: this.t,
      px: this.px,
      pz: this.pz,
      half: this.half,
      minions: this.enemies.filter((n) => n.live && n.kind !== "boss").length,
      color: def.color,
      accent: def.accent,
      fire: (ang, speed, opts) => {
        const col = opts?.color ?? def.color;
        const kind = opts?.kind ?? "major";
        const b = this.allocBullet(1, col, kind);
        b.x = opts?.ox ?? e.x;
        b.y = opts?.y ?? 1.4;
        b.z = opts?.oz ?? e.z;
        b.vx = Math.sin(ang) * speed;
        b.vz = Math.cos(ang) * speed;
        b.dmg = opts?.dmg ?? e.dmg;
        b.life = opts?.life ?? 2.6;
        b.r = opts?.r ?? 0.2;
        b.burn = opts?.burn ?? false;
        b.pierce = opts?.pierce ?? 0;
        b.homing = opts?.homing ?? false;
        b.delay = opts?.delay ?? 0;
        b.kind = kind;
        const sc = (opts?.r ?? 0.2) * 3.2;
        b.mesh.scale.setScalar(Math.min(1.15, Math.max(0.55, sc)));
      },
      warn: (x, z, color) => {
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          this.spawnSpark(x + Math.sin(a) * 0.7, 0.25, z + Math.cos(a) * 0.7, 0, 2.2, 0, color, 0.4);
        }
      },
      float: (text) => this.float(text, "#e8c456", e.x, e.z),
      dash: (vx, vz, time) => {
        e.dvx = vx;
        e.dvz = vz;
        e.dashT = time;
      },
      teleport: (x, z) => {
        this.spawnSpark(e.x, 1, e.z, 0, 3, 0, def.color, 0.35);
        e.x = Math.max(-this.half + 1.6, Math.min(this.half - 1.6, x));
        e.z = Math.max(-this.half + 1.6, Math.min(this.half - 1.6, z));
        e.mesh.position.set(e.x, 0, e.z);
        this.spawnSpark(e.x, 1, e.z, 0, 3, 0, def.accent, 0.35);
      },
      spawn: (kind, x, z) => this.placeAdd(kind, x, z),
      heal: (amt) => {
        e.hp = Math.min(e.maxHp, e.hp + amt);
      },
      spark: (x, z, color) => {
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          this.spawnSpark(x, 1, z, Math.sin(a) * 5, 2, Math.cos(a) * 5, color, 0.32);
        }
      },
      trauma: (n) => {
        this.trauma = Math.min(1, this.trauma + n);
      },
    };
    runBoss(e as BossState, _dt, _dist, api);
  }

  private spawnCoin(x: number, z: number) {
    let mesh = this.coinPool.pop();
    if (!mesh) mesh = createCoinMesh();
    mesh.visible = true;
    this.scene.add(mesh);
    this.coins.push({ live: true, x, z, mesh, vy: 2.4 });
  }

  private updateCoins(dt: number) {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i]!;
      const dx = this.px - c.x;
      const dz = this.pz - c.z;
      const d = Math.hypot(dx, dz);
      if (d < this.magnet) {
        c.x += (dx / (d || 1)) * 10 * dt;
        c.z += (dz / (d || 1)) * 10 * dt;
      }
      if (d < 0.55) {
        this.coinsN += 1;
        this.score += 5;
        this.audio.pickup();
        c.live = false;
        c.mesh.visible = false;
        this.scene.remove(c.mesh);
        this.coinPool.push(c.mesh);
        this.coins.splice(i, 1);
        continue;
      }
      c.mesh.position.set(c.x, 0.25 + Math.sin(this.t * 5 + i) * 0.08, c.z);
      c.mesh.rotation.z += dt * 4;
    }
  }

  private rebuildOrbits() {
    for (const m of this.orbitMeshes) {
      this.scene.remove(m);
    }
    this.orbitMeshes = [];
    const color = HERO_BY_ID[this.heroId].accent;
    for (let i = 0; i < this.orbits; i++) {
      const m = createOrbitMesh(color, suitToCard(HERO_BY_ID[this.heroId].suit, HERO_BY_ID[this.heroId].element));
      this.scene.add(m);
      this.orbitMeshes.push(m);
    }
  }

  private updateOrbits(dt: number) {
    const n = this.orbitMeshes.length;
    for (let i = 0; i < n; i++) {
      const ang = this.t * 2.4 + (i / n) * Math.PI * 2;
      const r = 1.35;
      const x = this.px + Math.sin(ang) * r;
      const z = this.pz + Math.cos(ang) * r;
      const m = this.orbitMeshes[i]!;
      m.position.set(x, 0.7, z);
      m.rotation.y += dt * 6;
      for (const e of this.enemies) {
        if (!e.live) continue;
        if (Math.hypot(e.x - x, e.z - z) < e.r + 0.22) {
          e.hp -= 26 * dt * this.dmgMul;
          if (e.hp <= 0) this.killEnemy(e);
        }
      }
    }
  }

  private roomClear() {
    this.picking = true;
    this.score += 400 + this.room * 90;
    this.audio.clear();
    const choices = rollChoices(this.stacks);
    this.hooks.onPick(choices);
  }

  private applyPower(id: PowerId) {
    this.stacks[id] = (this.stacks[id] ?? 0) + 1;
    switch (id) {
      case "multishot":
        this.shots = Math.min(7, this.shots + 1);
        break;
      case "shield":
        this.shieldMax = Math.min(6, this.shieldMax + 2);
        this.shield = Math.min(this.shieldMax, this.shield + 2);
        break;
      case "speed":
        this.speedMul = Math.min(2.3, this.speedMul * 1.14);
        break;
      case "rapid":
        this.rateMul = Math.min(2.4, this.rateMul * 1.18);
        break;
      case "pierce":
        this.pierce += 1;
        break;
      case "homing":
        this.homing = true;
        break;
      case "orbit":
        this.orbits = Math.min(6, this.orbits + 1);
        this.rebuildOrbits();
        break;
      case "heal":
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.45);
        break;
      case "giant":
        this.giant = Math.min(2.2, this.giant + 0.25);
        this.dmgMul *= 1.12;
        break;
      case "magnet":
        this.magnet += 1.8;
        break;
      case "vamp":
        this.vamp += 0.06;
        break;
      case "fork":
        this.fork = true;
        break;
    }
  }

  private gameOver() {
    this.over = true;
    this.hooks.onOver({
      score: this.score,
      rooms: this.room,
      heroId: this.heroId,
      coins: this.coinsN,
      won: false,
    });
  }

  private victory() {
    this.over = true;
    this.score += 8000;
    this.ascendSquad();
    this.hooks.onOver({
      score: this.score,
      rooms: this.room,
      heroId: this.heroId,
      coins: this.coinsN,
      won: true,
    });
  }

  private ascendSquad() {
    if (this.ascended) return;
    this.ascended = true;
    this.orbits = Math.min(6, Math.max(this.orbits, 4));
    this.rebuildOrbits();
    this.float("THE CIRCLE GATHERS", "#e8c456", this.px, this.pz);
  }

  private collideActor(self: { px?: number; pz?: number } | ArcanaGame, r: number) {
    this.px = Math.max(-this.half + r, Math.min(this.half - r, this.px));
    this.pz = Math.max(-this.half + r, Math.min(this.half - r, this.pz));
    for (const o of this.obstacles) {
      const dx = this.px - o.x;
      const dz = this.pz - o.z;
      const d = Math.hypot(dx, dz);
      const min = r + o.r;
      if (d < min && d > 0.0001) {
        const p = (min - d) / d;
        this.px += dx * p;
        this.pz += dz * p;
      }
    }
    void self;
  }

  private keepIn(e: Enemy, r: number) {
    e.x = Math.max(-this.half + r, Math.min(this.half - r, e.x));
    e.z = Math.max(-this.half + r, Math.min(this.half - r, e.z));
    for (const o of this.obstacles) {
      const dx = e.x - o.x;
      const dz = e.z - o.z;
      const d = Math.hypot(dx, dz);
      const min = r + o.r;
      if (d < min && d > 0.0001) {
        const p = (min - d) / d;
        e.x += dx * p;
        e.z += dz * p;
      }
    }
  }

  private hitObstacle(x: number, z: number, r: number) {
    for (const o of this.obstacles) {
      if (Math.hypot(x - o.x, z - o.z) < o.r + r) return true;
    }
    return false;
  }

  private tintGroup(g: THREE.Object3D, color: number | null) {
    g.traverse((obj) => {
      const m = obj as THREE.Mesh;
      const mat = m.material as THREE.MeshStandardMaterial | undefined;
      if (mat && mat.emissive) {
        if (color == null) {
          if (mat.userData._savedEInt != null) {
            mat.emissiveIntensity = mat.userData._savedEInt;
            delete mat.userData._savedEInt;
          }
        } else {
          if (mat.userData._savedEInt == null) mat.userData._savedEInt = mat.emissiveIntensity;
          mat.emissiveIntensity = 1.4;
        }
      }
    });
  }

  private float(text: string, color: string, x: number, z: number) {
    const v = new THREE.Vector3(x, 1.2, z).project(this.camera);
    const sx = (v.x * 0.5 + 0.5) * (this.canvas.clientWidth || 1);
    const sy = (-v.y * 0.5 + 0.5) * (this.canvas.clientHeight || 1);
    this.hooks.onFloat(text, color, sx, sy);
  }

  private render(dt: number) {
    this.cx += (this.px - this.cx) * Math.min(1, dt * 5.2);
    this.cz += (this.pz - this.cz) * Math.min(1, dt * 5.2);
    const shake = this.reduced ? 0 : this.trauma * this.trauma;
    const ox = (Math.random() * 2 - 1) * shake * 0.35;
    const oy = (Math.random() * 2 - 1) * shake * 0.22;
    this.camera.position.set(this.cx + ox, this.camY + oy, this.cz + this.camZ);
    this.camera.lookAt(this.cx, 0.4, this.cz);
    this.dirLight.position.set(this.cx + 10, 22, this.cz + 12);
    this.dirLight.target.position.set(this.cx, 0, this.cz);
    this.dirLight.target.updateMatrixWorld();

    this.playerMesh.position.set(this.px, 0, this.pz);
    this.playerMesh.rotation.y = this.yaw;
    const bob = this.playerMesh.userData.bob as THREE.Object3D | undefined;
    if (bob) {
      const moving = Math.hypot(this.pvx, this.pvz) > 0.3;
      bob.position.y = moving ? Math.abs(Math.sin(this.t * 11)) * 0.06 : Math.sin(this.t * 2.4) * 0.02;
    }
    if (this.iFrame > 0) this.playerMesh.visible = Math.floor(this.t * 18) % 2 === 0;
    else this.playerMesh.visible = true;

    this.playerLight.position.set(this.px, 2.2, this.pz);
    this.stars.position.set(this.px * 0.08, 0, this.pz * 0.08);

    const ring = this.playerMesh.userData.ring as THREE.Mesh | undefined;
    if (ring) {
      const mat = ring.material as THREE.MeshBasicMaterial;
      mat.opacity = this.shield > 0 ? 0.85 : 0.4;
      ring.scale.setScalar(this.shield > 0 ? 1.05 : 0.85);
      ring.rotation.z += dt * 0.6;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private pushHud() {
    let bossHp = 0;
    let bossMax = 0;
    let bossName = "";
    let bossMove = "";
    for (const e of this.enemies) {
      if (e.live && e.kind === "boss") {
        bossHp = e.hp;
        bossMax = e.maxHp;
        bossName = e.bossTitle ?? "Major Arcana";
        bossMove = e.moveName;
      }
    }
    const snap: HudSnap = {
      hp: this.hp,
      maxHp: this.maxHp,
      lives: this.lives,
      score: this.score,
      coins: this.coinsN,
      room: this.room,
      elapsed: this.elapsed,
      heroId: this.heroId,
      shield: this.shield,
      shieldMax: this.shieldMax,
      stacks: { ...this.stacks },
      bossHp,
      bossMax,
      bossName,
      bossMove,
      waitBoss: storyBoss(this.room).title,
      combo: this.combo,
      kills: this.kills,
      quota: this.quota,
      abilityName: HERO_BY_ID[this.heroId].ability ?? "",
      abilityPct: this.abilityMax > 0 ? 1 - Math.max(0, this.abilityCd) / this.abilityMax : 0,
      abilityBlurb: HERO_BY_ID[this.heroId].abilityBlurb ?? HERO_BY_ID[this.heroId].passive,
      minorTitle: this.minor.title,
      minorBlurb: this.minor.blurb,
      minorCss: this.mods.css,
      minorSkill: this.minor.skill,
      minorSkillBlurb: this.minor.skillBlurb,
      minorCd: Math.max(0, this.minorCd),
      minorCdMax: this.minor.skillCd,
      pips: this.pips,
      pipsMax: this.mods.pipsMax,
      resonance: this.resonate === "match" ? "Resonance" : this.resonate === "oppose" ? "Dissonance" : "Wildcard",
    };
    this.hooks.onHud(snap);
  }

  private bindControlsTest() {
    window.__controlsTest = {
      getYaw: () => this.yaw,
      getSpeed: () => Math.hypot(this.pvx, this.pvz),
      getX: () => this.px,
      getZ: () => this.pz,
      getScore: () => this.score,
      getRoom: () => this.room,
      getHp: () => this.hp,
      getLives: () => this.lives,
      isOver: () => this.over,
      isPicking: () => this.picking,
      forceVictory: () => this.victory(),
      forceBoss: () => {
        this.kills = this.quota;
        this.bossDelay = 0.05;
        this.bossSpawned = false;
      },
      ascendSquad: () => this.ascendSquad(),
      pickPower: (id: PowerId) => this.pickPower(id),
      setKeys: (codes) => this.input.setKeys(codes),
      setStick: (x, y) => this.input.setStick(x, y),
      autoMove: () => {
        let nx = 0;
        let nz = 0;
        let nd = 1e9;
        for (const e of this.enemies) {
          if (!e.live) continue;
          const d = Math.hypot(e.x - this.px, e.z - this.pz);
          if (d < nd) {
            nd = d;
            nx = e.x;
            nz = e.z;
          }
        }
        if (nd > 900) {
          this.input.setStick(0, 0);
          return;
        }
        const dx = this.px - nx;
        const dz = this.pz - nz;
        const d = Math.max(0.001, Math.hypot(dx, dz));
        let ix: number;
        let iy: number;
        if (d < 3.4) {
          ix = dx / d;
          iy = -dz / d;
        } else {
          ix = -dz / d;
          iy = -dx / d;
        }
        if (Math.abs(this.px) > this.half - 1.6) ix = -Math.sign(this.px);
        if (Math.abs(this.pz) > this.half - 1.6) iy = Math.sign(this.pz);
        this.input.setStick(ix, iy);
      },
      advance: (seconds) => {
        if (this.disposed) return;
        const dt = 0.016;
        const steps = Math.max(1, Math.round(seconds / dt));
        for (let i = 0; i < steps; i++) {
          this.last += dt * 1000;
          this.t += dt;
          if (!this.paused && !this.picking && !this.over) {
            if (this.freeze > 0) this.freeze -= dt;
            else this.update(dt);
          }
          if (this.picking || this.over) break;
        }
        this.render(dt);
        this.pushHud();
      },
    };
  }

  private onResize = () => {
    const vv = window.visualViewport;
    const w = this.canvas.clientWidth || vv?.width || window.innerWidth;
    const h = this.canvas.clientHeight || vv?.height || window.innerHeight;
    this.camera.aspect = w / Math.max(1, h);
    const portrait = h > w * 1.08;
    this.camY = portrait ? 36 : 30;
    this.camZ = portrait ? 30 : 25;
    this.camera.fov = portrait ? 44 : 48;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  };
}
