import React from 'react';
import { View } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface HeaderProps {
  currentView: View;
}

export const Header: React.FC<HeaderProps> = ({ currentView }) => {
  const { language, setLanguage, t } = useLanguage();

  const getBreadcrumb = () => {
    const prefix = t.common.workspace;
    switch (currentView) {
      case View.DERIVATION: return `${prefix} / ${t.nav.derivation}`;
      case View.AVATAR: return `${prefix} / ${t.nav.avatar}`;
      case View.TRY_ON: return `${prefix} / ${t.nav.try_on}`;
      case View.SWAP: return `${prefix} / ${t.nav.swap}`;
      case View.SYSTEM_PROMPTS: return `${prefix} / ${t.nav.prompts}`;
      default: return prefix;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="text-gray-500 text-sm font-medium">
        {getBreadcrumb()}
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-full hover:bg-gray-50"
        >
          <Globe size={16} />
          <span>{language === 'zh' ? 'English' : '中文'}</span>
        </button>
      </div>
    </header>
  );
};