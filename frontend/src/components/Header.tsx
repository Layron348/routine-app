import React from "react";

interface Props {
  streak: number;
  theme: "dark" | "light";
  onThemeToggle: () => void;
  onSettingsOpen: () => void;
  userName?: string;
}

export const Header: React.FC<Props> = ({ streak, theme, onThemeToggle, onSettingsOpen, userName }) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  const weekday = ["sun","mon","tue","wed","thu","fri","sat"][today.getDay()];

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-brand">
          <div className="brand-icon">📅</div>
          <span className="brand-name">Routine Week</span>
        </div>
      </div>
      <div className="topbar-center">
        <div className="date-chip">{weekday}, {dateStr}</div>
      </div>
      <div className="topbar-right">
        <div className="streak-pill">🔥 {streak}</div>
        <button className="icon-btn" onClick={onSettingsOpen} title="Settings">
          ⚙
        </button>
      </div>
    </div>
  );
};
