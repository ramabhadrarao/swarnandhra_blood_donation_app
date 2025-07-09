import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.put('/:id/read', authMiddleware, markNotificationAsRead);
router.put('/mark-all-read', authMiddleware, markAllNotificationsAsRead);

export default router;