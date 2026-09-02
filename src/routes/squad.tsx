import { createFileRoute, Link } from "@tanstack/react-router";
import { ArcanaSiteShell, PageIntro } from "@/components/arcana/ArcanaSiteShell";
import { GUARDIANS } from "@/lib/arcana";

export const Route = createFileRoute("/squad")({ component: SquadCodex });

const suitDetails = {
  swords: "Control direction, momentum, air pressure, ranged precision, and telekinetic movement.",
  pentacles: "Generate and preserve resources, grow plants, build temporary advantages, and amplify material rewards.",
  wands: "Create heat, fire, smoke, explosive pressure, and aggressive environmental hazards.",
  cups: "Protect, redirect, slow, heal, and use water or cold as defensive utility.",
  major: "Bend ordinary suit rules through cosmic, shadow, transformation, and wildcard effects.",
} as const;

function SquadCodex() {
  return (
    <ArcanaSiteShell>
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <PageIntro eyebrow="SQUAD CODEX" title="Five guardians. Five ways to change the field.">
          <p>Each guardian has a distinct suit, silhouette, elemental language, and mechanical role. The squad grows together, but nobody is a palette-swap understudy.</p>
        </PageIntro>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {GUARDIANS.map((guardian) => (
            <article key={guardian.id} className="arcana-card flex min-h-72 flex-col p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-gold-dim">{guardian.tarotFamily}</p>
              <h2 className="mt-2 font-display text-3xl text-gold">{guardian.animal}</h2>
              <p className="mt-1 text-sm text-muted">{guardian.element}</p>
              <p className="mt-5 text-sm leading-6 text-parchment">{guardian.gameplayRole}</p>
              <p className="mt-4 text-xs leading-5 text-muted">{suitDetails[guardian.tarotFamily]}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                {guardian.magicLanguage.map((word) => (
                  <span key={word} className="rounded-full border border-line bg-raised px-2 py-1 text-[10px] text-muted">{word}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <Link to="/play" className="rounded-xl bg-gold px-5 py-3 font-display text-sm text-void">Choose a Guardian</Link>
        </div>
      </section>
    </ArcanaSiteShell>
  );
}
