import express from 'express';
import {
  addItemToCart,
  changeCartItemQuantity,
  clearCart,
  deleteCartItem,
  getCart,
} from '../controllers/cartController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getCart).delete(clearCart);
router.post('/items', addItemToCart);
router.route('/items/:productId').patch(changeCartItemQuantity).delete(deleteCartItem);

export default router;
