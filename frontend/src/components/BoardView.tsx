import React from "react";
import { PlanResponse, Task, TaskStatus } from "../types";
import { TaskRow } from "./TaskRow";

const COLS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "todo",        label: "📋 Todo",        color: "#9090b0" },
  { status: "in_progress", label: "⚡ In Progress",  color: "#f0a500" },
  { status: "done",        label: "✅ Done",         color: "#26c869" },
  { status: "cancelled",   label: "🚫 Cancelled",    color: "#55556a" },
];

interface Props {
  plan: PlanResponse;
  onToggle: (id: number) => void;
  onPatch: (id: number, p: Record<string, unknown>) => void;
  onDelete: (id: number) => void;
}

export const BoardView: React.FC<Props> = ({ plan, onToggle, onPatch, onDelete }) => {
  const allTasks = plan.days.flatMap(d => d.tasks);

  return (
    <div className="board-view">
      {COLS.map(col => {
        const tasks = allTasks.filter(t => t.status === col.status);
        return (
          <div key={col.status} className="kanban-col">
            <div className="kanban-col-header">
              <div className="kanban-col-dot" style={{ background: col.color }} />
              <span className="kanban-col-title">{col.label}</span>
              <span className="kanban-col-cnt">{tasks.length}</span>
            </div>
            {tasks.length === 0
              ? <span style={{ fontSize: 11, color: "var(--muted)", padding: "4px 0" }}>Empty</span>
              : tasks.map(task => (
                  <div key={task.id} className={`kanban-card${task.done ? " done-card" : ""}`}>
                    <div className="kanban-card-title">
                      {task.title}
                    </div>
                    <div className="kanban-card-footer">
                      <span className={`task-cat-badge ${task.category}`}>{task.category}</span>
                      <span className={`prio-dot ${task.priority}`} />
                    </div>
                  </div>
                ))
            }
          </div>
        );
      })}
    </div>
  );
};
