import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export interface GenerationHistoryItem {
  id: string;
  user_id: string;
  type: 'derivation' | 'avatar' | 'try_on' | 'swap';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_files: string[];
  output_files: string[];
  parameters: Record<string, any>;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Check if a string is a base64 data URL
 */
export const isBase64DataUrl = (str: string): boolean => {
  return str.startsWith('data:');
};

/**
 * Check if a string is an HTTP(S) URL (R2 or other remote URL)
 */
export const isRemoteUrl = (str: string): boolean => {
  return str.startsWith('http://') || str.startsWith('https://');
};

/**
 * Resolve an image source to a usable URL
 * Handles both legacy base64 data URLs and new R2/remote URLs
 */
export const resolveImageUrl = (imageSource: string): string => {
  // If it's already a remote URL or base64, return as-is
  if (isRemoteUrl(imageSource) || isBase64DataUrl(imageSource)) {
    return imageSource;
  }
  // For any other format, return as-is (the backend should have converted it)
  return imageSource;
};

/**
 * Process an array of image sources to usable URLs
 */
export const resolveImageUrls = (images: string[]): string[] => {
  return images.map(resolveImageUrl);
};

export const fetchHistory = async (): Promise<GenerationHistoryItem[]> => {
  const response = await axios.get(`${API_URL}/generations`, { headers: getHeaders() });
  return response.data;
};

export const saveGeneration = async (data: Partial<GenerationHistoryItem>): Promise<GenerationHistoryItem> => {
  const response = await axios.post(`${API_URL}/generations`, data, { headers: getHeaders() });
  return response.data;
};

export const deleteGeneration = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/generations/${id}`, { headers: getHeaders() });
};

