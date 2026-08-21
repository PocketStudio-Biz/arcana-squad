import { createFileRoute, Link } from "@tanstack/react-router";
import { ArcanaSiteShell, PageIntro } from "@/components/arcana/ArcanaSiteShell";
import { GUARDIANS } from "@/lib/arcana";

export const Route = createFileRoute("/cards")({ component: CardArchive });

const familyCopy = {
  swords: "Precision, decisions, movement, and control of space.",
  pentacles: "Resources, growth, material rewards, and construction.",
  wands: "Pressure, action, heat, hazards, and aggressive tempo.",
  cups: "Protection, intuition, healing, redirection, and cold.",
  major: "Transformations and wildcard effects that can bend the normal suit rules.",
} as const;

function CardArchive() {
  return (
    <ArcanaSiteShell>
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <PageIntro eyebrow="CARD ARCHIVE" title="Tarot is a mechanic, not wallpaper.">
          <p>The archive is the shared reference for Major and Minor Arcana. Cards can change encounters, rewards, abilities, or route conditions, and discovered cards become part of the player's collection.</p>
        </PageIntro>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {GUARDIANS.map((guardian) => (
            <article key={guardian.tarotFamily} className="arcana-card p-5">
              <div className="aspect-[2/3] rounded-md border border-line bg-gradient-to-b from-raised to-ink p-4">
                <p className="font-display text-xs tracking-[0.22em] text-gold-dim">{guardian.tarotFamily === "major" ? "MAJOR ARCANA" : guardian.tarotFamily.toUpperCase()}</p>
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <p className="font-display text-3xl text-gold">{guardian.animal}</p>
                    <p className="mt-2 text-xs text-muted">Family gateway card</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{familyCopy[guardian.tarotFamily]}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-line bg-panel p-5 text-sm leading-6 text-muted">
          <p className="font-display text-xs tracking-[0.22em] text-gold">COLLECTION RULE</p>
          <p className="mt-2">Locked cards remain visible as silhouettes. Exact card-by-card Minor Arcana effects stay intentionally flexible until encounter balance is tested.</p>
        </div>

        <div className="mt-8 flex justify-end">
          <Link to="/play" className="rounded-xl bg-gold px-5 py-3 font-display text-sm text-void">Draw in the Game</Link>
        </div>
      </section>
    </ArcanaSiteShell>
  );
}
