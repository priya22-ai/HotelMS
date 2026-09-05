export function requireAdmin(req, res, next) {
  if (req.session && req.session.admin_id) return next();
  return res.status(401).json({ error: 'Admin login required' });
}

export function requireUser(req, res, next) {
  if (req.session && req.session.user_id) return next();
  return res.status(401).json({ error: 'User login required' });
}

export function requireAnyAuth(req, res, next) {
  if ((req.session && req.session.admin_id) || (req.session && req.session.user_id)) return next();
  return res.status(401).json({ error: 'Login required' });
}
