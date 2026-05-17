import axios from 'axios';
import axiosInstance from './axios';

export const createProductImageUploadUrls = async ({ files, productSlug }) => {
  const response = await axiosInstance.post('/uploads/product-images/presign', {
    files,
    productSlug,
  });
  return response.data;
};

export const rollbackProductImageUploads = async (keys) => {
  if (!keys.length) return;
  const response = await axiosInstance.post('/uploads/product-images/rollback', { keys });
  return response.data;
};

export const uploadImageToS3 = async ({ uploadUrl, file, onProgress }) => {
  console.log('file.type:', file.type);
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    withCredentials: false,
    onUploadProgress: (event) => {
      if (!event.total) return;
      onProgress?.(Math.round((event.loaded * 100) / event.total));
    },
  });
};
