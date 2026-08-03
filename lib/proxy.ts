import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "@/lib/auth";

const COOKIE_NAME = "unifinance-token";

export interface ProxyResult {
  user: JWTPayload;
}

export async function authProxy(req: NextRequest): Promise<
  | { ok: true; user: JWTPayload; res?: NextResponse }
  | { ok: false; res: NextResponse }
> {
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await verifyToken(token);

  if (!user) {
    const res = NextResponse.json({ error: "Invalid token" }, { status: 401 });
    res.cookies.delete(COOKIE_NAME);
    return { ok: false, res };
  }

  return { ok: true, user };
}

export function requireAuth(handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const result = await authProxy(req);
    if (!result.ok) return result.res;
    return handler(req, result.user);
  };
}
