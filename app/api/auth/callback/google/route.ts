import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { createToken, setSessionCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/sign-in?error=missing_code", req.url));
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/sign-in?error=oauth_failed", req.url));
    }

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userInfoRes.json();
    if (!googleUser.email) {
      return NextResponse.redirect(new URL("/sign-in?error=no_email", req.url));
    }

    let user = await db.user.findUnique({ where: { email: googleUser.email } });

    if (!user) {
      user = await db.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split("@")[0],
          imageUrl: googleUser.picture || null,
          provider: "google",
          googleId: googleUser.id,
        },
      });
    } else if (!user.googleId) {
      user = await db.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.id, provider: "google" },
      });
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    await setSessionCookie(token);

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(new URL("/sign-in?error=oauth_failed", req.url));
  }
}
