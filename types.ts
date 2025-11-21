export enum GameState {
  MENU = 'MENU',
  GENERATING = 'GENERATING',
  COUNTDOWN = 'COUNTDOWN',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  SUMMARY = 'SUMMARY',
  ERROR = 'ERROR'
}

export enum Category {
  FAMOUS_PEOPLE = 'Famous People',
  FICTIONAL_CHARACTERS = 'Fictional Characters',
  ANIMALS = 'Animals',
  JOBS = 'Jobs & Professions'
}

export enum Difficulty {
  EASY = 'Easy',
  HARD = 'Hard'
}

export interface CardData {
  id: string;
  name: string; // e.g., "Taylor Swift"
  category: string; // e.g., "Singer"
  hints: string[]; // ["She is a singer", "She is blonde"]
  toBeContext: string; // "Am I...?" or "Are we...?"
}

export interface GameSettings {
  category: Category;
  difficulty: Difficulty;
  duration: number; // in seconds
}

export interface RoundResult {
  correct: CardData[];
  skipped: CardData[];
  totalScore: number;
}