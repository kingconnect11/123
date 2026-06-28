"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PrideToggle from "./PrideToggle";
import {
  IMBIBE_LEVELS,
  DOWN_FOR_OPTIONS,
  energyWord,
} from "@/lib/constants";

const TL_PRESETS = [
  { label: "+1 hr", energy: 5 },
  { label: "+2 hr", energy: 5 },
  { label: "After nap", energy: 8 },
  { label: "Late night", energy: 3 },
];

export default function Dashboard({ user, pride, onTogglePride, onLogout }) {
  const [people, setPeople] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);

  // Local editable copy of my status.
  const [draft, setDraft] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const draftLoaded = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/status");
    if (res.status === 401) {
      onLogout();
      return;
    }
    const data = await res.json();
    setPeople(data.people || []);
    setLoaded(true);
    // Seed my editable draft once from the server.
    if (!draftLoaded.current) {
      const mine = (data.people || []).find((p) => p.isMe);
      if (mine) {
        setDraft(mine.status);
        draftLoaded.current = true;
        if (mine.status.updatedAt) setSavedAt(mine.status.updatedAt);
      }
    }
  }, [onLogout]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setStorageWarning(!d.shared))
      .catch(() => {});
  }, []);

  // Poll for the crew's updates (but don't clobber unsaved edits).
  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (!dirty) load();
    }, 12000);
    return () => clearInterval(id);
  }, [load, dirty]);

  function update(patch) {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (res.ok) {
        setDraft(data.status);
        setDirty(false);
        setSavedAt(data.status.updatedAt);
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    onLogout();
  }

  const others = people.filter((p) => !p.isMe);

  return (
    <div className="wrap">
      <header className="topbar">
        <div className="brand">
          <span className="bridge">🌉</span>
          <div>
            <h1>Vibe Meter</h1>
            <div className="tag">
              {pride
                ? "🏳️‍🌈 Pride Weekend · Marin × SF"
                : "Marin County × San Francisco"}
            </div>
          </div>
        </div>
        <div className="topbar-actions">
          <PrideToggle pride={pride} onToggle={onTogglePride} />
          <span className="who">
            Hey <b>{user.displayName}</b>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {storageWarning && (
        <div className="banner">
          <span>⚠️</span>
          <div>
            <b>Shared storage isn’t connected yet.</b> Your vibe saves on this
            server only and won’t sync to your crew. Connect a free Vercel KV /
            Upstash store (Project → Storage), then redeploy — see the README.
          </div>
        </div>
      )}

      <div className="grid">
        {draft && (
          <MyCard
            user={user}
            draft={draft}
            update={update}
            pride={pride}
            savedAt={savedAt}
          />
        )}

        {loaded && others.length === 0 && (
          <div className="card">
            <div className="section-label">🍸 Your crew</div>
            <p className="muted">
              Nobody else has checked in yet. Send them the link and have them
              create an account — their vibe will pop up right here.
            </p>
          </div>
        )}

        {others.map((p) => (
          <FriendCard key={p.username} person={p} />
        ))}
      </div>

      {draft && (
        <div className="save-bar">
          <div>
            {dirty ? (
              <span className="muted">Unsaved changes to your vibe</span>
            ) : savedAt ? (
              <span className="saved-tick">✓ Vibe shared</span>
            ) : (
              <span className="muted">Set your vibe and share it ↓</span>
            )}
            {savedAt > 0 && (
              <div className="updated">Last updated {timeAgo(savedAt)}</div>
            )}
          </div>
          <div className="spacer" />
          <button
            className="btn btn-primary"
            onClick={save}
            disabled={saving || !dirty}
          >
            {saving ? "Sharing…" : dirty ? "Share my vibe →" : "Up to date"}
          </button>
        </div>
      )}

      <div className="footer-note">
        Built for nights out in the Bay 🌁 · Pour responsibly, rally accordingly.
      </div>
    </div>
  );
}

