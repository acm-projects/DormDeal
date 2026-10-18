import { useEffect, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../auth/authConfig";
import {
  isSupabaseConfigured,
  supabase,
  supabaseConfigurationError,
} from "../auth/supabaseClient";

function MicrosoftLogo() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export default function Home() {
  const { instance, inProgress } = useMsal();
  const isMicrosoftAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(isSupabaseConfigured);
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [error, setError] = useState(sessionStorage.getItem("auth_error") || "");
  const [message, setMessage] = useState("");
  const microsoftBusy = inProgress !== "none";

  useEffect(() => {
    if (isMicrosoftAuthenticated) {
      navigate("/success", { replace: true });
    }
  }, [isMicrosoftAuthenticated, navigate]);

  useEffect(() => {
    if (!supabase) return undefined;

    let mounted = true;
    const token = sessionStorage.getItem("dormdeal_session");
    if (!token) {
      setCheckingSession(false);
      return undefined;
    }

    supabase.rpc("validate_session", { p_token: token }).then(({ data, error: sessionError }) => {
      if (!mounted) return;
      setCheckingSession(false);
      if (sessionError || !data) {
        sessionStorage.removeItem("dormdeal_session");
        return;
      }
      navigate("/success", { replace: true });
    });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const signIn = async () => {
    setError("");
    sessionStorage.removeItem("auth_error");
    try {
      // Sends the browser to Microsoft Entra; the response comes back to the redirect URI
      await instance.loginRedirect(loginRequest);
    } catch (e) {
      setError(e.errorMessage || e.message);
    }
  };

  const signInWithUsername = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError(supabaseConfigurationError);
      return;
    }

    setFormBusy(true);
    const { data: token, error: signInError } = await supabase.rpc("login_user", {
      p_username: username.trim(),
      p_password: password,
    });
    setFormBusy(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setPassword("");
    sessionStorage.setItem("dormdeal_session", token);
    navigate("/success", { replace: true });
  };

  const registerWithUsername = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError(supabaseConfigurationError);
      return;
    }

    setFormBusy(true);
    const { error: registrationError } = await supabase.rpc("register_user", {
      p_username: username.trim(),
      p_password: password,
    });
    setFormBusy(false);

    if (registrationError) {
      setError(registrationError.message);
      return;
    }

    setPassword("");
    setMode("login");
    setMessage("Registration successful. You can sign in now.");
  };

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
  };

  return (
    <main className="shell">
      <section className="brand">
        <h1 className="wordmark">DormDeal</h1>
        <p className="tag">Sign in to see what's on offer.</p>
      </section>
      <section className="panel">
        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button
            className={mode === "login" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => changeMode("login")}
          >
            Sign in
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => changeMode("register")}
          >
            Register
          </button>
        </div>
        <h2>{mode === "login" ? "Sign in" : "Create an account"}</h2>
        <p className="muted">
          {mode === "login"
            ? "Use your username and password to continue."
            : "Choose a username and password to register."}
        </p>
        <form
          className="login-form"
          onSubmit={mode === "login" ? signInWithUsername : registerWithUsername}
        >
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            minLength="3"
            maxLength="30"
            pattern="[A-Za-z0-9_]+"
            title="Use 3–30 letters, numbers, or underscores."
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button className="btn-primary" type="submit" disabled={formBusy || checkingSession}>
            {formBusy
              ? mode === "login" ? "Signing in…" : "Registering…"
              : checkingSession
                ? "Checking session…"
                : mode === "login" ? "Sign in" : "Register"}
          </button>
        </form>
        {mode === "login" && (
          <>
            <div className="divider"><span>or</span></div>
            <button className="btn-ms" onClick={signIn} disabled={microsoftBusy}>
              <MicrosoftLogo />
              <span>{microsoftBusy ? "Redirecting…" : "Login with Microsoft"}</span>
            </button>
          </>
        )}
        {!isSupabaseConfigured && (
          <p className="notice" role="status">{supabaseConfigurationError}</p>
        )}
        {message && <p className="success-message" role="status">{message}</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </section>
    </main>
  );
}
