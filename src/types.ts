export type Language = 'en' | 'cn';
export type Gender = 'male' | 'female';
export type Theme = 'sakura' | 'malibu' | 'pistachio' | 'lavender';
export type ModelAlias = 'nano-banana' | 'nano-banana-pro';

export interface Settings {
  apiKey: string;
  baseUrl: string; // For custom proxy if needed, though usually standard
  model: ModelAlias;
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

// Strictly Typed Translations used in UI
export interface Translations {
  appTitle: string;
  searchPlaceholder: string;
  weatherTitle: string;
  outfitTitle: string;
  generateBtn: string;
  settings: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  testConnection: string;
  save: string;
  gender: { male: string; female: string };
  loading: string;
  generating: string;
  error: string;
  success: string;
  enterKey: string;
  testSuccess: string;
  testFail: string;
  emptyCity: string;
  placeholders: {
    temp: string;
    tempRange: string;
    condition: string;
    city: string;
    item: string;
  }
}