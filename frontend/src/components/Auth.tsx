import React, { useState, useEffect } from "react";

interface AuthProps {
  onLogin: (token: string, user: { id: number; email: string; name: string }) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export default function Auth({ onLogin }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initData) {
      telegramLogin(tg.initData);
    }
  }, []);

  const telegramLogin = async (initData: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init_data: initData }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Telegram auth failed");
      }
      onLogin(data.access_token, { id: data.user_id, email: data.email || "", name: data.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth error");
      setLoading(false);
    }
  };

  const demoLogin = () => {
    const params = new URLSearchParams();
    params.set("user", JSON.stringify({ id: 12345, first_name: "Demo User", username: "demo" }));
    params.set("auth_date", String(Math.floor(Date.now() / 1000)));
    params.set("query_id", "demo_query_id");
    telegramLogin(params.toString());
  };

  const isTelegram = !!(window as any).Telegram?.WebApp?.initData;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon">📅</div>
          <h1 className="auth-title">Routine Week</h1>
          <p className="auth-subtitle">
            {loading ? "Authorizing..." : "Weekly planner in Telegram"}
          </p>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        {loading ? (
          <div className="center-screen" style={{ minHeight: "auto", padding: "24px 0" }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            {isTelegram ? (
              <button className="auth-submit" onClick={() => {
                const tg = (window as any).Telegram?.WebApp;
                if (tg?.initData) telegramLogin(tg.initData);
              }}>
                🔐 Sign in with Telegram
              </button>
            ) : (
              <>
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text2)", fontSize: 13 }}>
                  Open this app via the Telegram Bot.
                </div>
                {import.meta.env.DEV && (
                  <button className="auth-submit" onClick={demoLogin} style={{ background: "var(--s3)", color: "var(--text2)" }}>
                    🧪 Demo login (dev)
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
