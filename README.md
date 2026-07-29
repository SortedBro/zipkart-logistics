# Zipkart Integrated Logistics (MERN)

Internal transport-management app for a **single company** — bilty (LR) creation, party ledger, truck-wise profit & loss, trip tracking, and staff/role management. Built on the MERN stack: **M**ongoDB, **E**xpress, **R**eact, **N**ode.

```
server/   Express REST API + Mongoose models (MongoDB)
client/   React (Vite) single-page app
```

> This is **not** a multi-tenant SaaS. There is no public sign-up. One deployment serves one company; users are an **Admin** plus **Employees** the admin creates.

## Requirements

- Node.js v18+
- A running MongoDB instance — local (`mongod`) or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

## Setup

### 1. Backend (API)

```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGODB_URI and a long random JWT_SECRET (see .env.example for all options)
npm start
```

API runs at `http://localhost:4000`. The server validates required config on boot and exits if `MONGODB_URI` or `JWT_SECRET` is missing.

### 2. Create the first admin

There is no public registration. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `COMPANY_NAME` in `server/.env`, then:

```bash
cd server
npm run seed:admin
```

This creates the single company and the admin login. It's idempotent — re-running won't overwrite an existing admin unless you set `SEED_RESET_PASSWORD=true`.

### 3. Frontend (React)

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173` (Vite proxies `/api` to the backend on port 4000, so no CORS setup is needed in dev).

## First run

1. Open `http://localhost:5173/login` and sign in with the admin credentials you seeded.
2. Set your company details (name, GST, logo, address, contact) under **Settings**.
3. Add **Parties** (customers/suppliers) and **Trucks**.
4. Create a **Bilty** — freight, advance and balance are calculated automatically.
5. Track **Trips** (loading → in-transit → delivered) and log **truck expenses** for P&L.
6. As admin, add **Employee** logins from the Staff page — they get limited (non-admin) access.

## Auth

The API issues a JWT stored in an httpOnly cookie on login. The React app calls the API with `credentials: 'include'`, so no token handling is needed on the frontend. Roles are `owner` (Admin) and `staff` (Employee).

## File storage

Truck documents and the company logo upload to S3-compatible object storage (**Cloudflare R2** or **AWS S3**) when configured — see the `S3_*` variables in `.env.example`. If storage is not configured, uploads fall back to inline base64 so the app still works out of the box.

## Configuration

All server configuration is via `server/.env`. See [`server/.env.example`](server/.env.example) for the full list: database, JWT, CORS origins, rate limits, object storage, and the admin-seed values.

## Production build

```bash
cd client
npm run build   # outputs client/dist
```

Serve `client/dist` from any static host (Netlify, Vercel, nginx, or Express's `express.static`). Set `CLIENT_URL` (and any extra `CORS_ORIGINS`) in `server/.env` to your deployed frontend origin, `NODE_ENV=production`, and point `MONGODB_URI` at your production database.

## Data model

MongoDB collections: `companies`, `users`, `parties`, `trucks`, `bilties`, `payments`, `truckexpenses`, `trips`. Records carry a `company` reference (a single company for this deployment).
