# ML Strategy Lab

A draft helper for Mobile Legends: Bang Bang. You pick up to five enemy heroes and Gemini suggests counter picks, item builds, and a game plan. Logged-in users can save a strategy and vote on strategies.

- **Client:** React, Vite, Redux Toolkit, Tailwind CSS, daisyUI
- **Server:** Express, Sequelize, PostgreSQL, Gemini API
- **Login:** email and password, or Google

Hero data is pulled from public MLBB APIs through an admin-only endpoint. The API is documented in `server/api-doc.md`.

## Running it

You need Node.js and PostgreSQL. Database settings for local use are in `server/config/config.json`.

Server:

```bash
cd server
npm install
cp .env-example .env
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev
```

Fill in `.env` first: `JWT_SECRET`, `GOOGLE_CLIENT_ID`, and `GEMINI_API_KEY`. The server runs on port 3000 unless you set `PORT`.

The seeders add items and two users (`admin` and `user1`) but no heroes. To load heroes, log in as `admin` and call `POST /api/heroes/sync`.

Tests:

```bash
npm test
```

Client:

```bash
cd client
npm install
npm run dev
```

Create `client/.env` with `VITE_GOOGLE_CLIENT_ID` for Google login. The client talks to the deployed API. To use your local server, change `baseURL` in `client/src/helpers/api.js`.

## Deploying

The API runs on Vercel and the client runs on Firebase Hosting, both on free plans.

Set `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, and `GOOGLE_CLIENT_ID` in the Vercel project, then deploy from `server`. Use a pooler connection string for `DATABASE_URL`, because Vercel has no IPv6 route to a direct Supabase connection.

```bash
vercel --prod
```

Deploy the client from `client`:

```bash
npm run build
firebase deploy
```
