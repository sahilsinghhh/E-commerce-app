import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import HttpError from '../utils/httpError.js';

const assertObjectId = (id, label = 'id') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, `Invalid ${label}`);
  }
};

const normalizeQuantity = (quantity) => {
  const parsed = Number(quantity);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 99) {
    throw new HttpError(400, 'Quantity must be an integer between 1 and 99');
  }
  return parsed;
};

const populateCart = (query) =>
  query.populate({
    path: 'items.product',
    select: 'name price image category stock',
  });

export const getOrCreateCart = async (userId) => {
  let cart = await populateCart(Cart.findOne({ user: userId }));

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await populateCart(Cart.findById(cart._id));
  }

  return cart;
};

export const addCartItem = async ({ userId, productId, quantity = 1 }) => {
  assertObjectId(productId, 'product id');
  const requestedQuantity = normalizeQuantity(quantity);

  const product = await Product.findById(productId).select('stock');
  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  const cart = await Cart.findOne({ user: userId }) || new Cart({ user: userId, items: [] });
  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  const nextQuantity = (existingItem?.quantity || 0) + requestedQuantity;

  if (nextQuantity > product.stock) {
    throw new HttpError(409, `Only ${product.stock} units available`);
  }

  if (existingItem) {
    existingItem.quantity = nextQuantity;
  } else {
    cart.items.push({ product: productId, quantity: requestedQuantity });
  }

  await cart.save();
  return populateCart(Cart.findById(cart._id));
};

export const updateCartItem = async ({ userId, productId, quantity }) => {
  assertObjectId(productId, 'product id');
  const requestedQuantity = normalizeQuantity(quantity);

  const product = await Product.findById(productId).select('stock');
  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  if (requestedQuantity > product.stock) {
    throw new HttpError(409, `Only ${product.stock} units available`);
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new HttpError(404, 'Cart not found');
  }

  const item = cart.items.find((cartItem) => cartItem.product.toString() === productId);
  if (!item) {
    throw new HttpError(404, 'Cart item not found');
  }

  item.quantity = requestedQuantity;
  await cart.save();
  return populateCart(Cart.findById(cart._id));
};

export const removeCartItem = async ({ userId, productId }) => {
  assertObjectId(productId, 'product id');

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new HttpError(404, 'Cart not found');
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();
  return populateCart(Cart.findById(cart._id));
};

export const clearUserCart = async (userId) => {
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: [] } },
    { new: true, upsert: true }
  );

  return populateCart(Cart.findById(cart._id));
};
