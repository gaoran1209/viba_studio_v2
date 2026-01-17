import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PROMPTS } from '../services/geminiService';
import { Layers, User, Shirt, RefreshCw, ChevronDown } from 'lucide-react';
import { useModelConfig, AVAILABLE_MODELS, FeatureKey } from '../contexts/ModelConfigContext';

export const SystemPromptsView: React.FC = () => {
  const { t } = useLanguage();
  const { config, updateModel } = useModelConfig();

  const promptItems = [
    {
      icon: Layers,
      title: t.nav.derivation,
      steps: [
        {
          key: 'derivation_text' as FeatureKey,
          desc: "Step 1: Image Analysis (Image-to-Text)",
          prompt: PROMPTS.derivation_describe
        },
        {
          key: 'derivation_image' as FeatureKey,
          desc: "Step 2: Variation Generation (Text-to-Image)",
          prompt: PROMPTS.derivation_generate("[Image Description from Step 1]", 5)
        }
      ],
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: User,
      title: t.nav.avatar,
      steps: [{
        key: 'avatar' as FeatureKey,
        prompt: PROMPTS.avatar
      }],
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: Shirt,
      title: t.nav.try_on,
      steps: [{
        key: 'tryOn' as FeatureKey,
        prompt: PROMPTS.tryOn
      }],
      color: 'text-pink-600',
      bg: 'bg-pink-50'
    },
    {
      icon: RefreshCw,
      title: t.nav.swap,
      steps: [{
        key: 'swap' as FeatureKey,
        prompt: PROMPTS.swap
      }],
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto pb-20">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">{t.prompts.title}</h2>
            <p className="text-gray-500 mt-2">{t.prompts.desc}</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 bg-gray-50/80 border-b border-gray-200 p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">{t.prompts.feature}</div>
          <div className="col-span-3">{t.prompts.model}</div>
          <div className="col-span-6">{t.prompts.prompt}</div>
        </div>

        <div className="divide-y divide-gray-100">
          {promptItems.map((item, idx) => {
             const Icon = item.icon;
             return (
               <div key={idx} className="grid grid-cols-12 p-6 hover:bg-gray-50/50 transition-colors">
                 <div className="col-span-3 flex items-start gap-3">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>
                     <Icon size={18} />
                   </div>
                   <span className="font-medium text-gray-900 mt-1">{item.title}</span>
                 </div>
                 
                 <div className="col-span-9 grid grid-cols-9 gap-4">
                   {item.steps.map((step, stepIdx) => (
                     <React.Fragment key={stepIdx}>
                       <div className="col-span-3">
                         <div className="relative">
                           <select 
                             value={config[step.key]}
                             onChange={(e) => updateModel(step.key, e.target.value)}
                             className="appearance-none w-full pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                           >
                             {AVAILABLE_MODELS.map(m => (
                               <option key={m} value={m}>{m}</option>
                             ))}
                           </select>
                           <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                         </div>
                         {step.desc && (
                           <p className="text-xs text-gray-400 mt-1">{step.desc}</p>
                         )}
                       </div>
                       <div className="col-span-6 mb-2">
                         <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                           <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                             {step.prompt}
                           </pre>
                         </div>
                       </div>
                     </React.Fragment>
                   ))}
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export default SystemPromptsView;
