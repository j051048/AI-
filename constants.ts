import { Theme } from './types';

export const THEMES: Record<Theme, { primary: string; gradient: string }> = {
  sakura: { 
    primary: '#FB7185', 
    gradient: 'from-rose-400 via-pink-500 to-rose-500' 
  },
  malibu: { 
    primary: '#38BDF8', 
    gradient: 'from-sky-400 via-blue-500 to-cyan-500' 
  },
  pistachio: { 
    primary: '#34D399', 
    gradient: 'from-emerald-400 via-teal-500 to-green-500' 
  },
  lavender: { 
    primary: '#A78BFA', 
    gradient: 'from-violet-400 via-purple-500 to-indigo-500' 
  },
};

export const MODELS = {
  'nano-banana': 'gemini-2.5-flash-image',
  'nano-banana-pro': 'gemini-3-pro-image-preview',
  'text-model': 'gemini-2.5-flash',
};

export const TRANSLATIONS = {
  en: {
    appTitle: 'UniStyle AI',
    searchPlaceholder: 'Enter city (e.g., Tokyo)',
    weatherTitle: 'Current Weather',
    outfitTitle: 'OOTD Recommendation',
    generateBtn: 'Refresh Look',
    settings: 'Settings',
    apiKey: 'API Key',
    baseUrl: 'Default Gateway (Default: https://proxy.flydao.top/v1)',
    model: 'Model',
    testConnection: 'Test Connection',
    save: 'Save',
    gender: { male: 'Boy', female: 'Girl' },
    loading: 'Thinking...',
    generating: 'Designing...',
    error: 'Error',
    success: 'Success',
    enterKey: 'Please enter your Gemini API Key',
    testSuccess: 'Connection Successful!',
    testFail: 'Connection Failed. Check Key.',
    emptyCity: 'Please enter a city name',
    placeholders: {
        temp: '--°C',
        tempRange: 'L:--° H:--°',
        condition: 'Waiting...',
        city: 'City not selected',
        item: 'Waiting for recommendation...'
    }
  },
  cn: {
    appTitle: '大学生穿搭神器',
    searchPlaceholder: '输入城市 (如: 北京)',
    weatherTitle: '当地天气',
    outfitTitle: '今日穿搭推荐',
    generateBtn: '刷新形象',
    settings: '配置',
    apiKey: 'API 密钥',
    baseUrl: '默认网关 (默认: https://proxy.flydao.top/v1)',
    model: '模型',
    testConnection: '测试连接',
    save: '保存',
    gender: { male: '男生', female: '女生' },
    loading: '思考中...',
    generating: '生成中...',
    error: '错误',
    success: '成功',
    enterKey: '请输入您的 Gemini API Key',
    testSuccess: '连接成功！',
    testFail: '连接失败，请检查密钥。',
    emptyCity: '请输入城市名称',
    placeholders: {
        temp: '--°C',
        tempRange: '低温 --° / 高温 --°',
        condition: '等待查询...',
        city: '未选择城市',
        item: '等待穿搭推荐...'
    }
  },
};