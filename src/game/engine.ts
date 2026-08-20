import * as THREE from "three";
import type { EnemyKind, HeroId, HudSnap, PowerId } from "./types";
import { HERO_BY_ID } from "./heroes";
import { rollChoices } from "./powerups";
import { Input } from "./input";
import { AudioSys } from "./audio";
import {
  createAnubis,
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
  private pendingWaves: { kind: EnemyKind; n: number }[] = [];
  private spawnT = 0;
  private hudT = 0;
  private last = 0;
  private running = false;
  private disposed = false;
  private t = 0;
  private reduced = false;
  private camY = 20;
  private camZ = 17;

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
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    this.renderer.setSize(canvas.clientWidth || 1280, canvas.clientHeight || 720, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.48;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x1a1016, 1);

    this.camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.3, 280);
    this.camera.position.set(0, 20, 17);
    this.scene.fog = new THREE.FogExp2(0x221018, 0.008);

    const hemi = new THREE.HemisphereLight(0xffe6d4, 0x8a3048, 1.45);
    this.scene.add(hemi);
    const map = coarse ? 512 : 1024;
    this.dirLight = new THREE.DirectionalLight(0xfff1dc, 1.95);
    this.dirLight.position.set(10, 22, 12);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.set(map, map);
    this.dirLight.shadow.camera.near = 2;
    this.dirLight.shadow.camera.far = 60;
    this.dirLight.shadow.camera.left = -12;
    this.dirLight.shadow.camera.right = 12;
    this.dirLight.shadow.camera.top = 12;
    this.dirLight.shadow.camera.bottom = -12;
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
    if (this.room >= 15) {
      this.victory();
      return;
    }
    this.room += 1;
    if (this.room >= 10) this.ascendSquad();
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
    const size = 16 + Math.min(6, Math.floor(n / 2));
    const built = createDungeon(size, this.textures, n);
    this.dungeon = built.group;
    this.obstacles = built.obstacles;
    this.half = built.half - 0.55;
    this.scene.add(this.dungeon);
    this.px = 0;
    this.pz = 0;
    this.pendingWaves = this.planWaves(n);
    this.spawnT = 0.35;
    this.dirLight.target.position.set(0, 0, 0);
  }

  private planWaves(n: number): { kind: EnemyKind; n: number }[] {
    if (n % 5 === 0) {
      return [
        { kind: "scarab", n: 3 + Math.floor(n / 5) },
        { kind: "boss", n: 1 },
      ];
    }
    const wisps = 3 + n;
    const scarabs = Math.floor(n * 0.7);
    const brutes = Math.max(0, Math.floor((n - 2) / 2));
    const mages = Math.max(0, Math.floor((n - 3) / 2));
    const waves: { kind: EnemyKind; n: number }[] = [{ kind: "wisp", n: wisps }];
    if (scarabs) waves.push({ kind: "scarab", n: scarabs });
    if (brutes) waves.push({ kind: "brute", n: brutes });
    if (mages) waves.push({ kind: "mage", n: mages });
    return waves;
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
    if (this.comboT <= 0) this.combo = 0;
    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    this.muzzleLight.intensity = Math.max(0, this.muzzleLight.intensity - dt * 28);

    const def = HERO_BY_ID[this.heroId];
    const { ix, iy } = this.input.axes();
    // Screen-relative: +ix = right (+X), +iy = up on screen (−Z)
    const speed = def.speed * this.speedMul;
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

    if (nearest && nd < 12 * 12 && this.fireCd <= 0) {
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
      this.pendingWaves.length === 0 &&
      this.enemies.every((e) => !e.live) &&
      this.spawnT <= 0
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
    const base = this.yaw;
    const n = this.shots;
    const spread = (n - 1) * 0.18;
    const speed = def.projectileSpeed;
    const dmg = def.damage * this.dmgMul * this.giant;
    const fireOne = (ang: number, dmgMul = 1) => {
      const b = this.allocBullet(0, def.color, kind);
      b.x = ox;
      b.y = oy;
      b.z = oz;
      b.vx = Math.sin(ang) * speed;
      b.vz = Math.cos(ang) * speed;
      b.life = 1.35;
      b.dmg = dmg * dmgMul;
      b.pierce = this.pierce;
      b.r = 0.16 * this.giant;
      b.homing = this.homing;
      b.burn = this.burn;
      b.kind = kind;
      b.mesh.scale.set(0.55 * this.giant, 0.55 * this.giant, 0.55 * this.giant);
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
    if (this.wildcard && Math.random() < 0.15) fireOne(base + (Math.random() - 0.5) * 0.6);
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
      if (b.homing && b.team === 0) {
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
          const spd = Math.hypot(b.vx, b.vz);
          const tx = Math.sin(ang) * spd;
          const tz = Math.cos(ang) * spd;
          b.vx += (tx - b.vx) * Math.min(1, 6 * dt);
          b.vz += (tz - b.vz) * Math.min(1, 6 * dt);
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
            this.hurtEnemy(e, b.dmg, b.x, b.z, b.burn);
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

      const stop = e.kind === "mage" ? 6.2 : e.kind === "boss" ? 2.4 : 0.9;
      if (dist > stop) {
        e.x += ax * e.speed * dt;
        e.z += az * e.speed * dt;
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
        const b = this.allocBullet(1, 0xc4453c);
        b.x = e.x;
        b.y = 0.8;
        b.z = e.z;
        const s = 9;
        b.vx = (dx / dist) * s;
        b.vz = (dz / dist) * s;
        b.dmg = e.dmg;
        b.life = 2.2;
      }
      if (e.kind === "boss" && e.atk <= 0) {
        e.atk = 2.1;
        for (let k = 0; k < 8; k++) {
          const ang = (k / 8) * Math.PI * 2 + this.t;
          const b = this.allocBullet(1, 0xe8c456);
          b.x = e.x;
          b.y = 1.2;
          b.z = e.z;
          b.vx = Math.sin(ang) * 7;
          b.vz = Math.cos(ang) * 7;
          b.dmg = e.dmg;
          b.life = 2.4;
          b.r = 0.22;
        }
        this.trauma = Math.min(1, this.trauma + 0.35);
      }

      if (this.iFrame <= 0 && dist < e.r + 0.55) {
        this.hurtPlayer(e.dmg);
        e.x -= ax * 0.6;
        e.z -= az * 0.6;
      }
    }
  }

  private hurtEnemy(e: Enemy, dmg: number, hx: number, hz: number, burn: boolean) {
    e.hp -= dmg;
    e.flash = 1;
    const nx = e.x - hx;
    const nz = e.z - hz;
    const nl = Math.hypot(nx, nz) || 1;
    e.x += (nx / nl) * 0.28;
    e.z += (nz / nl) * 0.28;
    if (burn) e.burn = 1.4;
    if (this.vamp > 0) this.hp = Math.min(this.maxHp, this.hp + dmg * this.vamp);
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
    const n = Math.max(1, Math.round(e.coins * this.goldMul));
    for (let i = 0; i < n; i++) this.spawnCoin(e.x + (Math.random() - 0.5), e.z + (Math.random() - 0.5));
    this.float(`+${pts}`, "#e8c456", e.x, e.z);
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
    this.spawnT -= dt;
    if (this.spawnT > 0) return;
    if (!this.pendingWaves.length) return;
    if (this.enemies.some((e) => e.live)) return;
    const wave = this.pendingWaves.shift()!;
    for (let i = 0; i < wave.n; i++) this.spawnEnemy(wave.kind);
    this.spawnT = 0.4;
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
      if (Math.hypot(x - this.px, z - this.pz) > 4) break;
    }
    const tint = THEMES[(this.room - 1) % THEMES.length]!;
    const mesh = kind === "boss" ? createAnubis(1.55, false) : createEnemyMesh(kind, tint);
    if (kind !== "boss") mesh.scale.setScalar(1.05);
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
              : { hp: 280, r: 1.15, speed: 1.7, dmg: 15, score: 1800, coins: 12 };
    const e: Enemy = {
      live: true,
      kind,
      x,
      z,
      vx: 0,
      vz: 0,
      r: stats.r * (kind === "boss" ? 1.4 : 1.45),
      hp: Math.round(stats.hp * roomScale),
      maxHp: Math.round(stats.hp * roomScale),
      yaw: 0,
      speed: stats.speed + this.room * 0.04,
      dmg: Math.round(stats.dmg * (1 + this.room * 0.06)),
      score: stats.score,
      coins: stats.coins,
      flash: 0,
      burn: 0,
      atk: 1,
      mesh,
    };
    mesh.position.set(x, 0, z);
    this.enemies.push(e);
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
    const shake = this.reduced ? 0 : this.trauma * this.trauma;
    const ox = (Math.random() * 2 - 1) * shake * 0.35;
    const oy = (Math.random() * 2 - 1) * shake * 0.22;
    this.camera.position.set(this.px + ox, this.camY + oy, this.pz + this.camZ);
    this.camera.lookAt(this.px, 0.55, this.pz);
    this.dirLight.position.set(this.px + 8, 18, this.pz + 10);
    this.dirLight.target.position.set(this.px, 0, this.pz);
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
    for (const e of this.enemies) {
      if (e.live && e.kind === "boss") {
        bossHp = e.hp;
        bossMax = e.maxHp;
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
      combo: this.combo,
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
    this.camY = portrait ? 22.5 : 18.5;
    this.camZ = portrait ? 18.5 : 15.5;
    this.camera.fov = portrait ? 36 : 40;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  };
}
