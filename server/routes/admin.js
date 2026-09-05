import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { clean, toInt, toDateStr } from '../utils/helpers.js';

const router = Router();

// All admin routes require admin auth
router.use(requireAdmin);

// -------- DASHBOARD STATS --------
router.get('/dashboard', async (req, res) => {
  try {
    const total_users = (await pool.query("SELECT COUNT(*) FROM users")).rows[0].count;
    const total_meals_today = (await pool.query("SELECT COUNT(*) FROM meal_orders WHERE order_date = CURRENT_DATE")).rows[0].count;
    const total_paid = (await pool.query("SELECT COALESCE(SUM(amount),0) as s FROM payments WHERE status='paid'")).rows[0].s;
    const pending_payments = (await pool.query("SELECT COUNT(*) FROM payments WHERE status='pending'")).rows[0].count;

    const breakfast_count = (await pool.query("SELECT COUNT(*) FROM meal_orders WHERE order_date = CURRENT_DATE AND (meal_type='breakfast' OR breakfast=1)")).rows[0].count;
    const lunch_count = (await pool.query("SELECT COUNT(*) FROM meal_orders WHERE order_date = CURRENT_DATE AND (meal_type='lunch' OR lunch=1)")).rows[0].count;
    const dinner_count = (await pool.query("SELECT COUNT(*) FROM meal_orders WHERE order_date = CURRENT_DATE AND (meal_type='dinner' OR dinner=1)")).rows[0].count;

    const recent_users = (await pool.query("SELECT id, name, email, phone, user_type, category, status, created_at FROM users ORDER BY created_at DESC LIMIT 5")).rows;
    const notifications = (await pool.query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5")).rows;

    res.json({
      total_users: Number(total_users),
      total_meals_today: Number(total_meals_today),
      total_paid: Number(total_paid),
      pending_payments: Number(pending_payments),
      breakfast_count: Number(breakfast_count),
      lunch_count: Number(lunch_count),
      dinner_count: Number(dinner_count),
      recent_users,
      notifications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// -------- MENU CRUD --------
router.get('/menus', async (req, res) => {
  const date = toDateStr(req.query.date) || new Date().toISOString().slice(0,10);
  const rows = (await pool.query("SELECT * FROM menus WHERE menu_date=$1 ORDER BY CASE meal_type WHEN 'breakfast' THEN 1 WHEN 'lunch' THEN 2 WHEN 'dinner' THEN 3 ELSE 4 END", [date])).rows;
  res.json({ date, menus: rows });
});

router.post('/menus', async (req, res) => {
  const { meal_type, menu_date, items, price } = req.body;
  const mt = clean(meal_type), md = toDateStr(menu_date), it = clean(items), pr = parseFloat(price);
  if (!mt || !md || !it) return res.status(400).json({ error: 'All fields required' });
  if (!['breakfast','lunch','dinner'].includes(mt)) return res.status(400).json({ error: 'Invalid meal_type' });
  const aid = req.session.admin_id;
  try {
    const r = await pool.query(
      'INSERT INTO menus (meal_type, menu_date, items, price, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [mt, md, it, pr || 50, aid]
    );
    res.json({ message: 'Menu added', menu: r.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Menu for this meal type and date already exists' });
    console.error(err);
    res.status(500).json({ error: 'Failed to add menu' });
  }
});

router.put('/menus/:id', async (req, res) => {
  const id = toInt(req.params.id);
  const { meal_type, menu_date, items, price } = req.body;
  const mt = clean(meal_type), md = toDateStr(menu_date), it = clean(items), pr = parseFloat(price);
  if (!mt || !md || !it) return res.status(400).json({ error: 'All fields required' });
  const r = await pool.query('UPDATE menus SET meal_type=$1, menu_date=$2, items=$3, price=$4 WHERE id=$5 RETURNING *', [mt, md, it, pr || 50, id]);
  if (r.rowCount === 0) return res.status(404).json({ error: 'Menu not found' });
  res.json({ message: 'Menu updated', menu: r.rows[0] });
});

router.delete('/menus/:id', async (req, res) => {
  const id = toInt(req.params.id);
  await pool.query('DELETE FROM menus WHERE id=$1', [id]);
  res.json({ message: 'Menu deleted' });
});

// -------- USERS --------
router.get('/users', async (req, res) => {
  const filter = clean(req.query.filter || req.query.user_type || '');
  const search = clean(req.query.search || '');
  let sql = 'SELECT id, name, email, phone, address, user_type, category, status, created_at FROM users WHERE 1=1';
  const params = [];
  let idx = 1;
  if (filter) { sql += ` AND user_type=$${idx++}`; params.push(filter); }
  if (search) { sql += ` AND (name ILIKE $${idx} OR email ILIKE $${idx})`; params.push(`%${search}%`); idx++; }
  sql += ' ORDER BY created_at DESC';
  const rows = (await pool.query(sql, params)).rows;
  res.json({ users: rows, count: rows.length });
});

router.patch('/users/:id/toggle', async (req, res) => {
  const id = toInt(req.params.id);
  const r = await pool.query("UPDATE users SET status = CASE WHEN status='active' THEN 'inactive'::status_enum ELSE 'active'::status_enum END WHERE id=$1 RETURNING *", [id]);
  if (r.rowCount === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'Status toggled', user: r.rows[0] });
});

router.delete('/users/:id', async (req, res) => {
  const id = toInt(req.params.id);
  await pool.query('DELETE FROM users WHERE id=$1', [id]);
  res.json({ message: 'User deleted' });
});

// -------- TIMINGS --------
router.get('/timings', async (req, res) => {
  const rows = (await pool.query('SELECT * FROM meal_timings ORDER BY CASE meal_type WHEN \'breakfast\' THEN 1 WHEN \'lunch\' THEN 2 ELSE 3 END')).rows;
  const map = {};
  rows.forEach(r => map[r.meal_type] = r);
  res.json({ timings: map, list: rows });
});

router.put('/timings', async (req, res) => {
  // body: { breakfast_start, breakfast_end, lunch_start, lunch_end, dinner_start, dinner_end }
  for (const meal of ['breakfast','lunch','dinner']) {
    const start = clean(req.body[`${meal}_start`] || '');
    const end = clean(req.body[`${meal}_end`] || '');
    if (start && end) {
      await pool.query('UPDATE meal_timings SET start_time=$1, end_time=$2, updated_at=NOW() WHERE meal_type=$3', [start, end, meal]);
    }
  }
  const rows = (await pool.query('SELECT * FROM meal_timings ORDER BY CASE meal_type WHEN \'breakfast\' THEN 1 WHEN \'lunch\' THEN 2 ELSE 3 END')).rows;
  res.json({ message: 'Timings updated', timings: rows });
});

// -------- SETTINGS --------
router.get('/settings', async (req, res) => {
  const rows = (await pool.query('SELECT * FROM settings')).rows;
  const map = {};
  rows.forEach(r => map[r.setting_key] = r.setting_value);
  res.json({ settings: map, list: rows });
});

router.put('/settings', async (req, res) => {
  const keys = ['site_name','currency','breakfast_price','lunch_price','dinner_price'];
  for (const k of keys) {
    if (req.body[k] !== undefined) {
      const val = clean(String(req.body[k]));
      await pool.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES ($1,$2) ON CONFLICT (setting_key) DO UPDATE SET setting_value=$2',
        [k, val]
      );
    }
  }
  const rows = (await pool.query('SELECT * FROM settings')).rows;
  const map = {};
  rows.forEach(r => map[r.setting_key] = r.setting_value);
  res.json({ message: 'Settings saved', settings: map });
});

// -------- NOTIFICATIONS --------
router.get('/notifications', async (req, res) => {
  const rows = (await pool.query('SELECT n.*, a.name as admin_name FROM notifications n LEFT JOIN admins a ON n.created_by=a.id ORDER BY n.created_at DESC')).rows;
  res.json({ notifications: rows });
});

router.post('/notifications', async (req, res) => {
  const { title, message, target } = req.body;
  const t = clean(title), m = clean(message), tg = clean(target) || 'all';
  if (!t || !m) return res.status(400).json({ error: 'Title and message required' });
  const aid = req.session.admin_id;
  const r = await pool.query('INSERT INTO notifications (title, message, target, created_by) VALUES ($1,$2,$3,$4) RETURNING *', [t, m, tg, aid]);
  res.json({ message: 'Notification sent', notification: r.rows[0] });
});

router.delete('/notifications/:id', async (req, res) => {
  const id = toInt(req.params.id);
  await pool.query('DELETE FROM notifications WHERE id=$1', [id]);
  res.json({ message: 'Notification deleted' });
});

// -------- PAYMENTS (admin view) --------
router.get('/payments', async (req, res) => {
  const from = toDateStr(req.query.from) || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10);
  const to = toDateStr(req.query.to) || new Date().toISOString().slice(0,10);
  const type = clean(req.query.type || '');
  const status = clean(req.query.status || '');
  let sql = 'SELECT p.*, u.name, u.email, u.user_type FROM payments p JOIN users u ON p.user_id=u.id WHERE p.payment_date BETWEEN $1 AND $2';
  const params = [from, to];
  let idx = 3;
  if (type) { sql += ` AND p.payment_type=$${idx++}`; params.push(type); }
  if (status) { sql += ` AND p.status=$${idx++}`; params.push(status); }
  sql += ' ORDER BY p.created_at DESC';
  const rows = (await pool.query(sql, params)).rows;
  res.json({ payments: rows, from, to, count: rows.length });
});

// -------- REPORTS --------
router.get('/reports', async (req, res) => {
  const from = toDateStr(req.query.from) || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10);
  const to = toDateStr(req.query.to) || new Date().toISOString().slice(0,10);

  const paid_users = (await pool.query(
    `SELECT u.name, u.email, u.user_type, u.category, SUM(p.amount) as total_paid, COUNT(p.id) as payment_count
     FROM payments p JOIN users u ON p.user_id=u.id
     WHERE p.status='paid' AND p.payment_date BETWEEN $1 AND $2
     GROUP BY u.id, u.name, u.email, u.user_type, u.category ORDER BY total_paid DESC`,
    [from, to]
  )).rows;

  // Who hasn't paid but had meals
  const unpaid_users = (await pool.query(
    `SELECT u.name, u.email, u.user_type, COUNT(mo.id) as meal_count
     FROM users u LEFT JOIN meal_orders mo ON u.id=mo.user_id AND mo.order_date BETWEEN $1 AND $2
     WHERE u.id NOT IN (SELECT DISTINCT user_id FROM payments WHERE status='paid' AND payment_date BETWEEN $1 AND $2)
     GROUP BY u.id, u.name, u.email, u.user_type HAVING COUNT(mo.id) > 0 ORDER BY meal_count DESC`,
    [from, to]
  )).rows;

  const breakdown = (await pool.query(
    `SELECT payment_type, COUNT(*) as cnt, COALESCE(SUM(amount),0) as total FROM payments WHERE status='paid' AND payment_date BETWEEN $1 AND $2 GROUP BY payment_type`,
    [from, to]
  )).rows;

  const monthly = (await pool.query(
    `SELECT TO_CHAR(payment_date,'Mon') as month, EXTRACT(MONTH FROM payment_date) as m, SUM(amount) as total
     FROM payments WHERE status='paid' AND EXTRACT(YEAR FROM payment_date)=EXTRACT(YEAR FROM CURRENT_DATE)
     GROUP BY m, month ORDER BY m`
  )).rows;

  const chart_data = monthly.map(r => ({ label: r.month, value: Number(r.total), label_val: '৳' + Number(r.total).toLocaleString() }));

  res.json({ from, to, paid_users, unpaid_users, breakdown, chart_data });
});

export default router;
