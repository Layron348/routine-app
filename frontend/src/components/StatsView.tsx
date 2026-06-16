import React, { useState } from "react";
import { StatsResponse, PlanResponse } from "../types";
import { ProgressRing } from "./ProgressRing";
import { AISuggestions } from "./AISuggestions";
import { DeepInsights } from "./DeepInsights";
import { ExportStats } from "./ExportStats";

const CAT_CONFIG = [
  { k: "work",    e: "💼", l: "Work",     c: "var(--cat-work)" },
  { k: "train",   e: "🏋️", l: "Workouts", c: "var(--cat-train)" },
  { k: "project", e: "🚀", l: "Project",  c: "var(--cat-project)" },
  { k: "rest",    e: "😴", l: "Rest",     c: "var(--cat-rest)" },
  { k: "routine", e: "☀️", l: "Routine",  c: "var(--cat-routine)" },
];

interface Props {
  stats: StatsResponse;
  plan: PlanResponse;
  onAdd: (date: string, title: string, category: string, priority: string, time_start: string | null, time_end: string | null, is_habit: boolean) => void;
}

export const StatsView: React.FC<Props> = ({ stats, plan, onAdd }) => {
  const [showInsights, setShowInsights] = useState(true);
  const today = new Date().toISOString().split("T")[0];
  const allTasks = plan.days.flatMap(d => d.tasks);
  const cats = CAT_CONFIG.map(c => ({
    ...c,
    total: allTasks.filter(t => t.category === c.k).length,
    done:  allTasks.filter(t => t.category === c.k && t.done).length,
  })).filter(c => c.total > 0);

  const handleAddSuggestion = (title: string, category: string) => {
    onAdd(today, title, category, "medium", null, null, false);
  };

  return (
    <div className="stats-view">
      <div className="stats-block">
        <div className="stats-block-title">Overall Progress</div>
        <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
          <ProgressRing percent={stats.percent} size={120} strokeWidth={8} label="this week" />
        </div>
      </div>

      {showInsights && (
        <>
          <DeepInsights stats={stats} plan={plan} />
          <AISuggestions plan={plan} onAddSuggestion={handleAddSuggestion} />
        </>
      )}

      <div className="stats-block">
        <div className="stats-block-title">Daily Progress</div>
        {stats.by_day.map(d => (
          <div key={d.date} className="stats-day-row">
            <span className="sdr-name">{d.weekday}</span>
            <div className="sdr-bar">
              <div className={`sdr-fill${d.date === today ? " today" : ""}`}
                style={{ width: `${d.percent}%` }} />
            </div>
            <span className="sdr-num">{d.done}/{d.total}</span>
          </div>
        ))}
      </div>

      {cats.length > 0 && (
        <div className="stats-block">
          <div className="stats-block-title">By Category</div>
          <div className="cat-grid">
            {cats.map(c => (
              <div key={c.k} className="cat-item">
                <span className="cat-item-icon">{c.e}</span>
                <div>
                  <div className="cat-item-name">{c.l}</div>
                  <div className="cat-item-val" style={{ color: c.c }}>
                    {c.done}<span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 400 }}>/{c.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-block">
        <div className="stats-block-title">Week Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { l: "🔥 Streak",  v: `${stats.streak} days`, c: "#fb923c" },
            { l: "✅ Done",    v: String(stats.done),      c: "var(--green)" },
            { l: "📊 Total",   v: `${stats.percent}%`,     c: "var(--accent-h)" },
          ].map(s => (
            <div key={s.l} className="cat-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <div className="cat-item-val" style={{ color: s.c }}>{s.v}</div>
              <div className="cat-item-name">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <ExportStats stats={stats} plan={plan} />
    </div>
  );
};
