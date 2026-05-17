import asyncHandler from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import {
  addCartItem,
  clearUserCart,
  getOrCreateCart,
  removeCartItem,
  updateCartItem,
} from '../services/cartService.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  success(res, cart);
});

export const addItemToCart = asyncHandler(async (req, res) => {
  const cart = await addCartItem({
    userId: req.user._id,
    productId: req.body.productId,
    quantity: req.body.quantity,
  });

  success(res, cart, 201);
});

export const changeCartItemQuantity = asyncHandler(async (req, res) => {
  const cart = await updateCartItem({
    userId: req.user._id,
    productId: req.params.productId,
    quantity: req.body.quantity,
  });

  success(res, cart);
});

export const deleteCartItem = asyncHandler(async (req, res) => {
  const cart = await removeCartItem({
    userId: req.user._id,
    productId: req.params.productId,
  });

  success(res, cart);
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await clearUserCart(req.user._id);
  success(res, cart);
});
