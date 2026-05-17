import axios from './axios';

/**
 * Creates a Razorpay Order with the backend
 * @param {object} payload - Payment details (amount, currency)
 * @returns {Promise<object>} The server response containing orderId, amount, and mode
 */
export const processPayment = async ({ amount, currency = 'INR' }) => {
  const { data } = await axios.post('/payment/process', { amount, currency });
  return data;
};

/**
 * Verifies Razorpay payment signature
 * @param {object} verificationData - order_id, payment_id, signature
 * @returns {Promise<object>} The verification response status
 */
export const verifyPaymentSignature = async (verificationData) => {
  const { data } = await axios.post('/payment/verify', verificationData);
  return data;
};

/**
 * Fetches Razorpay config (keyId) from backend
 * @returns {Promise<object>} Razorpay keyId and simulation mode status
 */
export const getPaymentConfig = async () => {
  const { data } = await axios.get('/payment/config');
  return data;
};
