import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Button } from './Button';

export const ArcadeChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'WELCOME TO THE ARCADE! I AM PIXEL. READY TO PLAY?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await sendMessageToGemini(input);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 border-4 border-slate-600 p-2 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <div className="bg-slate-900 text-center py-2 mb-2 border-b-2 border-slate-600">
        <h3 className="text-yellow-400 text-xs animate-pulse">ARCADE MASTER AI</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-2 space-y-2 pr-1 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-2 rounded text-xs leading-5 ${
              msg.role === 'user' 
                ? 'bg-blue-900 text-blue-100 border-l-2 border-blue-500' 
                : 'bg-green-900 text-green-100 border-r-2 border-green-500'
            }`}>
              {msg.role === 'model' && <span className="text-green-400 font-bold mr-1">{'>'}</span>}
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-green-400 text-xs animate-pulse">PIXEL IS THINKING...</div>}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-900 border-2 border-slate-700 text-white text-xs p-2 focus:outline-none focus:border-yellow-500"
          placeholder="ASK PIXEL..."
        />
        <Button onClick={handleSend} className="text-xs px-2">SEND</Button>
      </div>
    </div>
  );
};