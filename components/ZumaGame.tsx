import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { Button } from './Button';

// Game Constants
const GAME_SIZE = 600; 
const CENTER = GAME_SIZE / 2;
const BALL_RADIUS = 16; // Slightly larger for better visuals
const BULLET_SPEED = 14;
const PATH_LENGTH_STEPS = 1200;
const SPAWN_RATE = 45; 
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899']; // Added Pink

interface Ball {
  id: number;
  color: string;
  pathIndex: number; 
  offset: number; 
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  active: boolean;
}

interface Point {
  x: number;
  y: number;
  angle?: number;
}

export const ZumaGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);

  // Game State Refs
  const pathPoints = useRef<Point[]>([]);
  const balls = useRef<Ball[]>([]);
  const bullets = useRef<Bullet[]>([]);
  const nextBulletColor = useRef<string>(COLORS[0]);
  const currentBulletColor = useRef<string>(COLORS[1]);
  const frameCount = useRef(0);
  const mousePos = useRef<Point>({ x: CENTER, y: 0 });
  const reqRef = useRef<number>(0);
  const isMouseDown = useRef(false);

  // Pre-calculate Spiral Path (New Shape: Winding Stone Path)
  useEffect(() => {
    const points: Point[] = [];
    
    // Create a more "designed" path than a pure math spiral
    // We blend a spiral with some noise/wiggle to make it look like a hand-carved track
    const loops = 3;
    const maxRadius = CENTER - 30;
    const minRadius = 50; 

    for (let i = 0; i <= PATH_LENGTH_STEPS; i++) {
      const t = i / PATH_LENGTH_STEPS;
      // Reverse t for radius (Big to Small)
      const r = maxRadius - (t * (maxRadius - minRadius));
      // Add slight waviness to radius
      const wave = Math.sin(t * 30) * 5; 
      
      const theta = t * Math.PI * 2 * loops - Math.PI; 
      
      points.push({
        x: CENTER + (r + wave) * Math.cos(theta),
        y: CENTER + (r + wave) * Math.sin(theta)
      });
    }
    pathPoints.current = points;
  }, []);

  const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

  const startGame = () => {
    balls.current = [];
    bullets.current = [];
    setScore(0);
    frameCount.current = 0;
    nextBulletColor.current = getRandomColor();
    currentBulletColor.current = getRandomColor();
    setGameState(GameState.PLAYING);
  };

  const shoot = () => {
    if (gameState !== GameState.PLAYING) return;
    
    const dx = mousePos.current.x - CENTER;
    const dy = mousePos.current.y - CENTER;
    const angle = Math.atan2(dy, dx);
    
    bullets.current.push({
      x: CENTER,
      y: CENTER,
      vx: Math.cos(angle) * BULLET_SPEED,
      vy: Math.sin(angle) * BULLET_SPEED,
      color: currentBulletColor.current,
      active: true
    });

    currentBulletColor.current = nextBulletColor.current;
    nextBulletColor.current = getRandomColor();
  };

  // Handle Input
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = GAME_SIZE / rect.width;
        const scaleY = GAME_SIZE / rect.height;
        mousePos.current = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const handleMouseDown = () => {
       isMouseDown.current = true;
       shoot();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleMouseDown);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('touchstart', handleMouseDown);
    };
  }, [gameState]);

  // Main Loop
  useEffect(() => {
    if (gameState !== GameState.PLAYING) {
        if (reqRef.current) cancelAnimationFrame(reqRef.current);
        return;
    }

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const render = () => {
        frameCount.current++;
        
        // 1. Draw Arena Background (Stone/Sand)
        ctx.fillStyle = '#1c1917'; // Stone-900 background
        ctx.fillRect(0, 0, GAME_SIZE, GAME_SIZE);
        
        // Subtle texture pattern
        ctx.fillStyle = '#292524';
        for(let i=0; i<20; i++) {
           ctx.fillRect(Math.random() * GAME_SIZE, Math.random() * GAME_SIZE, 4, 4);
        }

        // 2. Draw Path Track
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer Groove
        ctx.beginPath();
        pathPoints.current.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.lineWidth = BALL_RADIUS * 2 + 12;
        ctx.strokeStyle = '#0c0a09'; // Very dark groove
        ctx.stroke();

        // Inner Track
        ctx.beginPath();
        pathPoints.current.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.lineWidth = BALL_RADIUS * 2 + 2;
        ctx.strokeStyle = '#44403c'; // Stone-700 track
        ctx.stroke();

        // Center Track Line (Guide)
        ctx.beginPath();
        pathPoints.current.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#292524'; // Stone-800
        ctx.stroke();

        // 3. Draw Skull/Hole
        const endPoint = pathPoints.current[pathPoints.current.length - 1];
        
        // Pit Gradient
        const pitGrad = ctx.createRadialGradient(endPoint.x, endPoint.y, 5, endPoint.x, endPoint.y, 40);
        pitGrad.addColorStop(0, '#000');
        pitGrad.addColorStop(1, '#7f1d1d'); // Dark Red

        ctx.beginPath();
        ctx.arc(endPoint.x, endPoint.y, 35, 0, Math.PI * 2);
        ctx.fillStyle = pitGrad;
        ctx.fill();
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀', endPoint.x, endPoint.y + 2);

        // 4. Game Logic: Spawning & Movement
        if (frameCount.current % SPAWN_RATE === 0 && balls.current.length < 200) {
            balls.current.push({
                id: Math.random(),
                color: getRandomColor(),
                pathIndex: 0,
                offset: 0
            });
        }

        const baseSpeed = 0.6 + (score / 10000); 

        // Move balls
        balls.current.sort((a, b) => b.pathIndex - a.pathIndex); // Closest to skull first

        // First pass: Move everyone by speed
        for (let i = 0; i < balls.current.length; i++) {
            balls.current[i].pathIndex += baseSpeed;
        }

        // Second pass: Resolve Collisions (Push logic)
        const MIN_DIST = 16; // Path steps distance
        for (let i = 0; i < balls.current.length - 1; i++) {
            const lead = balls.current[i];
            const follower = balls.current[i + 1];
            
            if (lead.pathIndex - follower.pathIndex < MIN_DIST) {
                follower.pathIndex = lead.pathIndex - MIN_DIST;
            }
        }

        // Draw Balls (3D Marble Effect)
        balls.current.forEach(b => {
            if (b.pathIndex >= PATH_LENGTH_STEPS) {
                setGameState(GameState.GAME_OVER);
                return;
            }
            const pt = getPointOnPath(b.pathIndex);
            if (pt) {
                // Draw Marble
                const grad = ctx.createRadialGradient(pt.x - 4, pt.y - 4, 2, pt.x, pt.y, BALL_RADIUS);
                grad.addColorStop(0, '#fff'); // Highlight
                grad.addColorStop(0.3, b.color);
                grad.addColorStop(1, '#000'); // Shadow edge
                
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, BALL_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                // Drop Shadow
                ctx.beginPath();
                ctx.arc(pt.x + 2, pt.y + 2, BALL_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fill();
                // Redraw ball on top of shadow
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, BALL_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }
        });

        // 5. Bullets
        bullets.current.forEach((b, bIdx) => {
            if (!b.active) return;
            b.x += b.vx;
            b.y += b.vy;

            // Draw Bullet
            const grad = ctx.createRadialGradient(b.x - 4, b.y - 4, 2, b.x, b.y, BALL_RADIUS);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.3, b.color);
            grad.addColorStop(1, '#000');
            
            ctx.beginPath();
            ctx.arc(b.x, b.y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            if (b.x < 0 || b.x > GAME_SIZE || b.y < 0 || b.y > GAME_SIZE) {
                b.active = false;
            }

            // Collision
            if (b.active) {
                for (let i = 0; i < balls.current.length; i++) {
                    const target = balls.current[i];
                    const pt = getPointOnPath(target.pathIndex);
                    if (!pt) continue;

                    const dist = Math.hypot(b.x - pt.x, b.y - pt.y);
                    if (dist < BALL_RADIUS * 1.8) {
                        const newBall: Ball = {
                            id: Math.random(),
                            color: b.color,
                            pathIndex: target.pathIndex - (MIN_DIST/2),
                            offset: 0
                        };
                        balls.current.splice(i + 1, 0, newBall); 
                        b.active = false;
                        checkMatches(i + 1);
                        break;
                    }
                }
            }
        });
        bullets.current = bullets.current.filter(b => b.active);

        // 6. Shooter (Turret)
        const dx = mousePos.current.x - CENTER;
        const dy = mousePos.current.y - CENTER;
        const angle = Math.atan2(dy, dx);
        
        ctx.save();
        ctx.translate(CENTER, CENTER);
        ctx.rotate(angle);
        
        // Turret Base
        const turretGrad = ctx.createLinearGradient(-30, -30, 30, 30);
        turretGrad.addColorStop(0, '#57534e');
        turretGrad.addColorStop(1, '#292524');
        
        ctx.beginPath();
        ctx.arc(0, 0, 35, 0, Math.PI * 2);
        ctx.fillStyle = turretGrad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#a8a29e';
        ctx.stroke();

        // Barrel
        ctx.fillStyle = '#44403c';
        ctx.fillRect(0, -12, 45, 24); 
        
        // Loaded ball
        const loadGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, BALL_RADIUS);
        loadGrad.addColorStop(0, '#fff');
        loadGrad.addColorStop(0.3, currentBulletColor.current);
        loadGrad.addColorStop(1, '#000');

        ctx.beginPath();
        ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = loadGrad;
        ctx.fill();

        ctx.restore();

        // Next color indicator (Gem on frog head)
        const nextGrad = ctx.createRadialGradient(CENTER, CENTER, 2, CENTER, CENTER, 8);
        nextGrad.addColorStop(0, '#fff');
        nextGrad.addColorStop(0.5, nextBulletColor.current);
        nextGrad.addColorStop(1, '#000');
        
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, 8, 0, Math.PI * 2);
        ctx.fillStyle = nextGrad;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        reqRef.current = requestAnimationFrame(render);
    };

    reqRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(reqRef.current);
  }, [gameState]);

  const getPointOnPath = (index: number) => {
      const idx = Math.floor(index);
      if (idx < 0) return pathPoints.current[0];
      if (idx >= pathPoints.current.length) return pathPoints.current[pathPoints.current.length - 1];
      return pathPoints.current[idx];
  };

  const checkMatches = (index: number) => {
      const ball = balls.current[index];
      if (!ball) return;
      const color = ball.color;
      
      let startIndex = index;
      let endIndex = index;
      
      while (startIndex > 0 && balls.current[startIndex - 1].color === color) {
          startIndex--;
      }
      
      while (endIndex < balls.current.length - 1 && balls.current[endIndex + 1].color === color) {
          endIndex++;
      }
      
      const count = endIndex - startIndex + 1;
      if (count >= 3) {
          setScore(s => s + (count * 100));
          balls.current.splice(startIndex, count);
      }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[600px] mb-2 px-2 items-center">
         <div className="text-purple-400 text-xl font-bold font-mono">SCORE: {score}</div>
         <div className="text-gray-400 text-xs">MOUSE TO AIM, CLICK TO SHOOT</div>
      </div>
      
      <div className="relative border-4 border-stone-600 shadow-2xl bg-stone-900 rounded-lg overflow-hidden" 
           style={{ width: 350, height: 350 }}> 
        <canvas 
            ref={canvasRef} 
            width={GAME_SIZE} 
            height={GAME_SIZE} 
            className="w-full h-full cursor-crosshair"
        />
        
        {gameState !== GameState.PLAYING && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
            <h1 className="text-3xl text-purple-400 font-bold mb-4 drop-shadow-[2px_2px_0_#000]">
               {gameState === GameState.GAME_OVER ? 'GAME OVER' : 'STONE FROG'}
            </h1>
            <Button onClick={startGame} variant="primary">
               {gameState === GameState.IDLE ? 'PLAY' : 'RETRY'}
            </Button>
          </div>
        )}
      </div>
      <div className="text-[10px] text-gray-500 mt-2 text-center max-w-[300px]">
        Match 3 colors to destroy balls. Don't let them reach the skull!
      </div>
    </div>
  );
};