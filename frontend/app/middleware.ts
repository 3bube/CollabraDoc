// middleware.ts
import { auth } from "@/auth.config";
import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const session: Session | null = await auth();
  const url = request.nextUrl;

  console.log("Middleware session:", session);

  if (!session && url.pathname.startsWith("/dashboard")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // protect every /dashboard route
};
