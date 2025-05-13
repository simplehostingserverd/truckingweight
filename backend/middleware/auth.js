const pasetoService = require('../services/pasetoService');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify Paseto token
  try {
    const decoded = await pasetoService.decryptToken(token);

    if (!decoded) {
      return res.status(401).json({ msg: 'Token is not valid or expired' });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
