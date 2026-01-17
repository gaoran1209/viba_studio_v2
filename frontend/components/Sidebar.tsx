import React, { useState, useRef, useEffect } from 'react';
import { Layers, User, Shirt, RefreshCw, Wand2, Key, FileText, Settings, ChevronUp } from 'lucide-react';
import { NavItem, View } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const navItems: NavItem[] = [
    { id: View.DERIVATION, label: t.nav.derivation, icon: Layers },
    { id: View.AVATAR, label: t.nav.avatar, icon: User },
    { id: View.TRY_ON, label: t.nav.try_on, icon: Shirt },
    { id: View.SWAP, label: t.nav.swap, icon: RefreshCw },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-20">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3 shadow-lg shadow-blue-200">
          <Wand2 size={20} />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          ViBA Studio
        </span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentView === item.id
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={20} className={currentView === item.id ? 'text-blue-600' : 'text-gray-400'} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom Settings Area */}
      <div className="p-4 border-t border-gray-100" ref={settingsRef}>
        <div className="relative">
          {showSettings && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
              <button
                onClick={() => {
                  onNavigate(View.SYSTEM_PROMPTS);
                  setShowSettings(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  currentView === View.SYSTEM_PROMPTS ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileText size={18} />
                {t.nav.prompts}
              </button>
              
              <div className="h-px bg-gray-100 my-1" />
              
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Key size={18} />
                {t.nav.manage_api}
              </button>
            </div>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
               showSettings || currentView === View.SYSTEM_PROMPTS ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings size={20} className={showSettings ? 'text-gray-900' : 'text-gray-400'} />
              {t.nav.settings}
            </div>
            <ChevronUp size={16} className={`transition-transform duration-200 ${showSettings ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};