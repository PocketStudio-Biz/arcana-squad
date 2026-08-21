import { createFileRoute, Link } from "@tanstack/react-router";
import { ArcanaSiteShell, PageIntro } from "@/components/arcana/ArcanaSiteShell";
import { GUARDIANS } from "@/lib/arcana";

export const Route = createFileRoute("/grimoire")({ component: PlayerGrimoire });

function PlayerGrimoire() {
  return (
    <ArcanaSiteShell>
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <PageIntro eyebrow="PLAYER GRIMOIRE" title="Your run becomes a record.">
          <p>The Grimoire is the progression home for discovered Arcana, guardian evolution, equipped deck, active quests, achievements, daily draw state, and accessibility settings.</p>
        </PageIntro>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <section className="arcana-card p-5">
            <p className="font-display text-xs tracking-[0.22em] text-gold">GUARDIAN EVOLUTION</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {GUARDIANS.map((guardian) => (
                <div key={guardian.id} className="rounded-xl border border-line bg-panel p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-lg text-parchment">{guardian.animal}</p>
                    <span className="text-[10px] uppercase tracking-wider text-muted">Hatch</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-raised">
                    <div className="h-full w-0 bg-gold" aria-label="No saved evolution progress yet" />
                  </div>
                  <p className="mt-2 text-xs text-faint">Progress appears here after persistence is connected.</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-4">
            <section className="arcana-card p-5">
              <p className="font-display text-xs tracking-[0.22em] text-gold">DECK & COLLECTION</p>
              <p className="mt-3 text-sm leading-6 text-muted">Discovered cards, equipped cards, and locked silhouettes will live here. The shared Arcana model is now in the codebase; persistence is the next backend layer.</p>
              <Link to="/cards" className="mt-4 inline-flex rounded-lg border border-line px-3 py-2 text-sm text-parchment">Open Card Archive</Link>
            </section>
            <section className="arcana-card p-5">
              <p className="font-display text-xs tracking-[0.22em] text-gold">DAILY DRAW</p>
              <p className="mt-3 text-sm leading-6 text-muted">Designed as a return loop that can modify a run without replacing the dungeon loop.</p>
            </section>
            <section className="arcana-card p-5">
              <p className="font-display text-xs tracking-[0.22em] text-gold">ACCESSIBILITY</p>
              <p className="mt-3 text-sm leading-6 text-muted">Touch-first interaction and reduced-motion support remain product constraints across the game and website.</p>
            </section>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link to="/play" className="rounded-xl bg-gold px-5 py-3 font-display text-sm text-void">Continue to Play</Link>
        </div>
      </section>
    </ArcanaSiteShell>
  );
}
