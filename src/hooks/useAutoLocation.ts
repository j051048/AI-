import { useEffect, useRef } from 'react';
import { Language } from '../types';

interface AutoLocationProps {
    language: Language;
    onLocationFound: (city: string) => void;
    onToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const useAutoLocation = ({ language, onLocationFound, onToast }: AutoLocationProps) => {
    // Use a ref to strictly prevent double-execution in React.StrictMode
    const hasRunRef = useRef(false);

    useEffect(() => {
        const checkAndAutoLocate = async () => {
            if (hasRunRef.current) return;

            const STORAGE_KEY = 'unistyle_last_auto_locate_date';
            const today = new Date().toDateString();
            const lastRunDate = localStorage.getItem(STORAGE_KEY);

            // Only run once per day
            if (lastRunDate === today) return;

            if (!navigator.geolocation) return;

            hasRunRef.current = true; // Mark as running/run

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const langParam = language === 'cn' ? 'zh' : 'en';
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=${langParam}`,
                            { headers: { 'User-Agent': 'UniStyleAI/1.0' } }
                        );

                        if (response.ok) {
                            const data = await response.json();
                            const address = data.address;
                            // Priority check for city-level name (City -> District -> County)
                            // Exclude 'town', 'village' to ensure weather API compatibility
                            const cityName = address.city || address.district || address.county || address.state;

                            if (cityName) {
                                const msg = language === 'en' ? 'Located:' : '已定位到：';
                                onToast(`${msg} ${cityName}`, 'success');

                                // Mark as run for today
                                localStorage.setItem(STORAGE_KEY, today);

                                onLocationFound(cityName);
                            }
                        }
                    } catch (error) {
                        console.error("Auto-location failed:", error);
                    }
                },
                (error) => {
                    console.log("Location permission denied or unavailable:", error);
                }
            );
        };

        const timer = setTimeout(checkAndAutoLocate, 1500); // Slight delay for UI to settle
        return () => clearTimeout(timer);
    }, [language, onLocationFound, onToast]);
};
