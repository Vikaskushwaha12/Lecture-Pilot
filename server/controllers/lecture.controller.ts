import { Request, Response, NextFunction } from 'express';
import { GeminiService } from '../services/gemini.service';
import { AppError } from '../middleware/error.middleware';
import fs from 'fs';

// Mock Database (Replace with Supabase/Postgres in real impl)
const lectureDB: Record<string, any> = {};

export class LectureController {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  /**
   * Handles video upload, mock transcription, and AI analysis
   */
  uploadAndProcess = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let analysisResult;
      let transcript = "";

      // Case 1: File Upload (Video/Audio)
      if (req.file) {
        console.log(`Processing file: ${req.file.path} (${req.file.mimetype})`);
        
        // Pass file path to Gemini Service
        // The Service now handles the "Mock Transcription" internally for files
        analysisResult = await this.geminiService.analyzeLectureContent(
          req.file.path, 
          req.file.mimetype, 
          true
        );
        
        // Use the generated transcript (or mock) returned by Gemini service logic
        transcript = analysisResult.transcript || "Transcript generated from video analysis.";

        // Cleanup: Delete file after processing to save space
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Failed to delete temp file:", err);
        });
      } 
      // Case 2: Text Transcript Upload
      else if (req.body.transcript) {
        transcript = req.body.transcript;
        analysisResult = await this.geminiService.analyzeLectureContent(transcript);
      } else {
        throw new AppError('No video file or transcript provided', 400);
      }

      // 4. Save to DB
      const lectureId = Date.now().toString();
      const lectureData = {
        id: lectureId,
        userId: req.user?.id || 'guest',
        uploadDate: new Date(),
        transcript: transcript, // Store the full transcript
        ...analysisResult
      };

      lectureDB[lectureId] = lectureData;

      // 5. Response
      res.status(201).json({
        status: 'success',
        data: lectureData
      });

    } catch (error) {
      // Cleanup if error occurs
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      next(error);
    }
  };

  /**
   * Retrieve a specific lecture
   */
  getLecture = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const lecture = lectureDB[id];

      if (!lecture) {
        throw new AppError('Lecture not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: lecture
      });
    } catch (error) {
      next(error);
    }
  };
}

// Export the DB for Chat Controller to access (Mock only)
export { lectureDB };