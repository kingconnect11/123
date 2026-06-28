# 🌉 Vibe Meter

Call your energy, forecast your night, and broadcast how down you are to
imbibe — so you and your crew can read the room *before* you commit to the
plan. Marin County × San Francisco theme, with a **Pride Weekend mode** 🏳️‍🌈.

![Vibe Meter](public/preview.svg)

## What it does

- **Log in** — you and at least one other person each create an account.
- **Energy right now** — a 1–10 slider (1 = running on fumes, 10 = sending it).
- **Energy forecast tonight** — add timeline points like `10pm → 1`,
  `After nap → 8`, `Late night → 3`. Planning a nap? Drop `1 · 1 · 1 · 8`
  and your crew knows you'll resurrect later.
- **Willingness to imbibe** — a four-step scale:
  - 🚫 **Not drinking** — sober & sparkling
  - 🍺 **Early night** — one or two, home by 11
  - 🍸 **Down to clown** — 2–4 drinks, here for it
  - 🥃 **Full send** — no limits, no curfew
- **Down for tonight** — quick chips: 🍔 burgers, 🥃 tequila, 🍺 IPAs,
  🍸 martinis, 💃 dancing, 🏳️‍🌈 pride parade, 🏖️ Marin beach, and more.
- **The fine print** — a free-text note for the nuance.
- See **everyone's** card side by side, auto-refreshing every few seconds.
- **Pride Weekend mode** repaints the whole app in rainbow (on by default).

## Tech

- **Next.js 14** (App Router) — deploys to Vercel with zero config.
- Simple cookie session auth (`jose` + `bcryptjs`) — no third-party auth needed.
- Shared storage via **Vercel KV / Upstash Redis** (free tier). Falls back to
  in-memory for local dev.

---

## Run it locally

```bash
npm install
cp .env.example .env.local   # set AUTH_SECRET to any long random string
npm run dev
```

Open <http://localhost:3000>, create an account, and play. Locally it uses an
in-memory store, so two browsers on the same dev server will see each other.

---

## Deploy to Vercel

1. **Push this repo to GitHub** (already done if you're reading this there).
2. In Vercel, **New Project → Import** this repository. Vercel auto-detects
   Next.js — no build settings to change.
3. Add an environment variable:
   - `AUTH_SECRET` = any long random string
     (`openssl rand -base64 32` is a good way to make one).
4. **Deploy.** The app is now live. You can already log in.

### Make it shared between people (free)

So you *and your friend* see each other's vibes from different devices, the
app needs a shared store. The free way:

1. In your Vercel project → **Storage** → **Create Database** →
   choose **Upstash (Redis / KV)** → **Free** plan → connect it to this project.
2. Vercel automatically injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   (and/or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) — the app
   reads either pair.
3. **Redeploy** (Vercel → Deployments → ⋯ → Redeploy).

That's it. The yellow "shared storage isn't connected" banner disappears and
your check-ins sync across everyone. To stop any cost, just delete the store —
there's nothing else billing.

> **Note:** until you connect the store, accounts and vibes live only in a
> single server's memory and won't reliably sync between people. The app tells
> you with a banner.

---

## How sharing works

Everyone who creates an account shows up as a card. Your own card is editable;
everyone else's is read-only and refreshes automatically. There's no "friend"
system — anyone with the URL and an account is part of the crew, which is
exactly what you want for a couple of friends planning a night out.

## Environment variables

| Variable | Required | What it's for |
| --- | --- | --- |
| `AUTH_SECRET` | yes (prod) | Signs login session cookies. Any long random string. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | for sharing | Vercel KV connection (auto-set by the integration). |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | alt | Upstash naming — either pair works. |

Pour responsibly, rally accordingly. 🌁
