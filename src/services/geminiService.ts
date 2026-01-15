import { MODELS } from '../constants';
import { OutfitItem, WeatherData } from '../types';

interface GenConfig {
  apiKey: string;
  baseUrl?: string;
}

// Helper: Direct Fetch
const fetchGemini = async (
  model: string,
  payload: any,
  config: GenConfig
) => {
  const apiKey = config.apiKey?.trim();
  if (!apiKey) throw new Error('API Key is missing');

  let baseUrl = config.baseUrl?.trim() || 'https://proxy.flydao.top/v1';
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

  const url = `${baseUrl}/models/${model}:generateContent`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `API Error: ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error && errJson.error.message) {
          errMsg = errJson.error.message;
        }
      } catch (e) {
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

export const testApiKey = async (config: GenConfig) => {
  const payload = {
    contents: [{ parts: [{ text: "Hello" }] }]
  };
  return fetchGemini('gemini-2.5-flash', payload, config);
};

export const createClient = (config: GenConfig) => {
  return {};
};

// Styles for random selection
const STYLES = [
  'Minimalist Korean (Clean lines, neutral tones)',
  'Urban Streetwear (Oversized, layered, textures)',
  'Modern Business (Smart casual, blazers, sleek)',
  'Old Money Aesthetic (Polished, cashmere, earth tones)',
  'City Boy / City Girl (Japanese magazine style, relaxed)',
  'Athleisure Luxe (Functional, sporty but expensive looking)',
  'Neo-Vintage (Retro pieces mixed with modern)'
];

export const getAdvice = async (
  city: string,
  gender: string,
  lang: 'en' | 'cn',
  config: GenConfig
): Promise<{ weather: WeatherData; outfit: OutfitItem[] }> => {
  
  const languagePrompt = lang === 'cn' ? 'Response in Simplified Chinese.' : 'Response in English.';
  
  // Randomly select a style to ensure variety on every refresh
  const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)];

  const prompt = `
    Find the current typical weather for ${city} using Google Search.
    Based on this weather, curate a SPECIFIC, high-fashion outfit for a ${gender} (Age 18-38).
    
    Target Aesthetic: ${randomStyle}.
    IMPORTANT: Be bold with color and texture. Do not just suggest "jeans and t-shirt".
    Suggest a complete look that fits a "NeoVision" lifestyle (Modern, Aware, Stylish).

    ${languagePrompt}
    Return ONLY a raw JSON string with this schema:
    {
      "weather": {
        "city": "${city}",
        "temp": "current temp (number only, no unit)",
        "tempRange": "Low° / High°",
        "condition": "Short weather description (2-4 words)",
        "humidity": "percentage"
      },
      "outfit": [
        { "id": "1", "name": "Specific item name", "color": "Specific color (e.g. Sage Green)", "type": "top" },
        { "id": "2", "name": "Specific item name", "color": "Specific color", "type": "bottom" },
        { "id": "3", "name": "Specific item name", "color": "Specific color", "type": "shoes" },
        { "id": "4", "name": "Specific item name", "color": "Specific color", "type": "accessory" }
      ]
    }
  `;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ googleSearch: {} }] 
  };

  const data = await fetchGemini(MODELS['text-model'], payload, config);

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  
  if (!text) throw new Error('No response from AI');

  const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  try {
    const parsed = JSON.parse(jsonStr);
    // Ensure temp has degree symbol if missing
    if (parsed.weather.temp && !parsed.weather.temp.includes('°')) {
      parsed.weather.temp += '°';
    }
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
  config: GenConfig,
  lang: 'en' | 'cn'
): Promise<string> => {
  const outfitDesc = outfit.map(i => `${i.color} ${i.name}`).join(', ');
  const modelName = MODELS[modelAlias];

  const ethnicity = lang === 'cn' ? 'East Asian' : 'Global';
  
  // Dynamic Backgrounds
  const LOCATIONS = [
    'minimalist concrete architectural space with soft daylight',
    'busy futuristic tokyo street crossing, bokeh depth of field',
    'modern art gallery interior, clean white walls',
    'luxury coffee shop with glass windows, warm lighting',
    'rooftop garden at sunset, city skyline in background'
  ];
  const randomLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

  const prompt = `
    High-end fashion photography of a ${ethnicity} ${gender} model (age approx 24-30).
    Wearing: ${outfitDesc}.
    Location: ${randomLoc}.
    
    Style:
    - Shot on 35mm film, Portra 400.
    - Soft, natural lighting (Golden Hour or Overcast Softbox).
    - Candid but confident pose.
    - Extremely detailed texture on fabrics.
    - Photorealistic, 8k, Masterpiece.
    - Shallow depth of field (f/1.8), focus on the outfit.

    Aspect Ratio: 9:16 (Vertical Portrait).
  `;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const data = await fetchGemini(modelName, payload, config);

  const parts = data.candidates?.[0]?.content?.parts || [];
  
  for (const part of parts) {
    const inlineData = part.inlineData || part.inline_data;
    if (inlineData && inlineData.data) {
      const mimeType = inlineData.mimeType || inlineData.mime_type || 'image/png';
      return `data:${mimeType};base64,${inlineData.data}`;
    }
  }

  throw new Error('No image generated');
};