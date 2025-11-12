import jwt from 'jsonwebtoken';

export const VerifyToken = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      req.user = decoded;
      return next();
    }
  } catch (e) {
    console.error('Token verification error:', e);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const VerifySocketToken = async (socket, next) => {
  try {
    // Get token from cookie (Socket.IO automatically parses cookies)
    const token = socket.handshake.headers.cookie
      ?.split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return next(new Error('No token provided'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      socket.user = decoded;
      return next();
    }
  } catch (e) {
    console.error('Socket token verification error:', e);
    return next(new Error('Invalid or expired token'));
  }
};
