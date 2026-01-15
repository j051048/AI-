import React, { memo } from 'react';
import { OutfitItem, Translations } from '../types';

interface OutfitListProps {
    outfit: OutfitItem[];
    t: Translations;
}

const getDefaultOutfit = (t: Translations) => [1, 2, 3, 4].map(i => ({
    id: i.toString(), name: t.placeholders.item, color: '', type: ''
}));

export const OutfitList: React.FC<OutfitListProps> = memo(({ outfit, t }) => {
    const items = outfit.length > 0 ? outfit : getDefaultOutfit(t);

    return (
        <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4 relative shrink-0 min-h-[300px] mb-20 md:mb-0">
            <h3 className="text-xs uppercase tracking-[0.15em] text-white/40 font-bold mb-2">
                {t.outfitTitle}
            </h3>
            <div className="flex-1 space-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="group flex items-center justify-between py-2 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors px-2 rounded-lg">
                        <div className="flex flex-col">
                            <span className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">
                                {item.name}
                            </span>
                            {outfit.length > 0 && (
                                <span className="text-xs text-white/50 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color || '#fff' }}></span>
                                    {item.color}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

OutfitList.displayName = 'OutfitList';
