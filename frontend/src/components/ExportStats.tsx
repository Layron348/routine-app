import React from "react";
import { StatsResponse, PlanResponse } from "../types";

interface Props {
  stats: StatsResponse;
  plan: PlanResponse;
}

export const ExportStats: React.FC<Props> = ({ stats, plan }) => {
  const generateReport = () => {
    const today = new Date().toLocaleDateString("ru-RU");
    const allTasks = plan.days.flatMap(d => d.tasks);

    const report = `📊 ROUTINE WEEK - STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: ${today}

🔥 ACHIEVEMENTS
• Streak: ${stats.streak} days
• Completed: ${stats.done}/${allTasks.length} tasks
• Progress: ${stats.percent}%

📈 BY DAY
${stats.by_day.map(d => `• ${d.weekday_full}: ${d.done}/${d.total} (${d.percent}%)`).join("\n")}

📂 BY CATEGORY
${["work", "train", "project", "rest", "routine"]
  .map(cat => {
    const total = allTasks.filter(t => t.category === cat).length;
    const done = allTasks.filter(t => t.category === cat && t.done).length;
    return `• ${cat.toUpperCase()}: ${done}/${total}`;
  })
  .filter(line => !line.includes("/0"))
  .join("\n")}

💡 AVERAGE: ${(allTasks.length / stats.by_day.length).toFixed(1)} tasks/day
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Exported from Routine Week 📅
`;

    return report;
  };

  const generateJSON = () => {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        stats,
        plan,
      },
      null,
      2
    );
  };

  const handleExport = (format: "text" | "json") => {
    const content = format === "text" ? generateReport() : generateJSON();
    const element = document.createElement("a");
    const file = new Blob([content], {
      type: format === "text" ? "text/plain" : "application/json",
    });

    element.href = URL.createObjectURL(file);
    element.download = `routine-week-${new Date().toISOString().split("T")[0]}.${format === "text" ? "txt" : "json"}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="export-stats">
      <div className="export-title">📥 Export Stats</div>

      <div className="export-buttons">
        <button
          className="export-btn export-text"
          onClick={() => handleExport("text")}
        >
          📄 Text (.txt)
        </button>
        <button className="export-btn export-json" onClick={() => handleExport("json")}>
          📋 JSON (.json)
        </button>
      </div>

      <div className="export-preview">
        <div className="export-label">Preview:</div>
        <pre className="export-content">{generateReport().slice(0, 300)}...</pre>
      </div>
    </div>
  );
};
