import React, { useState } from "react";
import { Task } from "../types";

interface Props {
  allTasks: Task[];
  onSelect: (task: Task) => void;
  onClose: () => void;
}

export const SearchTasks: React.FC<Props> = ({ allTasks, onSelect, onClose }) => {
  const [query, setQuery] = useState("");

  const filtered = allTasks
    .filter(
      (t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 10);

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <input
          className="search-input"
          placeholder="🔍 Search tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        {filtered.length > 0 ? (
          <div className="search-results">
            {filtered.map((task) => (
              <div
                key={task.id}
                className="search-result-item"
                onClick={() => {
                  onSelect(task);
                  onClose();
                }}
              >
                <span className={`search-cat cat-${task.category}`}>●</span>
                <div className="search-result-info">
                  <div className="search-result-title">{task.title}</div>
                  <div className="search-result-meta">
                    {task.date} • {task.category}
                  </div>
                </div>
                <span className={`search-prio prio-${task.priority}`}>●</span>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="search-empty">No tasks found 🤔</div>
        ) : null}
      </div>
    </div>
  );
};
