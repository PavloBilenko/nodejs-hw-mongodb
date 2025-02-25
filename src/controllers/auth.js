import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import User from '../models/user.js';
import Session from '../models/session.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

// 🚀 Реєстрація користувача
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Перевірка наявності користувача
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'Email in use');
  }

  // Хешування пароля
  const hashedPassword = await bcrypt.hash(password, 10);

  // Створення користувача
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Видалення пароля з відповіді
  const userResponse = {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: userResponse,
  });
};

// 🚀 Логін користувача
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw createError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError(401, 'Invalid email or password');
  }

  // Видаляємо стару сесію
  await Session.deleteMany({ userId: user._id });

  // Генеруємо токени
  const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });

  // Створюємо сесію
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 хв
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 днів
  });

  // Встановлюємо кукі для рефреш токена
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: { accessToken },
  });
};

// 🚀 Оновлення токену (refresh)
export const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw createError(401, 'Refresh token not provided');
  }

  const session = await Session.findOne({ refreshToken });
  if (!session) {
    throw createError(401, 'Invalid refresh token');
  }

  const userId = session.userId;
  const newAccessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });

  // Видаляємо стару сесію і створюємо нову
  await Session.deleteOne({ refreshToken });

  await Session.create({
    userId,
    accessToken: newAccessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: newAccessToken },
  });
};

// 🚀 Логаут
export const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw createError(401, 'Refresh token not provided');
  }

  await Session.deleteOne({ refreshToken });

  res.clearCookie('refreshToken');
  res.status(204).send();
};
