import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
      navigate("/curve", { replace: true });
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
    <section className="auth-screen">
      <article className="auth-card">
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
      </article>
    </section>
  );
}

export function AuthPage() {
  return (
    <div className="page-shell page-shell--auth">
      <AuthPanel />
    </div>
  );
}
