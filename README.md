# Zipkart Integrated Logistics (MERN)

Transport management web app — bilty (LR) creation, party ledger, truck-wise profit & loss, trip tracking, and staff/role management. Rebuilt as a full MERN stack: **M**ongoDB, **E**xpress, **R**eact, **N**ode.

```
server/   Express REST API + Mongoose models (MongoDB)
client/   React (Vite) single-page app
```

## Requirements

- Node.js v18+
- A running MongoDB instance — either:
  - Local MongoDB (`mongod`) — install from mongodb.com/try/download/community, or
  - A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (get a connection string)

## Setup

### 1. Backend (API)

```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGODB_URI to your local mongod or Atlas connection string
npm start
```

API runs at `http://localhost:4000`.

### 2. Frontend (React)

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173` (the Vite dev server proxies `/api` calls to the backend on port 4000, so no CORS setup needed in dev).

## First run

1. Open `http://localhost:5173/register` and create your company account (this becomes the "owner" login).
2. Add a few **Parties** (customers/suppliers) and **Trucks**.
3. Create a **Bilty** — freight, advance and balance are calculated automatically.
4. Track **Trips** (loading → in-transit → delivered) and log **truck expenses** for P&L.
5. As owner, add **Staff** logins from the Staff page — they get limited (non-owner) access.

## Auth

The API issues a JWT stored in an httpOnly cookie on login/register. The React app calls the API with `credentials: 'include'`, so no token handling is needed on the frontend.

## Production build

```bash
cd client
npm run build   # outputs client/dist
```

Serve `client/dist` from any static host (Netlify, Vercel, nginx, or Express's `express.static`) and point `CLIENT_URL` in `server/.env` at that domain, with `MONGODB_URI` pointing at your production database.

## Data model

MongoDB collections: `companies`, `users`, `parties`, `trucks`, `bilties`, `payments`, `truckexpenses`, `trips` — all scoped by `company` so each signed-up business only sees its own data.
