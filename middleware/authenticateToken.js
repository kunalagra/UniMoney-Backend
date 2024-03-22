
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret';

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Unauthorized access. Please log in.' });
  
    jwt.verify(token.replace('Bearer ', ''), JWT_SECRET, (err, user) => {
      if (err) return res.status(401).json({ error: 'Invalid token.' });
      req.user = user;
      next();
    });
  };

module.exports = authenticateToken;