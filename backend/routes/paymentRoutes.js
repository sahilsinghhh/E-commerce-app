import express from 'express';
import { processPayment, getPaymentConfig, verifyPayment } from '../controllers/paymentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/process', authMiddleware, processPayment);
router.post('/verify', authMiddleware, verifyPayment);
router.get('/config', authMiddleware, getPaymentConfig);

export default router;
