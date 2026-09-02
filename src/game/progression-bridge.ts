import { ArcanaGame } from "./engine";
import type { HeroId } from "./types";
import type { GuardianId } from "@/lib/arcana";
import { familyForHero } from "@/lib/arcana-cards";
import { recordRunProgress } from "@/lib/run-progression";

const PATCH_FLAG = Symbol.for("arcana-squad.progression-patched");

type RuntimePrototype = {
  gameOver: (this: ArcanaGame) => void;
  victory: (this: ArcanaGame) => void;
};

type RuntimeState = {
  heroId: HeroId;
  room: number;
  score: number;
};

function guardianForHero(heroId: HeroId): GuardianId {
  const family = familyForHero(heroId);
  if (family === "swords") return "turtle";
  if (family === "pentacles") return "otter";
  if (family === "wands") return "lizard";
  if (family === "cups") return "raven";
  return "lynx";
}

function persist(game: ArcanaGame, won: boolean) {
  const runtime = game as unknown as RuntimeState;
  void recordRunProgress({
    data: {
      guardianId: guardianForHero(runtime.heroId),
      rooms: runtime.room,
      score: runtime.score,
      won,
    },
  }).catch(() => undefined);
}

const proto = ArcanaGame.prototype as unknown as RuntimePrototype & Record<PropertyKey, unknown>;

if (!proto[PATCH_FLAG]) {
  proto[PATCH_FLAG] = true;
  const originalGameOver = proto.gameOver;
  const originalVictory = proto.victory;

  proto.gameOver = function progressionGameOver(this: ArcanaGame) {
    originalGameOver.call(this);
    persist(this, false);
  };

  proto.victory = function progressionVictory(this: ArcanaGame) {
    originalVictory.call(this);
    persist(this, true);
  };
}
