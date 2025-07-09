import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  registerDonor,
  getDonorProfile,
  updateDonorProfile,
  searchDonors,
  getDonorsList
} from '../controllers/donorController.js';

const router = express.Router();

router.post('/register', authMiddleware, registerDonor);
router.get('/profile', authMiddleware, getDonorProfile);
router.put('/profile', authMiddleware, updateDonorProfile);
router.get('/search', searchDonors);
router.get('/list', getDonorsList);

export default router;