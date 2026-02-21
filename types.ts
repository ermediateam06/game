export enum GameType {
  MENU = 'MENU',
  SNAKE = 'SNAKE',
  MINESWEEPER = 'MINESWEEPER',
  FLAPPY = 'FLAPPY',
  ZUMA = 'ZUMA',
  TETRIS = 'TETRIS',
}

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  WON = 'WON',
  PAUSED = 'PAUSED',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Snake Types
export interface Point {
  x: number;
  y: number;
}

export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

// Minesweeper Types
export interface Cell {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}