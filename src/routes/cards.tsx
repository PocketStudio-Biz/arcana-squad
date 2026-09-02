import { createFileRoute, Link } from "@tanstack/react-router";
import { ArcanaSiteShell, PageIntro } from "@/components/arcana/ArcanaSiteShell";
import { ARCANA_DECK } from "@/lib/arcana-cards";
import type { ArcanaFamily } from "@/lib/arcana";

export const Route = createFileRoute("/cards")({ component: CardArchive });

const families: Array<{ id: ArcanaFamily; label: string; copy: string }> = [
  { id: "major", label: "Major Arcana", copy: "Rule-bending transformations and wildcard effects." },
  { id: "swords", label: "Swords", copy: "Precision, decisions, movement, and control of space." },
  { id: "pentacles", label: "Pentacles", copy: "Resources, growth, material rewards, and construction." },
  { id: "cups", label: "Cups", copy: "Protection, intuition, healing, redirection, and cold." },
  { id: "wands", label: "Wands", copy: "Pressure, action, heat, hazards, and aggressive tempo." },
];

function CardArchive() {
  return (
    <ArcanaSiteShell>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <PageIntro eyebrow="CARD ARCHIVE" title="All 78 cards belong to the game system.">
          <p>
            This archive is generated from the same Arcana dataset intended for opening draws, rewards, the
            Player Grimoire, and encounter modifiers. Major and Minor Arcana therefore share one source of truth
            instead of quietly mutating into five incompatible spreadsheets.
          </p>
        </PageIntro>

        <div className="mt-10 grid gap-8">
          {families.map((family) => {
            const cards = ARCANA_DECK.filter((card) => card.family === family.id);
            return (
              <section key={family.id} aria-labelledby={`family-${family.id}`}>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p id={`family-${family.id}`} className="font-display text-xl text-gold">{family.label}</p>
                    <p className="mt-1 text-sm text-muted">{family.copy}</p>
                  </div>
                  <span className="rounded-full border border-line bg-panel px-3 py-1 text-xs text-muted">
                    {cards.length} cards
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {cards.map((card) => (
                    <article key={card.id} className="arcana-card flex min-h-48 flex-col p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-base text-parchment">{card.name}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold-dim">
                            {card.family} · {card.rarity}
                          </p>
                        </div>
                        <span aria-label={`Tier ${card.tier}`} className="rounded-md border border-line px-2 py-1 text-xs text-muted">
                          T{card.tier}
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-muted">{card.meaning}</p>
                      <div className="mt-auto pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gold">Gameplay</p>
                        <p className="mt-1 text-sm leading-5 text-parchment/80">{card.gameplayEffect}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-10 rounded-xl border border-line bg-panel p-5 text-sm leading-6 text-muted">
          <p className="font-display text-xs tracking-[0.22em] text-gold">COLLECTION RULE</p>
          <p className="mt-2">
            The archive exposes card identities and mechanics. Player-specific locked/unlocked presentation belongs
            to the Grimoire and persisted collection state, so public reference data never lies about ownership.
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <Link to="/play" className="rounded-xl bg-gold px-5 py-3 font-display text-sm text-void">Draw in the Game</Link>
        </div>
      </section>
    </ArcanaSiteShell>
  );
}
