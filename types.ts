export interface LectureData {
  id: string;
  title: string;
  videoUrl?: string; 
  transcript: string;
  summary: string;
  segments: Segment[];
  notes: NoteSection[];
  formulas: Formula[];
  complexityData: ComplexityPoint[];
  quizzes: QuizQuestion[];
  flashcards: Flashcard[];
}

export interface Segment {
  timestamp: string;
  title: string;
  description: string;
}

export interface NoteSection {
  heading: string;
  points: string[];
}

export interface Formula {
  latex: string;
  description: string;
  context: string; // The sentence where it was mentioned
}

export interface ComplexityPoint {
  time: string;
  score: number; // 1-100
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  explanation: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppState {
  LANDING,
  PROCESSING,
  DASHBOARD,
  ERROR
}

export type View = 'home' | 'workspace' | 'settings';