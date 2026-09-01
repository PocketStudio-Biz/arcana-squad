import { ChevronLeft } from "lucide-react";
import { HERO_BY_ID, PLAYABLE_HEROES } from "./heroes";
import type { HeroId } from "./types";

type Diagram = "fan" | "dual" | "nova" | "ring" | "tide" | "orbit";

type Sheet = {
  hd: string;
  sprite: string;
  bust: string;
  diagram: Diagram;
  materials: string[];
  prop: string;
};

export const CODEX: Partial<Record<HeroId, Sheet>> = {
  fool: {
    hd: "/cards/fool-book.jpg",
    sprite: "/cards/fool-sprite.png",
    bust: "/cards/fool-bust.jpg",
    diagram: "fan",
    materials: ["violet robe", "gold filigree", "otter fur", "astral crystal"],
    prop: "Star Wand + Astral Orbs",
  },
  swords: {
    hd: "/cards/swords-book.jpg",
    sprite: "/cards/swords-sprite.png",
    bust: "/cards/swords-bust.jpg",
    diagram: "dual",
    materials: ["blue mantle", "air-steel", "feline fur", "wind crests"],
    prop: "Twin Windblades",
  },
  pentacles: {
    hd: "/cards/pentacles-book.jpg",
    sprite: "/cards/pentacles-sprite.png",
    bust: "/cards/pentacles-bust.jpg",
    diagram: "nova",
    materials: ["green earth silk", "minted gold", "rabbit fur", "pentacle disc"],
    prop: "Pentacle Disc",
  },
  wands: {
    hd: "/cards/wands-book.jpg",
    sprite: "/cards/wands-sprite.png",
    bust: "/cards/wands-bust.jpg",
    diagram: "ring",
    materials: ["raven feather", "ember wood", "brass", "living flame"],
    prop: "Burning Staff + Flame Spirit",
  },
  cups: {
    hd: "/cards/cups-book.jpg",
    sprite: "/cards/cups-sprite.png",
    bust: "/cards/cups-bust.jpg",
    diagram: "tide",
    materials: ["teal tide silk", "gold", "turtle shell", "water gem"],
    prop: "Gem Cup",
  },
  world: {
    hd: "/cards/world-book.jpg",
    sprite: "/cards/world-sprite.png",
    bust: "/cards/world-bust.jpg",
    diagram: "orbit",
    materials: ["white cosmic scale", "gold", "green dragon wing", "world orbs"],
    prop: "Twin-Orb Staff",
  },
};

