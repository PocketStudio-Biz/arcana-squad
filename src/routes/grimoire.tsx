import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArcanaSiteShell, PageIntro } from "@/components/arcana/ArcanaSiteShell";
import { GUARDIANS } from "@/lib/arcana";
import { ARCANA_BY_ID } from "@/lib/arcana-cards";
import { getGrimoire, type GrimoireState } from "@/lib/progression";

export const Route = createFileRoute("/grimoire")({ component: PlayerGrimoire });

function PlayerGrimoire() {
  const [state, setState] = useState<GrimoireState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void getGrimoire()
      .then((next) => {
        if (live) setState(next);
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "The Grimoire could not be opened.");
      });
    return () => {
      live = false;
    };
  }, []);

  const progressByGuardian = useMemo(
    () => new Map(state?.guardians.map((row) => [row.guardian_id, row]) ?? []),
    [state],
  );

  return (
    <ArcanaSiteShell>
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <PageIntro eyebrow="PLAYER GRIMOIRE" title="Your run becomes a record.">
          <p>
            The Grimoire reads directly from the authenticated Arcana progression store: discovered cards,
            equipped deck, guardian evolution, achievements, quest state, Daily Draw, and accessibility settings.
          </p>
        </PageIntro>

        {error && (
          <div role="status" className="mt-8 rounded-xl border border-gold-dim bg-panel p-5 text-sm leading-6 text-muted">
            <p className="font-display text-gold">The Grimoire is sealed.</p>
            <p className="mt-2">{error}</p>
            <Link to="/login" className="mt-4 inline-flex rounded-lg bg-gold px-3 py-2 font-display text-xs text-void">
              Sign in
            </Link>
          </div>
        )}

        {!state && !error && (
          <div role="status" className="mt-8 rounded-xl border border-line bg-panel p-5 text-sm text-muted">
            Opening your saved Grimoire…
          </div>
        )}

        {state && (
          <>
            <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
              <section className="arcana-card p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-display text-xs tracking-[0.22em] text-gold">GUARDIAN EVOLUTION</p>
                    <p className="mt-2 text-sm text-muted">Active guardian: {state.profile.active_guardian}</p>
                  </div>
                  <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                    {state.guardians.length}/5 saved
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {GUARDIANS.map((guardian) => {
                    const progress = progressByGuardian.get(guardian.id);
                    const xp = progress?.xp ?? 0;
                    const pct = Math.min(100, Math.round((xp / 1000) * 100));
                    return (
                      <div key={guardian.id} className="rounded-xl border border-line bg-panel p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-display text-lg text-parchment">{guardian.animal}</p>
                            <p className="text-xs text-muted">{guardian.tarotFamily}</p>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-muted">
                            {progress?.evolution_stage ?? "hatch"}
                          </span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-raised" aria-label={`${xp} guardian experience`}>
                          <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-faint">{xp.toLocaleString()} XP</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-4">
                <section className="arcana-card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-xs tracking-[0.22em] text-gold">DECK & COLLECTION</p>
                    <span className="text-xs text-muted">{state.unlockedCards.length} discovered</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 12 }, (_, index) => {
                      const slot = state.deck.find((entry) => entry.slot === index + 1);
                      const card = slot ? ARCANA_BY_ID[slot.card_id] : undefined;
                      return (
                        <div key={index} className="min-h-20 rounded-lg border border-line bg-raised p-2 text-xs">
                          <span className="text-faint">{index + 1}</span>
                          <p className="mt-2 leading-4 text-parchment">{card?.name ?? (slot?.card_id || "Empty")}</p>
                        </div>
                      );
                    })}
                  </div>
                  <Link to="/cards" className="mt-4 inline-flex rounded-lg border border-line px-3 py-2 text-sm text-parchment">
                    Open Card Archive
                  </Link>
                </section>

                <section className="arcana-card p-5">
                  <p className="font-display text-xs tracking-[0.22em] text-gold">DAILY DRAW</p>
                  {state.profile.daily_draw_card_id ? (
                    <>
                      <p className="mt-3 font-display text-lg text-parchment">
                        {ARCANA_BY_ID[state.profile.daily_draw_card_id]?.name ?? state.profile.daily_draw_card_id}
                      </p>
                      <p className="mt-1 text-xs text-muted">Drawn {state.profile.daily_draw_date}</p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-muted">No Daily Draw has been saved yet.</p>
                  )}
                </section>

                <section className="arcana-card p-5">
                  <p className="font-display text-xs tracking-[0.22em] text-gold">QUESTS & ACHIEVEMENTS</p>
                  <p className="mt-3 text-sm text-muted">Active quest: {state.profile.active_quest ?? "None"}</p>
                  <p className="mt-1 text-sm text-muted">Achievements: {state.achievements.length}</p>
                </section>

                <section className="arcana-card p-5">
                  <p className="font-display text-xs tracking-[0.22em] text-gold">ACCESSIBILITY</p>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    Reduced-motion support is respected globally. Persisted accessibility preferences are available
                    in the profile store for the next settings pass.
                  </p>
                </section>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Link to="/play" className="rounded-xl bg-gold px-5 py-3 font-display text-sm text-void">Continue to Play</Link>
            </div>
          </>
        )}
      </section>
    </ArcanaSiteShell>
  );
}
