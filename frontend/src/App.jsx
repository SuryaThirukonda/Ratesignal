import { Navigate, Route, Routes } from "react-router-dom";
import { TopBar } from "./components/TopBar";
import { useAuth } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MaturityHistoryPage } from "./pages/MaturityHistoryPage";
import { PredictionsPage } from "./pages/PredictionsPage";

function BootScreen() {
  return (
    <section className="boot-screen" aria-live="polite">
      <div className="boot-card">
        <p className="boot-copy">Loading session...</p>
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
      <Route path="/" element={isAuthenticated ? <Navigate to="/curve" replace /> : <AuthPage />} />
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/curve" replace /> : <AuthPage />} />
      <Route
        path="/curve"
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/history"
        element={isAuthenticated ? <MaturityHistoryPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/predictions"
        element={isAuthenticated ? <PredictionsPage /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/curve" : "/"} replace />} />
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
