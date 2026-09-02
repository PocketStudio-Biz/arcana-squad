import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArcanaSiteShell, PageIntro } from "@/components/arcana/ArcanaSiteShell";
import { GUARDIANS } from "@/lib/arcana";
import { ARCANA_BY_ID, ARCANA_DECK } from "@/lib/arcana-cards";
import {
  getGrimoire,
  saveDailyDraw,
  saveDeck,
  unlockArcanaCard,
  type GrimoireState,
} from "@/lib/progression";
import {
  saveAccessibilityPreferences,
  type ArcanaAccessibility,
} from "@/lib/accessibility";

export const Route = createFileRoute("/grimoire")({ component: PlayerGrimoire });

const DEFAULT_ACCESSIBILITY: ArcanaAccessibility = {
  reducedEffects: false,
  largerText: false,
  highContrast: false,
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeAccessibility(value: Record<string, unknown> | undefined): ArcanaAccessibility {
  return {
    reducedEffects: Boolean(value?.reducedEffects),
    largerText: Boolean(value?.largerText),
    highContrast: Boolean(value?.highContrast),
  };
}

function applyAccessibility(value: ArcanaAccessibility) {
  const root = document.documentElement;
  root.dataset.arcanaReducedEffects = String(value.reducedEffects);
  root.dataset.arcanaLargerText = String(value.largerText);
  root.dataset.arcanaHighContrast = String(value.highContrast);
  try {
    localStorage.setItem("arcana-squad-accessibility", JSON.stringify(value));
  } catch {
    // Local persistence is optional; authenticated server persistence remains authoritative.
  }
}

function PlayerGrimoire() {
  const [state, setState] = useState<GrimoireState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<ArcanaAccessibility>(DEFAULT_ACCESSIBILITY);
  const [deckIds, setDeckIds] = useState<string[]>([]);

  useEffect(() => {
    let live = true;
    void getGrimoire()
      .then((next) => {
        if (!live) return;
        setState(next);
        setDeckIds([...next.deck].sort((a, b) => a.slot - b.slot).map((entry) => entry.card_id));
        const saved = normalizeAccessibility(next.profile.accessibility);
        setPrefs(saved);
        applyAccessibility(saved);
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

  const discoveredCards = useMemo(
    () => (state?.unlockedCards ?? []).map((id) => ARCANA_BY_ID[id]).filter(Boolean),
    [state],
  );

  const today = localDateKey();
  const alreadyDrewToday = state?.profile.daily_draw_date === today;

  const drawDailyCard = async () => {
    if (!state || alreadyDrewToday || busy) return;
    setBusy("daily");
    setError(null);
    const card = ARCANA_DECK[Math.floor(Math.random() * ARCANA_DECK.length)]!;
    try {
      await saveDailyDraw({ data: { cardId: card.id, date: today } });
      await unlockArcanaCard({ data: { cardId: card.id } });
      try {
        localStorage.setItem("arcana-squad-daily-draw", JSON.stringify({ date: today, cardId: card.id }));
      } catch {
        // The account save already succeeded; local storage only helps the next run start instantly.
      }
      setState((current) =>
        current
          ? {
              ...current,
              profile: {
                ...current.profile,
                daily_draw_date: today,
                daily_draw_card_id: card.id,
              },
              unlockedCards: current.unlockedCards.includes(card.id)
                ? current.unlockedCards
                : [...current.unlockedCards, card.id],
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "The Daily Draw could not be saved.");
    } finally {
      setBusy(null);
    }
  };

  const toggleDeckCard = (cardId: string) => {
    setDeckIds((current) => {
      if (current.includes(cardId)) return current.filter((id) => id !== cardId);
      if (current.length >= 12) return current;
      return [...current, cardId];
    });
  };

  const persistDeck = async () => {
    if (!state || busy) return;
    setBusy("deck");
    setError(null);
    try {
      await saveDeck({ data: { cardIds: deckIds } });
      setState((current) =>
        current
          ? {
              ...current,
              deck: deckIds.map((cardId, index) => ({ slot: index + 1, card_id: cardId })),
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "The deck could not be saved.");
    } finally {
      setBusy(null);
    }
  };

  const togglePreference = async (key: keyof ArcanaAccessibility) => {
    if (busy) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    applyAccessibility(next);
    setBusy(`accessibility-${key}`);
    try {
      await saveAccessibilityPreferences({ data: next });
      setState((current) =>
        current
          ? {
              ...current,
              profile: { ...current.profile, accessibility: next },
            }
          : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Accessibility preferences could not be saved.");
    } finally {
      setBusy(null);
    }
  };

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
            <p className="font-display text-gold">Grimoire notice</p>
            <p className="mt-2">{error}</p>
            {!state && (
              <Link to="/login" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-gold px-3 py-2 font-display text-xs text-void">
                Sign in
              </Link>
            )}
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
                    const pct = Math.min(100, Math.round((xp / 1500) * 100));
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
                        <p className="mt-2 text-xs text-faint">{xp.toLocaleString()} XP · Digivolve at 1,500</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-4">
                <section className="arcana-card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-xs tracking-[0.22em] text-gold">DECK & COLLECTION</p>
                      <p className="mt-1 text-xs text-muted">{state.unlockedCards.length} discovered · {deckIds.length}/12 equipped</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void persistDeck()}
                      disabled={busy === "deck"}
                      className="min-h-11 rounded-lg bg-gold px-3 py-2 font-display text-xs text-void disabled:opacity-50"
                    >
                      {busy === "deck" ? "Saving…" : "Save deck"}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 12 }, (_, index) => {
                      const id = deckIds[index];
                      const card = id ? ARCANA_BY_ID[id] : undefined;
                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={!id}
                          onClick={() => id && toggleDeckCard(id)}
                          className="min-h-20 rounded-lg border border-line bg-raised p-2 text-left text-xs disabled:cursor-default"
                          aria-label={id ? `Remove ${card?.name ?? id} from deck` : `Empty deck slot ${index + 1}`}
                        >
                          <span className="text-faint">{index + 1}</span>
                          <p className="mt-2 leading-4 text-parchment">{card?.name ?? "Empty"}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-line bg-panel p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Discovered cards</p>
                    {discoveredCards.length ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {discoveredCards.map((card) => {
                          const selected = deckIds.includes(card.id);
                          return (
                            <button
                              key={card.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => toggleDeckCard(card.id)}
                              className={`min-h-11 rounded-lg border px-3 py-2 text-left text-xs ${selected ? "border-gold bg-raised text-gold" : "border-line text-parchment"}`}
                            >
                              {card.name}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted">Complete a Daily Draw or start a run to discover your first Arcana card.</p>
                    )}
                  </div>

                  <Link to="/cards" className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-line px-3 py-2 text-sm text-parchment">
                    Open Card Archive
                  </Link>
                </section>

                <section className="arcana-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
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
                    </div>
                    <button
                      type="button"
                      onClick={() => void drawDailyCard()}
                      disabled={alreadyDrewToday || busy === "daily"}
                      className="min-h-11 shrink-0 rounded-lg bg-gold px-3 py-2 font-display text-xs text-void disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {alreadyDrewToday ? "Drawn today" : busy === "daily" ? "Drawing…" : "Draw card"}
                    </button>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-faint">
                    Today’s card is also offered to the next run as its opening Arcana modifier.
                  </p>
                </section>

                <section className="arcana-card p-5">
                  <p className="font-display text-xs tracking-[0.22em] text-gold">QUESTS & ACHIEVEMENTS</p>
                  <p className="mt-3 text-sm text-muted">Active quest: {state.profile.active_quest ?? "None"}</p>
                  <p className="mt-1 text-sm text-muted">Achievements: {state.achievements.length}</p>
                  {state.achievements.length > 0 && (
                    <ul className="mt-3 grid gap-1 text-xs text-faint">
                      {state.achievements.map((achievement) => <li key={achievement}>• {achievement}</li>)}
                    </ul>
                  )}
                </section>

                <section className="arcana-card p-5">
                  <p className="font-display text-xs tracking-[0.22em] text-gold">ACCESSIBILITY</p>
                  <div className="mt-4 grid gap-2">
                    {([
                      ["reducedEffects", "Reduced effects", "Reduce shake and companion motion."],
                      ["largerText", "Larger text", "Increase interface text sizing across the website."],
                      ["highContrast", "Higher contrast", "Brighten muted text and interface boundaries."],
                    ] as const).map(([key, label, description]) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={prefs[key]}
                        onClick={() => void togglePreference(key)}
                        className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-line bg-panel px-4 py-3 text-left"
                      >
                        <span>
                          <span className="block text-sm font-semibold text-parchment">{label}</span>
                          <span className="mt-1 block text-xs text-muted">{description}</span>
                        </span>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${prefs[key] ? "bg-gold text-void" : "bg-raised text-muted"}`}>
                          {prefs[key] ? "On" : "Off"}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Link to="/play" className="inline-flex min-h-11 items-center rounded-xl bg-gold px-5 py-3 font-display text-sm text-void">Continue to Play</Link>
            </div>
          </>
        )}
      </section>
    </ArcanaSiteShell>
  );
}
