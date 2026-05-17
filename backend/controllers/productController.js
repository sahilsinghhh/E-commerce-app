import Product from '../models/Product.js';
import { deleteProductImageObjects } from '../services/s3UploadService.js';

const normalizeProductPayload = (body) => {
  const payload = { ...body };

  if (Array.isArray(payload.images)) {
    payload.images = payload.images.slice(0, 5).map((image, index) => ({
      url: image.url,
      key: image.key,
      alt: image.alt || payload.name || 'Product image',
      isPrimary: Boolean(image.isPrimary) || index === 0,
    }));

    const primaryIndex = payload.images.findIndex((image) => image.isPrimary);
    payload.images = payload.images.map((image, index) => ({
      ...image,
      isPrimary: index === (primaryIndex >= 0 ? primaryIndex : 0),
    }));

    if (payload.images.length > 0) {
      payload.image = payload.images.find((image) => image.isPrimary)?.url || payload.images[0].url;
    }
  }

  return payload;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(normalizeProductPayload(req.body));
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const previousProduct = await Product.findById(req.params.id);
    if (!previousProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const payload = normalizeProductPayload(req.body);
    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (Array.isArray(payload.images)) {
      const nextKeys = new Set(payload.images.map((image) => image.key));
      const removedKeys = previousProduct.images
        .map((image) => image.key)
        .filter((key) => key && !nextKeys.has(key));

      if (removedKeys.length) {
        deleteProductImageObjects(removedKeys).catch((deleteError) => {
          console.error('Failed to delete replaced product images', deleteError);
        });
      }
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.images?.length) {
      deleteProductImageObjects(product.images.map((image) => image.key)).catch((deleteError) => {
        console.error('Failed to delete product images', deleteError);
      });
    }
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
