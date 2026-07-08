import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CurvePreview() {
  return (
    <div className="curve-preview" aria-hidden="true">
      <div className="curve-preview-head">
        <span>Curve sketch</span>
        <span>Local UI</span>
      </div>
      <svg viewBox="0 0 520 220" className="curve-svg" role="presentation">
        <defs>
          <linearGradient id="curveStroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="55%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <path
          d="M28 168 C 96 150, 128 118, 178 100 S 286 82, 334 92 S 420 124, 492 58"
          fill="none"
          stroke="url(#curveStroke)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {[
          [28, 168],
          [132, 122],
          [238, 94],
          [340, 92],
          [492, 58]
        ].map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r="8" fill="currentColor" />
        ))}
      </svg>
      <div className="curve-preview-footer">
        <span>Token check</span>
        <span>/api/auth/me</span>
      </div>
    </div>
  );
}

function AuthPanel() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: ""
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
  });

  function switchMode(nextMode) {
    setError("");
    setNotice("");
    setMode(nextMode);
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await login(loginForm);
      navigate("/welcome", { replace: true });
    } catch (authError) {
      setError(authError.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await register(registerForm);
      setNotice("Account created. Switch to sign in and use the same username or email.");
      setMode("login");
      setLoginForm({
        identifier: registerForm.username,
        password: registerForm.password
      });
    } catch (authError) {
      setError(authError.message || "Unable to create the account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-layout">
      <article className="hero-panel">
        <p className="eyebrow">Yield curve research desk</p>
        <h1>Authenticate in a browser, then swap in your forecast views later.</h1>
        <p className="lead">
          This frontend keeps the first pass intentionally small: JWT storage,
          session verification through <code>/api/auth/me</code>, and a clean
          route for the post-login shell.
        </p>

        <div className="signal-row">
          <span className="signal-pill">POST /api/auth/login</span>
          <span className="signal-pill">POST /api/auth/register</span>
          <span className="signal-pill">JWT in localStorage</span>
        </div>

        <CurvePreview />
      </article>

      <article className="auth-card">
        <div className="card-head">
          <div>
            <p className="eyebrow">Session access</p>
            <h2>{mode === "login" ? "Welcome back" : "Create an account"}</h2>
          </div>

          <div className="tab-group" role="tablist" aria-label="Auth mode">
            <button
              type="button"
              className={`tab-button ${mode === "login" ? "active" : ""}`}
              onClick={() => switchMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`tab-button ${mode === "register" ? "active" : ""}`}
              onClick={() => switchMode("register")}
            >
              Register
            </button>
          </div>
        </div>

        <p className="card-intro">
          The token is stored locally, then rechecked against your backend before
          the dashboard opens.
        </p>

        {notice ? <div className="notice-banner">{notice}</div> : null}
        {error ? <div className="error-banner">{error}</div> : null}

        {mode === "login" ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label className="field">
              <span>Username or email</span>
              <input
                autoComplete="username"
                autoFocus
                required
                value={loginForm.identifier}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    identifier: event.target.value
                  }))
                }
                placeholder="name@domain.com or your handle"
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                autoComplete="current-password"
                required
                type="password"
                minLength={8}
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    password: event.target.value
                  }))
                }
                placeholder="password"
              />
            </label>

            <button type="submit" className="submit-button" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in and verify"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="field-grid">
              <label className="field">
                <span>Name</span>
                <input
                  autoComplete="name"
                  autoFocus
                  required
                  value={registerForm.name}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  placeholder="Alex Morgan"
                />
              </label>

              <label className="field">
                <span>Username</span>
                <input
                  autoComplete="username"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="^[a-zA-Z0-9_]+$"
                  value={registerForm.username}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      username: event.target.value
                    }))
                  }
                  placeholder="alex_morgan"
                />
              </label>
            </div>

            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                required
                type="email"
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    email: event.target.value
                  }))
                }
                placeholder="alex@company.com"
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                autoComplete="new-password"
                required
                type="password"
                minLength={8}
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    password: event.target.value
                  }))
                }
                placeholder="At least 8 characters"
              />
            </label>

            <button type="submit" className="submit-button" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}

        <p className="fineprint">
          Local dev uses a Vite proxy, so `/api` reaches your backend on port 9000.
        </p>
      </article>
    </section>
  );
}

export function AuthPage() {
  return (
    <div className="page-shell">
      <AuthPanel />
    </div>
  );
}
