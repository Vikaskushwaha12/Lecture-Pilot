import { Router } from 'express';
import { LectureController } from '../controllers/lecture.controller';
import { ChatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();
const lectureController = new LectureController();
const chatController = new ChatController();

// --- Lecture Management ---

// Upload video & start processing pipeline (Transcription -> Analysis)
router.post(
  '/lectures/upload',
  authMiddleware,
  uploadMiddleware.single('video'),
  lectureController.uploadAndProcess
);

// Get specific lecture details
router.get(
  '/lectures/:id',
  authMiddleware,
  lectureController.getLecture
);

// --- Chatbot / Doubt Solver ---

// Ask a question about a specific lecture
router.post(
  '/lectures/:id/chat',
  authMiddleware,
  chatController.askQuestion
);

export default router;