import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

const nav = [
  { to: "/", label: "World Gate" },
  { to: "/squad", label: "Squad Codex" },
  { to: "/cards", label: "Card Archive" },
  { to: "/play", label: "Play" },
  { to: "/grimoire", label: "Player Grimoire" },
] as const;

export function ArcanaSiteShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh overflow-y-auto bg-void text-parchment">
      <a
        href="#arcana-main-content"
        className="sr-only z-50 rounded-md bg-gold px-4 py-3 font-semibold text-void focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line/80 bg-void/95 px-4 py-3 pt-[max(.75rem,env(safe-area-inset-top))] backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/" className="min-h-11 shrink-0 content-center rounded-md font-display text-sm tracking-[0.24em] text-gold">
            ARCANA SQUAD
          </Link>
          <nav className="flex max-w-[72vw] gap-1 overflow-x-auto pb-1 text-xs text-muted sm:gap-2" aria-label="Arcana Squad">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-line px-3 py-2 transition-colors hover:border-gold-dim hover:text-parchment"
                activeProps={{ className: "border-gold-dim bg-panel text-gold" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div id="arcana-main-content" tabIndex={-1} className="pb-[max(1rem,env(safe-area-inset-bottom))] outline-none">
        {children}
      </div>
    </main>
  );
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="max-w-3xl">
      <p className="font-display text-[11px] tracking-[0.32em] text-gold-dim">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-gold sm:text-6xl">{title}</h1>
      <div className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">{children}</div>
    </div>
  );
}
