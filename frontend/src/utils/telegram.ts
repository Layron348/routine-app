function tg(): any {
  return (window as any).Telegram?.WebApp;
}

export function isTelegram(): boolean {
  return !!tg()?.initData;
}

export function ready(): void {
  tg()?.ready();
}

export function expand(): void {
  tg()?.expand();
}

// ─── Haptic ────────────────────────────────────────────────────

export function haptic(type: "light" | "medium" | "heavy" | "success" | "error" = "light") {
  const h = tg()?.HapticFeedback;
  if (!h) return;
  try {
    if (type === "success" || type === "error") {
      h.notificationOccurred(type);
    } else {
      h.impactOccurred(type);
    }
  } catch { /* ignore */ }
}

// ─── BackButton ─────────────────────────────────────────────────

export function showBackButton(onClick: () => void): () => void {
  const webapp = tg();
  if (!webapp) return () => {};
  webapp.BackButton.show();
  webapp.BackButton.onClick(onClick);
  return () => {
    webapp.BackButton.offClick(onClick);
    webapp.BackButton.hide();
  };
}

export function hideBackButton(): void {
  tg()?.BackButton.hide();
}

// ─── MainButton ─────────────────────────────────────────────────

export function showMainButton(text: string, onClick: () => void, color?: string): () => void {
  const webapp = tg();
  if (!webapp) return () => {};
  webapp.MainButton.setText(text);
  webapp.MainButton.show();
  if (color) webapp.MainButton.setColor(color);
  webapp.MainButton.onClick(onClick);
  return () => {
    webapp.MainButton.offClick(onClick);
    webapp.MainButton.hide();
  };
}

export function hideMainButton(): void {
  tg()?.MainButton.hide();
}

// ─── CloudStorage ───────────────────────────────────────────────

export function cloudGet(key: string): Promise<string | null> {
  return new Promise((resolve) => {
    const s = tg()?.CloudStorage;
    if (!s) { resolve(null); return; }
    s.getItem(key, (_err: any, val: string) => resolve(val ?? null));
  });
}

export function cloudSet(key: string, value: string): Promise<void> {
  return new Promise((resolve) => {
    const s = tg()?.CloudStorage;
    if (!s) { resolve(); return; }
    s.setItem(key, value, () => resolve());
  });
}
