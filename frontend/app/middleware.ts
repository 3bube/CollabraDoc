// middleware.ts
import { auth } from "@/auth.config";
import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://collabradoc.onrender.com",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400", // 24 hours
      },
    });
  }

  // Handle authentication
  const session: Session | null = await auth();
  const url = request.nextUrl;

  console.log("Middleware session:", session);

  if (!session && url.pathname.startsWith("/dashboard")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Add CORS headers to the response
  const response = NextResponse.next();
  response.headers.set(
    "Access-Control-Allow-Origin",
    "https://collabradoc.onrender.com"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"], // protect dashboard routes and add CORS to API routes
};
