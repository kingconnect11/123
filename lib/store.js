import { Redis } from "@upstash/redis";

// ── Shared storage with graceful fallback ────────────────────────────
// Prefer Upstash / Vercel KV when its env vars are present. Otherwise fall
// back to an in-memory store so the app still runs locally. The in-memory
// store is per-instance and ephemeral — fine for dev, not shared between
// users in production. Connect Vercel KV (free) to enable real sharing.

function makeRedis() {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

const redis = makeRedis();

export const storageConfigured = Boolean(redis);

// In-memory fallback, persisted across hot reloads via globalThis.
const mem = (() => {
  if (!globalThis.__vibeMem) {
    globalThis.__vibeMem = { kv: new Map(), sets: new Map() };
  }
  return globalThis.__vibeMem;
})();

export async function getJSON(key) {
  if (redis) {
    const val = await redis.get(key);
    // @upstash/redis auto-parses JSON; normalize to object or null.
    return val ?? null;
  }
  return mem.kv.has(key) ? JSON.parse(mem.kv.get(key)) : null;
}

export async function setJSON(key, value) {
  if (redis) {
    await redis.set(key, value);
    return;
  }
  mem.kv.set(key, JSON.stringify(value));
}

export async function addToSet(key, member) {
  if (redis) {
    await redis.sadd(key, member);
    return;
  }
  const set = mem.sets.get(key) || new Set();
  set.add(member);
  mem.sets.set(key, set);
}

export async function getSet(key) {
  if (redis) {
    const members = await redis.smembers(key);
    return members || [];
  }
  const set = mem.sets.get(key);
  return set ? Array.from(set) : [];
}