/* ── My editable card ──────────────────────────────────────────────── */
function MyCard({ user, draft, update, savedAt }) {
  function setTimelinePoint(i, patch) {
    const tl = draft.timeline.map((p, idx) => (idx === i ? { ...p, ...patch } : p));
    update({ timeline: tl });
  }
  function addPoint(preset) {
    const tl = [...draft.timeline, { label: preset.label, energy: preset.energy }];
    update({ timeline: tl.slice(0, 12) });
  }
  function removePoint(i) {
    const tl = draft.timeline.filter((_, idx) => idx !== i);
    update({ timeline: tl.length ? tl : [{ label: "Now", energy: 5 }] });
  }
  function toggleDownFor(id) {
    const has = draft.downFor.includes(id);
    update({
      downFor: has
        ? draft.downFor.filter((d) => d !== id)
        : [...draft.downFor, id],
    });
  }

  return (
    <section className="card me">
      <div className="card-head">
        <div className="person">
          <div className="avatar">{initials(user.displayName)}</div>
          <div>
            <div className="name">{user.displayName}</div>
            <div className="sub">@{user.username}</div>
          </div>
        </div>
        <span className="badge-me">You</span>
      </div>

      {/* Energy now */}
      <div className="section">
        <div className="section-label">⚡ Energy right now</div>
        <div className="energy-big">
          <span className="num">{draft.energyNow}</span>
          <span className="den">/ 10</span>
          <span className="word">{energyWord(draft.energyNow)}</span>
        </div>
        <div className="meter-track">
          <div
            className="meter-fill"
            style={{ width: `${draft.energyNow * 10}%` }}
          />
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={draft.energyNow}
          onChange={(e) => {
            const v = Number(e.target.value);
            // Keep the first timeline point ("Now") in sync if it's "Now".
            const tl = draft.timeline.map((p, idx) =>
              idx === 0 && /now/i.test(p.label) ? { ...p, energy: v } : p
            );
            update({ energyNow: v, timeline: tl });
          }}
        />
      </div>

      {/* Forecast */}
      <div className="section">
        <div className="section-label">📈 Energy forecast tonight</div>
        <ForecastBars timeline={draft.timeline} />
        <div style={{ marginTop: 10 }}>
          {draft.timeline.map((p, i) => (
            <div className="tl-row" key={i}>
              <input
                type="text"
                value={p.label}
                onChange={(e) => setTimelinePoint(i, { label: e.target.value })}
                placeholder="When? (e.g. 10pm, After nap)"
              />
              <div className="tl-en">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={p.energy}
                  onChange={(e) =>
                    setTimelinePoint(i, { energy: Number(e.target.value) })
                  }
                  style={{ margin: 0 }}
                />
                <b>{p.energy}</b>
              </div>
              <button
                className="tl-x"
                onClick={() => removePoint(i)}
                title="Remove"
                type="button"
              >
                ×
              </button>
            </div>
          ))}
          <div className="tl-presets">
            {TL_PRESETS.map((preset) => (
              <button
                key={preset.label}
                className="btn btn-ghost btn-sm"
                onClick={() => addPoint(preset)}
                type="button"
              >
                + {preset.label}
              </button>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            Tip: nap incoming? Try 1 → 1 → 1 → then 8 after you wake up. 😴
          </p>
        </div>
      </div>

      {/* Imbibe scale */}
      <div className="section">
        <div className="section-label">🍸 Willingness to imbibe</div>
        <div className="imbibe-grid">
          {IMBIBE_LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              className={`imbibe-opt ${draft.imbibe === lvl.id ? "on" : ""}`}
              onClick={() => update({ imbibe: lvl.id })}
            >
              <div className="io-top">
                <span className="io-emoji">{lvl.emoji}</span>
                {lvl.label}
              </div>
              <div className="io-blurb">{lvl.blurb}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Down for tonight */}
      <div className="section">
        <div className="section-label">🎉 Down for tonight</div>
        <div className="chips">
          {DOWN_FOR_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`chip ${draft.downFor.includes(o.id) ? "on" : ""}`}
              onClick={() => toggleDownFor(o.id)}
            >
              <span className="chip-emoji">{o.emoji}</span>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="section">
        <div className="section-label">📝 The fine print</div>
        <textarea
          rows={2}
          maxLength={280}
          value={draft.note}
          onChange={(e) => update({ note: e.target.value })}
          placeholder="“Down for burgers in Marin then dancing in the Castro — but I fade at midnight.”"
        />
      </div>
    </section>
  );
}

/* ── Friend's read-only card ───────────────────────────────────────── */
function FriendCard({ person }) {
  const s = person.status;
  const imbibe = IMBIBE_LEVELS.find((l) => l.id === s.imbibe) || IMBIBE_LEVELS[1];
  const downFor = DOWN_FOR_OPTIONS.filter((o) => s.downFor.includes(o.id));

  return (
    <section className="card">
      <div className="card-head">
        <div className="person">
          <div className="avatar">{initials(person.displayName)}</div>
          <div>
            <div className="name">{person.displayName}</div>
            <div className="sub">
              {s.updatedAt ? `updated ${timeAgo(s.updatedAt)}` : "no check-in yet"}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-label">⚡ Energy right now</div>
        <div className="energy-big">
          <span className="num">{s.energyNow}</span>
          <span className="den">/ 10</span>
          <span className="word">{energyWord(s.energyNow)}</span>
        </div>
        <div className="meter-track">
          <div className="meter-fill" style={{ width: `${s.energyNow * 10}%` }} />
        </div>
      </div>

      <div className="section">
        <div className="section-label">📈 Energy forecast tonight</div>
        <ForecastBars timeline={s.timeline} />
      </div>

      <div className="section">
        <div className="section-label">🍸 Willingness to imbibe</div>
        <div className="imbibe-readout">
          <span className="big">{imbibe.emoji}</span>
          <div>
            <div>{imbibe.label}</div>
            <div className="blurb">{imbibe.blurb}</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-label">🎉 Down for tonight</div>
        {downFor.length ? (
          <div className="chips">
            {downFor.map((o) => (
              <span key={o.id} className="chip on read">
                <span className="chip-emoji">{o.emoji}</span>
                {o.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="muted">Hasn’t called it yet.</p>
        )}
      </div>

      {s.note && (
        <div className="section">
          <div className="section-label">📝 The fine print</div>
          <div className="note-read">{s.note}</div>
        </div>
      )}
    </section>
  );
}

/* ── Forecast bar chart ────────────────────────────────────────────── */
function ForecastBars({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return <p className="muted">No forecast yet.</p>;
  }
  return (
    <div className="forecast">
      {timeline.map((p, i) => (
        <div className="fc-col" key={i}>
          <span className="fc-energy">{p.energy}</span>
          <div className="fc-bar-wrap">
            <div className="fc-bar" style={{ height: `${p.energy * 10}%` }} />
          </div>
          <span className="fc-label">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── helpers ───────────────────────────────────────────────────────── */
function initials(name) {
  return (name || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(ts) {
  if (!ts) return "—";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 45) return "just now";
  if (s < 90) return "a minute ago";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}
