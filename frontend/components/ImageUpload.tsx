import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageUploadProps {
  label: string;
  subLabel?: string;
  onImageSelect: (file: File) => void;
  selectedImage?: File | null;
  onClear?: () => void;
  heightClass?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  label, 
  subLabel, 
  onImageSelect, 
  selectedImage, 
  onClear,
  heightClass = "h-[400px]"
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displaySubLabel = subLabel || t.upload.default_sub;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClear?.();
  };

  return (
    <div 
      className={`relative w-full ${heightClass} 
        ${selectedImage && previewUrl ? 'border border-gray-200 bg-gray-50' : 'border-2 border-dashed border-gray-300 bg-white'} 
        rounded-3xl flex flex-col items-center justify-center cursor-pointer 
        hover:border-blue-400 hover:bg-blue-50/30 transition-all group overflow-hidden`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />

      {selectedImage && previewUrl ? (
        <div className="w-full h-full relative">
          <img 
            src={previewUrl} 
            alt="Uploaded preview" 
            className="w-full h-full object-contain" 
          />
          <button 
            onClick={handleClear}
            className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 backdrop-blur-sm shadow-sm transition-colors z-10"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload size={24} />
          </div>
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-500 mt-1">{displaySubLabel}</p>
        </div>
      )}
    </div>
  );
};