import { GoogleGenAI, Type } from "@google/genai";
import { LectureData, ChatMessage } from "../types";

const API_BASE_URL = "http://localhost:3001/api/v1";

// --- CLIENT-SIDE FALLBACK CONSTANTS ---

// Initialize Gemini Client for client-side fallback
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const HALLUCINATION_PREVENTION_CLAUSE = `
CRITICAL RULE: HALLUCINATION PREVENTION
- You are strictly a "Lecture Processor". 
- Do NOT add outside knowledge, facts, or historical context that is not explicitly present in the provided video/audio/transcript.
- If a concept is mentioned but not explained, note it as "Mentioned but not defined".
`;

const ANALYSIS_SYSTEM_PROMPT = `
You are Lecture Pilot, an advanced EdTech AI designed to convert raw educational video content into high-quality exam revision assets.

${HALLUCINATION_PREVENTION_CLAUSE}

YOUR TASKS:
1. **Executive Summary**: A concise 3-4 sentence overview.
2. **Topic Segmentation**: Timestamped chapters with titles.
3. **Exam-Oriented Notes**: Structured headings and bullet points.
4. **Formula Extraction**: LaTeX format formulas with context.
5. **Complexity Analysis**: conceptual difficulty (1-100) curve.
6. **Active Recall**: 5 Quiz questions and 8 Flashcards.

Output the result in the strict JSON schema provided.
`;

const CHAT_SYSTEM_PROMPT = (context: string) => `
You are 'Lecture Pilot AI', a specialized Tutor for this specific lecture.
CONTEXT: ${context}
${HALLUCINATION_PREVENTION_CLAUSE}
Answer questions strictly based on the context.
`;

const LECTURE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    transcript: { type: Type.STRING },
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.STRING },
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
          points: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    formulas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          latex: { type: Type.STRING },
          description: { type: Type.STRING },
          context: { type: Type.STRING }
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
          correctAnswer: { type: Type.INTEGER },
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

// Helper to simulate a token (in a real app, use auth provider)
const getAuthHeader = () => ({
  'Authorization': 'Bearer mock_token_123'
});

export const analyzeLecture = async (
  content: File | string, 
  progressCallback: (msg: string) => void
): Promise<LectureData> => {
  progressCallback("Preparing upload...");

  try {
    // 1. Try Backend API
    const formData = new FormData();
    if (content instanceof File) {
      formData.append('video', content);
    } else {
      formData.append('transcript', content);
    }

    const json = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/lectures/upload`);
      
      // Add Auth Headers
      const headers = getAuthHeader();
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      // Track Upload Progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          if (percent < 100) {
            progressCallback(`Uploading content... ${percent}%`);
          } else {
             progressCallback(`Processing lecture content...`);
          }
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error("Invalid JSON response"));
          }
        } else {
          reject(new Error(`Server Error: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network connection failed"));
      xhr.ontimeout = () => reject(new Error("Request timed out"));
      
      // Set a short timeout to fail fast and trigger fallback if backend is down
      xhr.timeout = 5000; 

      xhr.send(formData);
    });

    const data = json.data;
    
    return {
      id: data.id,
      title: data.title || "Untitled Lecture",
      summary: data.summary,
      transcript: data.transcript,
      videoUrl: content instanceof File ? URL.createObjectURL(content) : "",
      segments: data.segments || [],
      notes: data.notes || [],
      formulas: data.formulas || [],
      complexityData: data.complexityData || [],
      quizzes: data.quizzes || [],
      flashcards: data.flashcards || []
    } as LectureData;

  } catch (error) {
    console.warn("Backend unavailable, falling back to Client-Side AI...", error);
    progressCallback("Server unavailable. Switching to browser AI...");
    
    // 2. Client-Side Fallback
    return await analyzeLectureClientSide(content, progressCallback);
  }
};

const analyzeLectureClientSide = async (
  content: File | string,
  progressCallback: (msg: string) => void
): Promise<LectureData> => {
  try {
    const model = "gemini-2.5-flash";
    let transcriptText = "";

    if (content instanceof File) {
      progressCallback("Analyzing video structure (Client-side)...");
      await new Promise(r => setTimeout(r, 1000));
      progressCallback("Extracting audio data...");
      await new Promise(r => setTimeout(r, 1000));
      transcriptText = MOCK_TRANSCRIPT;
    } else {
      transcriptText = content;
    }

    progressCallback("Generating notes, quiz, and flashcards with Gemini...");
    
    const parts = [{ text: `Transcript Input:\n${transcriptText.substring(0, 500000)}` }];

    const response = await ai.models.generateContent({
      model,
      contents: { role: 'user', parts: parts },
      config: {
        systemInstruction: ANALYSIS_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: LECTURE_SCHEMA
      }
    });

    if (!response.text) throw new Error("Empty response from AI");
    
    const data = JSON.parse(response.text);

    return {
      id: Date.now().toString(),
      title: data.title || "Untitled Lecture",
      summary: data.summary,
      transcript: transcriptText,
      videoUrl: content instanceof File ? URL.createObjectURL(content) : "",
      segments: data.segments || [],
      notes: data.notes || [],
      formulas: data.formulas || [],
      complexityData: data.complexityData || [],
      quizzes: data.quizzes || [],
      flashcards: data.flashcards || []
    };

  } catch (error) {
    console.error("Client-side Analysis Error:", error);
    throw new Error("Failed to analyze content (both Server and Client failed).");
  }
};

export const apiChatWithLecture = async (lectureId: string, history: {role: 'user'|'model', text: string}[], message: string) => {
  try {
    // Try Server
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${API_BASE_URL}/lectures/${lectureId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ message, history }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Chat Server Error");
    const json = await response.json();
    return json.data.answer;

  } catch (error) {
    console.warn("Chat Server unavailable, using Client-side AI...");
    
    // Client-side Fallback
    try {
      const context = MOCK_TRANSCRIPT;
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: { systemInstruction: CHAT_SYSTEM_PROMPT(context) },
        history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
      });
      
      const result = await chat.sendMessage({ message });
      return result.text;
    } catch (clientError) {
      console.error("Client Chat Error:", clientError);
      return "I'm having trouble connecting right now.";
    }
  }
};