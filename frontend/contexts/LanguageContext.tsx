import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

const translations = {
  en: {
    nav: {
      derivation: 'Image Derivation',
      avatar: 'Character Creation',
      try_on: 'Virtual Try-On',
      swap: 'Character Swap',
      prompts: 'System Prompts',
      manage_api: 'Manage API Key',
      license: 'License',
      settings: 'Settings'
    },
    common: {
      workspace: 'Workspace',
      generate: 'Generate',
      processing: 'Processing...',
      retrying: 'Retrying...',
      retry: 'Retry',
      failed: 'Generation Failed',
      upload: 'Upload',
      save: 'Save',
      view_large: 'Click to enlarge',
      close: 'Close',
      download: 'Download',
      or: 'or',
      click_to_view: 'Click to view full size',
      history: 'History'
    },
    derivation: {
      title: 'Image Derivation',
      desc: 'Upload a reference image to explore different visual variations and styles.',
      reference_material: 'Reference Material',
      upload_label: 'Upload Reference',
      add_images: 'Add Images',
      batch_desc: 'Upload multiple images to generate variations in batch.',
      creativity_level: 'Creativity Level',
      skin_tone: 'Skin Tone',
      skin_tone_default: 'Original / Default',
      skin_tone_white: 'White',
      skin_tone_east_asian: 'East Asian',
      skin_tone_latino: 'Latino',
      skin_tone_black: 'Black',
      skin_tone_south_asian: 'South Asian',
      conservative: 'Conservative',
      wild: 'Wild',
      generate_all: 'Generate All',
      queue_title: 'Generation Queue',
      job_pending: 'Pending',
      job_processing: 'Processing',
      job_completed: 'Completed',
      job_failed: 'Failed',
      source_info: 'Source & Parameters',
      prompt_generated: 'Generated Description',
      empty_queue: 'Your generation queue is empty. Add images to start.',
      view_large_tooltip: 'View Large'
    },
    avatar: {
      title: 'Create High-Definition Character',
      desc: 'Upload 1-3 clear, half-body/full-body portrait photos. ViBA will train a high-definition model for your personal use.',
      photo: 'Photo',
      add_photo: 'Add Photo',
      start_training: 'Start Training',
      training: 'Training Model...',
      time_est: 'Avg. time: 30 seconds',
      ready_title: 'Character Ready!',
      ready_desc: 'Your high-definition character model has been created.',
      train_another: 'Train Another',
      download: 'Download',
      history_empty: 'No character models created yet.'
    },
    try_on: {
      title: 'Virtual Try-On',
      desc: 'Realistic fitting simulation. Restore authentic wearing effects.',
      step1: 'Select Model',
      step1_label: 'Upload Full Body',
      step2: 'Upload Garment',
      step2_label: 'Upload Flat Lay',
      step2_sub: 'Front view clear',
      step3: 'Generated Effect',
      ready: 'Ready to generate',
      ready_sub: 'Click the button below',
      weaving: 'Weaving pixels...',
      btn: 'Generate Try-On'
    },
    swap: {
      title: 'Character Swap',
      desc: 'Place your character into any scene seamlessly.',
      source: 'Source Character',
      source_label: 'Upload Character',
      source_desc: 'Clear full body or half body shot',
      selected: 'Selected',
      my_avatar: 'My Digital Avatar',
      target: 'Target Scene',
      target_label: 'Upload Background',
      target_sub: 'Landscape, City, etc.',
      result: 'Composition Result',
      btn: 'Generate Composition',
      ready_title: 'Ready to blend',
      ready_desc: 'Upload both images to start',
      blending: 'Blending lighting and shadows...'
    },
    prompts: {
      title: 'System Prompts',
      desc: 'Transparency on the models and prompts driving the creative engine.',
      feature: 'Feature',
      model: 'Model',
      prompt: 'System Prompt / Template'
    },
    upload: {
      default_sub: 'JPG, PNG, WEBP'
    }
  },
  zh: {
    nav: {
      derivation: '图像衍生',
      avatar: '形象创建',
      try_on: '虚拟试衣',
      swap: '人物替换',
      prompts: '系统提示词',
      manage_api: 'API 密钥管理',
      license: '管理许可证',
      settings: '设置'
    },
    common: {
      workspace: '工作台',
      generate: '生成',
      processing: '处理中...',
      retrying: '请求超时，正在重试...',
      retry: '重试',
      failed: '生成失败，请稍后重试',
      upload: '上传',
      save: '保存',
      view_large: '点击放大',
      close: '关闭',
      download: '下载',
      or: '或',
      click_to_view: '点击查看大图',
      history: '历史记录'
    },
    derivation: {
      title: '图像衍生',
      desc: '上传参考图，探索不同风格的视觉变体。',
      reference_material: '参考素材',
      upload_label: '上传参考图',
      add_images: '添加图片',
      batch_desc: '上传多张图片进行批量衍生',
      creativity_level: '创意程度',
      skin_tone: '人物肤色',
      skin_tone_default: '原图默认',
      skin_tone_white: '白种人',
      skin_tone_east_asian: '东亚',
      skin_tone_latino: '拉丁裔',
      skin_tone_black: '黑人',
      skin_tone_south_asian: '南亚',
      conservative: '保守',
      wild: '狂野',
      generate_all: '全部生成',
      queue_title: '生成队列',
      job_pending: '等待中',
      job_processing: '生成中',
      job_completed: '已完成',
      job_failed: '失败',
      source_info: '参考源与参数',
      prompt_generated: 'AI 生成描述',
      empty_queue: '生成队列为空，请添加图片开始。',
      view_large_tooltip: '查看大图'
    },
    avatar: {
      title: '创建高清形象',
      desc: '上传 1-3 张清晰的、半身/全身肖像照片，ViBA 将为您训练专属的高清形象模型。',
      photo: '照片',
      add_photo: '添加照片',
      start_training: '开始训练',
      training: '正在训练模型...',
      time_est: '平均耗时: 30 秒',
      ready_title: '形象已就绪!',
      ready_desc: '您的专属高清形象已创建并保存至资产库。',
      train_another: '再次训练',
      download: '下载',
      history_empty: '暂无创建的历史形象'
    },
    try_on: {
      title: '虚拟试衣',
      desc: '逼真的试穿模拟，还原真实的穿着效果。',
      step1: '选择模特',
      step1_label: '上传全身照',
      step2: '上传服装',
      step2_label: '上传平铺图',
      step2_sub: '正面清晰展示',
      step3: '生成效果',
      ready: '准备生成',
      ready_sub: '点击下方按钮',
      weaving: '正在编织像素...',
      btn: '生成试穿效果'
    },
    swap: {
      title: '人物替换',
      desc: '将您的人物无缝融入任何场景。',
      source: '源人物',
      source_label: '上传人物图',
      source_desc: '清晰的半身或全身照',
      selected: '已选择',
      my_avatar: '我的数字分身',
      target: '目标场景',
      target_label: '上传背景',
      target_sub: '风景、城市等',
      result: '合成结果',
      btn: '生成合成图',
      ready_title: '准备融合',
      ready_desc: '上传两张图片以开始',
      blending: '正在融合光影...'
    },
    prompts: {
      title: '系统提示词',
      desc: '展示驱动创意引擎的模型型号及系统提示词。',
      feature: '功能模块',
      model: '模型型号',
      prompt: '系统提示词 / 模板'
    },
    upload: {
      default_sub: 'JPG, PNG, WEBP'
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};