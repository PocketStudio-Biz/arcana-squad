# Arcana Squad Card System, Website Architecture, and Game Flow

This document captures the current proposed Arcana Squad information architecture and gameplay loop so the website, card system, and game teach the same world instead of behaving like three unrelated projects wearing the same logo.

## Core Product Principle

**One suit = one gameplay language.**

Every public website section should teach something the player later uses in-game. The site is not only marketing; it is the first layer of onboarding into the Arcana Squad world.

## Current Five-Guardian Mapping

| Guardian | Tarot family | Element / magic language | Gameplay identity |
| --- | --- | --- | --- |
| Turtle | Swords | Wind, air, telekinesis | Precision, space control, positioning |
| Otter | Pentacles | Plant, money, growth, resources | Resource generation, growth, building |
| Lizard | Wands | Fire, heat, smoke, aggression | Pressure, damage, tempo |
| Raven | Cups | Water, cold, intuition, support | Protection, redirection, support |
| Lynx | Major Arcana | Cosmic, shadow, transformation, wildcard | Rule-bending, transformation, cross-suit effects |

### Suit Rules

- **Swords / Turtle**: control space, direction, momentum, air pressure, ranged precision, telekinetic movement.
- **Pentacles / Otter**: generate or preserve resources, create plant growth, build temporary advantages, interact with currency and material rewards.
- **Wands / Lizard**: heat, fire, smoke, explosive pressure, aggressive momentum, environmental hazards.
- **Cups / Raven**: water, cold, intuition, healing/support behavior, protection, redirects, slows, and defensive utility.
- **Major Arcana / Lynx**: cosmic and shadow magic. Major Arcana can bend the normal suit rules and create unusual transformation or wildcard effects.

## Website Architecture

### 1. World Gate

**Purpose:** homepage / entry point.

The homepage should present Arcana Squad as a playable system, not only as character art.

Primary jobs:

- Introduce the world premise.
- Reveal the five guardians.
- Establish the relationship between tarot suits and gameplay.
- Make entering the game the strongest call to action.

Primary actions:

- **Enter the Game**
- **Meet the Squad**
- **Explore the Arcana**

### 2. Squad Codex

**Purpose:** character and faction onboarding.

Each guardian page should explain:

- animal identity
- tarot family
- elemental / magical language
- signature weapon language
- combat role
- visual motif
- evolution path
- relationships with the other squad members

The Squad Codex should function as playable onboarding rather than detached lore.

### 3. Card Archive

**Purpose:** Major + Minor Arcana collection and reference system.

The archive should support:

- Major Arcana cards
- Minor Arcana by suit
- discovered vs locked states
- card meanings
- gameplay effects
- card ownership / unlock state
- card visual reference

Locked cards can remain visible as silhouettes so players understand the collection size without exposing every reward.

### 4. Play

**Purpose:** functional bridge from website into the actual game.

Recommended states:

- New Game
- Continue
- Daily Draw
- Current Quest
- Current Squad Status

This should be the strongest action on the website.

### 5. Player Grimoire

**Purpose:** player identity and progression hub.

Recommended contents:

- discovered cards
- equipped deck
- guardian evolution progress
- achievements
- active quests
- accessibility / readability settings
- saved progress

## Main Game App Flow

### Step 1: Enter the World

First-launch sequence:

1. Intro animation.
2. Player name / identity setup.
3. Accessibility and readability settings.
4. Short explanation of the tarot-driven world.

The game is touch-first, so onboarding should never assume mouse precision.

### Step 2: Choose the First Guardian

The player chooses:

- Turtle
- Otter
- Lizard
- Raven
- Lynx

Each guardian teaches a different play style.

Choosing a first guardian should **not permanently lock the others**. The squad is meant to grow into a team.

### Step 3: Draw the Opening Card

The first Arcana draw creates the tutorial modifier.

The card can influence:

- encounter theme
- room condition
- blessing
- reward modifier
- temporary ability
- first collectible Arcana card

This establishes immediately that tarot cards are mechanics, not decoration.

### Step 4: Battle / Puzzle Encounter

The player combines:

- guardian movement
- guardian weapon / attack language
- suit magic
- current card effect

Core differentiation:

- Swords control space.
- Pentacles build resources.
- Wands pressure enemies.
- Cups protect, redirect, or support.
- Major Arcana breaks or bends standard rules.

### Step 5: Squad Interaction

Unlocked companions should visibly behave like a squad instead of passive menu icons.

Between and during encounters they can:

- practice fighting
- assist jumps
- catch one another
- defend
- combine abilities
- help traverse space
- react to nearby squad members

