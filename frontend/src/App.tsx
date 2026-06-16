import React, { useState, useEffect } from "react";
import "./styles.css";
import { usePlan } from "./hooks/usePlan";
import { useAutoTheme } from "./hooks/useAutoTheme";
import { Header } from "./components/Header";
import { StreakPanel } from "./components/StreakPanel";
import { SearchTasks } from "./components/SearchTasks";
import { FocusMode } from "./components/FocusMode";
import { QuickCapture } from "./components/QuickCapture";
import { DayGroup } from "./components/DayGroup";
import { BoardView } from "./components/BoardView";
import { InsightsView } from "./components/InsightsView";
import { ToastProvider, useToast } from "./components/Toast";
import { SettingsModal } from "./components/SettingsModal";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { Confetti } from "./components/Confetti";
import { haptic, isTelegram, ready, expand, showBackButton, hideBackButton, cloudGet, cloudSet } from "./utils/telegram";
import Auth from "./components/Auth";
import { Task } from "./types";

type Tab = "today" | "week" | "board" | "insights";

const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
  { id: "today",     icon: "☀️", label: "Today" },
  { id: "week",      icon: "📅", label: "Week" },
  { id: "board",     icon: "⚡", label: "Board" },
  { id: "insights",  icon: "📊", label: "Insights" },
];

