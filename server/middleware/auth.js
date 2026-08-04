const jwt = require('jsonwebtoken');
const config = require('../config');

function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// The single-company admin. The DB role value stays 'owner' for backward compatibility;
// `requireAdmin` is the preferred name going forward (the UI labels this role "Admin").
function requireOwner(req, res, next) {
  if (!req.user || req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Only an admin can perform this action' });
  }
  next();
}

function requirePermission(permKey) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (req.user.role === 'owner') {
      return next();
    }
    const perms = req.user.permissions || { dashboard: true, bilties: true, parties: true, trucks: true, trips: true, tracking: true };
    if (perms[permKey] === false) {
      return res.status(403).json({ error: `Access denied. You do not have permission to access ${permKey}.` });
    }
    next();
  };
}

module.exports = { requireAuth, requireOwner, requireAdmin: requireOwner, requirePermission };
