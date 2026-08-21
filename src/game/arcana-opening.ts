import { ArcanaGame } from "./engine";
import type { HeroId, PowerId } from "./types";
import { drawOpeningArcana, type ArcanaGameplayCard } from "@/lib/arcana-cards";
import { unlockArcanaCard } from "@/lib/progression";

declare global {
  interface Window {
    __arcanaOpeningCard?: ArcanaGameplayCard;
  }
}

type EngineInternals = ArcanaGame & {
  applyPower: (id: PowerId) => void;
  pushHud: () => void;
  float: (text: string, color: string, x: number, z: number) => void;
};

const PATCH_FLAG = Symbol.for("arcana-squad.opening-card-patched");
const proto = ArcanaGame.prototype as unknown as Record<PropertyKey, unknown>;

if (!proto[PATCH_FLAG]) {
  proto[PATCH_FLAG] = true;
  const originalBoot = ArcanaGame.prototype.boot;

  ArcanaGame.prototype.boot = async function patchedBoot(this: ArcanaGame, heroId: HeroId) {
    await originalBoot.call(this, heroId);

    const card = drawOpeningArcana(heroId);
    const internal = this as unknown as EngineInternals;
    internal.applyPower(card.powerId);
    if (card.secondaryPowerId) internal.applyPower(card.secondaryPowerId);
    internal.pushHud();
    internal.float(card.name.toUpperCase(), card.family === "major" ? "#9b7de0" : "#e8c456", 0, 0);

    window.__arcanaOpeningCard = card;
    window.dispatchEvent(new CustomEvent("arcana:opening-draw", { detail: card }));

    try {
      localStorage.setItem("arcana-squad-opening-card", card.id);
    } catch {
      // Storage can be unavailable in private or embedded contexts; gameplay still proceeds.
    }

    // Signed-out play remains valid. Authenticated players persist the discovery.
    void unlockArcanaCard({ data: { cardId: card.id } }).catch(() => undefined);
  };
}
