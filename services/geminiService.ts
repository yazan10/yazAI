import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MODELS, SYSTEM_PROMPTS } from '../constants';
import { ModelId } from '../types';

// Helper to get client - always create new instance to pick up latest key
const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const handleApiError = (error: any) => {
  const msg = error.message || '';
  
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('does not have permission')) {
    const err: any = new Error("Permission Denied");
    err.code = 'PERMISSION_DENIED';
    throw err;
  }
  
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
    const err: any = new Error("Quota Exceeded");
    err.code = 'QUOTA_EXCEEDED';
    throw err;
  }

  throw error;
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateTextResponse = async (
  modelId: ModelId, 
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  imageBase64?: string
): Promise<string> => {
  
  const MAX_RETRIES = 3;
  let lastError: any;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const modelDef = MODELS.find(m => m.id === modelId);
      const actualModelName = modelDef?.baseModel || 'gemini-3-flash-preview';
      const systemInstruction = SYSTEM_PROMPTS[modelId];

      const ai = getClient();
      
      // Use chat for text models to maintain history
      const chat = ai.chats.create({
        model: actualModelName,
        history: history,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      let messageContent: any;

      if (imageBase64) {
        // Extract base64 data and mime type
        // Data URI format: data:[<mediatype>][;base64],<data>
        const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const mimeType = matches[1];
            const data = matches[2];
            
            messageContent = {
                parts: [
                    { text: prompt },
                    { 
                        inlineData: { 
                            mimeType: mimeType, 
                            data: data 
                        } 
                    }
                ]
            };
        } else {
            // Fallback if parsing fails
            messageContent = { message: prompt };
        }
      } else {
        messageContent = { message: prompt };
      }

      const response: GenerateContentResponse = await chat.sendMessage(messageContent);
      return response.text || "عذراً، لم أتمكن من إنشاء رد.";

    } catch (error: any) {
      lastError = error;
      const msg = error.message || '';
      
      // Check if error is retryable (429 Quota or 5xx Server Errors)
      const isQuotaError = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
      const isServerError = msg.includes('500') || msg.includes('503') || msg.includes('overloaded');

      if ((isQuotaError || isServerError) && attempt < MAX_RETRIES) {
        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500; 
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`);
        await wait(delay);
        continue;
      }

      // If not retryable or max retries reached, break loop
      break;
    }
  }

  // If we exit the loop, handle the last error
  handleApiError(lastError);
  return ""; // Unreachable
};