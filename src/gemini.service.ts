
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API key not found");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateLoveMessages(): Promise<string[]> {
    const prompt = `
      Genera 3 frases de amor cortas y poéticas en español para un tercer aniversario.
      Deben contar una pequeña historia conectada entre sí.
      El tono debe ser muy romántico y de celebración.
      Cada frase debe tener menos de 12 palabras.
      IMPORTANTE: La respuesta debe ser únicamente en español.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              messages: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                }
              }
            }
          }
        }
      });
      
      const jsonStr = response.text.trim();
      const result = JSON.parse(jsonStr);

      if (result.messages && Array.isArray(result.messages) && result.messages.length > 0) {
        return result.messages;
      }
      throw new Error("Invalid response format from Gemini API");
    } catch (error) {
      console.error("Error generating messages with Gemini:", error);
      // Fallback in case of API error
      return [
        'Tres años de nuestro amor...',
        '...un viaje de mil sonrisas.',
        'Y por una eternidad más contigo.'
      ];
    }
  }
}
