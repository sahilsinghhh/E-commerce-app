import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from './emailService.js';

export const register = async ({ name, email, password }) => {
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Store refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  // Send welcome email in background
  sendWelcomeEmail(user.email, user.name).catch((err) => {
    console.error('Failed to send welcome email:', err.message);
  });

  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.__v;

  return { user: userObject, accessToken, refreshToken };
};

export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    throw new Error('Invalid email or password');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Store refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.__v;

  return { user: userObject, accessToken, refreshToken };
};

export const refreshAccessToken = async (token) => {
  if (!token) throw new Error('No refresh token provided');

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw new Error('Invalid refresh token');
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (token) => {
  if (!token) return;
  const user = await User.findOneAndUpdate(
    { refreshToken: token },
    { $set: { refreshToken: null } }
  );
  return user;
};
