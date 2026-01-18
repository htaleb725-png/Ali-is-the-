
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
    // التأكد من وجود المفتاح أو رمي خطأ واضح للمستخدم
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("Missing API_KEY in environment variables.");
    }
    return new GoogleGenAI({ apiKey: apiKey || "" });
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
      if (fileData) {
        currentParts.push(fileData);
      }
      
      // إذا كان النص فارغاً والملف موجود، نضع أمراً افتراضياً للتحليل
      currentParts.push({ text: prompt || "قم بتحليل المحتوى المرفق بدقة أكاديمية عالية ومصادر موثقة." });

      contents.push({ role: 'user', parts: currentParts });

      // استخدام طراز gemini-3-pro-preview للأبحاث المعقدة
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
          topP: 0.9,
        },
      });

      if (!response || !response.text) {
        throw new Error("تلقى النظام استجابة فارغة من المحرك.");
      }

      const text = response.text;
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
      console.error("Gemini Critical Error:", err);
      // تخصيص رسالة الخطأ لتكون مفهومة للمستخدم في الاستضافة
      let userError = "حدث خطأ أثناء الاتصال بالخادم الأكاديمي.";
      if (err.message?.includes("API_KEY")) userError = "مفتاح الربط (API Key) غير معد بشكل صحيح في الاستضافة.";
      if (err.message?.includes("fetch")) userError = "فشل في الاتصال بالإنترنت أو تم حظر الطلب من الاستضافة.";
      
      throw new Error(userError);
    }
  }

  async humanizeText(text: string) {
    return this.generateResponse(
      `أعد صياغة النص التالي بأسلوب بشري 100%، استخدم تعبيرات بليغة وتجنب الأسلوب النمطي للذكاء الاصطناعي لضمان تجاوز الفحص: \n\n ${text}`,
      AcademicMode.HUMANIZER
    );
  }
}

export const geminiService = new GeminiService();
