import React from "react";
import { DayPlan } from "../types";

interface Props {
  day: DayPlan;
  onClose: () => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const FocusMode: React.FC<Props> = ({ day, onClose, onToggle, onDelete }) => {
  const done = day.tasks.filter(t => t.done).length;
  const total = day.tasks.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const getEmoji = (cat: string) => {
    const emojis: Record<string, string> = {
      work: "💼",
      train: "🏋️",
      project: "🚀",
      rest: "😴",
      routine: "☀️",
    };
    return emojis[cat] || "📌";
  };

  return (
    <div className="focus-mode">
      <div className="focus-header">
        <button className="focus-close" onClick={onClose}>
          ✕
        </button>
        <div className="focus-title">
          <div className="focus-date">{day.weekday}</div>
          <div className="focus-progress">
            {done} of {total}
          </div>
        </div>
        <div className="focus-percent">{percent}%</div>
      </div>

      <div className="focus-circle">
        <svg viewBox="0 0 200 200" className="focus-ring">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="var(--s3)"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeDasharray={`${(percent / 100) * 565} 565`}
            className="focus-ring-fill"
            style={{ transform: "rotate(-90deg)", transformOrigin: "100px 100px" }}
          />
        </svg>
        <div className="focus-center">
          <div className="focus-percent-large">{percent}%</div>
          <div className="focus-subtitle">Completed</div>
        </div>
      </div>

      <div className="focus-tasks">
        {day.tasks.map((task, idx) => (
          <div key={task.id} className={`focus-task${task.done ? " done" : ""}`}>
            <div className="focus-task-num">{idx + 1}</div>
            <div className="focus-task-content">
              <div className="focus-task-title">
                {getEmoji(task.category)} {task.title}
              </div>
              {task.time_start && (
                <div className="focus-task-time">🕐 {task.time_start}</div>
              )}
            </div>
            <input
              type="checkbox"
              className="focus-checkbox"
              checked={task.done}
              onChange={() => onToggle(task.id)}
            />
          </div>
        ))}
      </div>

      <div className="focus-footer">
        💪 You've got this! Stay focused and get it all done!
      </div>
    </div>
  );
};
