import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Settings, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Save, Wifi } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (s: Settings) => void;
  lang: Language;
  onTest: (s: Settings) => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave, lang, onTest }) => {
  const t = TRANSLATIONS[lang];
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  const handleChange = (field: keyof Settings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.settings}>
      <div className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm mb-1">{t.apiKey}</label>
          <input 
            type="password" 
            value={localSettings.apiKey}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/50"
            placeholder="AIzaSy..."
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-1">{t.baseUrl}</label>
          <input 
            type="text" 
            value={localSettings.baseUrl}
            onChange={(e) => handleChange('baseUrl', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/50"
            placeholder="https://generativelanguage.googleapis.com"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-1">{t.model}</label>
          <div className="grid grid-cols-2 gap-2">
            {(['nano-banana', 'nano-banana-pro'] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleChange('model', m)}
                className={`py-2 px-3 rounded-xl text-sm transition-all ${
                  localSettings.model === m 
                    ? 'bg-white text-purple-600 font-bold' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex gap-3">
           <button 
            onClick={() => onTest(localSettings)}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Wifi className="w-4 h-4" />
            {t.testConnection}
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-white text-purple-600 font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Save className="w-4 h-4" />
            {t.save}
          </button>
        </div>
      </div>
    </Modal>
  );
};
