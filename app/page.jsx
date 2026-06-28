"use client";

import { useEffect, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";

export default function Page() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [pride, setPride] = useState(true);

  // Load pride-mode preference (defaults ON — it's Pride Weekend).
  useEffect(() => {
    const saved = localStorage.getItem("vibe_pride");
    if (saved !== null) setPride(saved === "1");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-pride", pride ? "true" : "false");
    localStorage.setItem("vibe_pride", pride ? "1" : "0");
  }, [pride]);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return <div className="loading">Reading the vibes…</div>;
  }

  if (!user) {
    return (
      <AuthScreen
        pride={pride}
        onTogglePride={() => setPride((p) => !p)}
        onAuthed={(u) => setUser(u)}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      pride={pride}
      onTogglePride={() => setPride((p) => !p)}
      onLogout={() => setUser(null)}
    />
  );
}