export function Codex({
  selected,
  onSelect,
  onBack,
  onWalk,
}: {
  selected: HeroId;
  onSelect: (id: HeroId) => void;
  onBack: () => void;
  onWalk: () => void;
}) {
  const hero = HERO_BY_ID[selected];
  const sheet = CODEX[selected] ?? CODEX.fool!;

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto overscroll-contain bg-[#d8dde4]">
      <div
        className="mx-auto max-w-6xl px-3 pb-28 sm:px-5"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-11 items-center gap-1 text-sm text-[#4a5568]"
        >
          <ChevronLeft className="size-4" /> Back
        </button>
        <p className="mt-1 text-[11px] tracking-[0.28em] text-[#6b7280]">POLYFORGE BOOK · ARCANA SQUAD</p>
        <h2 className="font-display text-2xl text-[#1f2937] sm:text-3xl">3D Asset Sheets</h2>
        <p className="mt-1 max-w-2xl text-sm text-[#4b5563]">
          Orthographic study. High-definition book art beside the low-definition in-game mesh. Ability callouts with cast time.
        </p>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {PLAYABLE_HEROES.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => onSelect(h.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs tracking-wide ${
                h.id === selected ? "border-[#c9a227] bg-[#c9a227] text-[#1a1408]" : "border-[#c5ccd6] bg-white text-[#374151]"
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <SheetCard title={`Character Sheet: ${hero.title}`}>
            <div className="relative overflow-hidden rounded-md bg-[#cfd6df] p-2">
              <div className="pointer-events-none absolute bottom-2 left-2 top-2 w-4 bg-[repeating-linear-gradient(to_top,#9aa3b0_0_1px,transparent_1px_8px)] opacity-50" />
              <p className="mb-1 text-center text-[9px] tracking-[0.3em] text-[#6b7280]">FRONT · IN-GAME · BOOK</p>
              <div className="grid grid-cols-3 items-end gap-2 pl-5">
                <Fig className="h-36 sm:h-44" src={hero.portrait} label="Front" />
                <Fig className="h-36 sm:h-44" src={sheet.sprite} label="In-game" pixel />
                <Fig className="h-36 sm:h-44" src={sheet.hd} label="Book HD" />
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#4b5563]">
              Neutral study for {hero.animal} · {hero.element}. Front tarot, low-definition in-game mesh, high-definition book paint. T-pose target for the 3D rig.
            </p>
          </SheetCard>

          <SheetCard title={`Ability Sheet: ${hero.ability ?? "Arcana"}`}>
            <div className="grid grid-cols-[1fr_7.5rem] gap-2">
              <div className="rounded-md bg-[#cfd6df] p-2">
                <Pattern kind={sheet.diagram} />
                <p className="mt-1 text-center text-[10px] text-[#374151]">
                  {hero.ability} — Cast Time {hero.abilityCd?.toFixed(1) ?? "6.0"}s
                </p>
              </div>
              <div className="space-y-2">
                <Fig className="h-16" src={sheet.bust} label="Bust" />
                <Fig className="h-16" src={hero.portrait} label="Card" />
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#4b5563]">{hero.abilityBlurb}</p>
            <p className="mt-1 text-[11px] text-[#6b7280]">{hero.passive}</p>
          </SheetCard>

          <SheetCard title="Ability Sheet: Warding / Passive">
            <div className="rounded-md bg-[#cfd6df] p-3">
              <Pattern kind="orbit" faint />
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] text-[#374151]">
                <div>
                  <p className="font-display text-base">{hero.hp}</p>
                  HP
                </div>
                <div>
                  <p className="font-display text-base">{hero.speed.toFixed(1)}</p>
                  Speed
                </div>
                <div>
                  <p className="font-display text-base">{hero.damage}</p>
                  Dmg
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#4b5563]">
              Fire rate {hero.fireRate}s · projectile {hero.projectileSpeed}. {hero.startShield ? `${hero.startShield} shield. ` : ""}
              {hero.startOrbits ? `${hero.startOrbits} orbiting shards. ` : ""}
              {hero.startPierce ? `Pierce ${hero.startPierce}. ` : ""}
              {hero.burn ? "Burn on hit. " : ""}
              {hero.vamp ? `Lifesteal ${(hero.vamp * 100).toFixed(0)}%. ` : ""}
            </p>
          </SheetCard>

          <SheetCard title={`Prop Sheet: ${sheet.prop}`}>
            <div className="grid grid-cols-3 gap-2 rounded-md bg-[#cfd6df] p-2">
              <Fig className="h-24" src={hero.portrait} label="Held" />
              <Fig className="h-24" src={sheet.sprite} label="Lo-poly" pixel />
              <Fig className="h-24" src={sheet.hd} label="Hi-poly" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {sheet.materials.map((m) => (
                <span key={m} className="rounded-sm border border-[#c5ccd6] bg-white px-1.5 py-0.5 text-[10px] text-[#4b5563]">
                  {m}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#4b5563]">{hero.weapon} · {hero.meaning}</p>
          </SheetCard>
        </div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 border-t border-[#c5ccd6] bg-white/95 px-4 pt-3"
        style={{ paddingBottom: "max(0.85rem, calc(env(safe-area-inset-bottom) + 0.6rem))" }}
      >
        <div className="mx-auto flex max-w-6xl gap-2">
          <button
            type="button"
            onClick={onWalk}
            className="h-12 min-h-12 flex-1 rounded-md bg-[#c9a227] font-display text-sm tracking-wide text-[#1a1408]"
          >
            Walk as {hero.name}
          </button>
        </div>
      </div>
    </div>
  );
}

function SheetCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-[#c5ccd6] bg-white p-3 shadow-sm">
      <h3 className="font-display text-base text-[#1f2937]">{title}</h3>
      <div className="mt-2">{children}</div>
    </article>
  );
}

function Fig({
  src,
  label,
  pixel,
  className = "",
}: {
  src: string;
  label: string;
  pixel?: boolean;
  className?: string;
}) {
  return (
    <figure className={`flex flex-col items-center ${className}`}>
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-sm bg-[#e8edf3]">
        <img
          src={src}
          alt={label}
          className={`max-h-full max-w-full object-contain ${pixel ? "image-render-pixel" : ""}`}
          style={pixel ? { imageRendering: "pixelated" } : undefined}
        />
      </div>
      <figcaption className="mt-1 text-[9px] tracking-[0.2em] text-[#6b7280]">{label}</figcaption>
    </figure>
  );
}

function Pattern({ kind, faint }: { kind: Diagram; faint?: boolean }) {
  const stroke = faint ? "#9aa3b0" : "#4b5563";
  const accent = "#c9a227";
  return (
    <svg viewBox="0 0 160 90" className="h-28 w-full">
      <rect width="160" height="90" fill="#e8edf3" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`v${i}`} x1={20 * i} y1="0" x2={20 * i} y2="90" stroke="#d5dbe3" />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={18 * i} x2="160" y2={18 * i} stroke="#d5dbe3" />
      ))}
      <circle cx="80" cy="50" r="4" fill={accent} />
      {kind === "fan" &&
        [-24, -12, 0, 12, 24].map((a) => (
          <line key={a} x1="80" y1="50" x2={80 + Math.sin((a * Math.PI) / 180) * 40} y2={50 - Math.cos((a * Math.PI) / 180) * 40} stroke={stroke} />
        ))}
      {kind === "dual" && (
        <>
          <line x1="70" y1="70" x2="70" y2="12" stroke={stroke} />
          <line x1="90" y1="70" x2="90" y2="12" stroke={stroke} />
        </>
      )}
      {kind === "nova" &&
        Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <circle key={i} cx={80 + Math.cos(a) * 28} cy={50 + Math.sin(a) * 22} r="4" fill="none" stroke={accent} />;
        })}
      {kind === "ring" && <circle cx="80" cy="50" r="28" fill="none" stroke={accent} strokeWidth="2" />}
      {kind === "tide" && (
        <>
          <circle cx="80" cy="50" r="16" fill="none" stroke={stroke} />
          <circle cx="80" cy="50" r="28" fill="none" stroke={accent} />
          <circle cx="80" cy="50" r="38" fill="none" stroke={stroke} opacity="0.5" />
        </>
      )}
      {kind === "orbit" &&
        [0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return <circle key={i} cx={80 + Math.cos(a) * 30} cy={50 + Math.sin(a) * 22} r="5" fill={accent} />;
        })}
    </svg>
  );
}
