import React, { createContext, useContext, useState, useEffect } from 'react';

export type FeatureKey = 'derivation_text' | 'derivation_image' | 'avatar' | 'tryOn' | 'swap';

export interface ModelConfig {
  derivation_text: string;
  derivation_image: string;
  avatar: string;
  tryOn: string;
  swap: string;
}

const DEFAULT_CONFIG: ModelConfig = {
  derivation_text: 'gemini-2.5-flash',
  derivation_image: 'gemini-2.0-flash-exp',
  avatar: 'gemini-2.0-flash-exp',
  tryOn: 'gemini-2.0-flash-exp',
  swap: 'gemini-2.0-flash-exp'
};

export const AVAILABLE_MODELS = [
  'gemini-2.0-flash-exp',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
];

interface ModelConfigContextType {
  config: ModelConfig;
  updateModel: (feature: FeatureKey, model: string) => void;
  resetConfig: () => void;
}

const ModelConfigContext = createContext<ModelConfigContextType | undefined>(undefined);

export const ModelConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ModelConfig>(() => {
    const saved = localStorage.getItem('viba_model_config');
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('viba_model_config', JSON.stringify(config));
  }, [config]);

  const updateModel = (feature: FeatureKey, model: string) => {
    setConfig(prev => ({ ...prev, [feature]: model }));
  };

  const resetConfig = () => setConfig(DEFAULT_CONFIG);

  return (
    <ModelConfigContext.Provider value={{ config, updateModel, resetConfig }}>
      {children}
    </ModelConfigContext.Provider>
  );
};

export const useModelConfig = () => {
  const context = useContext(ModelConfigContext);
  if (!context) {
    throw new Error('useModelConfig must be used within a ModelConfigProvider');
  }
  return context;
};
