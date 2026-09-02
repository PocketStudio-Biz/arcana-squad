# Arcana Squad

Isometric tarot dungeon crawler. Pick a Major Arcana or Circle hero, auto-aim tarot-card shots, stack blessings, and clear 15 rooms.

## Play

- **Move:** left stick / WASD
- **Aim:** auto-locks nearest foe
- **Blessings:** after each room
- **Lives:** 3 · **Victory:** room 15

Touch-first. Works on phones, tablets, and desktop. Add to Home Screen as a PWA.

## Product architecture

The current proposed guardian mapping, tarot card system, website architecture, and game app flow are documented in [`docs/ARCANA_CARD_SYSTEM.md`](docs/ARCANA_CARD_SYSTEM.md).

That document covers:

- Turtle / Swords
- Otter / Pentacles
- Lizard / Wands
- Raven / Cups
- Lynx / Major Arcana
- World Gate, Squad Codex, Card Archive, Play, and Player Grimoire
- the draw → encounter → squad interaction → reading → evolution loop
- shared card and guardian data-model recommendations
- implementation guardrails and open design decisions

## Stack

TanStack Start · Three.js · Tailwind · Postgres (Neon / PGLite fallback)

```bash
npm install
npm run dev
```

Open the preview, walk as The Fool, and survive the temple.
