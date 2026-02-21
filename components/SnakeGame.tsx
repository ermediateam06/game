import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Point, Direction } from '../types';
import { Button } from './Button';

const GRID_SIZE = 20;
const CELL_SIZE = 20; // Visual size in pixels approx, used for calculations relative to board
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;
const INITIAL_SPEED = 150;

export const SnakeGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  // Use refs for values needed inside the effect interval to avoid closure staleness without re-triggering effect
  const directionRef = useRef(Direction.RIGHT);
  const moveQueueRef = useRef<Direction[]>([]); // To prevent rapid double-turn suicide

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    let isOnSnake = true;
    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * BOARD_WIDTH),
        y: Math.floor(Math.random() * BOARD_HEIGHT),
      };
      // eslint-disable-next-line no-loop-func
      isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) return newFood;
    }
    return { x: 0, y: 0 }; // Fallback
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setDirection(Direction.RIGHT);
    directionRef.current = Direction.RIGHT;
    moveQueueRef.current = [];
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameState(GameState.PLAYING);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== GameState.PLAYING) return;

    let newDir = directionRef.current;
    
    switch (e.key) {
      case 'ArrowUp': newDir = Direction.UP; break;
      case 'ArrowDown': newDir = Direction.DOWN; break;
      case 'ArrowLeft': newDir = Direction.LEFT; break;
      case 'ArrowRight': newDir = Direction.RIGHT; break;
      default: return;
    }

    // Prevent 180 degree turns
    const currentDir = directionRef.current;
    if (
      (newDir === Direction.UP && currentDir === Direction.DOWN) ||
      (newDir === Direction.DOWN && currentDir === Direction.UP) ||
      (newDir === Direction.LEFT && currentDir === Direction.RIGHT) ||
      (newDir === Direction.RIGHT && currentDir === Direction.LEFT)
    ) {
      return;
    }

    // Simple queue to handle quick key presses
    if (moveQueueRef.current.length < 2) {
       moveQueueRef.current.push(newDir);
    }
  }, [gameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;

    const moveSnake = () => {
      // Process input queue
      if (moveQueueRef.current.length > 0) {
        const nextDir = moveQueueRef.current.shift();
        // Double check 180 turn prevention here in case of rapid inputs
        const currentDir = directionRef.current;
        const invalid = (
          (nextDir === Direction.UP && currentDir === Direction.DOWN) ||
          (nextDir === Direction.DOWN && currentDir === Direction.UP) ||
          (nextDir === Direction.LEFT && currentDir === Direction.RIGHT) ||
          (nextDir === Direction.RIGHT && currentDir === Direction.LEFT)
        );
        
        if (nextDir !== undefined && !invalid) {
            directionRef.current = nextDir;
            setDirection(nextDir);
        }
      }

      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        
        switch (directionRef.current) {
          case Direction.UP: head.y -= 1; break;
          case Direction.DOWN: head.y += 1; break;
          case Direction.LEFT: head.x -= 1; break;
          case Direction.RIGHT: head.x += 1; break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT) {
          setGameState(GameState.GAME_OVER);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameState(GameState.GAME_OVER);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat food
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
          setSpeed(s => Math.max(50, s * 0.98)); // Speed up slightly
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [gameState, food, speed, generateFood]);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="flex justify-between w-full mb-4 px-4 items-center">
        <div className="text-yellow-400 text-sm">SCORE: {score}</div>
        <div className="text-xs text-gray-400">ARROWS TO MOVE</div>
      </div>

      <div 
        className="relative bg-black border-4 border-gray-700 shadow-lg"
        style={{ 
          width: BOARD_WIDTH * GRID_SIZE, 
          height: BOARD_HEIGHT * GRID_SIZE,
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)'
        }}
      >
        {/* Grid Background (Optional visual aid) */}
        <div className="absolute inset-0 opacity-10" 
             style={{ 
               backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
               backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
             }} 
        />

        {/* Food */}
        <div
          className="absolute bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"
          style={{
            left: food.x * GRID_SIZE,
            top: food.y * GRID_SIZE,
            width: GRID_SIZE,
            height: GRID_SIZE,
          }}
        />

        {/* Snake */}
        {snake.map((segment, i) => (
          <div
            key={`${segment.x}-${segment.y}-${i}`}
            className="absolute bg-green-500 border border-black"
            style={{
              left: segment.x * GRID_SIZE,
              top: segment.y * GRID_SIZE,
              width: GRID_SIZE,
              height: GRID_SIZE,
              opacity: i === 0 ? 1 : 0.8 - (i / snake.length) * 0.5,
              zIndex: 10
            }}
          />
        ))}

        {gameState !== GameState.PLAYING && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4 z-20">
            <h2 className="text-2xl text-green-400 mb-4 font-bold">
              {gameState === GameState.GAME_OVER ? 'GAME OVER' : 'SNAKE XENZIA'}
            </h2>
            <Button onClick={resetGame}>
              {gameState === GameState.IDLE ? 'START GAME' : 'RETRY'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};