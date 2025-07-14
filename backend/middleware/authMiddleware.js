const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  console.log("Authorization Header:", authHeader);

  const token = authHeader?.split(' ')[1]; // Bearer <token>
  console.log("Extracted Token:", token);

  if (!token) return res.status(401).json({ msg: 'No token, access denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded JWT:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err.message);
    res.status(401).json({ msg: 'Invalid token' });
  }
};
