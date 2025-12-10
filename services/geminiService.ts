import { MODELS } from '../constants';
import { OutfitItem, WeatherData } from '../types';

interface GenConfig {
  apiKey: string;
  baseUrl?: string;
}

// Helper: Direct Fetch to bypass SDK restrictions and handle proxy Auth headers correctly
const fetchGemini = async (
  model: string,
  payload: any,
  config: GenConfig
) => {
  const apiKey = config.apiKey?.trim();
  if (!apiKey) throw new Error('API Key is missing');

  // Default to the requested proxy
  let baseUrl = config.baseUrl?.trim() || 'https://vip.apiyi.com';
  // Ensure clean URL construction
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

  // Construct standard Gemini REST endpoint
  const url = `${baseUrl}/v1beta/models/${model}:generateContent`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // CRITICAL FIX: Use Bearer Token as required by the proxy
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `API Error: ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        // Handle Google-style error wrapping
        if (errJson.error && errJson.error.message) {
          errMsg = errJson.error.message;
        }
      } catch (e) {
        // use raw text if json parse fails
        if (errText.length < 100) errMsg += ` (${errText})`;
      }
      throw new Error(errMsg);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Gemini API Fetch Error:', error);
    throw new Error(error.message || 'Network request failed');
  }
};

// Exported helper to test connection from App.tsx
export const testApiKey = async (config: GenConfig) => {
  const payload = {
    contents: [{ parts: [{ text: "Hello" }] }]
  };
  // Use a lightweight model for testing
  return fetchGemini('gemini-2.5-flash', payload, config);
};

export const createClient = (config: GenConfig) => {
  // Deprecated: SDK removed to fix proxy issues.
  // Kept empty to prevent import crashes during hot-reload if App.tsx hasn't updated yet.
  return {};
};

export const getAdvice = async (
  city: string,
  gender: string,
  lang: 'en' | 'cn',
  config: GenConfig
): Promise<{ weather: WeatherData; outfit: OutfitItem[] }> => {
  
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

  // Construct payload manually
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    // Use googleSearch tool for grounding
    tools: [{ googleSearch: {} }] 
  };

  const data = await fetchGemini(MODELS['text-model'], payload, config);

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  
  if (!text) throw new Error('No response from AI');

  // Clean markdown code blocks if present
  const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return parsed;
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
  const outfitDesc = outfit.map(i => `${i.color} ${i.name}`).join(', ');
  const modelName = MODELS[modelAlias];

  const prompt = `
    Full body fashion shot of a trendy ${gender} university student standing on a modern university campus.
    Wearing: ${outfitDesc}.
    Style: Casual, clean, academic aesthetic, photorealistic, soft lighting, 8k resolution.
    Pose: Standing confidently, looking at camera.
    Aspect Ratio: 9:16 (Vertical).
  `;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const data = await fetchGemini(modelName, payload, config);

  // Extract image from REST response structure
  // candidates[0].content.parts[].inlineData
  const parts = data.candidates?.[0]?.content?.parts || [];
  
  for (const part of parts) {
    // Handle both camelCase (SDK style) and snake_case (Raw JSON style) just in case
    const inlineData = part.inlineData || part.inline_data;
    if (inlineData && inlineData.data) {
      // Prioritize mimeType from response, fallback to png if missing
      const mimeType = inlineData.mimeType || inlineData.mime_type || 'image/png';
      return `data:${mimeType};base64,${inlineData.data}`;
    }
  }

  throw new Error('No image generated');
};