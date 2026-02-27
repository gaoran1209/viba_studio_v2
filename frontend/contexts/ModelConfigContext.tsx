import React, { createContext, useContext, useState, useEffect } from 'react';

export type FeatureKey = 'derivation_text' | 'derivation_image' | 'avatar' | 'tryOn' | 'swap';

export interface ModelConfig {
  derivation_text: string;
  derivation_image: string;
  avatar: string;
  tryOn: string;
  swap: string;
}

const DEFAULT_TEXT_MODEL = 'gemini-3-flash-preview';
const DEFAULT_IMAGE_MODEL = 'gemini-3.1-flash-image-preview';
const LEGACY_TEXT_MODEL = 'gemini-3-pro-preview';
const LEGACY_IMAGE_MODEL = 'gemini-3-pro-image-preview';

const normalizeTextModel = (model: string) =>
  model === LEGACY_TEXT_MODEL ? DEFAULT_TEXT_MODEL : model;

const normalizeImageModel = (model: string) =>
  model === LEGACY_IMAGE_MODEL ? DEFAULT_IMAGE_MODEL : model;

const normalizeConfig = (config: ModelConfig): ModelConfig => ({
  ...config,
  derivation_text: normalizeTextModel(config.derivation_text),
  derivation_image: normalizeImageModel(config.derivation_image),
  avatar: normalizeImageModel(config.avatar),
  tryOn: normalizeImageModel(config.tryOn),
  swap: normalizeImageModel(config.swap),
});

const DEFAULT_CONFIG: ModelConfig = {
  derivation_text: DEFAULT_TEXT_MODEL,
  derivation_image: DEFAULT_IMAGE_MODEL,
  avatar: DEFAULT_IMAGE_MODEL,
  tryOn: DEFAULT_IMAGE_MODEL,
  swap: DEFAULT_IMAGE_MODEL
};

export const MODEL_OPTIONS_BY_FEATURE: Record<FeatureKey, string[]> = {
  derivation_text: [DEFAULT_TEXT_MODEL],
  derivation_image: [DEFAULT_IMAGE_MODEL],
  avatar: [DEFAULT_IMAGE_MODEL],
  tryOn: [DEFAULT_IMAGE_MODEL],
  swap: [DEFAULT_IMAGE_MODEL],
};

interface ModelConfigContextType {
  config: ModelConfig;
  updateModel: (feature: FeatureKey, model: string) => void;
  resetConfig: () => void;
}

const ModelConfigContext = createContext<ModelConfigContextType | undefined>(undefined);

export const ModelConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ModelConfig>(() => {
    const saved = localStorage.getItem('viba_model_config');
    return saved ? normalizeConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) }) : DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('viba_model_config', JSON.stringify(config));
  }, [config]);

  const updateModel = (feature: FeatureKey, model: string) => {
    const allowedModels = MODEL_OPTIONS_BY_FEATURE[feature];
    const fallback = allowedModels[0];
    const normalizedModel = feature === 'derivation_text' ? normalizeTextModel(model) : normalizeImageModel(model);
    const nextModel = allowedModels.includes(normalizedModel) ? normalizedModel : fallback;
    setConfig(prev => ({ ...prev, [feature]: nextModel }));
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
