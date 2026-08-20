import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

export type ScoreRow = {
  id: number;
  display_name: string;
  score: number;
  rooms: number;
  hero_id: string;
  created_at: string;
};

export const getTopScores = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<ScoreRow>`
    select id, display_name, score, rooms, hero_id, created_at::text as created_at
    from scores
    order by score desc, created_at asc
    limit 20
  `;
});

export const submitScore = createServerFn({ method: "POST" })
  .validator((d: { displayName: string; score: number; rooms: number; heroId: string }) => ({
    displayName: (d.displayName || "Wanderer").trim().slice(0, 24) || "Wanderer",
    score: Math.max(0, Math.min(99_999_999, Math.floor(Number(d.score) || 0))),
    rooms: Math.max(0, Math.min(9999, Math.floor(Number(d.rooms) || 0))),
    heroId: String(d.heroId || "fool").slice(0, 24),
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    let userId: string | null = null;
    try {
      const { getSessionUser } = await import("@/lib/auth/verify.server");
      const u = await getSessionUser();
      userId = u?.id ?? null;
    } catch {
      userId = null;
    }
    await sql`
      insert into scores (user_id, display_name, score, rooms, hero_id)
      values (${userId}, ${data.displayName}, ${data.score}, ${data.rooms}, ${data.heroId})
    `;
    return { ok: true as const };
  });
