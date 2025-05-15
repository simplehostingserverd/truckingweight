import * as pasetoService from '../../services/pasetoService.js';

// Auth middleware for Fastify
async function authMiddleware(request, reply) {
  // Get token from header
  const token = request.headers['x-auth-token'];

  // Check if no token
  if (!token) {
    return reply.code(401).send({ msg: 'No token, authorization denied' });
  }

  // Verify Paseto token
  try {
    const decoded = await pasetoService.decryptToken(token);

    if (!decoded) {
      return reply.code(401).send({ msg: 'Token is not valid or expired' });
    }

    request.user = decoded.user;
  } catch (err) {
    return reply.code(401).send({ msg: 'Token is not valid' });
  }
}

export { authMiddleware };

export default {
  authMiddleware,
};
