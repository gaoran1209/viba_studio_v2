import React, { useState, useEffect } from 'react';
import { Upload, Plus, Loader2, CheckCircle2, User, X, Download, Maximize2, RotateCw } from 'lucide-react';
import { trainAvatar, fileToBase64 } from '../services/geminiService';
import { ImageModal } from '../components/ImageModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useModelConfig } from '../contexts/ModelConfigContext';

interface AvatarJob {
  id: string;
  files: File[];
  previews: string[];
  result?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  statusText?: string;
  timestamp: number;
}

// Helper component for individual thumbnail
const AvatarThumbnail: React.FC<{ file: File; onRemove: () => void }> = ({ file, onRemove }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative w-24 h-32 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
        {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
            <div className="animate-pulse w-full h-full bg-gray-200" />
        )}
        <button 
          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/70" 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
            <Plus className="rotate-45" size={12} />
        </button>
    </div>
  );
};

export const AvatarView: React.FC = () => {
  const { t } = useLanguage();
  const { config } = useModelConfig(); // Get config from context
  const [files, setFiles] = useState<File[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  
  // History
  const [jobs, setJobs] = useState<AvatarJob[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Limit to 3 files total
      const newFiles = Array.from(e.target.files).slice(0, 3 - files.length);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleTrain = async () => {
    if (files.length < 1) return;
    setIsTraining(true);

    const newJob: AvatarJob = {
      id: Date.now().toString(),
      files: [...files],
      previews: files.map(f => URL.createObjectURL(f)),
      status: 'processing',
      statusText: t.avatar.training,
      timestamp: Date.now()
    };

    setJobs(prev => [newJob, ...prev]);
    setFiles([]); // Clear input

    try {
      const avatarUrl = await trainAvatar(newJob.files, (status) => {
        let text = t.avatar.training;
        if (status === 'retrying') text = t.common.retrying;
        setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, statusText: text } : j));
      }, config.avatar);

      setJobs(prev => prev.map(j => j.id === newJob.id ? { 
        ...j, 
        status: 'completed', 
        result: avatarUrl 
      } : j));

    } catch (error) {
      console.error(error);
      setJobs(prev => prev.map(j => j.id === newJob.id ? { 
        ...j, 
        status: 'failed',
        statusText: t.common.failed
      } : j));
    } finally {
      setIsTraining(false);
    }
  };

  const handleRetry = async (job: AvatarJob) => {
    // Reset job status
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'processing', statusText: t.avatar.training } : j));

    try {
      const avatarUrl = await trainAvatar(job.files, (status) => {
        let text = t.avatar.training;
        if (status === 'retrying') text = t.common.retrying;
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, statusText: text } : j));
      }, config.avatar);

      setJobs(prev => prev.map(j => j.id === job.id ? { 
        ...j, 
        status: 'completed', 
        result: avatarUrl 
      } : j));

    } catch (error) {
      console.error(error);
      setJobs(prev => prev.map(j => j.id === job.id ? { 
        ...j, 
        status: 'failed',
        statusText: t.common.failed
      } : j));
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

      {/* Top Creation Area */}
      <div className="bg-white border-b border-gray-200 p-6 shrink-0 z-10 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20"></div>
         
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{t.avatar.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{t.avatar.desc}</p>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex gap-3">
                  {files.map((file, idx) => (
                    <AvatarThumbnail key={idx} file={file} onRemove={() => removeFile(idx)} />
                  ))}
                  
                  {files.length < 3 && (
                    <label className="w-24 h-32 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors text-blue-600 group">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                        <Plus size={16} />
                      </div>
                      <span className="text-xs font-medium text-center px-1">{t.avatar.add_photo}</span>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
                    </label>
                  )}
                </div>

                <button
                  onClick={handleTrain}
                  disabled={files.length === 0 || isTraining}
                  className={`px-8 py-3 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    files.length === 0 || isTraining
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  {isTraining ? <Loader2 className="animate-spin" size={18} /> : <User size={18} />}
                  {isTraining ? t.common.processing : t.avatar.start_training}
                </button>
            </div>
         </div>
      </div>

      {/* History Feed */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 opacity-60">
              <User size={48} className="mb-3" />
              <p className="font-medium">{t.avatar.history_empty}</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[400px]">
                
                {/* Left Panel: Inputs */}
                <div className="w-full md:w-80 border-r border-gray-100 bg-white p-6 flex flex-col shrink-0">
                   <div className="flex justify-between items-start mb-6">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                        ${job.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          job.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                          job.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {job.status === 'completed' ? 'Success' : 
                         job.status === 'processing' ? 'Training' : 
                         job.status === 'failed' ? 'Failed' : 'Pending'}
                      </span>
                      <button onClick={() => removeJob(job.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={16} />
                      </button>
                   </div>

                   <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto">
                      <p className="text-xs font-bold text-gray-700 mb-2">Reference Photos</p>
                      <div className="grid grid-cols-2 gap-2">
                        {job.previews.map((preview, idx) => (
                           <img key={idx} src={preview} className="w-full aspect-[3/4] object-cover rounded-lg bg-gray-50 border border-gray-100" alt="ref" />
                        ))}
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
                             download={`avatar-${job.id}.png`}
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
                            <p className="text-xs text-gray-400 mt-2">{t.avatar.time_est}</p>
                          </>
                        ) : job.status === 'failed' ? (
                           <div className="text-center">
                            <X className="mb-3 text-red-400 mx-auto" size={32} />
                            <p className="font-medium text-red-500 mb-2">{t.common.failed}</p>
                            <button 
                              onClick={() => handleRetry(job)}
                              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 shadow-sm flex items-center gap-2 mx-auto"
                            >
                              <RotateCw size={14} />
                              {t.common.retry}
                            </button>
                           </div>
                        ) : (
                          <User size={48} className="opacity-20" />
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