import React, { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  onClose: () => void;
}

export const PomodoroTimer: React.FC<Props> = ({ onClose }) => {
  const WORK = 25 * 60;
  const BREAK = 5 * 60;

  const [timeLeft, setTimeLeft] = useState(WORK);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<"work" | "break">("work");
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearTimer();
      if (phase === "work") {
        setSessions(s => s + 1);
        setPhase("break");
        setTimeLeft(BREAK);
        setIsRunning(false);
      } else {
        setPhase("work");
        setTimeLeft(WORK);
        setIsRunning(false);
      }
    }
    return clearTimer;
  }, [isRunning, timeLeft, phase, clearTimer, BREAK, WORK]);

  const toggle = () => setIsRunning(r => !r);
  const reset = () => {
    clearTimer();
    setIsRunning(false);
    setPhase("work");
    setTimeLeft(WORK);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="pomodoro-overlay" onClick={onClose}>
      <div className="pomodoro-modal" onClick={e => e.stopPropagation()}>
        <div className="pomodoro-title">
          {phase === "work" ? "🎯 Focus" : "☕ Break"}
        </div>

        <div className={`pomodoro-timer ${phase}`}>
          {formatTime(timeLeft)}
        </div>

        <div className="pomodoro-controls">
          <button
            className={`pomodoro-btn ${isRunning ? "pomodoro-btn-pause" : "pomodoro-btn-start"}`}
            onClick={toggle}
          >
            {isRunning ? "⏸ Pause" : "▶ Start"}
          </button>
          <button className="pomodoro-btn pomodoro-btn-reset" onClick={reset}>
            ↺ Reset
          </button>
        </div>

        <div className="pomodoro-sessions">
          Sessions completed: {sessions}
        </div>

        <button className="pomodoro-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
