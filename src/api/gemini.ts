import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || "");

export const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "Eres EVA, una asistente financiera inteligente. Responde SIEMPRE en formato JSON puro para asegurar la integridad de la base de datos.",
});
