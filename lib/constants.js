// Shared, dependency-free constants usable by both client and server.

export const IMBIBE_LEVELS = [
  { id: "dry", label: "Not drinking", blurb: "Sober & sparkling", emoji: "🚫" },
  {
    id: "early",
    label: "Early night",
    blurb: "One or two, home by 11",
    emoji: "🍺",
  },
  {
    id: "clown",
    label: "Down to clown",
    blurb: "2–4 drinks, here for it",
    emoji: "🍸",
  },
  {
    id: "fullsend",
    label: "Full send",
    blurb: "No limits, no curfew",
    emoji: "🥃",
  },
];

export const DOWN_FOR_OPTIONS = [
  { id: "burgers", label: "Burgers", emoji: "🍔" },
  { id: "tequila", label: "Tequila", emoji: "🥃" },
  { id: "ipas", label: "IPAs", emoji: "🍺" },
  { id: "martinis", label: "Martinis", emoji: "🍸" },
  { id: "dancing", label: "Dancing", emoji: "💃" },
  { id: "dinner", label: "Dinner", emoji: "🍽️" },
  { id: "patio", label: "Patio hang", emoji: "🌅" },
  { id: "couch", label: "Couch & chill", emoji: "🛋️" },
  { id: "parade", label: "Pride parade", emoji: "🏳️‍🌈" },
  { id: "beach", label: "Beach / Marin", emoji: "🏖️" },
  { id: "latenight", label: "Late night", emoji: "🌙" },
  { id: "coffee", label: "Coffee first", emoji: "☕" },
];

export const ENERGY_WORDS = [
  "", // index 0 unused
  "Running on fumes",
  "Barely flickering",
  "Low & slow",
  "Warming up",
  "Steady",
  "Feeling good",
  "Charged up",
  "Buzzing",
  "Electric",
  "Absolutely sending it",
];

export function energyWord(n) {
  const i = Math.max(1, Math.min(10, Math.round(n || 1)));
  return ENERGY_WORDS[i];
}
