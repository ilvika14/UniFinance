import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.BASE_URL || req.nextUrl.origin;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  if (!clientId) {
    return NextResponse.redirect(new URL("/sign-in?error=google_not_configured", req.url));
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid email profile&access_type=offline`;

  return NextResponse.redirect(googleAuthUrl);
}
