# HotelMS — MealMate (React + Node + Neon)

Legacy PHP (`index.php`, `admin/`, `user/`, `meal_management.sql`) has been **ported to React + Node + Neon Postgres** for free hosting on **Render (Node)** + **Neon (Postgres)** single service.

## Structure

```
HotelM/
├── client/           # Vite React SPA (pages/admin, pages/user, components)
│   ├── src/
│   │   ├── pages/Home.jsx, admin/*, user/*
│   │   ├── components/Header.jsx, Sidebar.jsx
│   │   └── api.js
│   └── vite.config.js (proxy /api → localhost:3000)
├── server/
│   ├── index.js      # Express + session (PG store) + static client/dist
│   ├── db.js         # pg Pool from DATABASE_URL (Neon)
│   ├── middleware/auth.js
│   └── routes/auth.js, admin.js, user.js
├── schema.pg.sql     # Neon Postgres schema (PG port of meal_management.sql)
├── .env.example      # DATABASE_URL template
├── render.yaml       # Render free Node service
├── package.json      # root: build client + start server
└── assets/css/style.css (reused warm luxury theme)
```

## Quick Start (Local)

1. **DB** — Create Neon project at https://neon.tech → copy **pooled** `DATABASE_URL` (ends `?sslmode=require`)

2. **Env**
```bash
cp .env.example .env
# edit .env: set DATABASE_URL, SESSION_SECRET=random32chars
```

3. **Schema**
```bash
# requires psql (or use Neon SQL Editor)
psql "$DATABASE_URL" -f schema.pg.sql
# or: npm run migrate  (uses psql + $DATABASE_URL)
```

4. **Install & Run**
```bash
npm install
npm install --prefix client

# dev: server :3000 + client :5173 (proxy)
npm run dev

# prod build + serve (like Render)
npm run build
npm start  # http://localhost:3000 + client/dist served at /
```

## Deploy to Render + Neon (Free)

1. Push to GitHub (`priya22-ai/HotelMS` already has `main`):
```bash
git add .
git commit -m "feat: React+Node+Neon ready for Render"
git push origin main
```

2. Render → **New Web Service** → Connect `priya22-ai/HotelMS` → **Node** → Plan **Free** →
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Env:
     - `DATABASE_URL` = Neon pooled URL
     - `SESSION_SECRET` = `openssl rand -hex 32`
     - `NODE_ENV=production`
     - `NODE_VERSION=20`
   - Health: `/api/health`

3. First run: Render will run `schema.pg.sql` **once** via `psql` or Neon dashboard.

4. Test: `https://hotelms.onrender.com/api/health` → `{status:"ok"}`

## Notes

- **Session store** is `connect-pg-simple` → survives Render free restarts (memory store would lose login).
- **Prod**: `client/dist` is served by `server/index.js` (`express.static`). No separate static site needed → saves 750h.
- **PHP files** remain for reference but are **not served** in Node mode. Access via `http://localhost:80` still works if you run Apache locally.
- **Pricing table** added in PG schema for `category → meal price` (`user/meal-order`).
- **Free tier limits:** Render sleeps after 15min idle (cold ~60s), Neon scales to zero after 5min (zero CU). Both are permanent free.

## API

- `POST /api/admin/register`, `POST /api/admin/login`, `GET /api/admin/dashboard`, `GET /api/admin/menus?date=YYYY-MM-DD`, etc.
- `POST /api/user/register`, `POST /api/user/login`, `GET /api/user/dashboard`, `POST /api/user/meal-order`, etc.
- All admin/user routes require session cookie (`withCredentials`).

## Provide DATABASE_URL

When you have Neon string, paste it in `.env` and Render Env — server will connect automatically. No code change needed.
