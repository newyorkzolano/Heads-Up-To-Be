import { GoogleGenAI, Type } from "@google/genai";
import { CardData, Category, Difficulty } from "../types";
import { CARDS_PER_ROUND } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGameCards = async (category: Category, difficulty: Difficulty): Promise<CardData[]> => {
  try {
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Generate ${CARDS_PER_ROUND} "Heads Up" game cards for learning the English verb "To Be".
      
      Category: ${category}
      Difficulty: ${difficulty}
      
      Rules:
      1. "name": The famous person, character, animal, or job.
      2. "category": A short subtitle (e.g., "Actor", "Superhero", "Mammal").
      3. "hints": Provide 3 short sentences describing the name using ONLY the "To Be" verb (am, is, are, was, were). 
         Example: "He is famous." "He was a president."
      4. "toBeContext": The question format the guesser should use (e.g., "Am I...?" for people, "Is it...?" for animals).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              hints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              toBeContext: { type: Type.STRING }
            },
            required: ["id", "name", "category", "hints", "toBeContext"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const data = JSON.parse(text) as CardData[];
    return data.map((card, index) => ({ ...card, id: `card-${Date.now()}-${index}` }));

  } catch (error) {
    console.error("Failed to generate cards:", error);
    throw error;
  }
};