import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const isProd = process.env.NODE_ENV === 'production';

// ---- DB pool test ----
pool.query('SELECT 1').then(()=> console.log('[db] connected')).catch(e=> console.error('[db] connection failed', e.message));

// ---- Middleware ----
app.use(cors({
  origin: isProd ? true : [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Session (PG store — critical for Render free restarts) ----
const PgStore = pgSession(session);
app.use(session({
  store: new PgStore({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me_32chars!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd, // Render provides HTTPS, so secure true in prod
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// ---- API Routes ----
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString(), env: process.env.NODE_ENV }));
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// ---- Serve React (single service mode) ----
// In production, Express serves client/dist
const clientDist = path.join(rootDir, 'client', 'dist');
app.use(express.static(clientDist));

// SPA fallback: any non-API GET should serve index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  // try to serve index.html if exists, else fallback message
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      // client not built yet (dev mode) — give helpful message
      res.status(200).json({
        message: 'API running. Client not built yet. Run: npm run build in client/ or use dev mode.',
        api: '/api/health',
        docs: 'See README.md for dev vs prod',
      });
    }
  });
});

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error('[server] unhandled', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[server] HotelM Node running on http://localhost:${PORT} env=${process.env.NODE_ENV || 'development'}`);
  console.log(`[server] API: http://localhost:${PORT}/api/health`);
  if (!isProd) console.log(`[server] Client dev: ${CLIENT_URL} (run "npm run dev" in client/)`);
});

export default app;
