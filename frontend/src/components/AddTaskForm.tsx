import React, { useState } from "react";
import { TaskSuggestion } from "../types";

const CATS = [
  { v: "routine", l: "☀️ Routine" }, { v: "project", l: "🚀 Project" },
  { v: "work",    l: "💼 Work"  }, { v: "train",   l: "🏋️ Workout" },
  { v: "rest",    l: "😴 Rest"   },
];
const PRIOS = [
  { v: "high", l: "🔴 High" }, { v: "medium", l: "🟡 Medium" }, { v: "low", l: "⚪ Low" },
];

interface Props {
  date: string;
  suggestions?: TaskSuggestion[];
  onAdd: (date: string, title: string, cat: string, prio: string, ts: string|null, te: string|null, habit: boolean) => void;
  onClose: () => void;
}

export const AddTaskForm: React.FC<Props> = ({ date, suggestions = [], onAdd, onClose }) => {
  const [title, setTitle]   = useState("");
  const [cat, setCat]       = useState("routine");
  const [prio, setPrio]     = useState("medium");
  const [ts, setTs]         = useState("");
  const [te, setTe]         = useState("");
  const [habit, setHabit]   = useState(false);

  const submit = () => {
    if (!title.trim()) return;
    onAdd(date, title.trim(), cat, prio, ts||null, te||null, habit);
    onClose();
  };

  const applySuggestion = (s: TaskSuggestion) => {
    setTitle(s.title);
    setCat(s.category);
  };

  return (
    <div className="add-form">
      <input className="add-input" placeholder="Task name..." value={title}
        onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} autoFocus />

      {suggestions.length > 0 && (
        <div className="suggestion-chips">
          {suggestions.slice(0, 5).map(s => (
            <button
              key={`${s.title}-${s.category}`}
              className="suggestion-chip"
              onClick={() => applySuggestion(s)}
              title={`${s.is_smart ? "Smart suggestion" : "Frequent task"}: ${s.count} times`}
            >
              {s.title}
              {s.count > 1 && <span className="suggestion-count">{s.count}</span>}
            </button>
          ))}
        </div>
      )}

      <div className="add-form-row">
        <select className="add-select" value={cat} onChange={e => setCat(e.target.value)}>
          {CATS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
        </select>
        <select className="add-select" value={prio} onChange={e => setPrio(e.target.value)}>
          {PRIOS.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
        </select>
      </div>
      <div className="add-form-row">
        <input className="add-input" type="time" value={ts} onChange={e => setTs(e.target.value)} placeholder="Start" />
        <input className="add-input" type="time" value={te} onChange={e => setTe(e.target.value)} placeholder="End" />
      </div>
      <label className="habit-check-label">
        <input type="checkbox" checked={habit} onChange={e => setHabit(e.target.checked)} />
        🔁 Habit — repeat weekly
      </label>
      <div className="add-form-actions">
        <button className="btn-add" onClick={submit}>Add</button>
        <button className="btn-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};
