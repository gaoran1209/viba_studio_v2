import React, { useState, useRef, useEffect } from 'react';
import { generateDerivations } from '../services/geminiService';
import { Layers, Loader2, Download, Maximize2, Plus, X, RotateCw, Sparkles, Image as ImageIcon, Trash2, Wand2 } from 'lucide-react';
import { ImageModal } from '../components/ImageModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useModelConfig } from '../contexts/ModelConfigContext';
import { fetchHistory, saveGeneration, deleteGeneration } from '../services/historyService';
import { SkinTone } from '../types';

interface Job {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: string[];
  description?: string;
  creativity: number;
  skinTone?: SkinTone;
  statusText?: string;
}

export const DerivationView: React.FC = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Input State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [creativity, setCreativity] = useState(5);
  const [skinTone, setSkinTone] = useState<SkinTone>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-process queue effect
  useEffect(() => {
    const processNextJob = async () => {
      if (isProcessingQueue) return;

      const nextJobIndex = jobs.findIndex(j => j.status === 'pending');
      if (nextJobIndex === -1) return;

      setIsProcessingQueue(true);
      const job = jobs[nextJobIndex];

      // Update status to processing
      setJobs(prev => prev.map((j, i) => i === nextJobIndex ? { ...j, status: 'processing', statusText: t.common.processing } : j));

      try {
        const { images, description } = await generateDerivations(
          job.file, 
          job.creativity, 
          job.skinTone, 
          (status) => {
            let text = t.common.processing;
            if (status === 'processing_step1') text = 'Analyzing Image...';
            if (status === 'processing_step2') text = 'Generating Variations...';
            if (status === 'retrying') text = t.common.retrying;
            
            setJobs(prev => prev.map((j, i) => i === nextJobIndex ? { ...j, statusText: text } : j));
          },
          { textModel: config.derivation_text, imageModel: config.derivation_image }
        );

        setJobs(prev => prev.map((j, i) => {
          if (i === nextJobIndex) {
            const completedJob = { 
              ...j, 
              status: 'completed', 
              results: images, 
              description: description,
              statusText: undefined
            };

            // Save to Backend (Fire and forget)
            saveGeneration({
              type: 'derivation',
              input_files: [job.previewUrl],
              output_files: images,
              parameters: {
                description,
                creativity: job.creativity,
                skinTone: job.skinTone
              },
              status: 'completed'
            }).catch(err => console.error("Failed to save generation", err));

            return completedJob;
          }
          return j;
        }));

      } catch (error) {
        console.error(error);
        setJobs(prev => prev.map((j, i) => i === nextJobIndex ? { ...j, status: 'failed', statusText: t.common.failed } : j));
      } finally {
        setIsProcessingQueue(false);
      }
    };

    if (!isProcessingQueue && jobs.some(j => j.status === 'pending')) {
      processNextJob();
    }
  }, [jobs, isProcessingQueue, t]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedPreview(URL.createObjectURL(file));
      // Reset input value to allow selecting the same file again if needed
      e.target.value = '';
    }
  };

  const handleClearInput = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedFile(null);
    setSelectedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartGeneration = () => {
    if (!selectedFile || !selectedPreview) return;

    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      file: selectedFile,
      previewUrl: selectedPreview, // Pass the blob URL
      status: 'pending',
      results: [],
      creativity: creativity,
      skinTone: skinTone,
    };

    setJobs(prev => [newJob, ...prev]);
    
    // Clear input state but NOT the blob URL (it's used by the job)
    setSelectedFile(null);
    setSelectedPreview(null);
  };

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const handleRetry = (id: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === id) {
        return { ...j, status: 'pending', statusText: undefined, results: [] };
      }
      return j;
    }));
  };

  const getSkinToneLabel = (tone: SkinTone | undefined) => {
    if (!tone) return t.derivation.skin_tone_default;
    switch(tone) {
      case 'White': return t.derivation.skin_tone_white;
      case 'East Asian': return t.derivation.skin_tone_east_asian;
      case 'Latino': return t.derivation.skin_tone_latino;
      case 'Black': return t.derivation.skin_tone_black;
      case 'South Asian': return t.derivation.skin_tone_south_asian;
      default: return tone;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ImageModal 
        isOpen={!!previewImage} 
        imageUrl={previewImage} 
        onClose={() => setPreviewImage(null)} 
      />

      {/* Top Creation Area (AvatarView Style) */}
      <div className="bg-white border-b border-gray-200 p-6 shrink-0 z-10 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20"></div>
         
         <div className="max-w-6xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">{t.derivation.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{t.derivation.desc}</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
               {/* Image Input Zone */}
               <div 
                 className={`relative w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-xl border-2 ${selectedPreview ? 'border-gray-200' : 'border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50'} flex flex-col items-center justify-center cursor-pointer group transition-all`}
                 onClick={() => !selectedPreview && fileInputRef.current?.click()}
               >
                  {selectedPreview ? (
                    <>
                      <img src={selectedPreview} alt="Selected" className="w-full h-full object-cover rounded-lg" />
                      <button 
                        onClick={handleClearInput}
                        className="absolute -top-2 -right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform text-blue-600">
                        <Plus size={16} />
                      </div>
                      <span className="text-[10px] font-medium text-center text-blue-600 px-1">{t.derivation.upload_label}</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp" 
                    onChange={handleFileSelect}
                  />
               </div>

               {/* Controls & Action */}
               <div className="flex flex-col gap-4 w-full md:w-64">
                   {/* Skin Tone */}
                   <div>
                     <label className="text-xs font-medium text-gray-500 block mb-1.5">{t.derivation.skin_tone}</label>
                     <select
                       value={skinTone}
                       onChange={(e) => setSkinTone(e.target.value as SkinTone)}
                       className="w-full h-9 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                     >
                       <option value="">{t.derivation.skin_tone_default}</option>
                       <option value="White">{t.derivation.skin_tone_white}</option>
                       <option value="East Asian">{t.derivation.skin_tone_east_asian}</option>
                       <option value="Latino">{t.derivation.skin_tone_latino}</option>
                       <option value="Black">{t.derivation.skin_tone_black}</option>
                       <option value="South Asian">{t.derivation.skin_tone_south_asian}</option>
                     </select>
                   </div>

                   {/* Creativity */}
                   <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-xs font-medium text-gray-500">{t.derivation.creativity_level}</label>
                        <span className="text-xs text-gray-900 font-medium">{creativity * 10}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={creativity}
                        onChange={(e) => setCreativity(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                   </div>
               </div>
               
               {/* Action Button */}
               <button 
                 onClick={handleStartGeneration}
                 disabled={!selectedFile}
                 className={`h-12 px-8 rounded-full font-medium flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 w-full md:w-auto whitespace-nowrap ${
                   !selectedFile 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5'
                 }`}
               >
                 <Wand2 size={18} />
                 {t.common.generate}
               </button>
            </div>
         </div>
      </div>

      {/* Main Feed Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 opacity-60">
               <Layers size={64} className="mb-4 text-gray-300" />
               <p className="text-lg font-medium">{t.derivation.empty_queue}</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col lg:flex-row h-auto min-h-[420px]">
                
                {/* Left: Info Panel (Source & Description) */}
                <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-100 p-6 flex flex-col bg-white shrink-0">
                   <div className="flex justify-between items-start mb-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                        ${job.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          job.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                          job.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {job.status === 'completed' ? t.derivation.job_completed : 
                         job.status === 'processing' ? t.derivation.job_processing : 
                         job.status === 'failed' ? t.derivation.job_failed : t.derivation.job_pending}
                      </span>
                      <button onClick={() => removeJob(job.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                   </div>

                   <div className="mb-6 flex flex-col gap-3">
                     <div className="relative aspect-[3/4] w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100 group">
                        <img src={job.previewUrl} alt="Source" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                     </div>
                     <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                          {t.derivation.creativity_level}: {job.creativity}
                        </span>
                        {job.skinTone && (
                          <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                             {getSkinToneLabel(job.skinTone)}
                          </span>
                        )}
                     </div>
                   </div>

                   <div className="flex-1 min-h-0 flex flex-col">
                     <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Sparkles size={10} />
                        {t.derivation.prompt_generated}
                     </h4>
                     <div className="flex-1 overflow-y-auto text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono scrollbar-thin">
                        {job.description || (
                          <span className="text-gray-400 italic">
                            {job.status === 'completed' ? 'No description available' : 'Analyzing...'}
                          </span>
                        )}
                     </div>
                   </div>
                </div>

                {/* Right: Results Grid (2x2) */}
                <div className="flex-1 bg-gray-50/30 p-4 lg:p-6">
                   {job.status === 'completed' ? (
                     <div className="grid grid-cols-2 gap-4 h-full">
                        {job.results.map((url, idx) => (
                          <div 
                            key={idx} 
                            className="relative group rounded-xl overflow-hidden bg-gray-200 cursor-pointer border border-gray-200 h-full min-h-[160px]"
                            onClick={() => setPreviewImage(url)}
                          >
                            <img src={url} alt={`Var ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                               <Maximize2 className="text-white" size={24} />
                            </div>
                            <a 
                               href={url} 
                               download={`variation-${job.id}-${idx}.png`} 
                               className="absolute bottom-3 right-3 bg-white/90 text-gray-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-lg translate-y-2 group-hover:translate-y-0"
                               onClick={(e) => e.stopPropagation()}
                               title={t.common.download}
                             >
                              <Download size={16} />
                            </a>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 border-2 border-dashed border-gray-100 rounded-xl">
                        {job.status === 'failed' ? (
                          <div className="flex flex-col items-center">
                            <X className="text-red-400 mb-3" size={32} />
                            <p className="font-medium text-red-500 mb-4">{t.common.failed}</p>
                            <button 
                              onClick={() => handleRetry(job.id)}
                              className="px-5 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 shadow-sm flex items-center gap-2 transition-all active:scale-95"
                            >
                              <RotateCw size={14} />
                              {t.common.retry}
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            {job.status === 'processing' ? (
                               <Loader2 className="animate-spin text-blue-500 mb-4 mx-auto" size={40} />
                            ) : (
                               <div className="w-10 h-10 rounded-full border-2 border-gray-200 mb-4 mx-auto" />
                            )}
                            <p className="font-medium text-gray-600">
                              {job.status === 'processing' ? job.statusText : t.derivation.job_pending}
                            </p>
                          </div>
                        )}
                     </div>
                   )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};