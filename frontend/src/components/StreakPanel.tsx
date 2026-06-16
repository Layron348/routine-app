import React from "react";
import { StatsResponse } from "../types";

interface Props { stats: StatsResponse; }

export const StreakPanel: React.FC<Props> = ({ stats }) => {
  const today = new Date().toISOString().split("T")[0];
  const r = 32, circ = 2 * Math.PI * r;
  const offset = circ - (stats.percent / 100) * circ;

  return (
    <>
      <div className="summary">
        <div className="summary-card sc-streak">
          <div className="sc-val">🔥{stats.streak}</div>
          <div className="sc-lbl">Streak</div>
        </div>
        <div className="summary-card sc-done">
          <div className="sc-val">{stats.done}</div>
          <div className="sc-lbl">Done</div>
        </div>
        <div className="summary-card sc-pct">
          <div className="sc-val">{stats.percent}%</div>
          <div className="sc-lbl">Progress</div>
        </div>
      </div>

      <div className="progress-row">
        <div className="ring-wrap">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle className="ring-bg" cx="36" cy="36" r={r} />
            <circle className="ring-fg" cx="36" cy="36" r={r}
              strokeDasharray={circ} strokeDashoffset={offset} />
          </svg>
          <div className="ring-inner">
            <span className="ring-pct">{stats.percent}%</span>
            <span className="ring-sub">week</span>
          </div>
        </div>

        <div className="week-bars">
          {stats.by_day.map(d => (
            <div key={d.date} className="wbar">
              <div className="wbar-track">
                <div className={`wbar-fill${d.date === today ? " is-today" : ""}`}
                  style={{ height: `${d.percent}%` }} />
              </div>
              <span className="wbar-lbl">{d.weekday}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
