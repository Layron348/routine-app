import React from "react";
import { UserRewards } from "../types";

interface Props {
  rewards: UserRewards;
}

export const RewardSystem: React.FC<Props> = ({ rewards }) => {
  const getRewardColor = (level: number) => {
    const colors = [
      "var(--muted)",
      "var(--blue)",
      "var(--green)",
      "var(--amber)",
      "var(--red)",
      "var(--purple)",
    ];
    return colors[Math.min(level - 1, colors.length - 1)];
  };

  const getLevelTitle = (level: number) => {
    const titles = ["Novice", "Fighter", "Warrior", "Legend", "Titan", "Routine God"];
    return titles[Math.min(level - 1, titles.length - 1)];
  };

  const nextLevelXp = 100 * rewards.level;
  const xpPercent = (rewards.xp / nextLevelXp) * 100;

  return (
    <div className="reward-system">
      <div className="reward-card" style={{ borderColor: getRewardColor(rewards.level) }}>
        <div className="reward-header">
          <div className="reward-level" style={{ color: getRewardColor(rewards.level) }}>
            Lvl {rewards.level}
          </div>
          <div className="reward-title">{getLevelTitle(rewards.level)}</div>
        </div>

        <div className="reward-stats">
          <div className="reward-stat">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{rewards.xp} XP</span>
          </div>
          <div className="reward-stat">
            <span className="stat-icon">💰</span>
            <span className="stat-value">{rewards.coins}</span>
          </div>
        </div>

        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
        </div>
        <div className="xp-text">
          {rewards.xp} / {nextLevelXp} XP
        </div>
      </div>

      <div className="rewards-tips">
        💡 +10 XP per completed task | +5 coins per streak
      </div>
    </div>
  );
};
