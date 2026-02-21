import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { Button } from './Button';

const GRAVITY = 0.6;
const JUMP = -8;
const PIPE_SPEED = 3;
const PIPE_SPAWN_RATE = 100; // frames
const GAME_HEIGHT = 400;
const GAME_WIDTH = 320;
const BIRD_SIZE = 20;
const PIPE_WIDTH = 40;
const PIPE_GAP = 120;

export const FlappyBirdGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Refs for loop state to avoid react render lag
  const birdY = useRef(GAME_HEIGHT / 2);
  const birdVelocity = useRef(0);
  const pipes = useRef<{x: number, topHeight: number, passed: boolean}[]>([]);
  const frameCount = useRef(0);
  const reqRef = useRef<number>(0);

  // Helper for rendering
  const [renderTrigger, setRenderTrigger] = useState(0);

  const startGame = () => {
    birdY.current = GAME_HEIGHT / 2;
    birdVelocity.current = 0;
    pipes.current = [];
    frameCount.current = 0;
    setScore(0);
    setGameState(GameState.PLAYING);
  };

  const jump = () => {
    if (gameState === GameState.PLAYING) {
      birdVelocity.current = JUMP;
    }
  };

  useEffect(() => {
    const handleInput = (e: KeyboardEvent | TouchEvent) => {
        if (gameState === GameState.PLAYING) {
            // e.preventDefault(); // Might block scrolling on mobile, be careful
            if (e.type === 'keydown' && (e as KeyboardEvent).code === 'Space') {
                jump();
            } else if (e.type === 'touchstart') {
                jump();
            }
        }
    };

    window.addEventListener('keydown', handleInput);
    window.addEventListener('touchstart', handleInput);
    return () => {
        window.removeEventListener('keydown', handleInput);
        window.removeEventListener('touchstart', handleInput);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      return;
    }

    const loop = () => {
      frameCount.current++;

      // Physics
      birdVelocity.current += GRAVITY;
      birdY.current += birdVelocity.current;

      // Spawn Pipes
      if (frameCount.current % PIPE_SPAWN_RATE === 0) {
        const minPipe = 50;
        const maxPipe = GAME_HEIGHT - PIPE_GAP - minPipe;
        const randomHeight = Math.floor(Math.random() * (maxPipe - minPipe + 1)) + minPipe;
        pipes.current.push({ x: GAME_WIDTH, topHeight: randomHeight, passed: false });
      }

      // Move Pipes & Collision
      pipes.current.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
      });

      // Remove off-screen pipes
      if (pipes.current.length > 0 && pipes.current[0].x < -PIPE_WIDTH) {
        pipes.current.shift();
      }

      // Collision Detection
      const birdRect = {
        top: birdY.current,
        bottom: birdY.current + BIRD_SIZE,
        left: 50, // Bird fixed x position
        right: 50 + BIRD_SIZE
      };

      // Ground/Ceiling
      if (birdRect.top < 0 || birdRect.bottom > GAME_HEIGHT) {
        setGameState(GameState.GAME_OVER);
        return; 
      }

      // Pipes
      for (const pipe of pipes.current) {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;

        // Check horizontal overlap
        if (birdRect.right > pipeLeft && birdRect.left < pipeRight) {
             // Check vertical collision (hit top pipe OR hit bottom pipe)
             if (birdRect.top < pipe.topHeight || birdRect.bottom > pipe.topHeight + PIPE_GAP) {
                 setGameState(GameState.GAME_OVER);
                 return;
             }
        }

        // Score
        if (!pipe.passed && birdRect.left > pipeRight) {
            pipe.passed = true;
            setScore(s => {
                const newS = s + 1;
                setHighScore(hs => Math.max(hs, newS));
                return newS;
            });
        }
      }

      setRenderTrigger(prev => prev + 1); // Trigger react render for this frame
      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [gameState]);

  return (
    <div className="flex flex-col items-center">
        <div className="flex justify-between w-full max-w-[320px] mb-2 px-2">
            <div className="text-white text-xs">SCORE: {score}</div>
            <div className="text-yellow-400 text-xs">BEST: {highScore}</div>
        </div>

      <div 
        className="relative overflow-hidden border-4 border-slate-700 bg-sky-300 shadow-xl"
        onClick={jump}
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* Bird */}
        {gameState !== GameState.IDLE && (
            <div 
                className="absolute bg-yellow-400 border-2 border-black rounded-sm"
                style={{
                    left: 50,
                    top: birdY.current,
                    width: BIRD_SIZE,
                    height: BIRD_SIZE,
                    transform: `rotate(${Math.min(Math.max(birdVelocity.current * 3, -25), 90)}deg)`,
                    transition: 'transform 0.1s'
                }}
            >
                <div className="absolute right-[-4px] top-1 w-2 h-1 bg-orange-600 border border-black"></div>
                <div className="absolute right-1 top-0 w-1 h-1 bg-white border border-black rounded-full"></div>
            </div>
        )}

        {/* Pipes */}
        {pipes.current.map((pipe, i) => (
            <React.Fragment key={i}>
                {/* Top Pipe */}
                <div 
                    className="absolute bg-green-500 border-x-2 border-b-2 border-black"
                    style={{
                        left: pipe.x,
                        top: 0,
                        width: PIPE_WIDTH,
                        height: pipe.topHeight
                    }}
                >
                    <div className="absolute bottom-0 w-[110%] left-[-5%] h-6 bg-green-600 border-2 border-black"></div>
                </div>
                {/* Bottom Pipe */}
                <div 
                    className="absolute bg-green-500 border-x-2 border-t-2 border-black"
                    style={{
                        left: pipe.x,
                        top: pipe.topHeight + PIPE_GAP,
                        width: PIPE_WIDTH,
                        height: GAME_HEIGHT - (pipe.topHeight + PIPE_GAP)
                    }}
                >
                     <div className="absolute top-0 w-[110%] left-[-5%] h-6 bg-green-600 border-2 border-black"></div>
                </div>
            </React.Fragment>
        ))}

        {/* Ground */}
        <div className="absolute bottom-0 w-full h-4 bg-[#ded895] border-t-4 border-[#73bf2e]">
             <div className="w-full h-full opacity-30" style={{backgroundImage: 'linear-gradient(135deg, #d0c874 25%, transparent 25%, transparent 50%, #d0c874 50%, #d0c874 75%, transparent 75%, transparent)', backgroundSize: '20px 20px'}}></div>
        </div>

        {/* Clouds (Static for aesthetic) */}
        <div className="absolute top-10 left-10 text-white opacity-60 text-4xl select-none cloud-anim">☁</div>
        <div className="absolute top-20 left-40 text-white opacity-40 text-3xl select-none cloud-anim-2">☁</div>

        {/* UI Overlay */}
        {(gameState === GameState.IDLE || gameState === GameState.GAME_OVER) && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
                <h1 className="text-3xl text-white font-bold mb-4 drop-shadow-[2px_2px_0_#000]">
                    {gameState === GameState.IDLE ? 'FLAPPY CLONE' : 'GAME OVER'}
                </h1>
                <Button onClick={startGame} variant="primary">
                    {gameState === GameState.IDLE ? 'PLAY' : 'RETRY'}
                </Button>
            </div>
        )}
      </div>
      <div className="text-[10px] text-gray-500 mt-2">SPACE or TAP to Jump</div>
    </div>
  );
};