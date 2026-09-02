import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

export type ArcanaAccessibility = {
  reducedEffects: boolean;
  largerText: boolean;
  highContrast: boolean;
};

async function requireUserId(): Promise<string> {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser();
  if (!user?.id) throw new Error("Sign in is required to save accessibility preferences.");
  return user.id;
}

export const saveAccessibilityPreferences = createServerFn({ method: "POST" })
  .validator((data: Partial<ArcanaAccessibility>) => ({
    reducedEffects: Boolean(data.reducedEffects),
    largerText: Boolean(data.largerText),
    highContrast: Boolean(data.highContrast),
  }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const sql = await getSql();
    const value = JSON.stringify(data);
    await sql`
      insert into arcana_profiles (user_id, accessibility)
      values (${userId}, ${value}::jsonb)
      on conflict (user_id) do update set
        accessibility = excluded.accessibility,
        updated_at = now()
    `;
    return { ok: true as const, accessibility: data };
  });
