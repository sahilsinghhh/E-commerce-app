import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import HttpError from '../utils/httpError.js';

const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING_PRICE = 10;

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const validateShippingAddress = (shippingAddress = {}) => {
  const requiredFields = ['address', 'city', 'postalCode', 'country'];
  const missingField = requiredFields.find((field) => !String(shippingAddress[field] || '').trim());

  if (missingField) {
    throw new HttpError(400, `Shipping ${missingField} is required`);
  }

  return {
    address: shippingAddress.address.trim(),
    city: shippingAddress.city.trim(),
    postalCode: shippingAddress.postalCode.trim(),
    country: shippingAddress.country.trim(),
  };
};

const normalizeIncomingItems = (orderItems = []) => {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return [];
  }

  const itemMap = new Map();

  orderItems.forEach((item) => {
    const productId = item.product || item.productId || item._id;
    const quantity = Number(item.quantity);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new HttpError(400, 'Invalid product id in order item');
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new HttpError(400, 'Order item quantity must be an integer between 1 and 99');
    }

    itemMap.set(productId.toString(), (itemMap.get(productId.toString()) || 0) + quantity);
  });

  return [...itemMap.entries()].map(([product, quantity]) => ({ product, quantity }));
};

const getOrderSourceItems = async ({ userId, orderItems }) => {
  const directItems = normalizeIncomingItems(orderItems);
  if (directItems.length > 0) {
    return directItems;
  }

  const cart = await Cart.findOne({ user: userId }).lean();
  if (!cart || cart.items.length === 0) {
    throw new HttpError(400, 'No order items');
  }

  return cart.items.map((item) => ({
    product: item.product.toString(),
    quantity: item.quantity,
  }));
};

const buildVerifiedOrderItems = async (sourceItems) => {
  const productIds = sourceItems.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } }).select(
    'name price image stock'
  );
  const productById = new Map(products.map((product) => [product._id.toString(), product]));

  return sourceItems.map((item) => {
    const product = productById.get(item.product);

    if (!product) {
      throw new HttpError(404, 'One or more products were not found');
    }

    if (product.stock < item.quantity) {
      throw new HttpError(409, `${product.name} has only ${product.stock} units available`);
    }

    return {
      name: product.name,
      quantity: item.quantity,
      image: product.image,
      price: product.price,
      product: product._id,
    };
  });
};

export const createOrderForUser = async ({
  userId,
  orderItems,
  shippingAddress,
  paymentMethod = 'Credit Card',
}) => {
  const safeShippingAddress = validateShippingAddress(shippingAddress);
  const sourceItems = await getOrderSourceItems({ userId, orderItems });
  const verifiedOrderItems = await buildVerifiedOrderItems(sourceItems);

  const itemsPrice = roundMoney(
    verifiedOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_PRICE;
  const totalPrice = roundMoney(itemsPrice + shippingPrice);

  const stockUpdateResult = await Product.bulkWrite(
    verifiedOrderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } },
      },
    }))
  );

  if (stockUpdateResult.modifiedCount !== verifiedOrderItems.length) {
    throw new HttpError(409, 'One or more products no longer have enough stock');
  }

  const order = await Order.create({
    orderItems: verifiedOrderItems,
    user: userId,
    shippingAddress: safeShippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
  });

  await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

  return order;
};

export const findOrderForUser = async ({ orderId, user }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new HttpError(400, 'Invalid order id');
  }

  const order = await Order.findById(orderId).populate('user', 'name email');
  if (!order) {
    throw new HttpError(404, 'Order not found');
  }

  const isOwner = order.user._id.toString() === user._id.toString();
  if (!isOwner && user.role !== 'admin') {
    throw new HttpError(403, 'You are not allowed to view this order');
  }

  return order;
};

export const findOrdersForUser = async (userId) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};
