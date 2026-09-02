import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import type { ArcanaGameplayCard } from "@/lib/arcana-cards";
import "@/game/arcana-opening";
import "@/game/squad-behavior";
import "@/game/progression-bridge";

const GameApp = lazy(() => import("@/game/GameApp").then((m) => ({ default: m.GameApp })));

export const Route = createFileRoute("/play")({ component: PlayRoute });

function Boot() {
  return (
    <main className="grid min-h-dvh place-items-center bg-void text-parchment">
      <p className="font-display text-sm tracking-[0.35em] text-gold">OPENING THE CIRCLE</p>
    </main>
  );
}

function OpeningArcanaNotice() {
  const [card, setCard] = useState<ArcanaGameplayCard | null>(null);

  useEffect(() => {
    let timer = 0;
    const onDraw = (event: Event) => {
      const detail = (event as CustomEvent<ArcanaGameplayCard>).detail;
      setCard(detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCard(null), 5200);
    };
    window.addEventListener("arcana:opening-draw", onDraw);
    return () => {
      window.removeEventListener("arcana:opening-draw", onDraw);
      window.clearTimeout(timer);
    };
  }, []);

  if (!card) return null;

  return (
    <aside
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-gold-dim bg-ink/95 p-4 shadow-2xl backdrop-blur"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.28em] text-gold-dim">Opening Arcana</p>
          <p className="mt-1 font-display text-xl text-gold">{card.name}</p>
        </div>
        <span className="rounded-full border border-line px-2 py-1 text-[10px] uppercase tracking-wider text-muted">
          {card.family}
        </span>
      </div>
      <p className="mt-3 text-sm leading-5 text-parchment/90">{card.meaning}</p>
      <p className="mt-2 text-xs leading-5 text-muted">{card.gameplayEffect}</p>
    </aside>
  );
}

function PlayRoute() {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-void">
      <Suspense fallback={<Boot />}>
        <GameApp />
      </Suspense>
      <OpeningArcanaNotice />
    </div>
  );
}
