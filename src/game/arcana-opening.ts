import { ArcanaGame } from "./engine";
import type { HeroId, PowerId } from "./types";
import {
  ARCANA_BY_ID,
  drawOpeningArcana,
  type ArcanaGameplayCard,
} from "@/lib/arcana-cards";
import { unlockArcanaCard } from "@/lib/progression";

declare global {
  interface Window {
    __arcanaOpeningCard?: ArcanaGameplayCard;
  }
}

type EngineInternals = {
  applyPower: (id: PowerId) => void;
  pushHud: () => void;
  float: (text: string, color: string, x: number, z: number) => void;
  reduced: boolean;
};

type StoredDailyDraw = { date: string; cardId: string };
type StoredAccessibility = {
  reducedEffects?: boolean;
  largerText?: boolean;
  highContrast?: boolean;
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readDailyCard(): ArcanaGameplayCard | null {
  try {
    const raw = localStorage.getItem("arcana-squad-daily-draw");
    if (!raw) return null;
    const saved = JSON.parse(raw) as StoredDailyDraw;
    if (saved.date !== localDateKey()) return null;
    return ARCANA_BY_ID[saved.cardId] ?? null;
  } catch {
    return null;
  }
}

function applyStoredAccessibility() {
  try {
    const raw = localStorage.getItem("arcana-squad-accessibility");
    if (!raw) return false;
    const saved = JSON.parse(raw) as StoredAccessibility;
    const root = document.documentElement;
    root.dataset.arcanaReducedEffects = String(Boolean(saved.reducedEffects));
    root.dataset.arcanaLargerText = String(Boolean(saved.largerText));
    root.dataset.arcanaHighContrast = String(Boolean(saved.highContrast));
    return Boolean(saved.reducedEffects);
  } catch {
    return false;
  }
}

const PATCH_FLAG = Symbol.for("arcana-squad.opening-card-patched");
const proto = ArcanaGame.prototype as unknown as Record<PropertyKey, unknown>;

if (!proto[PATCH_FLAG]) {
  proto[PATCH_FLAG] = true;
  const originalBoot = ArcanaGame.prototype.boot;

  ArcanaGame.prototype.boot = async function patchedBoot(this: ArcanaGame, heroId: HeroId) {
    const reduceEffects = applyStoredAccessibility();
    await originalBoot.call(this, heroId);

    const internal = this as unknown as EngineInternals;
    if (reduceEffects) internal.reduced = true;

    const card = readDailyCard() ?? drawOpeningArcana(heroId);
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
