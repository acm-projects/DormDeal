# DormDeal – Microsoft and email login

## 1. Entra app setup (App registrations > DormDeal)
1. **Overview**: copy *Application (client) ID* and *Directory (tenant) ID*.
2. **Authentication > Add a platform > Single-page application**.
3. Add Redirect URI: `http://localhost:5173/auth/callback` (add your production URL later, e.g. `https://yourdomain.com/auth/callback`).
4. **API permissions**: `Microsoft Graph > User.Read` (delegated) is enough for sign-in.

## 2. Supabase username/password setup

1. Create or select a Supabase project.
2. Open **SQL Editor**, paste in `supabase/schema.sql`, and run it once.
3. Copy the project URL and anon/publishable key from **Project Settings > API** into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The URL must be the base project URL (for example, `https://your-project.supabase.co`) with no `/rest/v1` path.

The schema stores usernames in `app_users`, hashes passwords with `pgcrypto`, and keeps both credential and session tables inaccessible through direct public API queries. The app uses narrowly scoped database functions to register, log in, and validate sessions.

## 3. Run
```bash
npm install
cp .env.example .env   # fill in client ID + tenant ID
npm run dev            # http://localhost:5173
```

## How it works
- `Login with Microsoft` calls `instance.loginRedirect()` (src/pages/Home.jsx).
- Entra authenticates the user and redirects to `/auth/callback` (src/pages/Callback.jsx).
- MSAL processes the response; `onLoginSuccess` / `onLoginFailure` in `src/auth/callbacks.js` run (wired in `src/main.jsx`).
- The regular form calls the `login_user` database function and validates its session token after a refresh.
- The Register tab calls the `register_user` database function. No email address or confirmation is required.
- Successful Microsoft or email logins go to the protected `/success` page. Authentication errors remain on the login page.
