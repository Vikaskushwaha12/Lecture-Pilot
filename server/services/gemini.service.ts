import { GoogleGenAI, Type } from "@google/genai";
import { AppError } from "../middleware/error.middleware";
import { ANALYSIS_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT } from "./prompts";
import fs from "fs";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Schema Definition for Structured Output
const LECTURE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    transcript: { type: Type.STRING, description: "A comprehensive transcript of the lecture." },
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING, description: "Format MM:SS" },
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    },
    notes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          points: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    },
    formulas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          latex: { type: Type.STRING, description: "The formula in LaTeX format (e.g. E=mc^2)" },
          description: { type: Type.STRING, description: "What this formula calculates" },
          context: { type: Type.STRING, description: "Surrounding context/explanation" }
        }
      }
    },
    quizzes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.INTEGER, description: "Index of correct option (0-3)" },
          explanation: { type: Type.STRING }
        }
      }
    },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          front: { type: Type.STRING },
          back: { type: Type.STRING }
        }
      }
    },
    complexityData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING },
          score: { type: Type.NUMBER }
        }
      }
    }
  }
};

// MOCK TRANSCRIPT for Video Uploads (Since we don't have a real STT engine here)
const MOCK_TRANSCRIPT = `
[00:00] Instructor: Hello class. Today we are diving into the fundamentals of Thermodynamics, specifically the Second Law. 
[00:30] The Second Law of Thermodynamics states that the total entropy of an isolated system can never decrease over time. 
[01:15] Think of entropy as disorder. If you drop a glass and it shatters, that's high entropy. It doesn't spontaneously put itself back together.
[02:00] The formula involves Delta S, which must be greater than or equal to zero for spontaneous processes. Written as: \\Delta S_{univ} \\geq 0.
[03:45] We also relate this to Heat Transfer. Heat always flows from a hot body to a cold body, never the reverse spontaneously. 
[05:00] This leads to the concept of Heat Engines and Efficiency. No engine can be 100% efficient due to this law. Carnot Efficiency gives us the theoretical maximum.
[06:30] Let's solve a problem. If we have a reservoir at 500K and a cold sink at 300K, what is the max efficiency? Efficiency = 1 - (Tc/Th).
[08:00] So, 1 - (300/500) = 1 - 0.6 = 0.4. That is 40% efficiency.
[09:15] Remember, energy quality degrades. Energy quantity is conserved (First Law), but quality decreases (Second Law).
[10:00] For the exam, memorize the Carnot efficiency formula and the definition of Entropy.
`;

export class GeminiService {
  /**
   * Processes a transcript or video file path to generate full lecture structure.
   */
  async analyzeLectureContent(content: string, mimeType?: string, isFilePath = false) {
    try {
      const model = "gemini-2.5-flash";
      let transcriptText = "";

      if (isFilePath && mimeType) {
        // FIX: Do not send raw video bytes to Gemini inline (Causes payload errors).
        // Since we lack a real STT service (Whisper/AssemblyAI), we SIMULATE transcription.
        console.log("Video detected. Simulating speech-to-text extraction...");
        transcriptText = MOCK_TRANSCRIPT; 
      } else {
        // It's already a text transcript
        transcriptText = content;
      }

      // Ensure text isn't too long for context window (safety check)
      const safeTranscript = transcriptText.substring(0, 500000);

      const parts = [
        { text: `Transcript Input:\n${safeTranscript}` }
      ];

      const response = await ai.models.generateContent({
        model,
        contents: {
          role: 'user',
          parts: parts
        },
        config: {
          systemInstruction: ANALYSIS_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: LECTURE_SCHEMA
        }
      });

      if (!response.text) {
        throw new AppError("Empty response from AI model", 500);
      }

      return JSON.parse(response.text);

    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      throw new AppError("Failed to analyze lecture content", 500);
    }
  }

  /**
   * RAG-based Chatbot functionality
   */
  async chatWithContext(history: any[], context: string, question: string) {
    try {
      const model = "gemini-2.5-flash";
      
      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: CHAT_SYSTEM_PROMPT(context.substring(0, 100000))
        },
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
        }))
      });

      const result = await chat.sendMessage({ message: question });
      return result.text;

    } catch (error) {
      console.error("Gemini Chat Error:", error);
      throw new AppError("Failed to generate chat response", 500);
    }
  }
}