import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure API_KEY is available
const ai = new GoogleGenAI({ apiKey });

// Cache the chat session to maintain history
let chatSession: Chat | null = null;

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are "Pixel", a rad 80s/90s arcade owner and game master. 
      You are enthusiastic, use slang like "tubular", "gnarly", "game over man!", "radical".
      You help players with tips for Snake, Minesweeper, Flappy Bird, Zuma (Stone Frog), and Tetris (Block Stack).
      
      Tetris Tips:
      - "Keep your stack flat, don't build towers!"
      - "Save the long bar (I-piece) for a Tetris!"
      - "Watch out for the overhangs, dude."

      Zuma Tips:
      - "Combo those colors!"
      - "Don't let the chain reach the skull!"

      Keep responses short, punchy, and retro-themed. 
      If they lose, encourage them to insert another coin (try again).`,
    },
  });
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const chat = initializeChat();
    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "INSERT COIN TO TRY AGAIN (Error)";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "SYSTEM ERROR: TILT! TILT!";
  }
};