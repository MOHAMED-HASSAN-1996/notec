import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  attachDeviceState,
  createSession,
  googleConfigured,
  upsertUser,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

// Google OAuth 2.0 callback: exchanges the code for tokens,
// reads the profile, creates/links the Notec account and starts a session.
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!googleConfigured() || !code) {
    return NextResponse.redirect(`${origin}/login?err=1`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${origin}/api/auth/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) throw new Error("token exchange failed");
    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) throw new Error("no access token");

    const infoRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      { headers: { authorization: `Bearer ${tokens.access_token}` } },
    );
    if (!infoRes.ok) throw new Error("userinfo failed");
    const info = (await infoRes.json()) as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
      email_verified?: boolean;
    };
    if (!info.email) throw new Error("no email from Google");

    const user = await upsertUser({
      email: info.email,
      name: info.name || info.email.split("@")[0],
      picture: info.picture || "",
      googleId: info.sub,
      provider: "google",
    });
    const token = await createSession(user.id);
    const device = req.headers.get("x-device-id") || "";
    if (device) await attachDeviceState(user.id, device);

    const res = NextResponse.redirect(`${origin}/my`);
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 86400,
    });
    return res;
  } catch {
    return NextResponse.redirect(`${origin}/login?err=1`);
  }
}
