export default function; (req, res, next) {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
  }

  next();
};
