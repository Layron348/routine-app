import React, { useState } from "react";
import { Task, TaskStatus } from "../types";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo", in_progress: "In Progress", done: "Done", cancelled: "Cancelled",
};
const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress", in_progress: "done", done: "cancelled", cancelled: "todo",
};
const CAT_EMOJI: Record<string, string> = {
  work: "💼", train: "🏋️", project: "🚀", rest: "😴", routine: "☀️",
};

interface Props {
  task: Task;
  onToggle: (id: number) => void;
  onPatch: (id: number, patch: Record<string, unknown>) => void;
  onDelete: (id: number) => void;
  showCat?: boolean;
}

export const TaskRow: React.FC<Props> = ({ task, onToggle, onPatch, onDelete, showCat = false }) => {
  const [animatingCheck, setAnimatingCheck] = useState(false);
  const [swipe, setSwipe] = useState<{ startX: number; currentX: number } | null>(null);

  const handleToggle = () => {
    setAnimatingCheck(true);
    setTimeout(() => setAnimatingCheck(false), 300);
    onToggle(task.id);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipe({ startX: e.touches[0].clientX, currentX: e.touches[0].clientX });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipe) return;
    setSwipe({ ...swipe, currentX: e.touches[0].clientX });
  };

  const handleTouchEnd = () => {
    if (!swipe) return;
    const diff = swipe.startX - swipe.currentX;
    if (diff > 80) {
      onDelete(task.id);
    }
    setSwipe(null);
  };

  return (
    <div
      className={`task-row cat-${task.category} status-${task.status}${task.done ? " done" : ""}`}
      onClick={handleToggle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: swipe ? `translateX(${swipe.currentX - swipe.startX}px)` : "translateX(0)",
        transition: swipe ? "none" : "transform 0.2s ease",
      }}
    >
      <div className={`task-check${animatingCheck ? " animate" : ""}`}>{task.done && "✓"}</div>
      <div className="task-info">
        <div className="task-name">{CAT_EMOJI[task.category]} {task.title}</div>
        <div className="task-sub">
          {task.time_start && (
            <span className="task-time">🕐 {task.time_start}{task.time_end ? `–${task.time_end}` : ""}</span>
          )}
          {showCat && (
            <span className={`task-cat-badge ${task.category}`}>{task.category}</span>
          )}
          {task.is_habit && <span className="habit-tag">🔁</span>}
        </div>
      </div>
      <span className={`prio-dot ${task.priority}`} />
      <span
        className={`status-badge ${task.status}`}
        onClick={e => { e.stopPropagation(); onPatch(task.id, { status: STATUS_CYCLE[task.status] }); }}
      >
        {STATUS_LABELS[task.status]}
      </span>
      <button
        className="task-del"
        onClick={e => { e.stopPropagation(); onDelete(task.id); }}
      >
        ×
      </button>
    </div>
  );
};
