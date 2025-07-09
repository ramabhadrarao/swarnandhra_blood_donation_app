import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  verifyDonor,
  getAllDonors,
  getAdminBloodRequests,
  assignDonorToRequest,
  updateBloodRequestStatus
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, adminMiddleware, getDashboardStats);
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.get('/donors', authMiddleware, adminMiddleware, getAllDonors);
router.get('/blood-requests', authMiddleware, adminMiddleware, getAdminBloodRequests);
router.put('/users/:userId/status', authMiddleware, adminMiddleware, updateUserStatus);
router.put('/donors/:donorId/verify', authMiddleware, adminMiddleware, verifyDonor);
router.post('/assign-donor', authMiddleware, adminMiddleware, assignDonorToRequest);
router.put('/blood-requests/:requestId/status', authMiddleware, adminMiddleware, updateBloodRequestStatus);

export default router;