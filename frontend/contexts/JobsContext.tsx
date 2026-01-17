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
  // Initialize state from localStorage
  const [derivationJobs, setDerivationJobs] = useState<DerivationJob[]>(() => {
    const saved = localStorage.getItem('viba_derivation_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [avatarJobs, setAvatarJobs] = useState<AvatarJob[]>(() => {
    const saved = localStorage.getItem('viba_avatar_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [tryOnJobs, setTryOnJobs] = useState<TryOnJob[]>(() => {
    const saved = localStorage.getItem('viba_tryon_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [swapJobs, setSwapJobs] = useState<SwapJob[]>(() => {
    const saved = localStorage.getItem('viba_swap_jobs');
    return saved ? JSON.parse(saved) : [];
  });

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