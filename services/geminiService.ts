
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AcademicMode } from "../types";
import { MODES } from "../constants";

export interface FileData {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export class GeminiService {
  private getAI() {
    const key = process.env.API_KEY || '';
    return new GoogleGenAI({ apiKey: key });
  }

  private getInstruction(mode: AcademicMode): string {
    const saved = localStorage.getItem(`custom_instruction_${mode}`);
    if (saved) return saved;
    const config = MODES.find(m => m.id === mode);
    return config?.systemInstruction || MODES[0].systemInstruction;
  }

  async generateResponse(
    prompt: string,
    mode: AcademicMode,
    history: { role: 'user' | 'assistant'; content: string }[] = [],
    fileData?: FileData
  ) {
    try {
      const ai = this.getAI();
      const systemInstruction = this.getInstruction(mode);
      
      const contents: any[] = history.map(item => ({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(item.content) }]
      }));

      const currentParts: any[] = [];
      if (fileData) currentParts.push(fileData);
      currentParts.push({ text: prompt || "قم بتحليل المحتوى المرفق بأسلوب أكاديمي وبشري." });

      contents.push({ role: 'user', parts: currentParts });

      // استخدام Gemini 3 Pro مع أدوات البحث لضمان المصادر
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0.9, // زيادة الحرارة تعزز العشوائية البشرية في الكتابة
          topP: 0.95,
        },
      });

      const text = response.text || "عذراً، لم أتمكن من معالجة الطلب حالياً.";
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const urls = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title
      })).filter((u: any) => u.uri) || [];

      return {
        text: text,
        groundingUrls: urls
      };
    } catch (err: any) {
      console.error("Gemini Service Error:", err);
      if (err.message?.includes("API_KEY")) {
        throw new Error("مفتاح API غير صالح أو مفقود.");
      }
      throw new Error("فشل الاتصال بالمحرك. يرجى التحقق من جودة الإنترنت.");
    }
  }

  async humanizeText(text: string) {
    return this.generateResponse(
      `حول النص التالي إلى أسلوب بشري تماماً (Human-like) بليغ وأكاديمي بحيث يتجاوز كواشف الذكاء الاصطناعي بنسبة 100%: \n\n ${text}`,
      AcademicMode.HUMANIZER
    );
  }
}

export const geminiService = new GeminiService();
