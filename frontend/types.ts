export enum View {
  DERIVATION = 'derivation',
  AVATAR = 'avatar',
  TRY_ON = 'try_on',
  SWAP = 'swap',
  SYSTEM_PROMPTS = 'system_prompts',
}

export type SkinTone = 'White' | 'East Asian' | 'Latino' | 'Black' | 'South Asian' | '';

export interface NavItem {
  id: View;
  label: string;
  icon: any; // Lucide icon component type
}

export interface GeneratedImage {
  url: string;
  prompt?: string;
  style?: string;
}

export interface AvatarProfile {
  id: string;
  name: string;
  thumbnail: string;
  status: 'trained' | 'training' | 'failed';
}

export interface DerivationJob {
  id: string;
  // file is excluded from persistence or handled specially
  file?: File; 
  previewUrl: string; // Blob URL or Base64
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: string[];
  description?: string;
  creativity: number;
  skinTone?: SkinTone;
  statusText?: string;
}

export interface AvatarJob {
  id: string;
  files?: File[];
  previews: string[];
  result?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  statusText?: string;
  timestamp: number;
}

export interface TryOnJob {
  id: string;
  modelFile?: File;
  clothFile?: File;
  modelPreview: string;
  clothPreview: string;
  result?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  statusText?: string;
  timestamp: number;
}

export interface SwapJob {
  id: string;
  sourceFile?: File;
  sceneFile?: File;
  sourcePreview: string;
  scenePreview: string;
  result?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  statusText?: string;
  timestamp: number;
}