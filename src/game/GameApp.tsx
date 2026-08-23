import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pause, Play, Trophy, ChevronLeft } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getTopScores, submitScore, type ScoreRow } from "@/lib/scores";
import { PLAYABLE_HEROES, HERO_BY_ID } from "./heroes";
import { POWERS } from "./powerups";
import { Codex } from "./Codex";
import type { HeroId, HudSnap, PowerId } from "./types";
import type { ArcanaGame } from "./engine";

type Screen = "title" | "select" | "how" | "scores" | "play" | "book";

type Floaty = { id: number; text: string; color: string; x: number; y: number };

const LOCAL_SCORES = "arcana-squad-scores-v1";
const STICK_R = 56;

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<ArcanaGame | null>(null);
  const { user, isPending } = useCurrentUserState();

  const [screen, setScreen] = useState<Screen>("title");
  const [hero, setHero] = useState<HeroId>("fool");
  const [hud, setHud] = useState<HudSnap | null>(null);
  const [paused, setPaused] = useState(false);
  const [picks, setPicks] = useState<PowerId[] | null>(null);
  const [over, setOver] = useState<{ score: number; rooms: number; heroId: HeroId; coins: number; won?: boolean } | null>(null);
  const [muted, setMuted] = useState(false);
  const [floats, setFloats] = useState<Floaty[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [booting, setBooting] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const floatId = useRef(0);

  const loadScores = useCallback(() => {
    void getTopScores()
      .then(setScores)
      .catch(() => {
        try {
          const raw = localStorage.getItem(LOCAL_SCORES);
          if (raw) setScores(JSON.parse(raw) as ScoreRow[]);
        } catch {
          /* ignore */
        }
      });
  }, []);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  const killGame = useCallback(() => {
    gameRef.current?.dispose();
    gameRef.current = null;
  }, []);

  const startRun = useCallback(
    async (id: HeroId) => {
      killGame();
      setHero(id);
      setOver(null);
      setPicks(null);
      setPaused(false);
      setSubmitted(false);
      setHud(null);
      setBootError(null);
      setBooting(true);
      setScreen("play");
      try {
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas missing");
        const { ArcanaGame } = await import("./engine");
        const game = new ArcanaGame(canvas, {
          onHud: setHud,
          onPick: (choices) => setPicks(choices),
          onOver: (stats) => setOver(stats),
          onFloat: (text, color, x, y) => {
            const fid = ++floatId.current;
            setFloats((f) => [...f.slice(-18), { id: fid, text, color, x, y }]);
            window.setTimeout(() => setFloats((f) => f.filter((n) => n.id !== fid)), 700);
          },
        });
        gameRef.current = game;
        game.audio.unlock();
        const timeout = new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("The temple took too long to open. Try again.")), 15000);
        });
        await Promise.race([game.boot(id), timeout]);
        if (gameRef.current !== game) {
          game.dispose();
          return;
        }
        setBooting(false);
      } catch (err) {
        killGame();
        setBooting(false);
        setBootError(err instanceof Error ? err.message : "Could not open the circle");
      }
    },
    [killGame],
  );

  useEffect(() => () => killGame(), [killGame]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape" || e.code === "KeyP") {
        if (screen !== "play" || over || picks) return;
        setPaused((p) => {
          const n = !p;
          gameRef.current?.setPaused(n);
          return n;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, over, picks]);

  useEffect(() => {
    if (screen !== "play") return;
    const block = (e: TouchEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("button, a, input")) return;
      e.preventDefault();
    };
    const blockMenu = (e: Event) => e.preventDefault();
    document.addEventListener("touchmove", block, { passive: false });
    document.addEventListener("gesturestart", blockMenu);
    document.addEventListener("contextmenu", blockMenu);
    return () => {
      document.removeEventListener("touchmove", block);
      document.removeEventListener("gesturestart", blockMenu);
      document.removeEventListener("contextmenu", blockMenu);
    };
  }, [screen]);

  const onPick = (id: PowerId) => {
    gameRef.current?.pickPower(id);
    setPicks(null);
  };

  const togglePause = () => {
    if (picks || over) return;
    setPaused((p) => {
      const n = !p;
      gameRef.current?.setPaused(n);
      return n;
    });
  };

  const quitToTitle = () => {
    killGame();
    setPaused(false);
    setPicks(null);
    setOver(null);
    setScreen("title");
    loadScores();
  };

  const saveScore = async () => {
    if (!over || submitted) return;
    const name = user?.displayName || user?.primaryEmail || "Wanderer";
    const row = {
      displayName: name,
      score: over.score,
      rooms: over.rooms,
      heroId: over.heroId,
    };
    try {
      await submitScore({ data: row });
    } catch {
      /* still keep local */
    }
    try {
      const raw = localStorage.getItem(LOCAL_SCORES);
      const list: ScoreRow[] = raw ? (JSON.parse(raw) as ScoreRow[]) : [];
      list.unshift({
        id: Date.now(),
        display_name: name,
        score: over.score,
        rooms: over.rooms,
        hero_id: over.heroId,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem(LOCAL_SCORES, JSON.stringify(list.slice(0, 20)));
    } catch {
      /* ignore */
    }
    setSubmitted(true);
    loadScores();
  };

  const setMove = useCallback((x: number, y: number) => {
    gameRef.current?.input.setStick(x, y);
  }, []);

  const playing = screen === "play";
  const heroDef = HERO_BY_ID[hero];
  const touchPlay = playing && !over && !picks && !paused && !booting;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-void text-parchment">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full touch-none ${playing ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {floats.map((f) => (
        <span
          key={f.id}
          className="pointer-events-none absolute z-20 -translate-x-1/2 font-display text-sm font-semibold tabular-nums"
          style={{
            left: f.x,
            top: f.y,
            color: f.color,
            animation: "arcana-float 700ms ease-out forwards",
          }}
        >
          {f.text}
        </span>
      ))}

      {touchPlay && (
        <FollowStick
          onVec={setMove}
          onStart={() => gameRef.current?.audio.unlock()}
        />
      )}

      {playing && hud && !over && (
        <Hud hud={hud} paused={paused} onPause={togglePause} stacks={hud.stacks} />
      )}

      {booting && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-void/70 px-6 text-center font-display tracking-[0.3em] text-gold">
          OPENING THE CIRCLE
        </div>
      )}

      {bootError && !booting && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-void/85 px-6 text-center">
          <div className="max-w-sm">
            <p className="font-display tracking-[0.28em] text-gold">THE CIRCLE STUCK</p>
            <p className="mt-3 text-sm text-muted">{bootError}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Btn onClick={() => void startRun(hero)}>Try again</Btn>
              <Btn dim onClick={() => { setBootError(null); setScreen("select"); }}>
                Choose another path
              </Btn>
            </div>
          </div>
        </div>
      )}

      {picks && <PowerPick choices={picks} onPick={onPick} />}

      {paused && !picks && !over && (
        <Modal>
          <h2 className="font-display text-3xl text-gold">Paused</h2>
          {hud && (
            <div className="mt-4 space-y-3 text-left">
              <div className="rounded-lg border border-line bg-ink/50 p-3">
                <p className="text-[10px] tracking-[0.28em] text-gold-dim">YOUR PATH</p>
                <p className="mt-1 font-display text-lg text-gold">{hud.abilityName || HERO_BY_ID[hud.heroId].name}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{hud.abilityBlurb}</p>
              </div>
              <div
                className="rounded-lg border bg-ink/50 p-3"
                style={{ borderColor: hud.minorCss }}
              >
                <p className="text-[10px] tracking-[0.28em]" style={{ color: hud.minorCss }}>
                  {hud.minorTitle} · {hud.resonance}
                </p>
                <p className="mt-1 font-display text-lg text-parchment">{hud.minorSkill}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{hud.minorSkillBlurb}</p>
                <p className="mt-2 text-xs text-faint">{hud.minorBlurb}</p>
                <p className="mt-2 text-[11px] tabular-nums" style={{ color: hud.minorCss }}>
                  {hud.minorCd <= 0.05
                    ? "Ready"
                    : `Cooldown ${hud.minorCd.toFixed(1)}s / ${hud.minorCdMax.toFixed(1)}s`}
                  {" · "}
                  Pips {Math.floor(hud.pips)}/{hud.pipsMax}
                </p>
              </div>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-2">
            <Btn onClick={togglePause}>Resume</Btn>
            <Btn
              dim
              onClick={() => {
                const m = gameRef.current?.audio.toggleMute() ?? false;
                setMuted(m);
              }}
            >
              {muted ? "Unmute" : "Mute"}
            </Btn>
            <Btn dim onClick={quitToTitle}>
              Abandon run
            </Btn>
          </div>
        </Modal>
      )}

      {over && (
        <Modal>
          <p className="font-display text-[11px] tracking-[0.4em] text-gold-dim">
            {over.won ? "THE CIRCLE IS WHOLE" : "THE CIRCLE CLOSES"}
          </p>
          <h2 className="mt-1 font-display text-3xl text-gold">{over.won ? "Ascended" : "Fallen"}</h2>
          {over.won && (
            <img src="/art/squad.png" alt="Endgame squad" className="mx-auto mt-3 h-40 w-40 object-contain sm:h-52 sm:w-52" />
          )}
          <p className="mt-3 text-sm text-muted">
            {HERO_BY_ID[over.heroId].name} {over.won ? "completed" : "reached"} room {over.rooms}
          </p>
          <p className="mt-4 font-display text-4xl tabular-nums text-parchment">{over.score.toLocaleString()}</p>
          <p className="text-xs text-faint">{over.coins} gold recovered</p>
          <div className="mt-6 flex flex-col gap-2">
            {!submitted ? (
              <Btn onClick={() => void saveScore()}>Save to high scores</Btn>
            ) : (
              <p className="text-center text-sm text-gold">Recorded in the circle.</p>
            )}
            <Btn onClick={() => void startRun(over.heroId)}>Run again</Btn>
            <Btn
              dim
              onClick={() => {
                killGame();
                setOver(null);
                setScreen("select");
              }}
            >
              Another path
            </Btn>
            <Btn dim onClick={quitToTitle}>
              Title
            </Btn>
          </div>
        </Modal>
      )}

      {screen === "title" && (
        <Title
          onPlay={() => setScreen("select")}
          onHow={() => setScreen("how")}
          onScores={() => {
            loadScores();
            setScreen("scores");
          }}
          onBook={() => setScreen("book")}
          isPending={isPending}
        />
      )}

      {screen === "select" && (
        <Select
          selected={hero}
          onSelect={setHero}
          onBack={() => setScreen("title")}
          onStart={() => void startRun(hero)}
          onBook={() => setScreen("book")}
        />
      )}

      {screen === "how" && <HowTo onBack={() => setScreen("title")} />}
      {screen === "scores" && <Scores scores={scores} onBack={() => setScreen("title")} />}
      {screen === "book" && (
        <Codex
          selected={hero}
          onSelect={setHero}
          onBack={() => setScreen("title")}
          onWalk={() => void startRun(hero)}
        />
      )}

      <style>{`
        @keyframes arcana-float {
          from { opacity: 1; transform: translate(-50%, 0); }
          to { opacity: 0; transform: translate(-50%, -28px); }
        }
      `}</style>
      <span className="hidden">{heroDef.name}</span>
    </div>
  );
}

