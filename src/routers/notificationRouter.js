import express from 'express'
import { getNotifications, markAsRead } from '../middlewares/notificationMiddleware.js';
import { sendNotification } from '../controllers/notificationController.js';

const router = express.Router();


router.get("/:userId", getNotifications);
router.put("/read/:id", markAsRead);
router.post("/send", sendNotification);


export default router;