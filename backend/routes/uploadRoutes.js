import express from 'express';
import rateLimit from 'express-rate-limit';
import authMiddleware from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import {
  createProductImageUploadUrls,
  deleteProductImageUpload,
  rollbackProductImageUploads,
} from '../controllers/uploadController.js';

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many upload requests. Please try again later.' },
});

router.use(authMiddleware, adminMiddleware, uploadLimiter);

router.post('/product-images/presign', createProductImageUploadUrls);
router.post('/product-images/rollback', rollbackProductImageUploads);
router.delete('/product-images', deleteProductImageUpload);

export default router;
