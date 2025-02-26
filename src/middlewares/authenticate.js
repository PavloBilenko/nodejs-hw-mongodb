import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../models/user.js';
import Session from '../models/session.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Access token not provided');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw createError(401, 'Access token expired or invalid');
    }

    // Перевірка, чи існує користувач
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createError(401, 'User not found');
    }

    // Перевірка, чи сесія активна
    const session = await Session.findOne({ accessToken: token });
    if (!session) {
      throw createError(401, 'Session not found or expired');
    }

    req.user = user; // Встановлення користувача
    next();
  } catch (error) {
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || 'Internal Server Error',
      data: null,
    });
  }
};
