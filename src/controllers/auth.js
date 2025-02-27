import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import createError from 'http-errors';
import nodemailer from 'nodemailer';
import User from '../models/user.js';
import Session from '../models/session.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const JWT_SECRET = process.env.JWT_SECRET || 'VOQjLdrpG1TWCHhDzv3o';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM;
const APP_DOMAIN = process.env.APP_DOMAIN || 'http://localhost:3000/auth';

// 🚀 Реєстрація користувача
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(409, 'Email in use'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    next(error);
  }
};

// 🚀 Логін користувача
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(401, 'Invalid email or password'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createError(401, 'Invalid email or password'));
    }

    await Session.deleteMany({ userId: user._id });

    const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
      expiresIn: '30d',
    });

    await Session.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

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
  } catch (error) {
    next(error);
  }
};

// 🚀 Відправка email для скидання паролю
export const sendResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, 'User not found!'));
    }

    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '5m' });
    const resetLink = `${APP_DOMAIN}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });

    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject: 'Password Reset Request',
      text: `Hello, you requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    next(createError(500, 'Failed to send the email, please try again later.'));
  }
};

// 🚀 Скидання паролю
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return next(createError(401, 'Token is expired or invalid.'));
    }

    const { email } = decoded;
    const user = await User.findOne({ email });

    if (!user) {
      return next(createError(404, 'User not found!'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    await Session.deleteMany({ userId: user._id });

    res.json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// 🚀 Оновлення токену (refresh)
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(createError(401, 'Refresh token not provided'));
    }

    const session = await Session.findOne({ refreshToken });
    if (!session) {
      return next(createError(401, 'Invalid refresh token'));
    }

    const userId = session.userId;
    const newAccessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });

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
  } catch (error) {
    next(error);
  }
};

// 🚀 Логаут
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(createError(401, 'Refresh token not provided'));
    }

    const session = await Session.findOne({ refreshToken });

    if (!session) {
      return next(createError(401, 'Session not found or already logged out'));
    }

    await Session.deleteOne({ refreshToken });

    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
