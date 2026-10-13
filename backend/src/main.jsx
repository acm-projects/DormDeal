import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./auth/authConfig";
import { onLoginSuccess, onLoginFailure } from "./auth/callbacks";
import App from "./App";
import "./styles.css";

async function start() {
  const msalInstance = new PublicClientApplication(msalConfig);
  await msalInstance.initialize();

  // Keep an active account selected after a refresh
  const accounts = msalInstance.getAllAccounts();
  if (!msalInstance.getActiveAccount() && accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  // Fires when Entra redirects back to the callback URL with a response
  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
      msalInstance.setActiveAccount(event.payload.account);
      onLoginSuccess(event.payload);
    }
    if (event.eventType === EventType.LOGIN_FAILURE) {
      onLoginFailure(event.error);
    }
  });

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MsalProvider>
    </React.StrictMode>
  );
}

start();
