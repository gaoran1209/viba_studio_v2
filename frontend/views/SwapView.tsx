import React, { useState } from 'react';
import { ImageUpload } from '../components/ImageUpload';
import { generateSwap } from '../services/geminiService';
import { Sparkles, Loader2, ArrowDown, X, Maximize2, Download, RefreshCw } from 'lucide-react';
import { ImageModal } from '../components/ImageModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useJobs } from '../contexts/JobsContext';
import { SwapJob } from '../types';

export const SwapView: React.FC = () => {
  const { t } = useLanguage();
  const { swapJobs: jobs, setSwapJobs: setJobs } = useJobs();
  
  // Input State
  const [sourceInput, setSourceInput] = useState<File | null>(null);
  const [sceneInput, setSceneInput] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!sourceInput || !sceneInput) return;
    
    setIsSubmitting(true);

    // Create new job
    const newJob: SwapJob = {
      id: Date.now().toString(),
      sourceFile: sourceInput,
      sceneFile: sceneInput,
      sourcePreview: URL.createObjectURL(sourceInput),
      scenePreview: URL.createObjectURL(sceneInput),
      status: 'processing',
      statusText: t.common.processing,
      timestamp: Date.now()
    };

    setJobs(prev => [newJob, ...prev]);

    try {
        const res = await generateSwap(sourceInput, sceneInput, (status) => {
          let text = t.common.processing;
          if (status === 'retrying') text = t.common.retrying;
          setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, statusText: text } : j));
        });
        
        setJobs(prev => prev.map(j => j.id === newJob.id ? { 
          ...j, 
          status: 'completed', 
          result: res 
        } : j));

    } catch (e) {
      console.error(e);
      setJobs(prev => prev.map(j => j.id === newJob.id ? { 
        ...j, 
        status: 'failed',
        statusText: t.common.failed
      } : j));
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ImageModal 
        isOpen={!!previewImage} 
        imageUrl={previewImage} 
        onClose={() => setPreviewImage(null)} 
      />

      {/* Top Section: Task Initiation */}
      <div className="bg-white border-b border-gray-200 p-6 shrink-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t.swap.title}</h2>
              <p className="text-sm text-gray-500">{t.swap.desc}</p>
            </div>
            
             <button 
                onClick={handleGenerate}
                disabled={!sourceInput || !sceneInput || isSubmitting}
                className={`px-8 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                  !sourceInput || !sceneInput || isSubmitting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-gray-900 text-white hover:bg-black'
                }`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ArrowDown size={18} />}
                {isSubmitting ? t.common.processing : t.swap.btn}
              </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Input 1 */}
            <div className="h-[280px] bg-white rounded-2xl border border-gray-200 p-4 flex flex-col shadow-sm relative group hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
                 <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">1</span>
                 <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{t.swap.source}</span>
              </div>
              <div className="flex-1 min-h-0">
                 <ImageUpload 
                   label={t.swap.source_label} 
                   subLabel={t.swap.source_desc}
                   selectedImage={sourceInput}
                   onImageSelect={setSourceInput}
                   onClear={() => setSourceInput(null)}
                   heightClass="h-full"
                 />
              </div>
            </div>

            {/* Input 2 */}
            <div className="h-[280px] bg-white rounded-2xl border border-gray-200 p-4 flex flex-col shadow-sm relative group hover:border-purple-200 transition-colors">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-50">
                 <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 text-[10px] font-bold flex items-center justify-center">2</span>
                 <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{t.swap.target}</span>
              </div>
              <div className="flex-1 min-h-0">
                 <ImageUpload 
                   label={t.swap.target_label} 
                   subLabel={t.swap.target_sub}
                   selectedImage={sceneInput}
                   onImageSelect={setSceneInput}
                   onClear={() => setSceneInput(null)}
                   heightClass="h-full"
                 />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: History Feed */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 opacity-60">
              <RefreshCw size={48} className="mb-3" />
              <p className="font-medium">{t.common.history} is empty</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[420px]">
                
                {/* Left Panel: Inputs */}
                <div className="w-full md:w-80 border-r border-gray-100 bg-white p-6 flex flex-col shrink-0">
                   <div className="flex justify-between items-start mb-6">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                        ${job.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          job.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                          job.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {job.status === 'completed' ? 'Success' : 
                         job.status === 'processing' ? 'Processing' : 
                         job.status === 'failed' ? 'Failed' : 'Pending'}
                      </span>
                      <button onClick={() => removeJob(job.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={16} />
                      </button>
                   </div>

                   <div className="flex-1 flex flex-col gap-4 min-h-0">
                      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 p-2 flex items-center gap-3">
                         <img src={job.sourcePreview} className="h-full w-20 object-cover rounded-lg bg-white" alt="Source" />
                         <div className="min-w-0">
                           <p className="text-xs font-bold text-gray-700">Source</p>
                           <p className="text-[10px] text-gray-400 truncate">{job.sourceFile.name}</p>
                         </div>
                      </div>
                      <div className="flex items-center justify-center text-gray-300">
                        <ArrowDown size={16} />
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 p-2 flex items-center gap-3">
                         <img src={job.scenePreview} className="h-full w-20 object-cover rounded-lg bg-white" alt="Scene" />
                         <div className="min-w-0">
                           <p className="text-xs font-bold text-gray-700">Scene</p>
                           <p className="text-[10px] text-gray-400 truncate">{job.sceneFile.name}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Right Panel: Result */}
                <div className="flex-1 bg-gray-50/30 p-4 md:p-6 flex items-center justify-center overflow-hidden relative">
                   {job.status === 'completed' && job.result ? (
                     <div className="relative h-full w-full flex items-center justify-center group">
                        <img 
                          src={job.result} 
                          alt="Result" 
                          className="max-h-full max-w-full object-contain rounded-lg shadow-sm cursor-pointer" 
                          onClick={() => setPreviewImage(job.result!)}
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => setPreviewImage(job.result!)}
                             className="bg-white text-gray-700 p-2 rounded-full shadow-md hover:bg-gray-50"
                             title={t.common.view_large}
                           >
                             <Maximize2 size={18} />
                           </button>
                           <a 
                             href={job.result} 
                             download={`swap-${job.id}.png`}
                             className="bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700"
                             title={t.common.download}
                           >
                             <Download size={18} />
                           </a>
                        </div>
                     </div>
                   ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        {job.status === 'processing' ? (
                          <>
                            <Loader2 className="animate-spin mb-3 text-blue-500" size={32} />
                            <p className="font-medium text-gray-600">{job.statusText}</p>
                          </>
                        ) : job.status === 'failed' ? (
                           <>
                            <X className="mb-3 text-red-400" size={32} />
                            <p className="font-medium text-red-500">{t.common.failed}</p>
                           </>
                        ) : (
                          <Sparkles size={48} className="opacity-20" />
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