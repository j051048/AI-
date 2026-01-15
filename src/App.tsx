import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/ui/Toast';
import { Sidebar } from './components/Sidebar';
import { ImageDisplay } from './components/ImageDisplay';
import { getAdvice, generateAvatar, testApiKey } from './services/geminiService';
import { useAutoLocation } from './hooks/useAutoLocation';
import {
  AppState, Settings, ToastMessage, OutfitItem
} from './types';
import { TRANSLATIONS, THEMES } from './constants';
import {
  Settings2, RefreshCw, Sparkles
} from 'lucide-react';

// Secure defaults via Environment Variables
const INITIAL_SETTINGS: Settings = {
  apiKey: import.meta.env.VITE_GOOGLE_AI_KEY || '',
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  model: 'nano-banana'
};

const App: React.FC = () => {
  // --- State ---
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('unistyle_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          // Ensure API key is not overwritten by empty if env var exists but local storage has useless data
          apiKey: parsed.apiKey || INITIAL_SETTINGS.apiKey
        };
      }
    } catch (e) {
      console.warn('Failed to parse settings', e);
    }
    return INITIAL_SETTINGS;
  });

  const [state, setState] = useState<AppState>({
    language: 'cn',
    theme: 'sakura',
    gender: 'female',
    city: '',
    weather: null,
    outfit: [],
    generatedImage: null,
    isLoading: false,
    isGeneratingImage: false
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [cityInput, setCityInput] = useState('');

  const t = TRANSLATIONS[state.language];

  // --- Effects ---
  useEffect(() => {
    const root = document.documentElement;
    const primaryColor = THEMES[state.theme].primary;
    root.style.setProperty('--color-primary', primaryColor);
  }, [state.theme]);

  // --- Helpers (Memoized) ---
  const addToast = useCallback((msg: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message: msg, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const saveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('unistyle_settings', JSON.stringify(newSettings));
    addToast(t.success, 'success');
  }, [addToast, t.success]);

  const testConnection = useCallback(async (testSettings: Settings) => {
    if (!testSettings.apiKey) {
      addToast(t.enterKey, 'error');
      return;
    }
    try {
      await testApiKey({
        apiKey: testSettings.apiKey,
        baseUrl: testSettings.baseUrl
      });
      addToast(t.testSuccess, 'success');
    } catch (e) {
      console.error(e);
      addToast(t.testFail, 'error');
    }
  }, [addToast, t.enterKey, t.testSuccess, t.testFail]);

  // --- Core Logic ---
  const handleGenerateImage = useCallback(async (outfitOverride?: OutfitItem[]) => {
    const currentOutfit = outfitOverride || state.outfit;
    if (currentOutfit.length === 0) return;

    setState(prev => ({ ...prev, isGeneratingImage: true }));
    try {
      const base64Image = await generateAvatar(
        state.gender,
        currentOutfit,
        settings.model,
        {
          apiKey: settings.apiKey || INITIAL_SETTINGS.apiKey,
          baseUrl: settings.baseUrl
        },
        state.language
      );
      setState(prev => ({ ...prev, generatedImage: base64Image, isGeneratingImage: false }));
    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, isGeneratingImage: false }));
      addToast('Image Gen Failed', 'error');
    }
  }, [settings, state.gender, state.language, state.outfit, addToast]);

  const handleSearch = useCallback(async (manualQuery?: string) => {
    const query = manualQuery || cityInput;

    if (!query) {
      addToast(t.emptyCity, 'info');
      return;
    }

    if (manualQuery) {
      setCityInput(manualQuery);
    }

    const keyToUse = settings.apiKey || INITIAL_SETTINGS.apiKey;
    if (!keyToUse) {
      setIsSettingsOpen(true);
      addToast(t.enterKey, 'info');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, city: query }));

    try {
      const advice = await getAdvice(query, state.gender, state.language, {
        apiKey: keyToUse,
        baseUrl: settings.baseUrl
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        weather: advice.weather,
        outfit: advice.outfit,
        isGeneratingImage: true
      }));

      // Chain the image generation
      // We pass advice.outfit directly to avoid stale state issues closure
      handleGenerateImage(advice.outfit);

    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, isLoading: false, isGeneratingImage: false }));
      addToast(t.error + ': ' + (e instanceof Error ? e.message : 'Unknown'), 'error');
    }
  }, [cityInput, settings, state.gender, state.language, t, addToast, handleGenerateImage]);

  // --- Hooks ---
  // Activate Auto Location
  useAutoLocation({
    language: state.language,
    onLocationFound: handleSearch,
    onToast: addToast
  });

  return (
    <Layout gradient={THEMES[state.theme].gradient}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={saveSettings}
        onTest={testConnection}
        lang={state.language}
      />

      {/* --- Top Bar --- */}
      <nav className="absolute top-0 left-0 right-0 p-6 z-50 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col pointer-events-auto">
          <h1 className="text-lg font-bold tracking-tight text-white/90 drop-shadow-md text-glow">
            {t.appTitle.split('（')[0]}
          </h1>
          <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase font-medium mt-1">
            NeoVision Studio © 2026
          </span>
        </div>

        <div className="flex gap-3 pointer-events-auto">
          <button
            onClick={() => setState(p => ({ ...p, language: p.language === 'en' ? 'cn' : 'en' }))}
            className="h-10 w-10 rounded-full glass-panel flex items-center justify-center text-xs font-bold hover:bg-white/10 transition-colors"
            aria-label="Toggle Language"
          >
            {state.language.toUpperCase()}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="h-10 w-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Open Settings"
          >
            <Settings2 className="w-5 h-5 text-white/80" />
          </button>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-1 w-full h-full relative flex flex-col md:flex-row overflow-hidden">

        {/* FAB Generator Button */}
        <button
          onClick={() => handleGenerateImage()}
          className={`
                absolute z-40 h-14 w-14 rounded-full glass-panel flex items-center justify-center 
                hover:bg-white text-white hover:text-black transition-all duration-300 shadow-2xl 
                hover:scale-110 active:scale-95 group 
                ${state.outfit.length === 0 ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
                bottom-8 right-8
            `}
          aria-label="Regenerate Image"
        >
          {state.isGeneratingImage ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:animate-pulse-slow" />}
        </button>

        {/* Left Panel */}
        <Sidebar
          state={state}
          setState={setState}
          cityInput={cityInput}
          setCityInput={setCityInput}
          handleSearch={() => handleSearch()}
          t={t}
        />

        {/* Right Panel */}
        <ImageDisplay state={state} t={t} />

      </main>
    </Layout>
  );
};

export default App;