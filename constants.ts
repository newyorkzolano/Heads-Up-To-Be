import { Category, Difficulty, GameSettings } from "./types";

export const DEFAULT_SETTINGS: GameSettings = {
  category: Category.FAMOUS_PEOPLE,
  difficulty: Difficulty.EASY,
  duration: 90,
};

export const APP_TITLE = "ToBe Heads Up";
export const CARDS_PER_ROUND = 15; 

export const FALLBACK_CARDS = [
  {
    id: '1',
    name: 'Spiderman',
    category: 'Superhero',
    hints: ['He is a teenager', 'He is strong', 'He is red and blue'],
    toBeContext: 'Am I...?'
  },
  {
    id: '2',
    name: 'Lion',
    category: 'Animal',
    hints: ['It is the king of the jungle', 'It is fierce', 'It is big'],
    toBeContext: 'Am I...?'
  },
  {
    id: '3',
    name: 'Doctor',
    category: 'Job',
    hints: ['They are helpful', 'They are in a hospital', 'They are smart'],
    toBeContext: 'Am I...?'
  },
  {
    id: '4',
    name: 'Harry Potter',
    category: 'Wizard',
    hints: ['He is magical', 'He is brave', 'He is a student'],
    toBeContext: 'Am I...?'
  }
];