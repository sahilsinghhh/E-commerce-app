import axiosInstance from './axios';

export const createOrder = async (orderData) => {
  const response = await axiosInstance.post('/orders', orderData);
  return response.data;
};

export const fetchOrderById = async (id) => {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response.data;
};

export const fetchMyOrders = async () => {
  const response = await axiosInstance.get('/orders/myorders');
  return response.data;
};
