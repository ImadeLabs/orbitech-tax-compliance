import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession, type Session } from "./auth-token";

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

/** Use in every console page and server action — proxy is only the first gate. */
export async function requireAdmin(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/console/login");
  return s;
}
