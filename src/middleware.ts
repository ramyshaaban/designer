export { auth as middleware } from "./lib/auth";

export const config = {
  matcher: ["/designer/:path*", "/api/:path*"],
};


