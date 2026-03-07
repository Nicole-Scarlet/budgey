import { GoogleGenAI } from "@google/genai";

const API_KEY = "insert key";
const client = new GoogleGenAI({ apiKey: API_KEY });

export const getGeminiResponse = async (prompt: string, history: any[] = []) => {
    try {
        const systemInstruction = { role: 'user', parts: [{ text: "System Instruction: You are Budgey's AI assistant. Use **bold text** for important terms, amounts, and key advice to make your responses easy to read." }] };
        const contents = [systemInstruction, ...history, { role: 'user', parts: [{ text: prompt }] }];

        const result = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                maxOutputTokens: 1000,
            }
        });

        return result.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
    }
};
