import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getJSON, setJSON, addToSet, getSet } from "./store";

const COOKIE_NAME = "vibe_session";
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "vibe-meter-dev-secret-change-me"
);

// ── Users ────────────────────────────────────────────────────────────
const userKey = (username) => `vibe:user:${username.toLowerCase()}`;
const USERS_SET = "vibe:users";

export async function createUser({ username, displayName, password }) {
  const uname = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{2,20}$/.test(uname)) {
    throw new Error(
      "Username must be 2–20 characters: letters, numbers, or underscores."
    );
  }
  if (!password || password.length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }
  const existing = await getJSON(userKey(uname));
  if (existing) {
    throw new Error("That username is already taken.");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    username: uname,
    displayName: (displayName || username).trim().slice(0, 30),
    passwordHash,
    createdAt: Date.now(),
  };
  await setJSON(userKey(uname), user);
  await addToSet(USERS_SET, uname);
  return publicUser(user);
}

export async function verifyUser({ username, password }) {
  const uname = (username || "").trim().toLowerCase();
  const user = await getJSON(userKey(uname));
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return publicUser(user);
}

export async function getUser(username) {
  const user = await getJSON(userKey(username));
  return user ? publicUser(user) : null;
}

export async function listUsers() {
  const usernames = await getSet(USERS_SET);
  const users = await Promise.all(usernames.map((u) => getJSON(userKey(u))));
  return users.filter(Boolean).map(publicUser);
}

function publicUser(user) {
  return { username: user.username, displayName: user.displayName };
}

// ── Sessions (signed cookie) ─────────────────────────────────────────
export async function createSession(username) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSession() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getSessionUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (!payload?.username) return null;
    return await getUser(payload.username);
  } catch {
    return null;
  }
}
