# Arcana Squad Backend Decision

## Decision

Keep the existing Postgres architecture (Neon in configured deployments, PGLite fallback in preview/dev) for the current build.

Do **not** add Convex as a parallel backend right now.

## Why

The repository already has:

- a shared server-only SQL layer in `src/lib/db.ts`
- migrations as the schema source of truth
- Better Auth integration
- score persistence
- a Neon production path
- a PGLite zero-config preview path

Adding Convex today would duplicate persistence, auth boundaries, and deployment responsibilities before Arcana Squad has a demonstrated need for that complexity.

## When to reconsider Convex

Re-evaluate Convex if the product later needs several of these at the same time:

- highly reactive cross-device player state
- live shared lobbies or presence
- collaborative multiplayer state outside the Three.js encounter loop
- large amounts of frequently changing profile / collection data where reactive subscriptions materially simplify the client
- durable background workflows that are awkward in the existing stack

If Convex is adopted later, migrate one bounded domain at a time. Do not keep Postgres and Convex as two competing sources of truth for the same player data.

## Current persistence roadmap

1. Keep scores on the existing SQL layer.
2. Add player progression tables via SQL migrations.
3. Persist discovered Arcana, equipped deck, guardian evolution, daily draw state, and active quest against the authenticated user.
4. Expose these through server functions rather than importing DB code into client components.
5. Add indexes for the primary authenticated-user read paths.

## Guardrail

The backend choice should serve the game loop. It should not become a second project wearing a backend-shaped hat.
