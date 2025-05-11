const jwt = require('jsonwebtoken');

// Auth middleware for Fastify
async function authMiddleware(request, reply) {
  // Get token from header
  const token = request.headers['x-auth-token'];

  // Check if no token
  if (!token) {
    return reply.code(401).send({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    request.user = decoded.user;
  } catch (err) {
    return reply.code(401).send({ msg: 'Token is not valid' });
  }
}

module.exports = {
  authMiddleware,
};
