import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateRequestStatus,
  assignDonorToRequest
} from '../controllers/requestController.js';

const router = express.Router();

router.post('/', createBloodRequest);
router.get('/', getBloodRequests);
router.get('/:id', getBloodRequestById);
router.put('/:id/status', authMiddleware, updateRequestStatus);
router.post('/assign', authMiddleware, assignDonorToRequest);

export default router;