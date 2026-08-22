import * as THREE from "three";
import { ArcanaGame } from "./engine";
import { createHeroMesh } from "./meshes";
import type { HeroId } from "./types";

const CORE_SQUAD: HeroId[] = ["swords", "pentacles", "wands", "cups", "fool"];
const PATCH_FLAG = Symbol.for("arcana-squad.behavior-patched");

type RuntimePrototype = {
  ascendSquad: (this: ArcanaGame) => void;
  render: (this: ArcanaGame, dt: number) => void;
  hurtPlayer: (this: ArcanaGame, dmg: number) => void;
};

type RuntimeState = {
  scene: THREE.Scene;
  px: number;
  pz: number;
  t: number;
  heroId: HeroId;
  reduced: boolean;
  float: (text: string, color: string, x: number, z: number) => void;
};

type SquadState = {
  allies: THREE.Group[];
  lastGuardAt: number;
};

const stateByGame = new WeakMap<ArcanaGame, SquadState>();
const proto = ArcanaGame.prototype as unknown as RuntimePrototype & Record<PropertyKey, unknown>;

if (!proto[PATCH_FLAG]) {
  proto[PATCH_FLAG] = true;

  const originalAscend = proto.ascendSquad;
  const originalRender = proto.render;
  const originalHurt = proto.hurtPlayer;

  proto.ascendSquad = function squadAscend(this: ArcanaGame) {
    originalAscend.call(this);
    if (stateByGame.has(this)) return;

    const runtime = this as unknown as RuntimeState;
    const ids = CORE_SQUAD.filter((id) => id !== runtime.heroId);
    const allies = ids.map((id) => {
      const mesh = createHeroMesh(id);
      mesh.scale.setScalar(0.88);
      mesh.userData.arcanaSquadAlly = true;
      runtime.scene.add(mesh);
      return mesh;
    });
    stateByGame.set(this, { allies, lastGuardAt: -99 });
    runtime.float("THE SQUAD ANSWERS", "#e8c456", runtime.px, runtime.pz);
  };

  proto.render = function squadRender(this: ArcanaGame, dt: number) {
    const runtime = this as unknown as RuntimeState;
    const squad = stateByGame.get(this);

    if (squad?.allies.length) {
      const count = squad.allies.length;
      for (let i = 0; i < count; i += 1) {
        const ally = squad.allies[i]!;
        const phase = runtime.reduced
          ? (i / count) * Math.PI * 2
          : runtime.t * 0.72 + (i / count) * Math.PI * 2;
        const practicePulse = runtime.reduced ? 0 : Math.max(0, Math.sin(runtime.t * 1.35 + i * 1.8));
        const radius = 1.75 + practicePulse * 0.32;
        const x = runtime.px + Math.sin(phase) * radius;
        const z = runtime.pz + Math.cos(phase) * radius;
        const lift = runtime.reduced ? 0.05 : 0.05 + Math.abs(Math.sin(runtime.t * 3 + i)) * 0.08;
        ally.position.set(x, lift, z);
        ally.rotation.y = Math.atan2(runtime.px - x, runtime.pz - z);

        const bob = ally.userData.bob as THREE.Object3D | undefined;
        if (bob) bob.position.y = runtime.reduced ? 0 : Math.abs(Math.sin(runtime.t * 5 + i * 0.9)) * 0.045;
      }
    }

    originalRender.call(this, dt);
  };

  proto.hurtPlayer = function squadGuard(this: ArcanaGame, dmg: number) {
    const runtime = this as unknown as RuntimeState;
    const squad = stateByGame.get(this);
    if (squad && runtime.t - squad.lastGuardAt >= 8) {
      squad.lastGuardAt = runtime.t;
      runtime.float("SQUAD GUARD", "#9b7de0", runtime.px, runtime.pz);
      originalHurt.call(this, dmg * 0.65);
      return;
    }
    originalHurt.call(this, dmg);
  };
}
