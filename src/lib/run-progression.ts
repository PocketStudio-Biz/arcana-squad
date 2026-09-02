import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import type { GuardianId } from "@/lib/arcana";

async function requireUserId(): Promise<string> {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser();
  if (!user?.id) throw new Error("Sign in is required to persist run progression.");
  return user.id;
}

function stageForXp(xp: number) {
  if (xp >= 1500) return "digivolve";
  if (xp >= 750) return "battle";
  if (xp >= 250) return "train";
  return "hatch";
}

export const recordRunProgress = createServerFn({ method: "POST" })
  .validator((data: { guardianId: GuardianId; rooms: number; score: number; won: boolean }) => ({
    guardianId: data.guardianId,
    rooms: Math.max(0, Math.min(9999, Math.floor(Number(data.rooms) || 0))),
    score: Math.max(0, Math.min(99_999_999, Math.floor(Number(data.score) || 0))),
    won: Boolean(data.won),
  }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const sql = await getSql();
    const earnedXp = Math.max(20, data.rooms * 40 + Math.floor(data.score / 1000) * 20 + (data.won ? 500 : 0));

    const [current] = await sql<{ xp: number }>`
      select xp from guardian_progress
      where user_id = ${userId} and guardian_id = ${data.guardianId}
    `;
    const nextXp = (current?.xp ?? 0) + earnedXp;
    const evolutionStage = stageForXp(nextXp);

    await sql`
      insert into guardian_progress (user_id, guardian_id, evolution_stage, xp)
      values (${userId}, ${data.guardianId}, ${evolutionStage}, ${nextXp})
      on conflict (user_id, guardian_id) do update set
        evolution_stage = excluded.evolution_stage,
        xp = excluded.xp,
        updated_at = now()
    `;

    if (data.rooms >= 10) {
      await sql`
        insert into arcana_achievements (user_id, achievement_id)
        values (${userId}, ${"squad-ascended"})
        on conflict (user_id, achievement_id) do nothing
      `;
    }
    if (data.won) {
      await sql`
        insert into arcana_achievements (user_id, achievement_id)
        values (${userId}, ${"circle-complete"})
        on conflict (user_id, achievement_id) do nothing
      `;
    }

    return { ok: true as const, earnedXp, xp: nextXp, evolutionStage };
  });
