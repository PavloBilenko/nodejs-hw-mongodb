import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../models/user.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError(401, 'Access token not provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(createError(401, 'User not found'));
    }

    req.user = user; // Встановлення користувача
    next();
  } catch (error) {
    return next(createError(401, 'Access token expired or invalid'));
  }
};
