export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "high" | "medium" | "low";
export type TaskCategory = "work" | "train" | "project" | "rest" | "routine";
export type RepeatType = "none" | "daily" | "weekly" | "monthly" | "weekdays" | "custom";

export interface Task {
  id: number;
  date: string;
  category: TaskCategory;
  title: string;
  done: boolean;
  status: TaskStatus;
  shift: string | null;
  priority: TaskPriority;
  time_start: string | null;
  time_end: string | null;
  is_habit: boolean;
  tags?: string[];
  time_estimate?: number;
  repeat_type?: RepeatType;
  repeat_days?: string[];
  remind_time?: string;
  archived?: boolean;
}

export interface TaskSuggestion {
  title: string;
  category: TaskCategory;
  count: number;
  is_smart?: boolean;
}

export interface DayPlan {
  date: string;
  weekday: string;
  tasks: Task[];
}

export interface PlanResponse {
  week_start: string;
  days: DayPlan[];
}

export interface DayStat {
  weekday: string;
  weekday_full: string;
  date: string;
  total: number;
  done: number;
  percent: number;
}

export interface StatsResponse {
  streak: number;
  total: number;
  done: number;
  percent: number;
  by_day: DayStat[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserLevel {
  level: number;
  title: string;
  experience: number;
  nextLevelExp: number;
  achievements: Achievement[];
}

export interface UserRewards {
  xp: number;
  coins: number;
  level: number;
}

export interface UserCategory {
  id: string;
  value: string;
  label: string;
  icon: string;
  color: string;
}
