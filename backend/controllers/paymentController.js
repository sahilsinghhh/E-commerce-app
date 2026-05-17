import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import HttpError from '../utils/httpError.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// @desc    Process Razorpay order creation / generate mock order
// @route   POST /api/payment/process
// @access  Private
export const processPayment = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    throw new HttpError(400, 'A valid payment amount is required');
  }

  const razorpay = getRazorpayInstance();

  if (razorpay) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise (1 INR = 100 paise)
        currency: currency.toUpperCase(),
        receipt: `receipt_order_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);

      return success(res, {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        mode: 'live',
      });
    } catch (err) {
      throw new HttpError(500, err.message || 'Razorpay order creation failed');
    }
  } else {
    // Sandbox Mock simulator fallback if no Razorpay credentials configured yet
    const simulatedOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
    
    return success(res, {
      success: true,
      orderId: simulatedOrderId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      mode: 'sandbox',
      message: 'Running in simulated payment sandbox. Use any test credentials to complete payment.',
    });
  }
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id) {
    throw new HttpError(400, 'Payment and Order IDs are required');
  }

  // If it's a simulated order, skip real signature verification and verify immediately
  if (razorpay_order_id.startsWith('order_mock_') || !process.env.RAZORPAY_KEY_SECRET) {
    return success(res, {
      verified: true,
      message: 'Simulated payment verified successfully.',
    });
  }

  if (!razorpay_signature) {
    throw new HttpError(400, 'Payment signature is required');
  }

  try {
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      throw new HttpError(400, 'Invalid payment signature. Verification failed.');
    }

    return success(res, {
      verified: true,
      message: 'Payment verified successfully.',
    });
  } catch (err) {
    throw new HttpError(500, 'Internal payment verification error.');
  }
});

// @desc    Get Razorpay Config
// @route   GET /api/payment/config
// @access  Private
export const getPaymentConfig = asyncHandler(async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_shophub_key_1o9283';
  const isSimulated = !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;

  success(res, {
    keyId,
    isSimulated,
  });
});
