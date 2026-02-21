import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState } from '../types';
import { Button } from './Button';

// Tetris Constants
const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 25;
const DROP_SPEED_START = 800;

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: '#06b6d4' }, // Cyan
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' }, // Blue
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316' }, // Orange
  O: { shape: [[1, 1], [1, 1]], color: '#eab308' }, // Yellow
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' }, // Green
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' }, // Purple
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' }, // Red
};

type TetrominoType = keyof typeof TETROMINOS;

interface Piece {
  type: TetrominoType;
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

export const TetrisGame: React.FC = () => {
  const [grid, setGrid] = useState<(string | null)[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);
  const [piece, setPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null

  const createPiece = (type: TetrominoType): Piece => ({
    type,
    shape: TETROMINOS[type].shape,
    color: TETROMINOS[type].color,
    x: Math.floor(COLS / 2) - Math.floor(TETROMINOS[type].shape[0].length / 2),
    y: 0,
  });

  const getRandomPiece = () => {
    const types = Object.keys(TETROMINOS) as TetrominoType[];
    const type = types[Math.floor(Math.random() * types.length)];
    return createPiece(type);
  };

  const checkCollision = (p: Piece, moveX: number, moveY: number, rotateShape?: number[][]) => {
    const shape = rotateShape || p.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = p.x + x + moveX;
          const newY = p.y + y + moveY;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && grid[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (p: Piece) => {
    // Transpose and swap
    const newShape = p.shape[0].map((val, index) =>
      p.shape.map(row => row[index]).reverse()
    );
    if (!checkCollision(p, 0, 0, newShape)) {
      setPiece({ ...p, shape: newShape });
    }
  };

  const mergePiece = () => {
    if (!piece) return;
    const newGrid = [...grid.map(row => [...row])];
    
    // Check game over
    let gameOver = false;

    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
            const gridY = piece.y + y;
            if (gridY < 0) {
                gameOver = true;
            } else {
                newGrid[gridY][piece.x + x] = piece.color;
            }
        }
      });
    });

    if (gameOver) {
      setGameState(GameState.GAME_OVER);
      return;
    }

    // Clear lines
    let linesCleared = 0;
    const clearedGrid = newGrid.filter(row => {
        const full = row.every(cell => cell !== null);
        if (full) linesCleared++;
        return !full;
    });

    while (clearedGrid.length < ROWS) {
        clearedGrid.unshift(Array(COLS).fill(null));
    }

    setGrid(clearedGrid);
    setScore(s => s + (linesCleared * 100));
    setPiece(nextPiece);
    setNextPiece(getRandomPiece());
  };

  const move = useCallback((dirX: number, dirY: number) => {
    if (!piece || gameState !== GameState.PLAYING) return;
    
    if (!checkCollision(piece, dirX, dirY)) {
      setPiece(p => p ? { ...p, x: p.x + dirX, y: p.y + dirY } : null);
    } else if (dirY > 0) {
      // Hit bottom or other piece
      mergePiece();
    }
  }, [piece, grid, gameState]);

  const startGame = () => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setScore(0);
    setPiece(getRandomPiece());
    setNextPiece(getRandomPiece());
    setGameState(GameState.PLAYING);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.PLAYING) return;
      
      switch (e.key) {
        case 'ArrowLeft': move(-1, 0); break;
        case 'ArrowRight': move(1, 0); break;
        case 'ArrowDown': move(0, 1); break;
        case 'ArrowUp': if (piece) rotate(piece); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, piece, move]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      dropInterval.current = window.setInterval(() => {
        move(0, 1);
      }, DROP_SPEED_START);
    } else if (dropInterval.current) {
      clearInterval(dropInterval.current);
    }
    return () => {
        if (dropInterval.current) clearInterval(dropInterval.current);
    };
  }, [gameState, move]);

  const renderNextPiece = () => {
    if (!nextPiece
      <div className="flex justify-between w-full max-w-[300px] mb-2 px-2 items-center">
         <div className="text-blue-400 text-xl font-bold font-mono">SCORE: {score}</div>
         <div className="text-gray-400 text-xs">ARROWS TO MOVE/ROTATE</div>
      </div>

      <div className="flex gap-4">
        <div className="relative bg-slate-800 border-4 border-slate-600 p-1 shadow-xl">
        <div 
            className="grid bg-black/50"
            style={{ 
                gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
            }}
        >
            {/* Grid Cells */}
            {grid.map((row, y) => row.map((color, x) => (
                <div 
                    key={`${x}-${y}`} 
                    className="border border-white/5"
                    style={{ backgroundColor: color || 'transparent' }}
                >
                    {color && <div className="w-full h-full border-t-2 border-l-2 border-white/30 border-b-2 border-r-2 border-black/20"></div>}
                </div>
            )))}

            {/* Active Piece */}
            {piece && piece.shape.map((row, y) => row.map((val, x) => {
                if (val) {
                    const absX = piece.x + x;
                    const absY = piece.y + y;
                    if (absX >= 0 && absX < COLS && absY >= 0 && absY < ROWS) {
                        return (
                            <div
                                key={`piece-${x}-${y}`}
                                className="absolute border-t-2 border-l-2 border-white/30 border-b-2 border-r-2 border-black/20"
                                style={{
                                    left: absX * CELL_SIZE,
                                    top: absY * CELL_SIZE,
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                    backgroundColor: piece.color
                                }}
                            />
                        );
                    }
                }
                return null;
            }))}
        </div>

 bg-black/80 flex flex-col items-center justify-center z-10">
            <h1 className="text-3xl text-blue-400 font-bold mb-4 drop-shadow-[2px_2px_0_#000]">
               {gameState === GameState.GAME_OVER ? 'GAME OVER' : 'BLOCK STACK'}
            </h1>
            <Button onClick={startGame} variant="primary">
               {gameState === GameState.IDLE ? 'PLAY' : 'RETRY'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};