function AppInner() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<{ id: number; email: string; name: string } | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const savedTheme = (localStorage.getItem("theme") as "dark" | "light" | "auto") || "auto";
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "auto">(savedTheme);
  const [tab, setTab] = useState<Tab>("today");
  const [showSearch, setShowSearch] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [autoThemeEnabled, setAutoThemeEnabled] = useState(savedTheme === "auto");
  const [compact, setCompact] = useState(localStorage.getItem("compact") === "true");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const autoTheme = useAutoTheme(autoThemeEnabled);
  const activeTheme = themeMode === "auto" ? autoTheme : themeMode;

  useEffect(() => {
    if (isTelegram()) {
      ready();
      expand();
    }
  }, []);

  const anyModalOpen = showSearch || showSettings || showPomodoro || focusMode;

  useEffect(() => {
    if (!isTelegram()) return;
    if (anyModalOpen) {
      const hide = showBackButton(() => {
        setShowSearch(false);
        setShowSettings(false);
        setShowPomodoro(false);
        setFocusMode(false);
      });
      return hide;
    }
    hideBackButton();
  }, [anyModalOpen]);

  const { plan, stats, suggestions, loading, error, toggleTask, patchTask, addTask, deleteTask, restoreTask, fetchSuggestions } = usePlan(token);
  const { show: showToast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", activeTheme);
    localStorage.setItem("theme", themeMode);
    if (isTelegram()) cloudSet("theme", themeMode);
  }, [activeTheme, themeMode]);

  useEffect(() => {
    document.documentElement.style.setProperty("--compact", compact ? "1" : "0");
    localStorage.setItem("compact", String(compact));
  }, [compact]);

  useEffect(() => {
    if (!isTelegram()) return;
    cloudGet("theme").then((saved) => {
      if (saved && (saved === "dark" || saved === "light" || saved === "auto")) {
        setThemeMode(saved);
        setAutoThemeEnabled(saved === "auto");
      }
    });
  }, []);

  useEffect(() => {
    if (plan && stats && stats.percent === 100 && stats.total > 0) {
      setShowConfetti(true);
      haptic("success");
    }
  }, [stats?.percent, stats?.total]);

  useEffect(() => {
    if (token && tab === "today" && plan) {
      const today = new Date().toISOString().split("T")[0];
      fetchSuggestions(today);
    }
  }, [token, tab, plan?.days[0]?.date, fetchSuggestions]);

  const handleLogin = (newToken: string, newUser: { id: number; email: string; name: string }) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const cycleTheme = () => {
    const next = themeMode === "light" ? "dark" : themeMode === "dark" ? "auto" : "light";
    setThemeMode(next);
    setAutoThemeEnabled(next === "auto");
    const labels = { light: "Light", dark: "Dark", auto: "Auto" };
    showToast(`Theme: ${labels[next]}`, "info");
  };

  if (!token || !user) {
    return <Auth onLogin={handleLogin} />;
  }

  const today = new Date().toISOString().split("T")[0];

  if (loading) return (
    <div className="center-screen">
      <div className="spinner" />
      <span>Loading...</span>
    </div>
  );
  if (error || !plan || !stats) return (
    <div className="center-screen">
      <div className="error-box">
        {error ?? "Failed to load data"}<br />
        <small>Make sure the backend is running on :8000</small>
      </div>
    </div>
  );

  const todayPlan = plan.days.find(d => d.date === today);
  const allTasks = plan.days.flatMap(d => d.tasks);

  const handleSearchSelect = (task: Task) => {
    if (task.date !== today) setTab("week");
  };

  const handleQuickCapture = (title: string, category: string) => {
    addTask(today, title, category, "medium", null, null, false);
    showToast("Task added!", "success");
    haptic("light");
  };

  const handleToggle = (id: number) => {
    const task = allTasks.find(t => t.id === id);
    toggleTask(id);
    if (task) {
      if (!task.done) {
        showToast(`✅ ${task.title}`, "success");
        haptic("success");
      } else {
        showToast("Task restored", "info");
      }
    }
  };

  const handleDelete = async (id: number) => {
    setConfirmDelete(id);
  };

  const toggleCompact = () => setCompact(c => !c);

  const confirmDeleteTask = async () => {
    if (confirmDelete === null) return;
    const task = allTasks.find(t => t.id === confirmDelete);
    const deleted = await deleteTask(confirmDelete);
    setConfirmDelete(null);
    if (deleted) {
      showToast(
        <span>
          Task deleted{" "}
          <button
            className="toast-undo"
            onClick={() => {
              restoreTask(deleted);
              showToast("Task restored", "success");
            }}
          >
            Undo
          </button>
        </span> as unknown as string,
        "info"
      );
    } else if (task) {
      showToast("Task deleted", "info");
    }
  };

  if (focusMode && todayPlan) {
    return (
      <FocusMode
        day={todayPlan}
        onClose={() => setFocusMode(false)}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="app">
        <Header
          streak={stats.streak}
          theme={activeTheme}
          onThemeToggle={cycleTheme}
          onSettingsOpen={() => setShowSettings(true)}
          userName={user.name}
        />

      <div className="action-row">
        <button className="action-btn action-btn-ghost" onClick={() => setShowSearch(true)}>
          🔍 Search
        </button>
        <button className="action-btn action-btn-ghost" onClick={() => setShowPomodoro(true)}>
          🍅 Timer
        </button>
        <button className="action-btn action-btn-primary" onClick={() => setFocusMode(true)}>
          🎯 Focus
        </button>
      </div>

      {tab !== "board" && tab !== "insights" && <StreakPanel stats={stats} />}

      <div className="section-hd">
        <span className="section-hd-title">
          {tab === "today" && "Today's Tasks"}
          {tab === "week"  && "This Week"}
          {tab === "board" && "Board — all tasks"}
          {tab === "insights" && "Insights"}
        </span>
      </div>

      <div className="tab-content">
        {tab === "today" && todayPlan && (
          <div style={{ padding: "0 18px" }}>
            <DayGroup day={todayPlan} today={today} suggestions={suggestions}
              onToggle={handleToggle} onPatch={patchTask} onAdd={addTask} onDelete={handleDelete}
              defaultOpen={true} />
          </div>
        )}

        {tab === "week" && (
          <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {plan.days.map(d => (
              <DayGroup key={d.date} day={d} today={today}
                onToggle={handleToggle} onPatch={patchTask} onAdd={addTask} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {tab === "board" && (
          <BoardView plan={plan} onToggle={handleToggle} onPatch={patchTask} onDelete={handleDelete} />
        )}

        {tab === "insights" && (
          <InsightsView stats={stats} plan={plan} onAdd={addTask} />
        )}
      </div>

      <QuickCapture onAdd={handleQuickCapture} />

      <div className="bottom-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item${tab === item.id ? " active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-label">{item.label}</span>
          </button>
        ))}
      </div>

      {showSearch && (
        <SearchTasks
          allTasks={allTasks}
          onSelect={handleSearchSelect}
          onClose={() => setShowSearch(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          theme={themeMode === "auto" ? activeTheme : themeMode}
          onThemeToggle={cycleTheme}
          compact={compact}
          onCompactToggle={toggleCompact}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showPomodoro && (
        <PomodoroTimer onClose={() => setShowPomodoro(false)} />
      )}

      {confirmDelete !== null && (
        <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-title">Delete task?</div>
            <div className="confirm-text">This action cannot be undone</div>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDeleteTask}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <Confetti active={showConfetti} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
