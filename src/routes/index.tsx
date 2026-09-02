import { createFileRoute, Link } from "@tanstack/react-router";
import { ArcanaSiteShell, PageIntro } from "@/components/arcana/ArcanaSiteShell";
import { GUARDIANS } from "@/lib/arcana";

export const Route = createFileRoute("/")({ component: WorldGate });

const familyClass = {
  swords: "border-swords/70",
  pentacles: "border-pentacles/70",
  wands: "border-wands/70",
  cups: "border-cups/70",
  major: "border-fool/70",
} as const;

function WorldGate() {
  return (
    <ArcanaSiteShell>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
        <PageIntro eyebrow="THE WORLD GATE" title="Draw the card. Enter the dungeon. Build the squad.">
          <p>
            Arcana Squad is a touch-first tarot dungeon crawler where each suit is a different gameplay language.
            Choose a guardian, draw Arcana that changes the run, and grow five distinct heroes into one living squad.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/play" className="rounded-xl bg-gold px-5 py-3 font-display text-sm text-void shadow-lg shadow-black/30">
              Enter the Game
            </Link>
            <Link to="/squad" className="rounded-xl border border-gold-dim px-5 py-3 text-sm text-parchment">
              Meet the Squad
            </Link>
            <Link to="/cards" className="rounded-xl border border-line px-5 py-3 text-sm text-muted">
              Explore the Arcana
            </Link>
          </div>
        </PageIntro>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {GUARDIANS.map((guardian) => (
            <article key={guardian.id} className={`arcana-card border-l-4 ${familyClass[guardian.tarotFamily]} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-parchment">{guardian.animal}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">{guardian.tarotFamily}</p>
                </div>
                <span className="rounded-full bg-raised px-2.5 py-1 text-[10px] uppercase tracking-wider text-gold">{guardian.element}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{guardian.gameplayRole}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="font-display text-xs tracking-[0.3em] text-gold-dim">THE LOOP</p>
          <p className="mt-3 max-w-4xl text-lg leading-8 text-parchment">
            Choose Guardian → Draw Arcana → Enter Encounter → Combine suit magic and card effects → Squad Interaction → Resolve the Reading → Rewards and Evolution → Arcana Hub → Repeat.
          </p>
        </div>
      </section>
    </ArcanaSiteShell>
  );
}
