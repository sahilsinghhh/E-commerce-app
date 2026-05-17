import axiosInstance from './axios';

export const fetchCart = async () => {
  const response = await axiosInstance.get('/cart');
  return response.data;
};

export const addCartItem = async ({ productId, quantity }) => {
  const response = await axiosInstance.post('/cart/items', { productId, quantity });
  return response.data;
};

export const updateCartItem = async ({ productId, quantity }) => {
  const response = await axiosInstance.patch(`/cart/items/${productId}`, { quantity });
  return response.data;
};

export const removeCartItem = async (productId) => {
  const response = await axiosInstance.delete(`/cart/items/${productId}`);
  return response.data;
};

export const clearServerCart = async () => {
  const response = await axiosInstance.delete('/cart');
  return response.data;
};
