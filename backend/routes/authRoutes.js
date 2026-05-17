import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getProfile);
router.put('/me', authMiddleware, authController.updateProfile);
router.post('/me/addresses', authMiddleware, authController.addAddress);
router.put('/me/addresses/:addressId', authMiddleware, authController.updateAddress);
router.delete('/me/addresses/:addressId', authMiddleware, authController.deleteAddress);
router.patch('/me/addresses/:addressId/default', authMiddleware, authController.setDefaultAddress);

export default router;
