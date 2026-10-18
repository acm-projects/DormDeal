// Callback methods that run when Entra responds to the sign-in.
// Put your own logic here (call your backend, store a session, analytics, etc.).

export function onLoginSuccess(result) {
  const { account, accessToken, idToken } = result;
  console.log("Signed in as", account.username);
  // Example: send the ID token to your API to create a session
  // fetch("/api/session", { method: "POST", headers: { Authorization: `Bearer ${idToken}` } });
  sessionStorage.removeItem("auth_error");
}

export function onLoginFailure(error) {
  console.error("Sign-in failed", error);
  sessionStorage.setItem(
    "auth_error",
    error?.errorMessage || error?.message || "Sign-in failed. Please try again."
  );
}
