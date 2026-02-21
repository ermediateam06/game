import React, { useState, useEffect } from 'react';
import { GameState, Cell } from '../types';
import { Button } from './Button';

const ROWS = 10;
const COLS = 10;
const MINES = 15;

export const MinesweeperGame: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [minesLeft, setMinesLeft] = useState(MINES);

  // Initialize Board
  const initBoard = () => {
    const newGrid: Cell[][] = [];
    for (let y = 0; y < ROWS; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < COLS; x++) {
        row.push({ x, y, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 });
      }
      newGrid.push(row);
    }

    // Place Mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const x = Math.floor(Math.random() * COLS);
      const y = Math.floor(Math.random() * ROWS);
      if (!newGrid[y][x].isMine) {
        newGrid[y][x].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate Numbers
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!newGrid[y][x].isMine) {
          let count = 0;
          directions.forEach(([dy, dx]) => {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS && newGrid[ny][nx].isMine) {
              count++;
            }
          });
          newGrid[y][x].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameState(GameState.PLAYING);
    setMinesLeft(MINES);
  };

  useEffect(() => {
    // Initial load doesn't start game automatically to show menu state, 
    // but here we just wait for user interaction or start.
    // We can show a blank board or start button.
  }, []);

  const revealCell = (x: number, y: number) => {
    if (gameState !== GameState.PLAYING) return;
    if (grid[y][x].isRevealed || grid[y][x].isFlagged) return;

    const newGrid = [...grid.map(row => [...row])];
    
    if (newGrid[y][x].isMine) {
      // Game Over
      newGrid[y][x].isRevealed = true;
      // Reveal all mines
      newGrid.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      setGrid(newGrid);
      setGameState(GameState.GAME_OVER);
      return;
    }

    // Flood fill
    const stack = [[x, y]];
    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      if (newGrid[cy][cx].isRevealed) continue;

      newGrid[cy][cx].isRevealed = true;

      if (newGrid[cy][cx].neighborMines === 0) {
        // Push neighbors
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
          ];
          directions.forEach(([dy, dx]) => {
            const ny = cy + dy;
            const nx = cx + dx;
            if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS && !newGrid[ny][nx].isRevealed && !newGrid[ny][nx].isFlagged) {
              stack.push([nx, ny]);
            }
          });
      }
    }

    setGrid(newGrid);
    checkWin(newGrid);
  };

  const toggleFlag = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (gameState !== GameState.PLAYING) return;
    if (grid[y][x].isRevealed) return;

    const newGrid = [...grid.map(row => [...row])];
    newGrid[y][x].isFlagged = !newGrid[y][x].isFlagged;
    setGrid(newGrid);
    setMinesLeft(prev => newGrid[y][x].isFlagged ? prev - 1 : prev + 1);
  };

  const checkWin = (currentGrid: Cell[][]) => {
    let revealedCount = 0;
    currentGrid.forEach(row => row.forEach(cell => {
      if (cell.isRevealed) revealedCount++;
    }));

    if (revealedCount === (ROWS * COLS) - MINES) {
      setGameState(GameState.WON);
    }
  };

  const getCellColor = (count: number) => {
    switch (count) {
      case 1: return 'text-blue-500';
      case 2: return 'text-green-500';
      case 3: return 'text-red-500';
      case 4: return 'text-purple-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[300px] mb-4">
        <div className="text-red-500">MINES: {minesLeft}</div>
        <div className="text-yellow-400">
          {gameState === GameState.WON ? 'VICTORY!' : gameState === GameState.GAME_OVER ? 'DEAD' : 'PLAYING'}
        </div>
      </div>

      <div className="bg-gray-400 border-4 border-gray-200 p-2 shadow-xl inline-block">
        {gameState === GameState.IDLE ? (
           <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-800">
             <Button onClick={initBoard}>START SWEEPER</Button>
           </div>
        ) : (
          <div 
            className="grid gap-[2px] bg-gray-600"
            style={{ gridTemplateColumns: `repeat(${COLS}, 30px)` }}
          >
            {grid.map((row, y) => (
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  onClick={() => revealCell(x, y)}
                  onContextMenu={(e) => toggleFlag(e, x, y)}
                  className={`
                    w-[30px] h-[30px] flex items-center justify-center text-sm font-bold cursor-pointer select-none
                    ${cell.isRevealed 
                      ? 'bg-gray-300 border border-gray-400 inset-shadow' 
                      : 'bg-gray-400 border-t-4 border-l-4 border-white border-b-4 border-r-4 border-gray-600 hover:bg-gray-300'}
                  `}
                >
                  {cell.isRevealed && cell.isMine && <span className="text-black text-xs">💣</span>}
                  {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && (
                    <span className={getCellColor(cell.neighborMines)}>{cell.neighborMines}</span>
                  )}
                  {!cell.isRevealed && cell.isFlagged && <span className="text-red-600 text-xs">🚩</span>}
                </div>
              ))
            ))}
          </div>
        )}
      </div>

      {(gameState === GameState.GAME_OVER || gameState === GameState.WON) && (
        <Button onClick={initBoard} className="mt-4">TRY AGAIN</Button>
      )}
      <div className="text-[10px] text-gray-500 mt-2">LEFT CLICK: REVEAL | RIGHT CLICK: FLAG</div>
    </div>
  );
};