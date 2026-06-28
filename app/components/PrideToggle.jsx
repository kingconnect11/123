"use client";

export default function PrideToggle({ pride, onToggle }) {
  return (
    <button
      className={`pride-toggle ${pride ? "on" : ""}`}
      onClick={onToggle}
      title="Toggle Pride Weekend mode"
      type="button"
    >
      <span>🏳️‍🌈</span>
      <span>{pride ? "Pride Mode ON" : "Pride Mode"}</span>
    </button>
  );
}
