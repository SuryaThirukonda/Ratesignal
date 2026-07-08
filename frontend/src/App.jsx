import { Navigate, Route, Routes } from "react-router-dom";
import { TopBar } from "./components/TopBar";
import { useAuth } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { WelcomePage } from "./pages/WelcomePage";

function BootScreen() {
  return (
    <section className="boot-screen" aria-live="polite">
      <div className="boot-card">
        <div className="boot-loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="eyebrow">Loading session</p>
        <h1>Checking for an existing JWT...</h1>
        <p>We are validating the token against <code>/api/auth/me</code>.</p>
      </div>
    </section>
  );
}

function AppRoutes() {
  const { status, isAuthenticated } = useAuth();

  if (status === "checking") {
    return <BootScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/welcome" replace /> : <AuthPage />} />
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/welcome" replace /> : <AuthPage />} />
      <Route
        path="/welcome"
        element={isAuthenticated ? <WelcomePage /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/welcome" : "/"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="app-main">
        <AppRoutes />
      </main>
    </div>
  );
}
