import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import { isSupabaseConfigured, supabase } from "../auth/supabaseClient";

export default function Success() {
  const isMicrosoftAuthenticated = useIsAuthenticated();
  const [checkingSession, setCheckingSession] = useState(isSupabaseConfigured);
  const [hasCustomSession, setHasCustomSession] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined;

    let mounted = true;
    const token = sessionStorage.getItem("dormdeal_session");
    if (!token) {
      setCheckingSession(false);
      return undefined;
    }

    supabase.rpc("validate_session", { p_token: token }).then(({ data, error }) => {
      if (!mounted) return;
      if (error || !data) sessionStorage.removeItem("dormdeal_session");
      setHasCustomSession(Boolean(data) && !error);
      setCheckingSession(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (checkingSession && !isMicrosoftAuthenticated) {
    return (
      <main className="shell center">
        <p className="status" role="status">Checking your login…</p>
      </main>
    );
  }

  if (!isMicrosoftAuthenticated && !hasCustomSession) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="shell center">
      <h1 className="success-title">login was successful.</h1>
    </main>
  );
}
