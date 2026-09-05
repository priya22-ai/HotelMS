import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { clean } from '../utils/helpers.js';

const router = Router();

// Helper to check admin exists
async function adminExists() {
  const r = await pool.query('SELECT id FROM admins LIMIT 1');
  return r.rowCount > 0;
}

// -------- ADMIN REGISTER / LOGIN --------

router.post('/admin/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const n = clean(name), e = clean(email), p = password || '', ph = clean(phone), addr = clean(address);
    if (!n || !e || !p) return res.status(400).json({ error: 'Name, email, password required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return res.status(400).json({ error: 'Invalid email' });
    if (p.length < 6) return res.status(400).json({ error: 'Password min 6 chars' });

    const exists = await pool.query('SELECT id FROM admins WHERE email=$1', [e.toLowerCase()]);
    if (exists.rowCount > 0) return res.status(409).json({ error: 'Admin already exists' });

    const hash = await bcrypt.hash(p, 10);
    const r = await pool.query(
      'INSERT INTO admins (name,email,password,phone,address) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email',
      [n, e.toLowerCase(), hash, ph || null, addr || null]
    );
    res.json({ message: 'Admin created', admin: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const e = clean(email), p = password || '';
    if (!e || !p) return res.status(400).json({ error: 'Enter email & password' });
    const r = await pool.query('SELECT * FROM admins WHERE email=$1 LIMIT 1', [e.toLowerCase()]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Admin not found' });
    const admin = r.rows[0];
    const ok = await bcrypt.compare(p, admin.password);
    if (!ok) return res.status(401).json({ error: 'Wrong password' });

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Session error' });
      req.session.admin_id = admin.id;
      req.session.admin_name = admin.name;
      req.session.admin_email = admin.email;
      // clear user session if any
      delete req.session.user_id;
      res.json({ message: 'Logged in', admin: { id: admin.id, name: admin.name, email: admin.email } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admin/me', async (req, res) => {
  if (!req.session.admin_id) return res.status(401).json({ error: 'Not logged in' });
  const r = await pool.query('SELECT id, name, email, phone, address, created_at FROM admins WHERE id=$1', [req.session.admin_id]);
  res.json({ admin: r.rows[0] || null, session: { admin_id: req.session.admin_id, admin_name: req.session.admin_name } });
});

router.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

// Check if any admin exists (for frontend to decide show register)
router.get('/admin/exists', async (req, res) => {
  const exists = await adminExists();
  res.json({ exists });
});

// -------- USER REGISTER / LOGIN --------

router.post('/user/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, user_type, category } = req.body;
    const n = clean(name), e = clean(email), p = password || '', ph = clean(phone), addr = clean(address);
    const ut = clean(user_type) || 'student';
    const cat = clean(category) || 'COZY';
    const allowedTypes = ['student','guest','employee','cleaner'];
    const allowedCats = ['COZY','Premium','VIP'];
    if (!n || !e || !p) return res.status(400).json({ error: 'Name, email, password required' });
    if (!allowedTypes.includes(ut)) return res.status(400).json({ error: 'Invalid user_type' });
    if (!allowedCats.includes(cat)) return res.status(400).json({ error: 'Invalid category' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return res.status(400).json({ error: 'Invalid email' });
    if (p.length < 6) return res.status(400).json({ error: 'Password min 6 chars' });

    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [e.toLowerCase()]);
    if (exists.rowCount > 0) return res.status(409).json({ error: 'This email is already registered' });

    const hash = await bcrypt.hash(p, 10);
    const r = await pool.query(
      `INSERT INTO users (name,email,password,phone,address,user_type,category) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, name, email, user_type, category`,
      [n, e.toLowerCase(), hash, ph || null, addr || null, ut, cat]
    );
    res.json({ message: 'Registration successful', user: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/user/login', async (req, res) => {
  try {
    const { email, password, category } = req.body;
    const e = clean(email), p = password || '', cat = clean(category);
    if (!e || !p) return res.status(400).json({ error: 'Enter email and password' });

    // build query with optional category filter (like PHP)
    let sql = 'SELECT * FROM users WHERE email=$1 AND status=$2';
    const params = [e.toLowerCase(), 'active'];
    if (cat) {
      sql += ' AND category=$3';
      params.push(cat);
    }
    sql += ' LIMIT 1';

    const r = await pool.query(sql, params);
    if (r.rowCount === 0) return res.status(404).json({ error: 'No active user found with this email/category' });
    const user = r.rows[0];
    const ok = await bcrypt.compare(p, user.password);
    if (!ok) return res.status(401).json({ error: 'Incorrect password' });

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Session error' });
      req.session.user_id = user.id;
      req.session.user_name = user.name;
      req.session.user_email = user.email;
      req.session.user_type = user.user_type;
      req.session.user_category = user.category;
      delete req.session.admin_id;
      res.json({ message: 'Logged in', user: { id: user.id, name: user.name, email: user.email, user_type: user.user_type, category: user.category } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/user/me', async (req, res) => {
  if (!req.session.user_id) return res.status(401).json({ error: 'Not logged in' });
  const r = await pool.query('SELECT id, name, email, phone, address, user_type, category, status, created_at FROM users WHERE id=$1', [req.session.user_id]);
  res.json({ user: r.rows[0] || null, session: { user_id: req.session.user_id, user_name: req.session.user_name } });
});

router.post('/user/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

// unified logout + session check
router.get('/session', (req, res) => {
  res.json({
    admin: req.session.admin_id ? { id: req.session.admin_id, name: req.session.admin_name, email: req.session.admin_email } : null,
    user: req.session.user_id ? { id: req.session.user_id, name: req.session.user_name, email: req.session.user_email, user_type: req.session.user_type, category: req.session.user_category } : null,
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

export default router;
