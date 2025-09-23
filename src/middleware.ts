import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For now, allow all requests to pass through
  // Authentication will be handled at the page level
  return NextResponse.next();
}

export const config = {
  matcher: ["/designer/:path*"],
};


