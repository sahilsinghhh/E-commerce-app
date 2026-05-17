import * as authService from '../services/authService.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpError from '../utils/httpError.js';

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
    res.clearCookie('refreshToken');
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
