import express from 'express';
import {
  addOrderItems,
  getOrderById,
  getMyOrders,
} from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, addOrderItems);
router.get('/myorders', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);

export default router;
