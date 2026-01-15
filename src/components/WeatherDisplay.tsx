import React, { memo } from 'react';
import { MapPin } from 'lucide-react';
import { WeatherData, Translations } from '../types';

interface WeatherDisplayProps {
    weather: WeatherData | null;
    t: Translations;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = memo(({ weather, t }) => {
    return (
        <div className="flex-1 flex flex-col justify-center min-h-[160px] shrink-0">
            {!weather ? (
                <div className="text-white/30 text-2xl font-light tracking-wide pl-2">
                    {t.placeholders.condition}
                </div>
            ) : (
                <div className="animate-in slide-in-from-left duration-700">
                    <div className="flex items-start gap-4">
                        <h2 className="text-[6rem] leading-[1] font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-lg">
                            {weather.temp.replace(/[^\d-]/g, '')}°
                        </h2>
                        <div className="pt-4 flex flex-col gap-1">
                            <span className="text-xl font-medium text-white/90">{weather.condition}</span>
                            <span className="text-sm text-white/60">{weather.tempRange}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-white/50 text-sm tracking-wide uppercase">
                        <MapPin className="w-3 h-3" />
                        {weather.city}
                    </div>
                </div>
            )}
        </div>
    );
});

WeatherDisplay.displayName = 'WeatherDisplay';
