import React, { memo } from 'react';
import { AppState, Translations } from '../types';

interface ImageDisplayProps {
    state: AppState;
    t: Translations;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = memo(({ state, t }) => {
    return (
        <section className="absolute inset-0 md:static md:flex-1 h-full w-full pointer-events-none md:pointer-events-auto">
            <div className="absolute inset-0 bg-black/30 md:hidden z-10" />

            <div className="w-full h-full relative overflow-hidden group">
                {state.generatedImage ? (
                    <>
                        <img
                            src={state.generatedImage}
                            alt="AI Generated Outfit Visualization"
                            loading="lazy"
                            className="w-full h-full object-cover object-center animate-in fade-in zoom-in-105 duration-1000 ease-out"
                        />
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center md:justify-end md:pr-20 opacity-30">
                        <div className="w-[300px] h-[500px] rounded-[100px] border-4 border-white/10 border-dashed flex items-center justify-center">
                            <p className="text-white/40 tracking-widest text-sm uppercase">Visualization Inactive</p>
                        </div>
                    </div>
                )}

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
    );
});

ImageDisplay.displayName = 'ImageDisplay';
