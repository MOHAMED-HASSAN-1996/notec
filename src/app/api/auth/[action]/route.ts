import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import {
  SESSION_COOKIE,
  attachDeviceState,
  createSession,
  getSessionUser,
  googleAuthUrl,
  googleConfigured,
  upsertUser,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 86400,
  });
}

type Ctx = { params: Promise<{ action: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const { action } = await params;

  if (action === "me") {
    const user = await getSessionUser(req);
    return NextResponse.json({ user });
  }

  if (action === "status") {
    return NextResponse.json({ google: googleConfigured() });
  }

  if (action === "google") {
    if (!googleConfigured()) {
      return NextResponse.json(
        { error: "Google OAuth is not configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)" },
        { status: 503 },
      );
    }
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(googleAuthUrl(origin));
  }

  return NextResponse.json({ error: "unknown action" }, { status: 404 });
}

export async function POST(req: Request, { params }: Ctx) {
  const { action } = await params;

  if (action === "logout") {
    const cookie = req.headers.get("cookie") || "";
    const m = cookie.match(/notec_session=([^;]+)/);
    if (m) {
      await db.delete(sessions).where(eq(sessions.token, m[1]));
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  }

  if (action === "demo") {
    let body: { name?: string; email?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid body" }, { status: 400 });
    }
    const email = (body.email || "").trim().toLowerCase();
    const name = (body.name || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }
    const user = await upsertUser({ email, name, provider: "demo" });
    const token = await createSession(user.id);
    const device = req.headers.get("x-device-id") || "";
    await attachDeviceState(user.id, device);
    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        provider: user.provider,
      },
    });
    setSessionCookie(res, token);
    return res;
  }

  return NextResponse.json({ error: "unknown action" }, { status: 404 });
}
