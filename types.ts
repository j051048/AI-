export type Language = 'en' | 'cn';
export type Gender = 'male' | 'female';
export type Theme = 'sakura' | 'malibu' | 'pistachio' | 'lavender';

export interface Settings {
  apiKey: string;
  baseUrl: string; // For custom proxy if needed, though usually standard
  model: 'nano-banana' | 'nano-banana-pro';
}

export interface WeatherData {
  city: string;
  temp: string;
  tempRange: string; // New field for min/max temp
  condition: string;
  humidity?: string;
}

export interface OutfitItem {
  id: string;
  name: string;
  color: string;
  type: string; // e.g., 'top', 'bottom', 'shoes', 'accessory'
}

export interface AppState {
  language: Language;
  theme: Theme;
  gender: Gender;
  city: string;
  weather: WeatherData | null;
  outfit: OutfitItem[];
  generatedImage: string | null;
  isLoading: boolean;
  isGeneratingImage: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}