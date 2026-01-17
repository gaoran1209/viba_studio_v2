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