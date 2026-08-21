import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import "@/game/arcana-opening";
import "@/game/squad-behavior";

const GameApp = lazy(() => import("@/game/GameApp").then((m) => ({ default: m.GameApp })));

export const Route = createFileRoute("/play")({ component: PlayRoute });

function Boot() {
  return (
    <main className="grid min-h-dvh place-items-center bg-void text-parchment">
      <p className="font-display text-sm tracking-[0.35em] text-gold">OPENING THE CIRCLE</p>
    </main>
  );
}

function PlayRoute() {
  return (
    <Suspense fallback={<Boot />}>
      <GameApp />
    </Suspense>
  );
}
