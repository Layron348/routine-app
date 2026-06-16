import React from "react";
import { StatsResponse, PlanResponse } from "../types";

interface Props {
  stats: StatsResponse;
  plan: PlanResponse;
}

export const DeepInsights: React.FC<Props> = ({ stats, plan }) => {
  const allTasks = plan.days.flatMap(d => d.tasks);

  // Most productive day
  const getMostProductiveDay = () => {
    return stats.by_day.reduce((max, day) => (day.percent > max.percent ? day : max));
  };

  // Hardest category
  const getHardestCategory = () => {
    const cats: Record<string, { total: number; done: number }> = {};
    allTasks.forEach(t => {
      if (!cats[t.category]) cats[t.category] = { total: 0, done: 0 };
      cats[t.category].total += 1;
      if (t.done) cats[t.category].done += 1;
    });

    const catEmojis: Record<string, string> = {
      work: "💼",
      train: "🏋️",
      project: "🚀",
      rest: "😴",
      routine: "☀️",
    };

    return Object.entries(cats)
      .map(([cat, data]) => ({
        category: cat,
        emoji: catEmojis[cat],
        percent: data.total > 0 ? Math.round((data.done / data.total) * 100) : 0,
        total: data.total,
      }))
      .sort((a, b) => a.percent - b.percent)[0];
  };

  // Average tasks per day
  const getAverageTasksPerDay = () => {
    return Math.round((allTasks.length / stats.by_day.length) * 10) / 10;
  };

  // Completion rate
  const getCompletionRate = () => {
    return allTasks.length > 0 ? Math.round((stats.done / allTasks.length) * 100) : 0;
  };

  const mostProductive = getMostProductiveDay();
  const hardestCat = getHardestCategory();
  const avgTasks = getAverageTasksPerDay();
  const completion = getCompletionRate();

  return (
    <div className="deep-insights">
      <div className="insights-row">
        <div className="insight-card">
          <div className="insight-label">⭐ Best Day</div>
          <div className="insight-value">{mostProductive.weekday}</div>
          <div className="insight-meta">{mostProductive.percent}% completed</div>
        </div>

        <div className="insight-card">
          <div className="insight-label">📊 Avg / Day</div>
          <div className="insight-value">{avgTasks}</div>
          <div className="insight-meta">tasks per day</div>
        </div>
      </div>

      <div className="insights-row">
        <div className="insight-card warning">
          <div className="insight-label">⚠️ Toughest</div>
          <div className="insight-value">{hardestCat.emoji}</div>
          <div className="insight-meta">{hardestCat.percent}% completed</div>
        </div>

        <div className="insight-card success">
          <div className="insight-label">✅ Completed</div>
          <div className="insight-value">{completion}%</div>
          <div className="insight-meta">{stats.done} of {allTasks.length}</div>
        </div>
      </div>

      <div className="insights-tip">
        💡 <strong>Tip:</strong> Focus on {hardestCat.category} tasks!
      </div>
    </div>
  );
};
