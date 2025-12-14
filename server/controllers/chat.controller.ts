import { Request, Response, NextFunction } from 'express';
import { GeminiService } from '../services/gemini.service';
import { AppError } from '../middleware/error.middleware';
import { lectureDB } from './lecture.controller'; // Import shared DB

export class ChatController {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  askQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { message, history } = req.body;

      if (!message) {
        throw new AppError('Message is required', 400);
      }

      // 1. Fetch Context
      const lecture = lectureDB[id]; 
      
      if (!lecture) {
        throw new AppError('Lecture not found or session expired', 404);
      }

      const context = lecture.transcript || lecture.summary || "No context available.";

      // 2. Process with AI
      const answer = await this.geminiService.chatWithContext(
        history || [], 
        context, 
        message
      );

      res.status(200).json({
        status: 'success',
        data: {
          answer,
          timestamp: new Date()
        }
      });

    } catch (error) {
      next(error);
    }
  };
}