import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import {
  createOrderForUser,
  findOrderForUser,
  findOrdersForUser,
} from '../services/orderService.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = asyncHandler(async (req, res) => {
  const order = await createOrderForUser({
    userId: req.user._id,
    orderItems: req.body.orderItems,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod,
  });

  success(res, order, 201);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await findOrderForUser({
    orderId: req.params.id,
    user: req.user,
  });

  success(res, order);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await findOrdersForUser(req.user._id);
  success(res, orders);
});
