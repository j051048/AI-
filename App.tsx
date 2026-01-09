import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/ui/Toast';
import { getAdvice, generateAvatar, testApiKey } from './services/geminiService';
import { 
  AppState, Settings, Language, Theme, ToastMessage, OutfitItem 
} from './types';
import { TRANSLATIONS, THEMES } from './constants';
import { 
  Settings2, Search, RefreshCw, MapPin, Sparkles, ArrowRight
} from 'lucide-react';

const INITIAL_SETTINGS: Settings = {
  apiKey: '123456789',
  baseUrl: '',
  model: 'nano-banana'
};

const App: React.FC = () => {
  // --- State ---
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('unistyle_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_SETTINGS, ...parsed, apiKey: parsed.apiKey || INITIAL_SETTINGS.apiKey };
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
    // API Key Check
    const keyToUse = settings.apiKey || INITIAL_SETTINGS.apiKey;
    if (!keyToUse) {
        setIsSettingsOpen(true);
        addToast(t.enterKey, 'info');
        return;
    }

    setState(prev => ({ ...prev, isLoading: true, city: cityInput }));

    try {
      // 1. Get Text Advice
      const advice = await getAdvice(cityInput, state.gender, state.language, { 
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
  };

  // --- Components ---
  const defaultOutfit = [1, 2, 3, 4].map(i => ({ 
    id: i.toString(), name: t.placeholders.item, color: '', type: '' 
  }));

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

      {/* --- Top Bar (Absolute) --- */}
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
            >
                {state.language.toUpperCase()}
            </button>
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="h-10 w-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-colors"
            >
                <Settings2 className="w-5 h-5 text-white/80" />
            </button>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-1 w-full h-full relative flex flex-col md:flex-row overflow-hidden">
        
        {/* Global Action Button (Mobile & Desktop) */}
        {/* On Mobile: Bottom right, fixed over content. On Desktop: Inside the image area ideally, but fixed is fine. */}
        <button 
            onClick={() => handleGenerateImage()}
            className={`
                absolute z-40 h-14 w-14 rounded-full glass-panel flex items-center justify-center 
                hover:bg-white text-white hover:text-black transition-all duration-300 shadow-2xl 
                hover:scale-110 active:scale-95 group 
                ${state.outfit.length === 0 ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
                bottom-8 right-8
            `}
        >
             {state.isGeneratingImage ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:animate-pulse-slow" />}
        </button>

        {/* Left: Interactive Control Panel */}
        {/* Mobile: Full Screen Scrollable Overlay. Desktop: Side Panel. */}
        <section className="
            relative z-20 
            w-full md:w-[400px] lg:w-[450px] 
            flex flex-col 
            h-full md:h-full
            overflow-y-auto no-scrollbar md:overflow-hidden 
            p-6 pt-24 md:pt-28 
            gap-6 
            animate-fade-in-up
            md:bg-transparent
        ">
            {/* Mobile Gradient Overlay for Readability (Scrolls with content) */}
            <div className="md:hidden absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-black/20 to-black/80 pointer-events-none h-[200%]"></div>

            {/* Spacer for Mobile to show Avatar Face initially */}
            <div className="shrink-0 h-[40vh] md:hidden w-full" />
            
            {/* Search Input - Floating Pill */}
            <div className="relative group w-full max-w-sm mx-auto md:mx-0 shrink-0">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="glass-input rounded-full h-14 flex items-center px-2 relative transition-all focus-within:ring-1 ring-white/30 backdrop-blur-md">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center ml-1">
                        <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <input 
                        type="text"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder={t.searchPlaceholder}
                        className="flex-1 bg-transparent border-none text-white px-4 placeholder-white/40 focus:outline-none font-medium"
                    />
                    <button 
                      onClick={handleSearch}
                      disabled={state.isLoading}
                      className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                    >
                        {state.isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Weather & Info - Atmospheric Display */}
            <div className="flex-1 flex flex-col justify-center min-h-[160px] shrink-0">
                {!state.weather ? (
                     <div className="text-white/30 text-2xl font-light tracking-wide pl-2">
                        {t.placeholders.condition}
                     </div>
                ) : (
                    <div className="animate-in slide-in-from-left duration-700">
                        <div className="flex items-start gap-4">
                            <h2 className="text-[6rem] leading-[1] font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-lg">
                                {state.weather.temp.replace(/[^\d-]/g, '')}°
                            </h2>
                            <div className="pt-4 flex flex-col gap-1">
                                <span className="text-xl font-medium text-white/90">{state.weather.condition}</span>
                                <span className="text-sm text-white/60">{state.weather.tempRange}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-white/50 text-sm tracking-wide uppercase">
                            <MapPin className="w-3 h-3" />
                            {state.weather.city}
                        </div>
                    </div>
                )}
            </div>

            {/* Gender Switcher - Segmented Control */}
            <div className="flex gap-4 items-center shrink-0">
                <div className="glass-input p-1 rounded-full flex gap-1">
                    {(['male', 'female'] as const).map(g => (
                        <button 
                            key={g}
                            onClick={() => setState(p => ({ ...p, gender: g }))}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                                state.gender === g 
                                ? 'bg-white text-black shadow-lg' 
                                : 'text-white/50 hover:text-white'
                            }`}
                        >
                            {t.gender[g]}
                        </button>
                    ))}
                </div>
                {/* Theme Dots */}
                <div className="flex gap-2 ml-auto">
                    {(Object.keys(THEMES) as Theme[]).map(th => (
                        <button
                            key={th}
                            onClick={() => setState(p => ({ ...p, theme: th }))}
                            className={`w-6 h-6 rounded-full border border-white/20 transition-all ${state.theme === th ? 'scale-125 ring-2 ring-white/50' : 'opacity-50 hover:opacity-100'}`}
                            style={{ background: THEMES[th].primary }}
                        />
                    ))}
                </div>
            </div>

            {/* Outfit List - Spec Sheet Style */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4 relative shrink-0 min-h-[300px] mb-20 md:mb-0">
                 <h3 className="text-xs uppercase tracking-[0.15em] text-white/40 font-bold mb-2">
                    {t.outfitTitle}
                 </h3>
                 <div className="flex-1 space-y-4">
                    {(state.outfit.length > 0 ? state.outfit : defaultOutfit).map((item, idx) => (
                        <div key={idx} className="group flex items-center justify-between py-2 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors px-2 rounded-lg">
                            <div className="flex flex-col">
                                <span className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">
                                    {item.name}
                                </span>
                                {state.outfit.length > 0 && (
                                    <span className="text-xs text-white/50 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full inline-block" style={{backgroundColor: item.color || '#fff'}}></span>
                                        {item.color}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </section>

        {/* Right: Immersive Avatar Display (Background on Mobile) */}
        <section className="absolute inset-0 md:static md:flex-1 h-full w-full pointer-events-none md:pointer-events-auto">
            {/* Darken overlay for mobile readability - now handled by Left Column gradient, but keep base darken */}
            <div className="absolute inset-0 bg-black/30 md:hidden z-10" />
            
            <div className="w-full h-full relative overflow-hidden group">
                {state.generatedImage ? (
                    <>
                         <img 
                            src={state.generatedImage} 
                            alt="Avatar" 
                            className="w-full h-full object-cover object-center animate-in fade-in zoom-in-105 duration-1000 ease-out"
                        />
                        {/* Desktop Gradient Overlay */}
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center md:justify-end md:pr-20 opacity-30">
                         {/* Placeholder Graphic */}
                         <div className="w-[300px] h-[500px] rounded-[100px] border-4 border-white/10 border-dashed flex items-center justify-center">
                            <p className="text-white/40 tracking-widest text-sm uppercase">Visualization Inactive</p>
                         </div>
                    </div>
                )}
                
                {/* Loader Overlay */}
                {(state.isLoading || state.isGeneratingImage) && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-40 flex flex-col items-center justify-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-white animate-spin"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
                        </div>
                        <p className="text-white/80 tracking-widest text-sm animate-pulse">
                            {state.isLoading ? t.loading : t.generating}
                        </p>
                    </div>
                )}
            </div>
        </section>

      </main>
    </Layout>
  );
};

export default App;