function FollowStick({
  onVec,
  onStart,
}: {
  onVec: (x: number, y: number) => void;
  onStart: () => void;
}) {
  const origin = useRef<{ x: number; y: number } | null>(null);
  const pid = useRef<number | null>(null);
  const [viz, setViz] = useState<{ ox: number; oy: number; kx: number; ky: number } | null>(null);

  const local = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pid.current != null) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    pid.current = e.pointerId;
    const p = local(e);
    origin.current = p;
    setViz({ ox: p.x, oy: p.y, kx: 0, ky: 0 });
    onVec(0, 0);
    onStart();
  };

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pid.current !== e.pointerId || !origin.current) return;
    e.preventDefault();
    const p = local(e);
    let dx = p.x - origin.current.x;
    let dy = p.y - origin.current.y;
    const len = Math.hypot(dx, dy);
    if (len > STICK_R) {
      dx = (dx / len) * STICK_R;
      dy = (dy / len) * STICK_R;
    }
    onVec(dx / STICK_R, -dy / STICK_R);
    setViz({ ox: origin.current.x, oy: origin.current.y, kx: dx, ky: dy });
  };

  const up = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pid.current !== e.pointerId) return;
    pid.current = null;
    origin.current = null;
    setViz(null);
    onVec(0, 0);
  };

  return (
    <div
      className="absolute inset-0 z-10 touch-none"
      style={{ touchAction: "none" }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      aria-label="Move"
    >
      {!viz && (
        <div
          className="pointer-events-none absolute size-28 rounded-full border-2 border-gold/25 bg-ink/35 landscape:size-24"
          style={{
            left: "max(1.25rem, env(safe-area-inset-left))",
            bottom: "max(5.5rem, calc(env(safe-area-inset-bottom) + 4.5rem))",
          }}
        >
          <div className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/35" />
        </div>
      )}
      {viz && (
        <div
          className="pointer-events-none absolute size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold/55 bg-ink/45"
          style={{ left: viz.ox, top: viz.oy }}
        >
          <div
            className="absolute size-11 rounded-full border border-gold bg-gold/90 shadow-md"
            style={{
              left: `calc(50% + ${viz.kx}px - 22px)`,
              top: `calc(50% + ${viz.ky}px - 22px)`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function Title({
  onPlay,
  onHow,
  onScores,
  onBook,
  isPending,
}: {
  onPlay: () => void;
  onHow: () => void;
  onScores: () => void;
  onBook: () => void;
  isPending: boolean;
}) {
  return (
    <div className="absolute inset-0 z-10 overflow-y-auto overscroll-contain">
      <img src="/art/key.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/25 via-void/35 to-void/90" />
      <div
        className="relative flex min-h-full flex-col items-center justify-between px-5"
        style={{
          paddingTop: "max(1.5rem, env(safe-area-inset-top))",
          paddingBottom: "max(5.5rem, calc(env(safe-area-inset-bottom) + 4rem))",
        }}
      >
        <header className="flex w-full max-w-5xl items-center justify-between gap-3">
          <p className="font-display text-[11px] tracking-[0.38em] text-gold">ARCANA SQUAD</p>
          <AuthChip pending={isPending} />
        </header>
        <div className="my-8 w-full max-w-xl text-center">
          <h1 className="font-display text-4xl font-semibold tracking-wide text-gold sm:text-6xl">
            Arcana Squad
          </h1>
          <p className="mt-3 font-display text-xs tracking-[0.18em] text-parchment/80 sm:text-sm sm:tracking-[0.22em]">
            SIX PATHS. ONE CIRCLE. TWENTY-TWO BOSSES FROM 0 TO XXI.
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
            Choose one of the six. Walk the story. Each room is a Major Arcana you have to put down.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-sm flex-col items-stretch gap-2.5">
            <Btn onClick={onPlay} wide>
              Enter the temple
            </Btn>
            <div className="flex gap-2">
              <Btn dim onClick={onHow} className="min-w-0 flex-1">
                How to play
              </Btn>
              <Btn dim onClick={onScores} className="min-w-0 flex-1">
                High scores
              </Btn>
            </div>
            <Btn dim onClick={onBook} wide className="border-gold/40">
              Character book
            </Btn>
          </div>
        </div>
        <p className="text-center text-[11px] tracking-wide text-faint">
          Drag anywhere to move · auto-aim · pause top-left
        </p>
      </div>
    </div>
  );
}

function Select({
  selected,
  onSelect,
  onBack,
  onStart,
  onBook,
}: {
  selected: HeroId;
  onSelect: (id: HeroId) => void;
  onBack: () => void;
  onStart: () => void;
  onBook: () => void;
}) {
  const h = HERO_BY_ID[selected] ?? PLAYABLE_HEROES[0]!;

  return (
    <div className="absolute inset-0 z-10 flex flex-col overflow-hidden bg-void">
      <img src="/art/key.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15" />
      <div className="absolute inset-0 bg-void/80" />
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 sm:px-4"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="mx-auto w-full max-w-5xl pb-3">
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-11 items-center gap-1 self-start pr-4 text-sm text-muted"
          >
            <ChevronLeft className="size-4" /> Back
          </button>
          <h2 className="mt-1 font-display text-2xl text-gold sm:text-3xl landscape:mt-0 landscape:text-xl">
            Choose a path
          </h2>
          <p className="mt-2 text-xs text-muted sm:text-sm">
            Six playable. The rest of the Major Arcana wait as story bosses.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3">
            {PLAYABLE_HEROES.map((hero) => (
              <HeroCard key={hero.id} hero={hero} on={hero.id === selected} onSelect={onSelect} />
            ))}
          </div>
        </div>
      </div>
      <div
        className="relative z-10 border-t border-line bg-panel/95 px-4 pt-3 landscape:pt-2"
        style={{ paddingBottom: "max(1rem, calc(env(safe-area-inset-bottom) + 0.75rem))" }}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img src={h.portrait} alt="" className="h-16 w-11 shrink-0 rounded-sm object-contain ring-1 ring-gold/40 sm:h-20 sm:w-14" />
            <div className="min-w-0">
              <p className="font-display text-[10px] tracking-[0.28em] text-gold-dim">{h.title}</p>
              <p className="font-display text-lg text-gold">{h.name}</p>
              {h.ability && (
                <p className="truncate font-display text-xs tracking-wide text-gold">
                  {h.ability}
                  <span className="ml-1 font-sans font-normal text-muted">— {h.abilityBlurb}</span>
                </p>
              )}
              <p className="truncate text-xs text-muted">
                {h.animal} · {h.element} · {h.passive}
              </p>
            </div>
          </div>
          <Btn dim onClick={onBook} className="sm:w-auto">
            Sheet
          </Btn>
          <Btn onClick={onStart} wide className="sm:w-auto sm:min-w-56">
            Walk as {h.name}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function HeroCard({
  hero,
  on,
  onSelect,
}: {
  hero: (typeof PLAYABLE_HEROES)[number];
  on: boolean;
  onSelect: (id: HeroId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(hero.id)}
      className={`arcana-card w-full text-left ${on ? "ring-2 ring-gold border-gold" : ""}`}
    >
      <div className="relative aspect-[2/3] bg-black">
        <div className="absolute inset-[3px] overflow-hidden rounded-[4px] bg-[#07060c]">
          <img src={hero.portrait} alt="" className="h-full w-full object-contain object-center" />
        </div>
      </div>
      <div className="flex h-12 flex-col justify-center border-t border-gold/35 bg-ink px-1.5">
        <p className="truncate font-display text-[10px] tracking-[0.16em] text-gold sm:text-[11px]">
          {hero.roman} · {hero.name}
        </p>
        <p className="truncate text-[9px] tracking-wide text-muted">{hero.ability ?? hero.element}</p>
      </div>
    </button>
  );
}

function HowTo({ onBack }: { onBack: () => void }) {
  return (
    <Modal>
      <h2 className="font-display text-3xl text-gold">How to play</h2>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
        <li>Drag anywhere on the dungeon to move. You always auto-fire at the nearest foe.</li>
        <li>Six playable: The Fool, Swords, Pentacles, Wands, Cups, The World.</li>
        <li>Each Major Arcana boss fights with a unique pattern from their card. Learn the telegraph, then punish.</li>
        <li>Open Character book for orthographic sheets: book HD vs in-game mesh, ability cast times, prop callouts.</li>
        <li>Pick a blessing. Three lives. Beat The World to finish the circle.</li>
      </ul>
      <Btn onClick={onBack} className="mt-6" wide>
        Understood
      </Btn>
    </Modal>
  );
}

function Scores({ scores, onBack }: { scores: ScoreRow[]; onBack: () => void }) {
  return (
    <div className="absolute inset-0 z-10 overflow-y-auto overscroll-contain bg-void">
      <div
        className="mx-auto max-w-lg px-4"
        style={{
          paddingTop: "max(1.5rem, env(safe-area-inset-top))",
          paddingBottom: "max(5rem, env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-11 items-center gap-1 text-sm text-muted hover:text-gold"
        >
          <ChevronLeft className="size-4" /> Back
        </button>
        <h2 className="mt-4 flex items-center gap-2 font-display text-3xl text-gold">
          <Trophy className="size-6" /> High scores
        </h2>
        <ol className="mt-5 divide-y divide-line rounded-xl border border-line bg-panel">
          {scores.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted">No names in the circle yet.</li>
          )}
          {scores.map((s, i) => (
            <li key={s.id} className="flex min-h-12 items-center gap-3 px-4 py-3">
              <span className="w-6 font-display text-gold-dim tabular-nums">{i + 1}</span>
              <span className="flex-1 truncate text-sm">{s.display_name}</span>
              <span className="hidden text-xs text-faint sm:inline">
                {HERO_BY_ID[s.hero_id as HeroId]?.name ?? s.hero_id}
              </span>
              <span className="font-display tabular-nums text-gold">{s.score.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Hud({
  hud,
  paused,
  onPause,
  stacks,
}: {
  hud: HudSnap;
  paused: boolean;
  onPause: () => void;
  stacks: HudSnap["stacks"];
}) {
  const mm = String(Math.floor(hud.elapsed / 60)).padStart(2, "0");
  const ss = String(Math.floor(hud.elapsed % 60)).padStart(2, "0");
  const hpPct = Math.max(0, hud.hp / hud.maxHp);
  const ids = Object.entries(stacks).filter(([, n]) => (n ?? 0) > 0) as [PowerId, number][];
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-20"
      style={{
        paddingTop: "max(0.6rem, env(safe-area-inset-top))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onPause}
          className="pointer-events-auto grid size-12 place-items-center rounded-md border border-line bg-ink/80 text-parchment"
          aria-label={paused ? "Resume" : "Pause"}
        >
          {paused ? <Play className="size-5" /> : <Pause className="size-5" />}
        </button>
        <div className="text-center">
          <p className="font-display text-xl tabular-nums tracking-widest text-parchment sm:text-2xl">
            {mm}:{ss}
          </p>
          <p className="text-[11px] tracking-[0.18em] text-gold">
            {hud.bossName
              ? `${hud.bossName}${hud.bossMove ? ` · ${hud.bossMove}` : ""}`
              : hud.minorTitle}
          </p>
          {!hud.bossName && (
            <p className="text-[9px] tracking-[0.14em] text-muted">
              Room {hud.room} / 22 · {hud.waitBoss} waits · {hud.kills}/{hud.quota}
            </p>
          )}
        </div>
        <div className="min-w-14 text-right font-display text-sm tabular-nums">
          <p className="text-gold">{hud.coins} G</p>
          <p className="text-parchment">{hud.score.toLocaleString()}</p>
        </div>
      </div>
      <div className="mx-auto mt-2 max-w-md">
        <div className="flex items-center gap-2">
          <div className="h-3.5 flex-1 overflow-hidden rounded-full border border-line bg-ink">
            <div className="h-full bg-hp" style={{ width: `${hpPct * 100}%` }} />
          </div>
          {hud.shield > 0 && (
            <div className="h-3.5 w-14 overflow-hidden rounded-full border border-line bg-ink sm:w-16">
              <div
                className="h-full bg-shield"
                style={{ width: `${(hud.shield / Math.max(1, hud.shieldMax)) * 100}%` }}
              />
            </div>
          )}
          <span className="text-xs tabular-nums text-muted">×{hud.lives}</span>
        </div>
        {hud.bossMax > 0 ? (
          <div className="mt-1 h-2 overflow-hidden rounded-full border border-line bg-ink">
            <div className="h-full bg-gold" style={{ width: `${(hud.bossHp / hud.bossMax) * 100}%` }} />
          </div>
        ) : (
          <div className="mt-1 h-2 overflow-hidden rounded-full border border-line bg-ink">
            <div
              className="h-full bg-gold/80"
              style={{ width: `${Math.min(100, (hud.kills / Math.max(1, hud.quota)) * 100)}%` }}
            />
          </div>
        )}
        {hud.abilityName && (
          <div className="mt-1 flex items-center gap-2">
            <span className="w-[5.5rem] shrink-0 truncate text-[9px] tracking-[0.14em] text-gold-dim">
              {hud.abilityName}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full border border-line bg-ink">
              <div className="h-full bg-parchment/90" style={{ width: `${hud.abilityPct * 100}%` }} />
            </div>
          </div>
        )}
        {ids.length > 0 && (
          <div className="mt-2 flex max-h-12 flex-wrap gap-1 overflow-hidden">
            {ids.map(([id, n]) => (
              <span
                key={id}
                className="rounded-sm border border-line bg-ink/80 px-1.5 py-0.5 text-[10px] tracking-wide text-gold"
              >
                {POWERS[id].name} {n > 1 ? `×${n}` : ""}
              </span>
            ))}
          </div>
        )}
      </div>
      <div
        className="mt-2 max-w-[11.5rem] rounded-md border bg-ink/85 p-2 shadow-lg"
        style={{ borderColor: hud.minorCss }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[9px] tracking-[0.2em]" style={{ color: hud.minorCss }}>
              {hud.minorTitle}
            </p>
            <p className="font-display text-sm leading-tight text-parchment">{hud.minorSkill}</p>
          </div>
          <span className="shrink-0 font-display text-xs tabular-nums" style={{ color: hud.minorCss }}>
            {hud.minorCd <= 0.08 ? "RDY" : `${hud.minorCd.toFixed(1)}s`}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full border border-line bg-void">
          <div
            className="h-full"
            style={{
              width: `${Math.min(100, (1 - hud.minorCd / Math.max(0.01, hud.minorCdMax)) * 100)}%`,
              background: hud.minorCss,
            }}
          />
        </div>
        <div className="mt-1 flex gap-0.5">
          {Array.from({ length: Math.min(10, hud.pipsMax) }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-sm"
              style={{
                background: i < hud.pips ? hud.minorCss : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PowerPick({ choices, onPick }: { choices: PowerId[]; onPick: (id: PowerId) => void }) {
  return (
    <div
      className="absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-void/75 p-4"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="w-full max-w-3xl">
        <p className="text-center font-display text-[11px] tracking-[0.28em] text-gold sm:tracking-[0.4em]">
          ROOM CLEARED — CHOOSE A BLESSING
        </p>
        <div className="mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3">
          {choices.map((id) => {
            const p = POWERS[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onPick(id)}
                className="min-h-20 rounded-xl border border-line bg-panel p-4 text-left active:border-gold sm:min-h-28 sm:p-5"
              >
                <p className="font-display text-lg text-gold">{p.name}</p>
                <p className="mt-1 text-sm text-muted">{p.blurb}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 z-30 grid place-items-center overflow-y-auto bg-void/75 p-4"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="w-full max-w-sm rounded-xl border border-line bg-panel p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:p-7">
        {children}
      </div>
    </div>
  );
}

function Btn({
  children,
  onClick,
  dim,
  wide,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  dim?: boolean;
  wide?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${wide ? "w-full" : "min-w-40"} h-14 min-h-12 rounded-md px-5 font-display text-sm tracking-wide sm:h-12 ${
        dim
          ? "border border-line bg-raised text-parchment active:border-gold-dim"
          : "bg-gold text-ink active:bg-parchment"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function AuthChip({ pending }: { pending: boolean }) {
  if (pending) return <div className="h-11 w-24 animate-pulse rounded-full bg-raised" />;
  return (
    <div className="pointer-events-auto flex min-h-11 items-center text-sm">
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <Link
          to="/login"
          className="flex min-h-11 items-center px-2 text-muted underline-offset-4 hover:text-gold hover:underline"
        >
          Sign in
        </Link>
      </SignedOut>
    </div>
  );
}
