
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
    const ai = this.getAI();
    const systemInstruction = this.getInstruction(mode);
    
    const languageRule = "\nIMPORTANT: Always respond in the same language as the user's message or voice recording (Arabic or English). If the user speaks Arabic, reply in professional Arabic. If English, reply in academic English.";

    // تحويل التاريخ إلى تنسيق Gemini
    const contents = history.map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(item.content) }]
    }));

    // إضافة الرسالة الحالية مع الملف إن وجد
    const currentParts: any[] = [{ text: prompt }];
    if (fileData) {
      currentParts.push(fileData);
    }

    contents.push({
      role: 'user',
      parts: currentParts
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction + languageRule + "\nIf audio is provided, prioritize analyzing its content. Answer accurately.",
        tools: [{ googleSearch: {} }],
      },
    });

    return this.processResponse(response);
  }

  private processResponse(response: GenerateContentResponse) {
    const text = response.text || "";
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
      `Please rewrite the following text to sound perfectly natural, human, and professional. It must bypass AI detection while maintaining the original meaning and language (Arabic/English): \n\n ${text}`,
      AcademicMode.HUMANIZER
    );
  }
}

export const geminiService = new GeminiService();
