import React, { useState } from "react";

const CATS = [
  { v: "routine", l: "☀️", t: "Routine" },
  { v: "project", l: "🚀", t: "Project" },
  { v: "work",    l: "💼", t: "Work" },
  { v: "train",   l: "🏋️", t: "Workout" },
  { v: "rest",    l: "😴", t: "Rest" },
];

interface Props {
  onAdd: (title: string, category: string) => void;
}

export const QuickCapture: React.FC<Props> = ({ onAdd }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("routine");

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), category);
    setTitle("");
    setCategory("routine");
    setShowModal(false);
  };

  return (
    <>
      <button
        className="quick-capture-btn"
        onClick={() => setShowModal(true)}
        title="Quick add task"
      >
        ⚡
      </button>

      {showModal && (
        <div className="quick-capture-modal" onClick={() => setShowModal(false)}>
          <div className="quick-capture-content" onClick={e => e.stopPropagation()}>
            <div className="quick-capture-header">
              <span>⚡ Quick Task</span>
              <button className="quick-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <input
              className="quick-input"
              placeholder="What needs to be done?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              autoFocus
            />

            <div className="quick-cat-row">
              {CATS.map(c => (
                <button
                  key={c.v}
                  className={`quick-cat-btn${category === c.v ? " active" : ""}`}
                  onClick={() => setCategory(c.v)}
                  title={c.t}
                >
                  {c.l}
                </button>
              ))}
            </div>

            <div className="quick-hint">💡 Press Enter to add</div>

            <button className="quick-add-btn" onClick={handleAdd}>
              Add Task
            </button>
          </div>
        </div>
      )}
    </>
  );
};
