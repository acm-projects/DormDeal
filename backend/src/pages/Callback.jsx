import { Navigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";

// Entra redirects here after sign-in. MsalProvider reads the response from
// the URL automatically; once it finishes, send the user back home.
export default function Callback() {
  const { inProgress } = useMsal();

  if (inProgress === InteractionStatus.None) {
    return <Navigate to="/success" replace />;
  }

  return (
    <main className="shell center">
      <p className="status" role="status">Signing you in…</p>
    </main>
  );
}
