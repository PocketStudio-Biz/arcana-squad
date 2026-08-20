import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const GameApp = lazy(() => import("@/game/GameApp").then((m) => ({ default: m.GameApp })));

export const Route = createFileRoute("/")({ component: Home });

function Boot() {
  return (
    <main className="grid min-h-dvh place-items-center bg-void text-parchment">
      <p className="font-display text-sm tracking-[0.35em] text-gold">ARCANA SQUAD</p>
    </main>
  );
}

function Home() {
  return (
    <Suspense fallback={<Boot />}>
      <GameApp />
    </Suspense>
  );
}
