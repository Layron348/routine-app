import { useState, useEffect, useCallback } from "react";
import { PlanResponse, StatsResponse, TaskSuggestion } from "../types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function ensureOk(response: Response) {
  if (!response.ok) {
    let message = `API error: ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) message = Array.isArray(body.detail) ? message : String(body.detail);
    } catch {
      // Keep the status-based message when the response is not JSON.
    }
    throw new Error(message);
  }
  return response;
}

export function usePlan(token: string | null) {
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [pR, sR] = await Promise.all([
        fetch(`${BASE}/plan`, { headers: getAuthHeaders() }),
        fetch(`${BASE}/stats`, { headers: getAuthHeaders() })
      ]);
      await Promise.all([ensureOk(pR), ensureOk(sR)]);
      const [p, s] = await Promise.all([pR.json(), sR.json()]);
      setPlan(p); setStats(s); setError(null);
    } catch { setError("Failed to load data"); }
    finally { setLoading(false); }
  }, [token]);

  const fetchSuggestions = useCallback(async (targetDate?: string) => {
    if (!token) return;
    try {
      const url = new URL(`${BASE}/tasks/suggestions`, window.location.origin);
      if (targetDate) url.searchParams.set("target_date", targetDate);
      const res = await fetch(url.toString().replace(window.location.origin, ""), { headers: getAuthHeaders() });
      await ensureOk(res);
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
  }, [token]);

  useEffect(() => { if (token) fetchAll(); }, [token, fetchAll]);

  const toggleTask = async (taskId: number) => {
    setPlan(prev => prev ? { ...prev, days: prev.days.map(d => ({
      ...d, tasks: d.tasks.map(t => t.id === taskId ? { ...t, done: !t.done, status: t.done ? "todo" : "done" } : t)
    }))} : prev);
    try {
      const res = await fetch(`${BASE}/tasks/toggle`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ task_id: taskId })
      });
      await ensureOk(res);
    } catch { setError("Update error"); }
    finally { await fetchAll(); }
  };

  const patchTask = async (taskId: number, patch: Record<string, unknown>) => {
    try {
      const res = await fetch(`${BASE}/tasks`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ task_id: taskId, ...patch })
      });
      await ensureOk(res);
      await fetchAll();
    } catch { setError("Edit error"); }
  };

  const addTask = async (date: string, title: string, category: string, priority = "medium", time_start: string | null = null, time_end: string | null = null, is_habit = false) => {
    try {
      const res = await fetch(`${BASE}/tasks`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ date, title, category, priority, time_start, time_end, is_habit })
      });
      await ensureOk(res);
      await fetchAll();
      await fetchSuggestions(date);
    } catch { setError("Failed to create task"); }
  };

  const deleteTask = async (taskId: number) => {
    const deletedTask = plan?.days.flatMap(d => d.tasks).find(t => t.id === taskId);
    setPlan(prev => prev ? { ...prev, days: prev.days.map(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== taskId) }))} : prev);
    try {
      const res = await fetch(`${BASE}/tasks`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ task_id: taskId })
      });
      await ensureOk(res);
    } catch { setError("Delete error"); }
    finally { await fetchAll(); }
    return deletedTask ?? null;
  };

  const restoreTask = async (task: {
    date: string;
    category: string;
    title: string;
    priority: string;
    time_start: string | null;
    time_end: string | null;
    is_habit: boolean;
  }) => {
    await addTask(task.date, task.title, task.category, task.priority, task.time_start, task.time_end, task.is_habit);
  };

  return { plan, stats, suggestions, loading, error, toggleTask, patchTask, addTask, deleteTask, restoreTask, refresh: fetchAll, fetchSuggestions };
}
