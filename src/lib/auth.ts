import { randomUUID } from "crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

export const SESSION_COOKIE = "notec_session";
const DAYS_30 = 30 * 86400;

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleAuthUrl(origin: string): string {
  const redirect = `${origin}/api/auth/callback`;
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: redirect,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`;
}

export async function upsertUser(data: {
  email: string;
  name: string;
  picture?: string;
  googleId?: string | null;
  provider: "google" | "demo";
}) {
  const email = data.email.toLowerCase().trim();
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing[0]) {
    const upd = await db
      .update(users)
      .set({
        name: data.name || existing[0].name,
        picture: data.picture || existing[0].picture,
        googleId: data.googleId ?? existing[0].googleId,
        provider: data.provider,
      })
      .where(eq(users.id, existing[0].id))
      .returning();
    return upd[0];
  }
  const ins = await db
    .insert(users)
    .values({
      email,
      name: data.name || email.split("@")[0],
      picture: data.picture || "",
      googleId: data.googleId ?? null,
      provider: data.provider,
    })
    .returning();
  return ins[0];
}

export async function createSession(userId: string): Promise<string> {
  const token = randomUUID() + randomUUID().replace(/-/g, "");
  await db.insert(sessions).values({
    token,
    userId,
    expiresAt: new Date(Date.now() + DAYS_30 * 1000),
  });
  return token;
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
  provider: string;
};

export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/notec_session=([^;]+)/);
  if (!m) return null;
  const rows = await db
    .select({ s: sessions, u: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.token, m[1]),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!rows[0]) return null;
  const u = rows[0].u;
  return { id: u.id, email: u.email, name: u.name, picture: u.picture, provider: u.provider };
}

/** Owner key for reservations/reminders: account first, then device. */
export function ownerKey(user: SessionUser | null, device: string): string {
  return user ? `u:${user.id}` : device || "anon";
}

/** Move a guest device's reservations/reminders onto the new account. */
export async function attachDeviceState(userId: string, device: string) {
  if (!device) return;
  const uOwner = `u:${userId}`;
  await db.execute(sql`
    DELETE FROM reservations a USING reservations b
      WHERE a.device = ${device} AND b.device = ${uOwner} AND a.event_id = b.event_id
  `);
  await db.execute(sql`UPDATE reservations SET device = ${uOwner} WHERE device = ${device}`);
  await db.execute(sql`
    DELETE FROM reminders a USING reminders b
      WHERE a.device = ${device} AND b.device = ${uOwner} AND a.event_id = b.event_id
  `);
  await db.execute(sql`UPDATE reminders SET device = ${uOwner} WHERE device = ${device}`);
}
