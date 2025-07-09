import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateRequestStatus,
  assignDonorToRequest,
  getRequestsForDonors,
  getMyAssignedRequests,
  respondToRequest,
  uploadProofDocument,
  markRequestCompleted
} from '../controllers/requestController.js';

const router = express.Router();

router.post('/', createBloodRequest);
router.get('/', getBloodRequests);
router.get('/for-donors', authMiddleware, getRequestsForDonors);
router.get('/my-assignments', authMiddleware, getMyAssignedRequests);
router.post('/respond', authMiddleware, respondToRequest);
router.post('/upload-proof', authMiddleware, uploadProofDocument);
router.post('/mark-completed', authMiddleware, markRequestCompleted);
router.get('/:id', getBloodRequestById);
router.put('/:id/status', authMiddleware, updateRequestStatus);
router.post('/assign', authMiddleware, assignDonorToRequest);

export default router;