import { getJSON, setJSON } from "./store";
import { IMBIBE_LEVELS, DOWN_FOR_OPTIONS } from "./constants";

const statusKey = (username) => `vibe:status:${username.toLowerCase()}`;

export { IMBIBE_LEVELS, DOWN_FOR_OPTIONS };

export function defaultStatus() {
  return {
    energyNow: 5,
    imbibe: "early",
    downFor: [],
    note: "",
    timeline: [{ label: "Now", energy: 5 }],
    updatedAt: null,
  };
}

function sanitize(input) {
  const base = defaultStatus();
  const out = { ...base };
  if (typeof input?.energyNow === "number") {
    out.energyNow = clamp(Math.round(input.energyNow), 1, 10);
  }
  if (
    typeof input?.imbibe === "string" &&
    IMBIBE_LEVELS.some((l) => l.id === input.imbibe)
  ) {
    out.imbibe = input.imbibe;
  }
  if (Array.isArray(input?.downFor)) {
    const valid = new Set(DOWN_FOR_OPTIONS.map((o) => o.id));
    out.downFor = input.downFor.filter((d) => valid.has(d)).slice(0, 12);
  }
  if (typeof input?.note === "string") {
    out.note = input.note.slice(0, 280);
  }
  if (Array.isArray(input?.timeline)) {
    out.timeline = input.timeline
      .slice(0, 12)
      .map((p) => ({
        label: String(p?.label ?? "").slice(0, 24) || "—",
        energy: clamp(Math.round(Number(p?.energy) || 1), 1, 10),
      }));
    if (out.timeline.length === 0) out.timeline = base.timeline;
  }
  return out;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

export async function getStatus(username) {
  const stored = await getJSON(statusKey(username));
  return stored ? { ...defaultStatus(), ...stored } : defaultStatus();
}

export async function setStatus(username, input) {
  const clean = sanitize(input);
  clean.updatedAt = Date.now();
  await setJSON(statusKey(username), clean);
  return clean;
}
