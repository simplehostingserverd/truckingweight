// Admin middleware for Fastify
async function adminMiddleware(request, reply) {
  // Check if user is admin
  if (!request.user.isAdmin) {
    return reply.code(403).send({ msg: 'Access denied. Admin privileges required.' });
  }
}

export default {
  adminMiddleware,
};
