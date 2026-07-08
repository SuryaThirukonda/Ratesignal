import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const TOKEN_KEY = "ratesignal.jwt";
const AuthContext = createContext(null);

async function verifyToken(token) {
  return apiRequest("/api/auth/me", {
    method: "POST",
    token
  });
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    status: "checking",
    user: null,
    token: null,
    error: null
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const storedToken = window.localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        if (!cancelled) {
          setState({
            status: "anonymous",
            user: null,
            token: null,
            error: null
          });
        }
        return;
      }

      try {
        const session = await verifyToken(storedToken);

        if (!cancelled) {
          setState({
            status: "authenticated",
            user: session.user ?? null,
            token: storedToken,
            error: null
          });
        }
      } catch (error) {
        window.localStorage.removeItem(TOKEN_KEY);

        if (!cancelled) {
          setState({
            status: "anonymous",
            user: null,
            token: null,
            error: error.message || "Session expired"
          });
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  async function persistSession(token) {
    window.localStorage.setItem(TOKEN_KEY, token);

    try {
      const session = await verifyToken(token);

      setState({
        status: "authenticated",
        user: session.user ?? null,
        token,
        error: null
      });

      return session.user ?? null;
    } catch (error) {
      window.localStorage.removeItem(TOKEN_KEY);
      setState({
        status: "anonymous",
        user: null,
        token: null,
        error: error.message || "Session verification failed"
      });
      throw error;
    }
  }

  async function login(credentials) {
    const result = await apiRequest("/api/auth/login", {
      method: "POST",
      body: credentials
    });

    if (!result?.token) {
      throw new Error("Login response did not include a token.");
    }

    return persistSession(result.token);
  }

  async function register(payload) {
    return apiRequest("/api/auth/register", {
      method: "POST",
      body: payload
    });
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setState({
      status: "anonymous",
      user: null,
      token: null,
      error: null
    });
  }

  const value = {
    ...state,
    isAuthenticated: state.status === "authenticated",
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
