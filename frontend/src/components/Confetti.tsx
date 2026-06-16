import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

export const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6"];
    const next: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.3,
      duration: 0.8 + Math.random() * 0.7,
      size: 6 + Math.random() * 8,
    }));
    setParticles(next);
    const t = setTimeout(() => setParticles([]), 2000);
    return () => clearTimeout(t);
  }, [active]);

  if (!particles.length) return null;

  return (
    <div className="confetti-overlay">
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            background: p.color,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
