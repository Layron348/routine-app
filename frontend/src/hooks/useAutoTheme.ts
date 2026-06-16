import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useAutoTheme(enabled: boolean): Theme {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    return saved ?? "dark";
  });

  useEffect(() => {
    if (!enabled) return;

    const update = () => {
      const hour = new Date().getHours();
      const auto: Theme = hour >= 7 && hour < 20 ? "light" : "dark";
      setTheme(auto);
    };

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [enabled]);

  return theme;
}