The squad should feel alive across the screen.

### Step 6: Resolve the Reading

At the end of an encounter, connect the run back to the card system.

Possible resolution layer:

- short card interpretation
- player-choice reflection
- reward reveal
- route consequence
- new lore or relationship beat

This keeps tarot meaning connected to play without turning the game into a lecture.

### Step 7: Return to the Arcana Hub

The player returns to the central progression layer and can:

- upgrade a guardian
- edit the deck
- inspect new lore
- choose the next quest
- perform the daily draw
- review collection progress
- re-enter combat

This becomes the repeating long-term loop.

## Core Loop

```text
World Gate
  -> Choose Guardian
  -> Draw Arcana
  -> Enter Encounter
  -> Use Guardian + Suit + Card
  -> Squad Interaction
  -> Resolve Reading
  -> Rewards / Evolution / Collection
  -> Arcana Hub
  -> Next Draw / Quest
  -> Repeat
```

## Website-to-Game Relationship

### The website teaches

- who each guardian is
- what each suit represents
- how tarot cards alter play
- the visual language of the world
- why the player should enter the game

### The game proves

- guardians play differently
- cards alter encounters
- squad members cooperate dynamically
- Major Arcana can bend ordinary rules
- collection and evolution create reasons to return

## Recommended Top-Level Navigation

```text
World Gate
Squad Codex
Card Archive
Play
Player Grimoire
```

These names can be displayed directly or used as internal architecture labels while the public-facing copy evolves.

## Existing Game Context

The repository currently describes Arcana Squad as an isometric tarot dungeon crawler with:

- touch-first controls
- auto-aim / auto-lock behavior
- blessing selection after rooms
- three lives
- a 15-room victory target
- PWA support for phones, tablets, and desktop

The existing README also identifies the current stack as:

- TanStack Start
- Three.js
- Tailwind
- Postgres with Neon / PGLite fallback

The card architecture above should extend that existing game instead of replacing the current core loop blindly.

## Implementation Guardrails

1. **Tarot must affect mechanics.** Do not reduce cards to collectible art only.
2. **Guardians must remain mechanically distinct.** Shared systems are fine; identical reskins are not.
3. **The five-animal mapping should remain consistent across website, UI, cards, and gameplay unless intentionally revised.**
4. **No duplicate guardian identity language.** Each animal, element, suit, silhouette, weapon language, and motion style should read differently.
5. **Touch-first remains a product constraint.** Every critical action needs a usable tap interaction.
6. **Major Arcana is a wildcard family, not simply a fifth elemental suit.**
7. **Website lore should reduce onboarding friction.** Avoid duplicating the same explanation in long modal tutorials when the site can teach it more elegantly.

## Suggested Next Implementation Layers

### Phase A: Information architecture

- Add routes or sections for World Gate, Squad Codex, Card Archive, Play, and Player Grimoire.
- Keep Play visually dominant.

### Phase B: Shared card data model

Create a single source of truth for card metadata that both UI and gameplay can consume.

Recommended fields:

```ts
type ArcanaCard = {
  id: string;
  name: string;
  family: 'major' | 'swords' | 'pentacles' | 'wands' | 'cups';
  rank?: number | 'ace' | 'page' | 'knight' | 'queen' | 'king';
  meaning: string;
  gameplayEffect: string;
  rarity?: string;
  unlocked: boolean;
  artAsset?: string;
};
```

### Phase C: Shared guardian data model

```ts
type Guardian = {
  id: 'turtle' | 'otter' | 'lizard' | 'raven' | 'lynx';
  tarotFamily: 'swords' | 'pentacles' | 'wands' | 'cups' | 'major';
  element: string;
  gameplayRole: string;
  weaponLanguage: string;
  magicLanguage: string;
  evolutionStage?: string;
};
```

### Phase D: Gameplay integration

- Opening Arcana draw modifies the first encounter.
- Room rewards add or modify Arcana effects.
- Guardian + card combinations produce meaningful mechanical variation.
- Squad assistance becomes visible in traversal and combat.

### Phase E: Progression

- Player Grimoire tracks discovered cards.
- Guardian evolution is visible and persistent.
- Daily Draw creates a return loop without replacing the core dungeon loop.

## Open Design Questions

These remain implementation decisions rather than settled facts:

- exact Minor Arcana card-by-card effects
- exact Major Arcana roster behavior
- exact guardian weapon designs
- whether decks are built before a run, during a run, or both
- whether Daily Draw affects gameplay globally or only a single run
- final account / save architecture
- final route names and URLs

Keep these explicitly flexible until the underlying gameplay is tested.
