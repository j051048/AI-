import React, { memo } from 'react';
import { MapPin, RefreshCw, ArrowRight } from 'lucide-react';
import { AppState, Theme, Translations } from '../types';
import { THEMES } from '../constants';
import { WeatherDisplay } from './WeatherDisplay';
import { OutfitList } from './OutfitList';

interface SidebarProps {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    cityInput: string;
    setCityInput: (val: string) => void;
    handleSearch: () => void;
    t: Translations;
}

export const Sidebar: React.FC<SidebarProps> = memo(({
    state, setState, cityInput, setCityInput, handleSearch, t
}) => {
    return (
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
            {/* Mobile Gradient Overlay */}
            <div className="md:hidden absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-black/20 to-black/80 pointer-events-none h-[200%]"></div>

            <div className="shrink-0 h-[40vh] md:hidden w-full" />

            {/* Search Input */}
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
                        aria-label="Search"
                    >
                        {state.isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Weather & Info */}
            <WeatherDisplay weather={state.weather} t={t} />

            {/* Gender Switcher - Segmented Control */}
            <div className="flex gap-4 items-center shrink-0">
                <div className="glass-input p-1 rounded-full flex gap-1">
                    {(['male', 'female'] as const).map(g => (
                        <button
                            key={g}
                            onClick={() => setState(p => ({ ...p, gender: g }))}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${state.gender === g
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
                            aria-label={`Select theme ${th}`}
                        />
                    ))}
                </div>
            </div>

            {/* Outfit List */}
            <OutfitList outfit={state.outfit} t={t} />
        </section>
    );
});

Sidebar.displayName = 'Sidebar';
