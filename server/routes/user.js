import { Router } from 'express';
import { pool } from '../db.js';
import { requireUser } from '../middleware/auth.js';
import { toDateStr } from '../utils/helpers.js';

const router = Router();

router.use(requireUser);

// Helper: get pricing for user's category
async function getPricing(category) {
  const cat = category || 'COZY';
  const rows = (await pool.query('SELECT meal_type, price FROM pricing WHERE category=$1', [cat])).rows;
  const map = {};
  rows.forEach(r => map[r.meal_type] = Number(r.price));
  if (Object.keys(map).length === 0) return { breakfast: 50, lunch: 80, dinner: 70 };
  // fill defaults if missing
  if (!map.breakfast) map.breakfast = 50;
  if (!map.lunch) map.lunch = 80;
  if (!map.dinner) map.dinner = 70;
  return map;
}

// -------- DASHBOARD --------
router.get('/dashboard', async (req, res) => {
  const uid = req.session.user_id;
  const user = (await pool.query('SELECT * FROM users WHERE id=$1', [uid])).rows[0];
  const today = new Date().toISOString().slice(0,10);
  const month_start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10);

  const today_order = (await pool.query('SELECT * FROM meal_orders WHERE user_id=$1 AND order_date=$2 LIMIT 1', [uid, today])).rows[0] || null;
  const total_meals = (await pool.query('SELECT COUNT(*) FROM meal_orders WHERE user_id=$1 AND order_date >= $2', [uid, month_start])).rows[0].count;
  const total_paid = (await pool.query("SELECT COALESCE(SUM(amount),0) as s FROM payments WHERE user_id=$1 AND status='paid'", [uid])).rows[0].s;
  const total_pending = (await pool.query("SELECT COALESCE(SUM(amount),0) as s FROM payments WHERE user_id=$1 AND status='pending'", [uid])).rows[0].s;
  const recent = (await pool.query('SELECT * FROM meal_orders WHERE user_id=$1 ORDER BY order_date DESC LIMIT 7', [uid])).rows;

  // notifications for this user (broadcast + direct)
  const notifs = (await pool.query('SELECT * FROM notifications WHERE (user_id=$1 OR user_id IS NULL) ORDER BY created_at DESC LIMIT 5', [uid])).rows;

  const timings = {};
  (await pool.query('SELECT * FROM meal_timings')).rows.forEach(t => timings[t.meal_type] = t);

  res.json({
    user,
    today_order,
    total_meals: Number(total_meals),
    total_paid: Number(total_paid),
    total_pending: Number(total_pending),
    recent,
    notifications: notifs,
    timings,
  });
});

// -------- MEAL ORDER (GET + POST) --------
router.get('/meal-order', async (req, res) => {
  const uid = req.session.user_id;
  const category = req.session.user_category;
  const today = new Date().toISOString().slice(0,10);
  const prices = await getPricing(category);
  const timings = {};
  (await pool.query('SELECT * FROM meal_timings')).rows.forEach(t => timings[t.meal_type] = t);
  const order = (await pool.query('SELECT * FROM meal_orders WHERE user_id=$1 AND order_date=$2 LIMIT 1', [uid, today])).rows[0] || null;
  res.json({ prices, timings, order, today });
});

router.post('/meal-order', async (req, res) => {
  const uid = req.session.user_id;
  const category = req.session.user_category;
  const today = new Date().toISOString().slice(0,10);
  const { breakfast, lunch, dinner } = req.body;
  const b = breakfast ? 1 : 0;
  const l = lunch ? 1 : 0;
  const d = dinner ? 1 : 0;
  const prices = await getPricing(category);
  const total = (b * prices.breakfast) + (l * prices.lunch) + (d * prices.dinner);

  const existing = (await pool.query('SELECT * FROM meal_orders WHERE user_id=$1 AND order_date=$2 LIMIT 1', [uid, today])).rows[0];

  if (existing) {
    const r = await pool.query('UPDATE meal_orders SET breakfast=$1, lunch=$2, dinner=$3, total_amount=$4 WHERE id=$5 RETURNING *', [b,l,d,total, existing.id]);
    return res.json({ message: "Meal updated", order: r.rows[0] });
  } else {
    const r = await pool.query(
      "INSERT INTO meal_orders (user_id, order_date, breakfast, lunch, dinner, total_amount, status) VALUES ($1,$2,$3,$4,$5,$6,'confirmed') RETURNING *",
      [uid, today, b,l,d,total]
    );
    return res.json({ message: "Meal order placed", order: r.rows[0] });
  }
});

