import * as authService from '../services/authService.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService.js';

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.register({ name, email, password });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, accessToken },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({ email, password });

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: { user, accessToken },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken);

    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await authService.logout(refreshToken);
    clearRefreshTokenCookie(res);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const sanitizeAddress = (body) => ({
  label: body.label || 'Home',
  fullName: body.fullName,
  phone: body.phone,
  address: body.address,
  city: body.city,
  postalCode: body.postalCode,
  country: body.country,
  isDefault: Boolean(body.isDefault),
});

const normalizeDefaultAddress = (user, defaultAddressId) => {
  if (!user.addresses.length) return;

  const targetId = defaultAddressId || user.addresses[0]._id;
  user.addresses.forEach((address) => {
    address.isDefault = address._id.toString() === targetId.toString();
  });
};

const sendUser = (res, user, status = 200) => {
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.__v;
  res.status(status).json({ success: true, data: userObject });
};

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new HttpError(404, 'User not found');

  if (req.body.name) user.name = req.body.name;
  await user.save();
  sendUser(res, user);
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new HttpError(404, 'User not found');

  const address = sanitizeAddress(req.body);
  if (address.isDefault || user.addresses.length === 0) {
    user.addresses.forEach((item) => {
      item.isDefault = false;
    });
    address.isDefault = true;
  }

  user.addresses.push(address);
  await user.save();
  sendUser(res, user, 201);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new HttpError(404, 'User not found');

  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new HttpError(404, 'Address not found');

  address.set(sanitizeAddress({ ...address.toObject(), ...req.body }));
  if (address.isDefault) {
    normalizeDefaultAddress(user, address._id);
  }

  await user.save();
  sendUser(res, user);
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new HttpError(404, 'User not found');

  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new HttpError(404, 'Address not found');

  const wasDefault = address.isDefault;
  address.deleteOne();
  if (wasDefault) normalizeDefaultAddress(user);

  await user.save();
  sendUser(res, user);
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new HttpError(404, 'User not found');

  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new HttpError(404, 'Address not found');

  normalizeDefaultAddress(user, address._id);
  await user.save();
  sendUser(res, user);
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new HttpError(400, 'Please provide an email address');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return success to prevent email enumeration attacks
    return res.status(200).json({
      success: true,
      message: 'If a user with this email exists, a password reset link has been sent.',
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set in database with 10 minutes expiry
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({
      success: true,
      message: 'If a user with this email exists, a password reset link has been sent.',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    throw new HttpError(500, 'Password reset email could not be sent');
  }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    throw new HttpError(400, 'Please provide a password with at least 6 characters');
  }

  // Hash reset token from URL
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new HttpError(400, 'Invalid or expired password reset token');
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});
