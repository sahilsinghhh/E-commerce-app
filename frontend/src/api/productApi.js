import axiosInstance from './axios';

export const fetchProducts = async (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  const response = await axiosInstance.get(`/products${params ? `?${params}` : ''}`);
  return response.data;
};

export const fetchProductById = async (id) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axiosInstance.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axiosInstance.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};