// -------- ACTIVITY (calendar) --------
router.get('/activity', async (req, res) => {
  const uid = req.session.user_id;
  let month = parseInt(req.query.month, 10) || (new Date().getMonth()+1);
  let year = parseInt(req.query.year, 10) || (new Date().getFullYear());
  if (month <1) { month=12; year--; }
  if (month >12) { month=1; year++; }
  const month_start = `${year}-${String(month).padStart(2,'0')}-01`;
  const month_end = new Date(year, month, 0).toISOString().slice(0,10);

  const orders = {};
  (await pool.query('SELECT * FROM meal_orders WHERE user_id=$1 AND order_date BETWEEN $2 AND $3', [uid, month_start, month_end])).rows.forEach(o => orders[o.order_date.toISOString ? o.order_date.toISOString().slice(0,10) : o.order_date] = o);
  // For PG date might be string or Date, normalize via query string cast
  // Re-query with formatted date string to ensure key consistency
  const ordersRaw = (await pool.query("SELECT *, TO_CHAR(order_date,'YYYY-MM-DD') as d FROM meal_orders WHERE user_id=$1 AND order_date BETWEEN $2 AND $3", [uid, month_start, month_end])).rows;
  const ordersMap = {};
  ordersRaw.forEach(o => ordersMap[o.d] = o);

  const paymentsRaw = (await pool.query("SELECT *, TO_CHAR(payment_date,'YYYY-MM-DD') as d FROM payments WHERE user_id=$1 AND payment_date BETWEEN $2 AND $3 AND status='paid'", [uid, month_start, month_end])).rows;
  const paymentsMap = {};
  paymentsRaw.forEach(p => paymentsMap[p.d] = p);

  // stats
  let total_days = Object.keys(ordersMap).length;
  let total_meals = 0, total_amount = 0;
  Object.values(ordersMap).forEach(o => { total_meals += Number(o.breakfast||0)+Number(o.lunch||0)+Number(o.dinner||0); total_amount += Number(o.total_amount||0); });
  let total_paid_month = 0;
  Object.values(paymentsMap).forEach(p => total_paid_month += Number(p.amount));

  res.json({ month, year, month_start, month_end, orders: ordersMap, payments: paymentsMap, total_days, total_meals, total_amount, total_paid_month });
});

// -------- REPORT --------
router.get('/report', async (req, res) => {
  const uid = req.session.user_id;

  const total_orders = (await pool.query('SELECT COUNT(*) FROM meal_orders WHERE user_id=$1', [uid])).rows[0].count;
  const total_breakfast = (await pool.query('SELECT COALESCE(SUM(breakfast),0) as s FROM meal_orders WHERE user_id=$1', [uid])).rows[0].s;
  const total_lunch = (await pool.query('SELECT COALESCE(SUM(lunch),0) as s FROM meal_orders WHERE user_id=$1', [uid])).rows[0].s;
  const total_dinner = (await pool.query('SELECT COALESCE(SUM(dinner),0) as s FROM meal_orders WHERE user_id=$1', [uid])).rows[0].s;
  const total_spent = (await pool.query('SELECT COALESCE(SUM(total_amount),0) as s FROM meal_orders WHERE user_id=$1', [uid])).rows[0].s;
  const total_paid = (await pool.query("SELECT COALESCE(SUM(amount),0) as s FROM payments WHERE user_id=$1 AND status='paid'", [uid])).rows[0].s;
  const total_pending = Number(total_spent) - Number(total_paid);

  const monthly = (await pool.query(
    `SELECT TO_CHAR(order_date,'Mon YYYY') as month_label,
            TO_CHAR(order_date,'YYYY-MM') as month_key,
            COUNT(*) as days,
            SUM(breakfast+lunch+dinner) as meals,
            SUM(total_amount) as amount
     FROM meal_orders
     WHERE user_id=$1 AND order_date >= CURRENT_DATE - INTERVAL '6 months'
     GROUP BY month_key, month_label
     ORDER BY month_key DESC`,
    [uid]
  )).rows;

  const pay_history = (await pool.query('SELECT * FROM payments WHERE user_id=$1 ORDER BY payment_date DESC LIMIT 10', [uid])).rows;

  res.json({
    total_orders: Number(total_orders),
    total_breakfast: Number(total_breakfast),
    total_lunch: Number(total_lunch),
    total_dinner: Number(total_dinner),
    total_spent: Number(total_spent),
    total_paid: Number(total_paid),
    total_pending,
    monthly,
    pay_history,
  });
});

// -------- PAYMENTS history + create --------
router.get('/payments', async (req, res) => {
  const uid = req.session.user_id;
  const from = toDateStr(req.query.from) || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10);
  const to = toDateStr(req.query.to) || new Date().toISOString().slice(0,10);
  const rows = (await pool.query('SELECT * FROM payments WHERE user_id=$1 AND payment_date BETWEEN $2 AND $3 ORDER BY payment_date DESC', [uid, from, to])).rows;
  res.json({ payments: rows, from, to });
});

router.post('/payments', async (req, res) => {
  const uid = req.session.user_id;
  const { amount, payment_type, payment_method, payment_date, note, payment_for_start, payment_for_end } = req.body;
  const amt = parseFloat(amount);
  if (!amt || amt <=0) return res.status(400).json({ error: 'Invalid amount' });
  const pt = ['daily','weekly','monthly'].includes(payment_type) ? payment_type : 'monthly';
  const pm = ['cash','bkash','nagad','card'].includes(payment_method) ? payment_method : 'cash';
  const pd = toDateStr(payment_date) || new Date().toISOString().slice(0,10);
  const pfs = toDateStr(payment_for_start);
  const pfe = toDateStr(payment_for_end);
  const r = await pool.query(
    `INSERT INTO payments (user_id, amount, payment_type, payment_method, payment_date, payment_for_start, payment_for_end, status, note) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8) RETURNING *`,
    [uid, amt, pt, pm, pd, pfs, pfe, note || null]
  );
  res.json({ message: 'Payment request submitted', payment: r.rows[0] });
});

// -------- NOTIFICATIONS (user view) --------
router.get('/notifications', async (req, res) => {
  const uid = req.session.user_id;
  const rows = (await pool.query("SELECT * FROM notifications WHERE (user_id=$1 OR user_id IS NULL) AND (target='all' OR target=$2 OR target='all') ORDER BY created_at DESC LIMIT 20", [uid, req.session.user_type || 'all'])).rows;
  res.json({ notifications: rows });
});

export default router;
