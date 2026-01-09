import { Theme } from './types';

export const THEMES: Record<Theme, { primary: string; gradient: string }> = {
  sakura: { 
    primary: '#FB7185', 
    gradient: 'from-[#2e021d] via-[#4a0d28] to-[#9d174d]' // Deep Atmospheric Red
  },
  malibu: { 
    primary: '#38BDF8', 
    gradient: 'from-[#0c4a6e] via-[#075985] to-[#0ea5e9]' // Deep Ocean Blue
  },
  pistachio: { 
    primary: '#34D399', 
    gradient: 'from-[#064e3b] via-[#065f46] to-[#10b981]' // Deep Forest
  },
  lavender: { 
    primary: '#A78BFA', 
    gradient: 'from-[#2e1065] via-[#4c1d95] to-[#7c3aed]' // Deep Cosmic Purple
  },
};

export const MODELS = {
  'nano-banana': 'gemini-2.5-flash-image',
  'nano-banana-pro': 'gemini-3-pro-image-preview',
  'text-model': 'gemini-2.5-flash',
};

export const TRANSLATIONS = {
  en: {
    appTitle: 'UniStyle AI (Real Person Ver.)',
    searchPlaceholder: 'Enter city (e.g., Tokyo)',
    weatherTitle: 'Now',
    outfitTitle: 'The Look',
    generateBtn: 'Regenerate',
    settings: 'Configuration',
    apiKey: 'Access Token',
    baseUrl: 'Gateway (Default: https://proxy.flydao.top/v1)',
    model: 'Engine',
    testConnection: 'Ping',
    save: 'Apply',
    gender: { male: 'Him', female: 'Her' },
    loading: 'Analyzing Atmosphere...',
    generating: 'Rendering Style...',
    error: 'System Error',
    success: 'Saved',
    enterKey: 'Token Required',
    testSuccess: 'Link Established',
    testFail: 'Link Failed',
    emptyCity: 'Input Location',
    placeholders: {
        temp: '--',
        tempRange: 'L -- / H --',
        condition: 'Clear',
        city: 'Select Location',
        item: 'Awaiting data...'
    }
  },
  cn: {
    appTitle: 'AI天气查询穿搭推荐神器（真人版）',
    searchPlaceholder: '探索城市...',
    weatherTitle: '此刻',
    outfitTitle: '今日灵感',
    generateBtn: '重塑风格',
    settings: '系统配置',
    apiKey: 'API 密钥',
    baseUrl: 'API 网关 (默认: https://proxy.flydao.top/v1)',
    model: '生成引擎',
    testConnection: '网络测试',
    save: '确认生效',
    gender: { male: '男士', female: '女士' },
    loading: '解析气象数据...',
    generating: '构想穿搭方案...',
    error: '系统异常',
    success: '已保存',
    enterKey: '请输入 API 密钥',
    testSuccess: '连接成功',
    testFail: '连接失败，请检查密钥',
    emptyCity: '请输入城市',
    placeholders: {
        temp: '--',
        tempRange: '低温 -- / 高温 --',
        condition: '等待数据',
        city: '未定位',
        item: '等待灵感...'
    }
  },
};