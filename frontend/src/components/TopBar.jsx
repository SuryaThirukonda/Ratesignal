import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export function TopBar() {
  const { theme, toggleTheme, isAuthenticated, user, logout } = useThemeAndAuth();

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" role="presentation">
            <path
              d="M8 31c5-8 10-12 16-12s9 4 16 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M8 37c5-2 10-5 16-5s9 2 16-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.45"
            />
          </svg>
        </div>
        <div className="brand-copy">
          <strong>Ratesignal</strong>
          <span>Yield curve auth shell</span>
        </div>
      </div>

      <div className="topbar-actions">
        <button type="button" className="ghost-button" onClick={toggleTheme}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        {isAuthenticated ? (
          <button type="button" className="ghost-button" onClick={logout}>
            Sign out{user?.username ? ` - ${user.username}` : ""}
          </button>
        ) : null}
      </div>
    </header>
  );
}

function useThemeAndAuth() {
  const theme = useTheme();
  const auth = useAuth();

  return { ...theme, ...auth };
}
