import React, { createContext, useContext, useState, useEffect } from 'react';
import { DerivationJob, AvatarJob, TryOnJob, SwapJob } from '../types';

interface JobsContextType {
  derivationJobs: DerivationJob[];
  setDerivationJobs: React.Dispatch<React.SetStateAction<DerivationJob[]>>;
  avatarJobs: AvatarJob[];
  setAvatarJobs: React.Dispatch<React.SetStateAction<AvatarJob[]>>;
  tryOnJobs: TryOnJob[];
  setTryOnJobs: React.Dispatch<React.SetStateAction<TryOnJob[]>>;
  swapJobs: SwapJob[];
  setSwapJobs: React.Dispatch<React.SetStateAction<SwapJob[]>>;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export const JobsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Helper to safely parse JSON from localStorage
  const safeParse = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return fallback;
    }
  };

  // Initialize state from localStorage
  const [derivationJobs, setDerivationJobs] = useState<DerivationJob[]>(() => 
    safeParse('viba_derivation_jobs', [])
  );

  const [avatarJobs, setAvatarJobs] = useState<AvatarJob[]>(() => 
    safeParse('viba_avatar_jobs', [])
  );

  const [tryOnJobs, setTryOnJobs] = useState<TryOnJob[]>(() => 
    safeParse('viba_tryon_jobs', [])
  );

  const [swapJobs, setSwapJobs] = useState<SwapJob[]>(() => 
    safeParse('viba_swap_jobs', [])
  );

  // Persist to localStorage whenever state changes
  useEffect(() => {
    // We filter out File objects because they can't be stringified,
    // and we trust that previewUrls (if remote) or base64 (if implemented) are enough.
    // For pending jobs with blob URLs, they will be invalid on reload.
    // Ideally we should warn or handle expiration, but for now we just persist structure.
    localStorage.setItem('viba_derivation_jobs', JSON.stringify(derivationJobs));
  }, [derivationJobs]);

  useEffect(() => {
    localStorage.setItem('viba_avatar_jobs', JSON.stringify(avatarJobs));
  }, [avatarJobs]);

  useEffect(() => {
    localStorage.setItem('viba_tryon_jobs', JSON.stringify(tryOnJobs));
  }, [tryOnJobs]);

  useEffect(() => {
    localStorage.setItem('viba_swap_jobs', JSON.stringify(swapJobs));
  }, [swapJobs]);

  return (
    <JobsContext.Provider value={{
      derivationJobs, setDerivationJobs,
      avatarJobs, setAvatarJobs,
      tryOnJobs, setTryOnJobs,
      swapJobs, setSwapJobs
    }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};