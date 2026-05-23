import axiosInstance, { setAccessToken } from './axios';

export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  if (response.data.success) {
    setAccessToken(response.data.data.accessToken);
  }
  return response.data;
};

export const register = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  if (response.data.success) {
    setAccessToken(response.data.data.accessToken);
  }
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post('/auth/logout', {}, { skipAuthRefresh: true });
  setAccessToken('');
  return response.data;
};

export const getProfile = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put('/auth/me', profileData);
  return response.data;
};

export const addAddress = async (addressData) => {
  const response = await axiosInstance.post('/auth/me/addresses', addressData);
  return response.data;
};

export const updateAddress = async (addressId, addressData) => {
  const response = await axiosInstance.put(`/auth/me/addresses/${addressId}`, addressData);
  return response.data;
};

export const deleteAddress = async (addressId) => {
  const response = await axiosInstance.delete(`/auth/me/addresses/${addressId}`);
  return response.data;
};

export const setDefaultAddress = async (addressId) => {
  const response = await axiosInstance.patch(`/auth/me/addresses/${addressId}/default`);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};
