import "server-only";

import { createHmac, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function derivePassword(password: string, salt: Buffer, length: number) {
  return new Promise<Buffer>((resolve, reject) => scryptCallback(password, salt, length, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key as Buffer)));
}
const cookieName = "erll_admin_session";
const sessionSeconds = 8 * 60 * 60;

export async function requireAdmin() {
  return await isAdminAuthenticated() ? null : NextResponse.json({ message: "Sign in to continue." }, { status: 401, headers: { "Cache-Control": "no-store" } });
}

export function adminIsConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_USERNAME.length <= 128 && process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function hmac(value: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(value).digest("base64url");
}

export async function verifyAdminCredentials(username: string, password: string) {
  if (!adminIsConfigured() || password.length > 1024) return false;
  const [algorithm, saltHex, expectedHex] = process.env.ADMIN_PASSWORD_HASH!.split(":");
  if (algorithm !== "scrypt" || !/^[a-f\d]{32,128}$/i.test(saltHex ?? "") || !/^[a-f\d]{128}$/i.test(expectedHex ?? "")) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = await derivePassword(password, Buffer.from(saltHex, "hex"), expected.length);
  return safeEqual(username, process.env.ADMIN_USERNAME!) && timingSafeEqual(actual, expected);
}

export async function setAdminSession() {
  const payload = Buffer.from(JSON.stringify({ user: process.env.ADMIN_USERNAME, exp: Date.now() + sessionSeconds * 1000, nonce: randomUUID() })).toString("base64url");
  const jar = await cookies();
  jar.set(cookieName, `${payload}.${hmac(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionSeconds,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.set(cookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}

export async function isAdminAuthenticated() {
  if (!adminIsConfigured()) return false;
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  if (!safeEqual(signature, hmac(payload))) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { user?: unknown; exp?: unknown };
    return session.user === process.env.ADMIN_USERNAME && typeof session.exp === "number" && session.exp > Date.now();
  } catch {
    return false;
  }
}
