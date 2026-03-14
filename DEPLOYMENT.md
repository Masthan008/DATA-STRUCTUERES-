# Deployment Guide

## How it works after deploy

Locally you run two processes (Vite dev server + Express). After deploy, you:
1. Build React into static files (`npm run build` → `dist/` folder)
2. Express serves those static files AND handles `/api/*` routes
3. One single server, one single URL — no more switching ports

---

## Step 1 — Update server.js to serve the built frontend

Replace your `server/server.js` with this:

```js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import studentRoutes from './routes/student.js';
import adminRoutes from './routes/admin.js';

dotenv.config({ path: './server/.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', studentRoutes);
app.use('/api', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React build in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// All non-API routes → React app (handles client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

---

## Step 2 — Add a build+start script to package.json

Add this to your `scripts` in `package.json`:

```json
"build:prod": "vite build",
"start:prod": "node server/server.js"
```

---

## Step 3 — Deploy options

### Option A: Railway (easiest, free tier)
1. Push your code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Set these environment variables in Railway dashboard:
   - `DATABASE_URL` = your Neon DB connection string
   - `PORT` = 5000 (Railway sets this automatically)
4. Set start command: `npm run build:prod && npm run start:prod`
5. Done — Railway gives you a public URL like `https://yourapp.railway.app`

### Option B: Render (free tier)
1. Push to GitHub
2. Go to https://render.com → New Web Service
3. Build command: `npm run build:prod`
4. Start command: `npm run start:prod`
5. Add env vars: `DATABASE_URL`

### Option C: VPS / your own server
```bash
git clone <your-repo>
cd your-project
npm install
npm run build:prod
node server/server.js
```
Use PM2 to keep it running:
```bash
npm install -g pm2
pm2 start server/server.js --name exam-portal
pm2 save
pm2 startup
```

---

## Step 4 — Environment variables needed on the server

Copy your `server/.env` values to the deployment platform:

```
DATABASE_URL=postgresql://...   ← your Neon DB URL
PORT=5000
```

---

## After deploy — how admin/student works

- Admin URL: `https://yourapp.railway.app/admin/login`
- Student URL: `https://yourapp.railway.app/student/login`
- API: `https://yourapp.railway.app/api/...`

The Vite proxy (`/api → localhost:5000`) only works in dev.
In production, React and Express are on the **same origin**, so `/api` calls go directly to Express — no proxy needed.

---

## GCC compiler note

The `/api/compile` route uses local GCC. On Railway/Render, GCC is available by default on Linux containers. On Windows VPS you need TDM-GCC installed.

If you deploy to Railway/Render (Linux), the compile route works out of the box.
