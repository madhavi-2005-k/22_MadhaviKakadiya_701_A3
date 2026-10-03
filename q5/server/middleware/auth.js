const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
  }

  // Expecting format: "Bearer <token>"
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied: Malformed Token' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_employee_jwt_key_2026');
    req.user = verified; // decoded payload: { id, empid, name, email }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or Expired Token' });
  }
}

module.exports = verifyToken;
