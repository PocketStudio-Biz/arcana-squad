import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import type { GuardianId } from "@/lib/arcana";

export type GuardianProgressRow = {
  guardian_id: GuardianId;
  evolution_stage: string;
  xp: number;
  updated_at: string;
};

export type GrimoireState = {
  profile: {
    active_guardian: GuardianId;
    active_quest: string | null;
    daily_draw_date: string | null;
    daily_draw_card_id: string | null;
    accessibility: Record<string, unknown>;
  };
  unlockedCards: string[];
  deck: Array<{ slot: number; card_id: string }>;
  guardians: GuardianProgressRow[];
  achievements: string[];
};

async function requireUserId(): Promise<string> {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser();
  if (!user?.id) throw new Error("Sign in is required to access the Player Grimoire.");
  return user.id;
}

export const getGrimoire = createServerFn({ method: "GET" }).handler(async (): Promise<GrimoireState> => {
  const userId = await requireUserId();
  const sql = await getSql();

  await sql`
    insert into arcana_profiles (user_id)
    values (${userId})
    on conflict (user_id) do nothing
  `;

  const [profile] = await sql<GrimoireState["profile"]>`
    select active_guardian, active_quest, daily_draw_date::text as daily_draw_date,
      daily_draw_card_id, accessibility
    from arcana_profiles
    where user_id = ${userId}
  `;
  const cardRows = await sql<{ card_id: string }>`
    select card_id from arcana_card_unlocks where user_id = ${userId} order by unlocked_at asc
  `;
  const deck = await sql<{ slot: number; card_id: string }>`
    select slot, card_id from arcana_deck_cards where user_id = ${userId} order by slot asc
  `;
  const guardians = await sql<GuardianProgressRow>`
    select guardian_id, evolution_stage, xp, updated_at::text as updated_at
    from guardian_progress where user_id = ${userId} order by guardian_id asc
  `;
  const achievementRows = await sql<{ achievement_id: string }>`
    select achievement_id from arcana_achievements where user_id = ${userId} order by unlocked_at asc
  `;

  return {
    profile: profile ?? {
      active_guardian: "lynx",
      active_quest: null,
      daily_draw_date: null,
      daily_draw_card_id: null,
      accessibility: {},
    },
    unlockedCards: cardRows.map((row) => row.card_id),
    deck,
    guardians,
    achievements: achievementRows.map((row) => row.achievement_id),
  };
});

export const unlockArcanaCard = createServerFn({ method: "POST" })
  .validator((data: { cardId: string }) => ({ cardId: String(data.cardId || "").trim().slice(0, 80) }))
  .handler(async ({ data }) => {
    if (!data.cardId) throw new Error("A card id is required.");
    const userId = await requireUserId();
    const sql = await getSql();
    await sql`
      insert into arcana_card_unlocks (user_id, card_id)
      values (${userId}, ${data.cardId})
      on conflict (user_id, card_id) do nothing
    `;
    return { ok: true as const };
  });

export const saveGuardianProgress = createServerFn({ method: "POST" })
  .validator((data: { guardianId: GuardianId; evolutionStage: string; xp: number }) => ({
    guardianId: data.guardianId,
    evolutionStage: String(data.evolutionStage || "hatch").trim().slice(0, 32) || "hatch",
    xp: Math.max(0, Math.min(2_000_000_000, Math.floor(Number(data.xp) || 0))),
  }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const sql = await getSql();
    await sql`
      insert into guardian_progress (user_id, guardian_id, evolution_stage, xp)
      values (${userId}, ${data.guardianId}, ${data.evolutionStage}, ${data.xp})
      on conflict (user_id, guardian_id) do update set
        evolution_stage = excluded.evolution_stage,
        xp = greatest(guardian_progress.xp, excluded.xp),
        updated_at = now()
    `;
    return { ok: true as const };
  });

export const saveDeck = createServerFn({ method: "POST" })
  .validator((data: { cardIds: string[] }) => ({
    cardIds: Array.from(new Set((data.cardIds ?? []).map((id) => String(id).trim()).filter(Boolean))).slice(0, 12),
  }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const sql = await getSql();
    await sql`delete from arcana_deck_cards where user_id = ${userId}`;
    for (let index = 0; index < data.cardIds.length; index += 1) {
      await sql`
        insert into arcana_deck_cards (user_id, slot, card_id)
        values (${userId}, ${index + 1}, ${data.cardIds[index]})
      `;
    }
    return { ok: true as const, count: data.cardIds.length };
  });

export const saveDailyDraw = createServerFn({ method: "POST" })
  .validator((data: { cardId: string; date: string }) => ({
    cardId: String(data.cardId || "").trim().slice(0, 80),
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(data.date)) ? String(data.date) : "",
  }))
  .handler(async ({ data }) => {
    if (!data.cardId || !data.date) throw new Error("A valid daily draw card and calendar date are required.");
    const userId = await requireUserId();
    const sql = await getSql();
    await sql`
      insert into arcana_profiles (user_id, daily_draw_date, daily_draw_card_id)
      values (${userId}, ${data.date}, ${data.cardId})
      on conflict (user_id) do update set
        daily_draw_date = excluded.daily_draw_date,
        daily_draw_card_id = excluded.daily_draw_card_id,
        updated_at = now()
    `;
    return { ok: true as const };
  });
