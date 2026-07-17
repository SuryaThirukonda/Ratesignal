import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export function TopBar() {
  const navigate = useNavigate();
  const { theme, toggleTheme, isAuthenticated, logout } = useThemeAndAuth();

  function handleSignOut() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="shell-header">
      <strong className="shell-brand">Ratesignal</strong>

      <div className="shell-actions">
        {isAuthenticated ? (
          <nav className="shell-nav" aria-label="Primary navigation">
            <button type="button" className="ghost-button" onClick={() => navigate("/curve")}>Curve</button>
            <button type="button" className="ghost-button" onClick={() => navigate("/history")}>History</button>
            <button type="button" className="ghost-button" onClick={() => navigate("/predictions")}>Predictions</button>
          </nav>
        ) : null}
        <button type="button" className="ghost-button" onClick={toggleTheme}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>

        {isAuthenticated ? (
          <button type="button" className="ghost-button" onClick={handleSignOut}>
            Sign out
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
