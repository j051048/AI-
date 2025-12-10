import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/ui/Toast';
import { getAdvice, generateAvatar, testApiKey } from './services/geminiService';
import { 
  AppState, Settings, Language, Theme, Gender, ToastMessage, OutfitItem 
} from './types';
import { TRANSLATIONS, THEMES } from './constants';
import { 
  Settings as SettingsIcon, Search, RefreshCw, Shirt, CloudSun, User
} from 'lucide-react';

const INITIAL_SETTINGS: Settings = {
  apiKey: '',
  baseUrl: '',
  model: 'nano-banana'
};

const App: React.FC = () => {
  // --- State ---
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('unistyle_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });
  
  const [state, setState] = useState<AppState>({
    language: 'cn',
    theme: 'sakura', // Changed default to new theme
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
  
  // Sync Theme Color to CSS Variable
  useEffect(() => {
    const root = document.documentElement;
    const primaryColor = THEMES[state.theme].primary;
    root.style.setProperty('--color-primary', primaryColor);
  }, [state.theme]);

  // --- Helpers ---
  const addToast = (msg: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message: msg, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('unistyle_settings', JSON.stringify(newSettings));
    addToast(t.success, 'success');
  };

  const testConnection = async (testSettings: Settings) => {
    if (!testSettings.apiKey) {
      addToast(t.enterKey, 'error');
      return;
    }
    try {
      // Use new service function to test connection via fetch
      await testApiKey({ 
        apiKey: testSettings.apiKey, 
        baseUrl: testSettings.baseUrl 
      });
      addToast(t.testSuccess, 'success');
    } catch (e) {
      console.error(e);
      addToast(t.testFail, 'error');
    }
  };

  // --- Core Logic ---
  const handleSearch = async () => {
    if (!cityInput) {
      addToast(t.emptyCity, 'info');
      return;
    }
    if (!settings.apiKey) {
      setIsSettingsOpen(true);
      addToast(t.enterKey, 'info');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, city: cityInput }));

    try {
      // 1. Get Weather & Outfit Text
      const advice = await getAdvice(cityInput, state.gender, state.language, { 
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl
      });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        weather: advice.weather,
        outfit: advice.outfit,
        // Trigger image generation automatically after text
        isGeneratingImage: true 
      }));

      // 2. Generate Image
      handleGenerateImage(advice.outfit);

    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, isLoading: false, isGeneratingImage: false }));
      addToast(t.error + ': ' + (e instanceof Error ? e.message : 'Unknown'), 'error');
    }
  };

  const handleGenerateImage = async (outfitOverride?: OutfitItem[]) => {
    const currentOutfit = outfitOverride || state.outfit;
    if (currentOutfit.length === 0) return;

    setState(prev => ({ ...prev, isGeneratingImage: true }));
    try {
      const base64Image = await generateAvatar(
        state.gender, 
        currentOutfit, 
        settings.model,
        { 
          apiKey: settings.apiKey,
          baseUrl: settings.baseUrl
        }
      );
      setState(prev => ({ ...prev, generatedImage: base64Image, isGeneratingImage: false }));
    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, isGeneratingImage: false }));
      addToast('Image Gen Failed', 'error');
    }
  };

  // --- Render Components ---

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

      {/* Header Grid */}
      <header className="px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
           {/* Mobile Title or Logo could go here */}
           <h1 className="text-xl font-bold tracking-tight text-white/90 drop-shadow-sm">{t.appTitle}</h1>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setState(p => ({ ...p, language: p.language === 'en' ? 'cn' : 'en' }))}
                className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-xs font-bold"
            >
                {state.language.toUpperCase()}
            </button>
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full glass-panel hover:bg-white/20 transition-colors"
            >
                <SettingsIcon className="w-5 h-5 text-white" />
            </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      {/* Mobile: Flex Column. Tablet+: Grid */}
      <main className="flex-1 px-4 pb-6 overflow-y-auto w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        
        {/* Left Column (Search + Weather + Outfit) */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4 h-full">
            
            {/* Search Bar */}
            <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 shadow-sm">
                <Search className="w-5 h-5 text-white/60 ml-2" />
                <input 
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={t.searchPlaceholder}
                    className="flex-1 bg-transparent border-none text-white placeholder-white/50 focus:outline-none h-10"
                />
                <button 
                  onClick={handleSearch}
                  disabled={state.isLoading}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 h-10 font-medium transition-colors"
                >
                   {state.isLoading ? '...' : 'Go'}
                </button>
            </div>

            {/* Controls Row (Theme, Gender) */}
            <div className="flex gap-2">
                <div className="flex-1 glass-panel p-1 rounded-xl flex justify-between items-center">
                    {(['male', 'female'] as const).map(g => (
                        <button 
                            key={g}
                            onClick={() => setState(p => ({ ...p, gender: g }))}
                            className={`flex-1 py-2 rounded-lg text-sm transition-all ${state.gender === g ? 'bg-white/20 shadow-sm font-bold' : 'text-white/60'}`}
                        >
                            {t.gender[g]}
                        </button>
                    ))}
                </div>
                 <div className="flex gap-1 glass-panel p-1 rounded-xl">
                    {(Object.keys(THEMES) as Theme[]).map(th => (
                        <button
                            key={th}
                            onClick={() => setState(p => ({ ...p, theme: th }))}
                            className={`w-8 h-8 rounded-lg transition-transform ${state.theme === th ? 'scale-110 ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
                            style={{ background: THEMES[th].primary }}
                        />
                    ))}
                </div>
            </div>

            {/* Weather Card */}
            {state.weather && (
                <div className="glass-panel p-5 rounded-3xl animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center gap-3 mb-2">
                        <CloudSun className="w-6 h-6 text-yellow-300" />
                        <h3 className="font-semibold text-lg">{t.weatherTitle}</h3>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{state.weather.temp}</span>
                        <span className="text-white/80 pb-1 mb-1">{state.weather.condition}</span>
                    </div>
                    <div className="text-sm text-white/60 mt-1">{state.weather.city}</div>
                </div>
            )}

            {/* Outfit List (Scrollable on mobile) */}
            {state.outfit.length > 0 && (
                <div className="glass-panel p-5 rounded-3xl flex-1 min-h-[200px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="flex items-center gap-3 mb-4">
                        <Shirt className="w-6 h-6 text-pink-300" />
                        <h3 className="font-semibold text-lg">{t.outfitTitle}</h3>
                    </div>
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {state.outfit.map((item, idx) => (
                            <div key={item.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-white/50">{item.color} • {item.type}</p>
                                </div>
                                <span className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: item.color.toLowerCase().includes('white') ? '#eee' : item.color }}></span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Right Column (Avatar Display) */}
        <div className="md:col-span-7 lg:col-span-8 h-full min-h-[50vh] relative group">
            <div className="absolute inset-0 glass-panel rounded-[2.5rem] overflow-hidden flex items-center justify-center p-2 shadow-2xl transition-all duration-500 group-hover:shadow-purple-500/20">
                {state.isGeneratingImage ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <p className="animate-pulse">{t.generating}</p>
                    </div>
                ) : state.generatedImage ? (
                    <>
                        <img 
                            src={state.generatedImage} 
                            alt="Generated Avatar" 
                            className="w-full h-full object-cover rounded-[2rem] animate-in zoom-in-95 duration-700"
                        />
                         {/* Reload Button overlaid */}
                        <button 
                            onClick={() => handleGenerateImage()}
                            className="absolute bottom-6 right-6 p-4 glass-panel rounded-full hover:bg-white/20 transition-all hover:scale-110 active:scale-95 shadow-lg"
                        >
                            <RefreshCw className="w-6 h-6 text-white" />
                        </button>
                    </>
                ) : (
                    <div className="text-center text-white/40 flex flex-col items-center gap-4">
                         <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                            <User className="w-10 h-10" />
                         </div>
                         <p>Enter city to start</p>
                    </div>
                )}
                
                {state.isLoading && !state.isGeneratingImage && (
                     <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center">
                         <div className="flex flex-col items-center">
                            <span className="text-2xl animate-bounce mb-2">🤔</span>
                            <p>{t.loading}</p>
                         </div>
                     </div>
                )}
            </div>
        </div>

      </main>
    </Layout>
  );
};

export default App;