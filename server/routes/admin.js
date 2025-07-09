import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  verifyDonor
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, adminMiddleware, getDashboardStats);
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.put('/users/:userId/status', authMiddleware, adminMiddleware, updateUserStatus);
router.put('/donors/:donorId/verify', authMiddleware, adminMiddleware, verifyDonor);

export default router;