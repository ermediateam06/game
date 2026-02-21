import React, { useState } from 'react';
import { GameType } from './types';
import { SnakeGame } from './components/SnakeGame';
import { MinesweeperGame } from './components/MinesweeperGame';
import { FlappyBirdGame } from './components/FlappyBirdGame';
import { ZumaGame } from './components/ZumaGame';
import { TetrisGame } from './components/TetrisGame';
import { ArcadeChat } from './components/ArcadeChat';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameType>(GameType.MENU);
  const [showChat, setShowChat] = useState(true);

  const renderGame = () => {
    switch (activeGame) {
      case GameType.SNAKE:
        return <SnakeGame />;
      case GameType.MINESWEEPER:
        return <MinesweeperGame />;
      case GameType.FLAPPY:
        return <FlappyBirdGame />;
      case GameType.ZUMA:
        return <ZumaGame />;
      case GameType.TETRIS:
        return <TetrisGame />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl p-6">
            <div className="group relative bg-slate-800 p-6 rounded-xl border-4 border-slate-700 hover:border-green-400 transition-all cursor-pointer shadow-xl flex flex-col items-center"
                 onClick={() => setActiveGame(GameType.SNAKE)}>
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🐍</div>
              <h2 className="text-xl text-green-400 font-bold mb-2">SNAKE XENZIA</h2>
              <p className="text-xs text-gray-400 text-center">Eat the pixels. Don't bite your tail.</p>
              <div className="absolute -bottom-3 bg-green-600 text-black text-[10px] font-bold px-2 py-1 rounded">PLAY NOW</div>
            </div>

            <div className="group relative bg-slate-800 p-6 rounded-xl border-4 border-slate-700 hover:border-red-400 transition-all cursor-pointer shadow-xl flex flex-col items-center"
                 onClick={() => setActiveGame(GameType.MINESWEEPER)}>
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">💣</div>
              <h2 className="text-xl text-red-400 font-bold mb-2">MINESWEEPER</h2>
              <p className="text-xs text-gray-400 text-center">Logic & luck. Watch your step.</p>
              <div className="absolute -bottom-3 bg-red-600 text-black text-[10px] font-bold px-2 py-1 rounded">PLAY NOW</div>
            </div>

            <div className="group relative bg-slate-800 p-6 rounded-xl border-4 border-slate-700 hover:border-yellow-400 transition-all cursor-pointer shadow-xl flex flex-col items-center"
                 onClick={() => setActiveGame(GameType.FLAPPY)}>
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🐦</div>
              <h2 className="text-xl text-yellow-400 font-bold mb-2">FLAPPY CLONE</h2>
              <p className="text-xs text-gray-400 text-center">Tap to fly. Avoid the pipes.</p>
              <div className="absolute -bottom-3 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded">PLAY NOW</div>
            </div>

            <div className="group relative bg-slate-800 p-6 rounded-xl border-4 border-slate-700 hover:border-purple-400 transition-all cursor-pointer shadow-xl flex flex-col items-center"
                 onClick={() => setActiveGame(GameType.ZUMA)}>
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🐸</div>
              <h2 className="text-xl text-purple-400 font-bold mb-2">STONE FROG</h2>
              <p className="text-xs text-gray-400 text-center">Match 3. Stop the chain.</p>
              <div className="absolute -bottom-3 bg-purple-400 text-black text-[10px] font-bold px-2 py-1 rounded">PLAY NOW</div>
            </div>

            <div className="group relative bg-slate-800 p-6 rounded-xl border-4 border-slate-700 hover:border-blue-400 transition-all cursor-pointer shadow-xl flex flex-col items-center"
                 onClick={() => setActiveGame(GameType.TETRIS)}>
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🏗️</div>
              <h2 className="text-xl text-blue-400 font-bold mb-2">BLOCK STACK</h2>
              <p className="text-xs text-gray-400 text-center">Stack 'em high. Clear lines.</p>
              <div className="absolute -bottom-3 bg-blue-400 text-black text-[10px] font-bold px-2 py-1 rounded">PLAY NOW</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-slate-900 text-white selection:bg-pink-500 selection:text-white">
      {/* CRT Overlay Effect */}
      <div className="fixed inset-0 crt-overlay z-50 pointer-events-none"></div>

      {/* Header */}
      <header className="w-full bg-slate-800 border-b-4 border-slate-700 p-4 shadow-lg z-10 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveGame(GameType.MENU)}>
          <span className="text-3xl animate-pulse">🕹️</span>
          <h1 className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
            RETRO ARCADE HUB
          </h1>
        </div>
        <div className="hidden md:flex gap-4 text-xs text-gray-400">
          <span>INSERT COIN</span>
          <span className="animate-pulse text-yellow-500">CREDITS: 99</span>
        </div>
        <button 
          onClick={() => setShowChat(!showChat)}
          className="md:hidden text-2xl"
        >
          💬
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex overflow-hidden relative">
        
        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
          {activeGame !== GameType.MENU && (
             <div className="mb-4 w-full max-w-md flex justify-start">
               <Button variant="secondary" onClick={() => setActiveGame(GameType.MENU)}>
                 &lt; BACK TO MENU
               </Button>
             </div>
          )}
          {renderGame()}
        </div>

        {/* Chat Sidebar (Desktop: Fixed Right, Mobile: Overlay) */}
        <div className={`
          fixed md:relative right-0 top-0 bottom-0 z-40 w-80 
          transform transition-transform duration-300 ease-in-out
          ${showChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:w-80'}
          bg-slate-900 md:bg-transparent p-4 pt-20 md:pt-4
          border-l-4 border-slate-700
        `}>
          <div className="h-full flex flex-col">
             <div className="flex justify-between md:hidden mb-2">
                 <h3 className="text-yellow-400">AI ASSISTANT</h3>
                 <button onClick={() => setShowChat(false)} className="text-red-500 font-bold">X</button>
             </div>
             <ArcadeChat />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 p-2 text-center text-[10px] text-gray-600 z-10">
        © 2024 RETRO ARCADE HUB | POWERED BY GEMINI | PRESS START
      </footer>
    </div>
  );
};

export default App;