
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
    if (!key) {
      console.error("Gemini API Key is missing.");
    }
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
      
      const languageRule = "\nIMPORTANT: Always respond in the same language as the user's message or voice recording (Arabic or English). If the user speaks Arabic, reply in professional Arabic. If English, reply in academic English.";

      // بناء التاريخ بشكل سليم
      const contents = history.map(item => ({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(item.content) }]
      }));

      const currentParts: any[] = [{ text: prompt || "تحليل" }];
      if (fileData) {
        currentParts.push(fileData);
      }

      contents.push({
        role: 'user',
        parts: currentParts
      });

      // استخدام محرك gemini-3-flash-preview
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: systemInstruction + languageRule,
          // جعل البحث مفعلاً فقط في النمط الشامل لتقليل احتمالية الخطأ
          tools: mode === AcademicMode.GENERAL ? [{ googleSearch: {} }] : undefined,
          temperature: 0.7,
        },
      });

      return this.processResponse(response);
    } catch (err: any) {
      console.error("Gemini API Error details:", err);
      // إرجاع رسالة خطأ واضحة للمستخدم
      throw new Error(err?.message || "فشل الاتصال بخادم الذكاء الاصطناعي.");
    }
  }

  private processResponse(response: GenerateContentResponse) {
    if (!response || !response.text) {
      throw new Error("استجابة فارغة من المحرك.");
    }
    
    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const groundingUrls = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        uri: String(chunk.web.uri),
        title: String(chunk.web.title || chunk.web.uri)
      }));

    return { text, groundingUrls };
  }

  async humanizeText(text: string) {
    return this.generateResponse(
      `Please rewrite the following text to sound natural and professional, maintaining the original language: \n\n ${text}`,
      AcademicMode.HUMANIZER
    );
  }
}

export const geminiService = new GeminiService();
