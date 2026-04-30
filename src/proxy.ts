import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { adminCredentials } from "@/lib/admin-credentials";

const cookieName = "hm_admin_session";

export const config = {
  matcher: ["/admin/:path*"]
};

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const { username, password, secret } = adminCredentials();
  const expected = await sha256Hex(`${username}:${password}:${secret}`);
  const token = request.cookies.get(cookieName)?.value;

  if (token === expected) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}
