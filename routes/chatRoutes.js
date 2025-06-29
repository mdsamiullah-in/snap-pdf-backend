// ai-chat-service/src/routes/chatRoutes.js
import express from 'express';
import { getAIResponse, getChatsByFileAndUser, deleteChat } from '../controllers/chatController.js';
import { AdminUserGuard } from '../middlewares/user.middlewares.js';

const router = express.Router();

// Define the route for AI chat
router.post('/', AdminUserGuard, getAIResponse); // POST /api/chat
router.get('/:fileId', AdminUserGuard, getChatsByFileAndUser); // ✅ Chat history route
router.delete('/:chatId', AdminUserGuard, deleteChat);

export default router;