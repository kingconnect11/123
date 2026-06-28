"use client";

import { useState } from "react";
import PrideToggle from "./PrideToggle";

export default function AuthScreen({ pride, onTogglePride, onAuthed }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { username, password }
          : { username, displayName, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      onAuthed(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <PrideToggle pride={pride} onToggle={onTogglePride} />
        </div>
        <div className="auth-emoji-row">🌉 🍔 🥃 🍸 🍺 💃</div>
        <h1>Vibe Meter</h1>
        <p className="sub">
          Marin&nbsp;·&nbsp;SF&nbsp;·&nbsp;Pride Weekend. Call your energy, your
          forecast, and how down you are to imbibe.
        </p>

        <div className="auth-tabs">
          <button
            className={mode === "login" ? "on" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
            type="button"
          >
            Log in
          </button>
          <button
            className={mode === "register" ? "on" : ""}
            onClick={() => {
              setMode("register");
              setError("");
            }}
            type="button"
          >
            Create account
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. philip"
              autoCapitalize="none"
              autoCorrect="off"
              required
            />
          </div>

          {mode === "register" && (
            <div className="field">
              <label>Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="What should we call you?"
              />
            </div>
          )}

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
            {busy
              ? "One sec…"
              : mode === "login"
              ? "Log in →"
              : "Create account →"}
          </button>
        </form>

        <div className="auth-foot">
          {mode === "login"
            ? "New here? Hit “Create account” — then send the link to your crew."
            : "Make one for you and one for your partner-in-crime. 🍸"}
        </div>
      </div>
    </div>
  );
}
