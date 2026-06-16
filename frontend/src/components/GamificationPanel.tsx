import React from "react";
import { StatsResponse } from "../types";

interface Props {
  stats: StatsResponse;
}

export const GamificationPanel: React.FC<Props> = ({ stats }) => {
  const getLevelFromStreak = (streak: number): number => {
    if (streak < 5) return 1;
    if (streak < 14) return 2;
    if (streak < 30) return 3;
    if (streak < 60) return 4;
    if (streak < 100) return 5;
    return 6;
  };

  const getLevelTitle = (level: number): string => {
    const titles = ["Novice", "Fighter", "Warrior", "Legend", "Titan", "Routine God"];
    return titles[level - 1] || "Routine God";
  };

  const getAchievements = (streak: number, percent: number): string[] => {
    const achievements = [];
    if (streak >= 7) achievements.push("🔥 Fire Week");
    if (streak >= 14) achievements.push("💪 Two Weeks Straight");
    if (streak >= 30) achievements.push("🏆 Monthly Warrior");
    if (streak >= 60) achievements.push("👑 Season Champion");
    if (percent === 100) achievements.push("💯 Perfect Week");
    return achievements;
  };

  const level = getLevelFromStreak(stats.streak);
  const levelTitle = getLevelTitle(level);
  const achievements = getAchievements(stats.streak, stats.percent);

  const levelColors = [
    "#9090b0",
    "#3b9edd",
    "#26c869",
    "#f0a500",
    "#e879f9",
    "#5e6ad2",
  ];
  const levelColor = levelColors[level - 1];

  return (
    <div className="gamification-panel">
      <div className="level-card" style={{ borderColor: levelColor }}>
        <div className="level-icon" style={{ color: levelColor }}>
          <div className="level-number">{level}</div>
        </div>
        <div className="level-info">
          <div className="level-title">{levelTitle}</div>
          <div className="level-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${((stats.streak % 7) / 7) * 100}%`,
                  background: `linear-gradient(90deg, ${levelColor}, ${levelColor}dd)`,
                }}
              />
            </div>
            <span className="progress-text">{stats.streak} days 🔥</span>
          </div>
        </div>
      </div>

      {achievements.length > 0 && (
        <div className="achievements-list">
          <div className="achievements-title">Achievements 🏅</div>
          <div className="achievements-grid">
            {achievements.map((achievement, i) => (
              <div key={i} className="achievement-badge">
                {achievement}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
