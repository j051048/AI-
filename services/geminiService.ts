import { GoogleGenAI, Type } from '@google/genai';
import { MODELS } from '../constants';
import { OutfitItem, WeatherData } from '../types';

interface GenConfig {
  apiKey: string;
  baseUrl?: string;
}

export const createClient = (config: GenConfig) => {
  // CRITICAL FIX: Trim whitespace that often occurs during copy-paste
  const apiKey = config.apiKey?.trim();
  
  if (!apiKey) throw new Error('API Key is missing');
  
  // User requested default to this specific third-party proxy
  const DEFAULT_BASE_URL = 'https://vip.apiyi.com';
  
  // Use the user provided URL (trimmed) or fallback to the proxy default
  // This effectively removes the default official Google endpoint unless manually entered
  const baseUrl = config.baseUrl?.trim() || DEFAULT_BASE_URL;
  
  return new GoogleGenAI({ 
    apiKey, 
    baseUrl 
  });
};

export const getAdvice = async (
  city: string,
  gender: string,
  lang: 'en' | 'cn',
  config: GenConfig
): Promise<{ weather: WeatherData; outfit: OutfitItem[] }> => {
  const ai = createClient(config);
  
  const languagePrompt = lang === 'cn' ? 'Response in Simplified Chinese.' : 'Response in English.';
  
  const prompt = `
    Find the current typical weather for ${city} using Google Search if necessary. 
    Based on this weather, suggest a stylish "University Student" outfit for a ${gender}.
    ${languagePrompt}
    Return ONLY a raw JSON string (do not include markdown code blocks) with this schema:
    {
      "weather": {
        "city": "${city}",
        "temp": "temperature with unit",
        "condition": "short description (e.g., Sunny, Rainy)",
        "humidity": "percentage (optional)"
      },
      "outfit": [
        { "id": "1", "name": "clothing item name", "color": "color name", "type": "top" },
        { "id": "2", "name": "clothing item name", "color": "color name", "type": "bottom" },
        { "id": "3", "name": "clothing item name", "color": "color name", "type": "shoes" },
        { "id": "4", "name": "clothing item name", "color": "color name", "type": "accessory" }
      ]
    }
  `;

  // We use the flash model for logic/text
  const response = await ai.models.generateContent({
    model: MODELS['text-model'],
    contents: prompt,
    config: {
        // responseMimeType: 'application/json', // REMOVED: Cannot use JSON mode with Tools
        tools: [{ googleSearch: {} }] // Use Search Grounding for accurate weather
    }
  });

  const text = response.text;
  if (!text) throw new Error('No response from AI');

  // Clean markdown code blocks if present (e.g. ```json ... ```)
  const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  try {
    const data = JSON.parse(jsonStr);
    return data;
  } catch (e) {
    console.error("Failed to parse JSON", text);
    throw new Error('AI returned invalid format');
  }
};

export const generateAvatar = async (
  gender: string,
  outfit: OutfitItem[],
  modelAlias: 'nano-banana' | 'nano-banana-pro',
  config: GenConfig
): Promise<string> => {
  const ai = createClient(config);
  
  const outfitDesc = outfit.map(i => `${i.color} ${i.name}`).join(', ');
  const modelName = MODELS[modelAlias];

  const prompt = `
    Full body fashion shot of a trendy ${gender} university student standing on a modern university campus.
    Wearing: ${outfitDesc}.
    Style: Casual, clean, academic aesthetic, photorealistic, soft lighting, 8k resolution.
    Pose: Standing confidently, looking at camera.
    Aspect Ratio: 9:16 (Vertical).
  `;

  // For nano-banana series (image generation models), we use generateContent
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
        // Nano banana models don't support responseMimeType or tools usually for pure image gen
    }
  });

  // Extract image
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error('No image generated');
};