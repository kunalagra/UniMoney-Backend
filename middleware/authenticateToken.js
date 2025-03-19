
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Unauthorized access. Please log in.' });
  
    jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET, (err, payload) => {
      if (err) return res.status(401).json({ error: 'Invalid token.' });
      req.user = payload.user;
      next();
    });
  };

module.exports = authenticateToken;
