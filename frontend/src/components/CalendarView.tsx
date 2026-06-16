import React from "react";
import { PlanResponse } from "../types";

interface Props {
  plan: PlanResponse;
  onDateSelect: (date: string) => void;
}

export const CalendarView: React.FC<Props> = ({ plan, onDateSelect }) => {
  const allTasks = plan.days.flatMap(d => d.tasks);

  const getMonthDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getTaskCount = (date: Date | null) => {
    if (!date) return 0;
    const dateStr = date.toISOString().split("T")[0];
    return allTasks.filter(t => t.date === dateStr).length;
  };

  const getDoneCount = (date: Date | null) => {
    if (!date) return 0;
    const dateStr = date.toISOString().split("T")[0];
    return allTasks.filter(t => t.date === dateStr && t.done).length;
  };

  const monthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const days = getMonthDays();
  const weekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="calendar-view">
      <div className="calendar-header">{monthName}</div>

      <div className="calendar-weekdays">
        {weekdayNames.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((date, i) => {
          const taskCount = getTaskCount(date);
          const doneCount = getDoneCount(date);
          const isToday = date && date.toDateString() === new Date().toDateString();

          return (
            <button
              key={i}
              className={`calendar-day${!date ? " empty" : ""}${isToday ? " today" : ""}`}
              onClick={() => date && onDateSelect(date.toISOString().split("T")[0])}
            >
              {date && (
                <>
                  <span className="calendar-day-num">{date.getDate()}</span>
                  {taskCount > 0 && (
                    <span className="calendar-day-badge">
                      {doneCount}/{taskCount}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
