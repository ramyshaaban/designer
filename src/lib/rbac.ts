import { type Session } from "next-auth";

export type Role = "admin" | "editor" | "viewer";

export function requireRole(session: Session | null, allowed: Role[]): asserts session is Session {
  if (!session?.user) throw new Error("UNAUTHORIZED");
  const role = (session.user as any).role as Role;
  if (!allowed.includes(role)) throw new Error("FORBIDDEN");
}

export function getSessionContext(session: Session) {
  const userId = (session.user as any).id ?? null;
  const role = (session.user as any).role as Role;
  const hospitalId = (session.user as any).hospitalId as string;
  return { userId, role, hospitalId };
}


