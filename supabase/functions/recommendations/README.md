# Recommendation Edge Function

This authenticated `GET` endpoint returns ranked marketplace listings for the
signed-in user. It uses conversation history, category and price affinity, text
similarity, freshness, listing popularity, seller reviews, and categories the
user explicitly likes.

Category scoring reserves 25 points for an explicit liked-category match and
10 points for category affinity learned from conversations. Users with liked
categories but no conversation history receive the `explicit_preferences`
strategy instead of the generic `cold_start` strategy.

## Test

From the repository root:

```powershell
npm --prefix supabase/functions test
```

These tests use an in-memory repository and never change Supabase data.

## Local endpoint

Apply the migrations in `supabase/migrations` to the database, link each
`app-users` row to its corresponding Supabase Auth user, and serve the function:

```powershell
npx supabase functions serve recommendations
```

Request:

```text
GET /functions/v1/recommendations?limit=10
Authorization: Bearer <signed-in-user-access-token>
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be placed in an Expo
public environment variable or browser bundle.
