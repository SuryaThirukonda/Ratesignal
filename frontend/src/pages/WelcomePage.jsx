import { useAuth } from "../context/AuthContext";

export function WelcomePage() {
  const { user } = useAuth();

  return (
    <div className="page-shell">
      <section className="welcome-layout">
        <article className="welcome-card welcome-spotlight">
          <p className="eyebrow">Authenticated</p>
          <h1>Welcome{user?.name ? `, ${user.name}` : ""}.</h1>
          <p className="lead">
            Your JWT is stored locally and this session has been verified through
            <code>/api/auth/me</code>.
          </p>

          <div className="status-grid">
            <div className="status-item">
              <span>Username</span>
              <strong>{user?.username ?? "Unknown"}</strong>
            </div>
            <div className="status-item">
              <span>Name</span>
              <strong>{user?.name ?? "Unknown"}</strong>
            </div>
            <div className="status-item">
              <span>Storage</span>
              <strong>localStorage</strong>
            </div>
          </div>
        </article>

        <article className="welcome-card welcome-muted">
          <p className="eyebrow">Next up</p>
          <h2>This shell is ready for your yield curve views.</h2>
          <p>
            Forecast panels, backtests, regime filters, and any other routes you
            add later can slot in without changing the auth flow.
          </p>
        </article>
      </section>
    </div>
  );
}
