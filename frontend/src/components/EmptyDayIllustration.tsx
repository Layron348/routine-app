import React from "react";

interface Props {
  weekday?: string;
}

export const EmptyDayIllustration: React.FC<Props> = ({ weekday }) => {
  const emojis = ["😴", "🎉", "🚀", "📚", "🎬", "🌟", "✨"];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  return (
    <div className="empty-day-container">
      <div className="empty-day-emoji">{emoji}</div>
      <div className="empty-day-text">It's empty! Add your first task 👇</div>
    </div>
  );
};
