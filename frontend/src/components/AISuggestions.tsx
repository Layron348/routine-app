import React from "react";
import { Task, PlanResponse } from "../types";

interface Props {
  plan: PlanResponse;
  onAddSuggestion: (title: string, category: string) => void;
}

export const AISuggestions: React.FC<Props> = ({ plan, onAddSuggestion }) => {
  const allTasks = plan.days.flatMap(d => d.tasks);

  // Analyze most frequent tasks by category
  const getFrequentTasks = (): { title: string; category: string; count: number }[] => {
    const taskCounts: Record<string, number> = {};
    const taskCats: Record<string, string> = {};

    allTasks.forEach(task => {
      taskCounts[task.title] = (taskCounts[task.title] || 0) + 1;
      taskCats[task.title] = task.category;
    });

    return Object.entries(taskCounts)
      .filter(([_, count]) => count >= 3)
      .map(([title, count]) => ({
        title,
        category: taskCats[title],
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Get days with the fewest tasks
  const getEmptyDays = () => {
    return plan.days
      .filter(d => d.tasks.length < 3)
      .slice(0, 3)
      .map(d => d.weekday);
  };

  // Get recommended categories for empty days
  const getRecommendedCategories = (): { category: string; icon: string }[] => {
    const cats = ["work", "train", "project", "rest", "routine"];
    const icons: Record<string, string> = {
      work: "💼",
      train: "🏋️",
      project: "🚀",
      rest: "😴",
      routine: "☀️",
    };

    const catCount: Record<string, number> = {};
    allTasks.forEach(t => {
      catCount[t.category] = (catCount[t.category] || 0) + 1;
    });

    return cats
      .map(cat => ({
        category: cat,
        count: catCount[cat] || 0,
        icon: icons[cat],
      }))
      .sort((a, b) => a.count - b.count)
      .slice(0, 3)
      .map(c => ({ category: c.category, icon: c.icon }));
  };

  const frequentTasks = getFrequentTasks();
  const emptyDays = getEmptyDays();
  const recommendedCats = getRecommendedCategories();

  return (
    <div className="ai-suggestions">
      {frequentTasks.length > 0 && (
        <div className="suggestions-block">
          <div className="suggestions-title">🤖 Recurring tasks</div>
          <div className="suggestions-grid">
            {frequentTasks.map((task) => (
              <div key={task.title} className="suggestion-card">
                <div className="suggestion-title">{task.title}</div>
                <div className="suggestion-meta">{task.count} times this week</div>
                <button
                  className="suggestion-btn"
                  onClick={() => onAddSuggestion(task.title, task.category)}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {emptyDays.length > 0 && recommendedCats.length > 0 && (
        <div className="suggestions-block">
          <div className="suggestions-title">💡 Days need tasks</div>
          <div className="suggestions-list">
            {emptyDays.map((day, i) => (
              <div key={day} className="suggestion-hint">
                <span className="hint-day">{day}</span>
                <span className="hint-icon">→</span>
                {recommendedCats[i % recommendedCats.length] && (
                  <span className="hint-cat">
                    {recommendedCats[i % recommendedCats.length].icon}{" "}
                    {recommendedCats[i % recommendedCats.length].category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
