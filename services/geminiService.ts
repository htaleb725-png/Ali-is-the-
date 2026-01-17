
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AcademicMode } from "../types";
import { MODES } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getInstructionForMode(mode: AcademicMode): string {
    const savedInstructions = localStorage.getItem(`custom_instruction_${mode}`);
    if (savedInstructions) return savedInstructions;
    
    const config = MODES.find(m => m.id === mode);
    return config?.systemInstruction || MODES[0].systemInstruction;
  }

  async generateResponse(
    prompt: string,
    mode: AcademicMode,
    history: { role: 'user' | 'assistant'; content: string }[] = []
  ) {
    // استخدام نموذج Flash لسرعة استجابة فائقة
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = this.getInstructionForMode(mode);
    
    // تعليمات السرعة والشمولية
    const speedInstruction = "\nأجب بسرعة قصوى. إذا كان السؤال عاماً، أجب مباشرة. إذا كان بحثياً، استخدم المصادر الموثوقة.";
    
    const formattedHistory = history.map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(item.content) }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview', // تغيير الموديل إلى Flash لسرعة خارقة
      config: {
        systemInstruction: systemInstruction + speedInstruction,
        tools: [{ googleSearch: {} }],
        temperature: mode === AcademicMode.HUMANIZER ? 0.9 : 0.6,
        topP: 0.95,
      },
      history: formattedHistory,
    });

    const response: GenerateContentResponse = await chat.sendMessage({ 
      message: prompt 
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const groundingUrls = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        uri: String(chunk.web.uri),
        title: String(chunk.web.title || chunk.web.uri)
      }));

    return {
      text,
      groundingUrls
    };
  }

  async humanizeText(text: string) {
    return this.generateResponse(
      `أعد صياغة النص التالي بأسلوب بشري يدوي فائق السرعة والذكاء، تخلص من أي سمات آلية: \n\n ${text}`,
      AcademicMode.HUMANIZER
    );
  }
}

export const geminiService = new GeminiService();
