import React from "react";

interface Props {
  theme: "dark" | "light";
  onThemeToggle: () => void;
  compact: boolean;
  onCompactToggle: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ theme, onThemeToggle, compact, onCompactToggle, onClose }) => {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">Appearance</div>
          <div className="settings-row">
            <span className="settings-label">
              <span className="settings-label-icon">{theme === "dark" ? "🌙" : "☀️"}</span>
              Dark theme
            </span>
            <button
              className={`toggle-switch${theme === "dark" ? " active" : ""}`}
              onClick={onThemeToggle}
            />
          </div>
          <div className="settings-row">
            <span className="settings-label">
              <span className="settings-label-icon">📏</span>
              Compact mode
            </span>
            <button
              className={`toggle-switch${compact ? " active" : ""}`}
              onClick={onCompactToggle}
            />
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">App</div>
          <div style={{ marginTop: 8, textAlign: "center", fontSize: 11, color: "var(--muted)" }}>
            Routine Week v0.1.0
          </div>
        </div>
      </div>
    </div>
  );
};
