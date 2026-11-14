/**
 * Signed session tokens (HMAC-SHA256 via Web Crypto) — usable from proxy,
 * route handlers and server actions alike.
 */
export const SESSION_COOKIE = "orb_console";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

const enc = new TextEncoder();

function b64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export function sessionSecret() {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
  return s ? `orbitech:${s}` : "";
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function equal(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export type Session = { user: string; exp: number };

export async function signSession(user: string): Promise<string> {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured");
  const payload = b64url(enc.encode(JSON.stringify({ user, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })));
  return `${payload}.${b64url(await hmac(secret, payload))}`;
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  const secret = sessionSecret();
  if (!token || !secret) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    if (!equal(fromB64url(sig), await hmac(secret, payload))) return null;
    const s = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as Session;
    if (typeof s.user !== "string" || typeof s.exp !== "number" || s.exp < Date.now() / 1000) return null;
    return s;
  } catch {
    return null;
  }
}

/** ADMIN_USERS="Ada:pass1,Musa:pass2" for named team logins; ADMIN_PASSWORD for a single shared login. */
export function configuredUsers(): { name: string; password: string }[] {
  const users = (process.env.ADMIN_USERS ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const i = p.indexOf(":");
      return { name: p.slice(0, i).trim(), password: p.slice(i + 1) };
    })
    .filter((u) => u.name && u.password);
  if (process.env.ADMIN_PASSWORD) users.push({ name: "Admin", password: process.env.ADMIN_PASSWORD });
  return users;
}

export async function checkCredentials(name: string, password: string): Promise<string | null> {
  const users = configuredUsers();
  const secret = sessionSecret() || "x";
  const given = await hmac(secret, password);
  let match: string | null = null;
  for (const u of users) {
    const ok = equal(given, await hmac(secret, u.password));
    const nameOk = users.length === 1 || u.name.toLowerCase() === name.trim().toLowerCase();
    if (ok && nameOk && !match) match = u.name;
  }
  return match;
}
