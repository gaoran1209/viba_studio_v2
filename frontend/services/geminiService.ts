import axios from 'axios';
import { SkinTone } from "../types";

export const PROMPTS = {
  derivation_describe: `# Role
你是一位专业的视觉内容分析专家，擅长将图像转化为精确、结构化且具有空间感知能力的文字描述。你的目标是让读者仅通过阅读文字就能在脑海中完美重建画面。

# Task
请对上传的图像进行深度视觉分析。不要只做笼统的总结，必须按照以下四个核心维度进行详细拆解。

# Analysis Guidelines
<visual_analysis_guidelines>
1. **画面内容 (Visual Content)**
   - 描述图像的整体类型（如：照片、插画、图表、UI截图）。
   - 详细列出可见的物体、环境元素、色彩基调、光影效果（光源方向、明暗对比）以及纹理细节。
   - 避免模糊的形容词，使用具体的视觉术语。

2. **核心主体 (Main Subject)**
   - 明确指出画面的视觉焦点（人、物或某个特定区域）。
   - 描述主体的外观特征（如：衣着、表情、姿态、颜色、形状）。
   - 解释为什么它是主体（通过构图、聚焦或光线突出）。

3. **相对位置与空间布局 (Spatial Layout & Relative Positions)**
   - 使用精确的空间方位词（前景、中景、背景；左上象限、右下角、中心偏左）。
   - 描述物体之间的距离感（紧挨、疏远）和层次感（遮挡关系、透视深度）。
   - 建立一个“心理网格”，精确定位元素在画幅中的位置。

4. **相互关系与交互 (Interrelationships & Interactions)**
   - 描述主体与环境或其他物体之间的互动（物理接触、视线方向、动作指向）。
   - 分析元素之间的逻辑或情感联系（例如：因果关系、对比关系、氛围烘托）。
   - 解释画面讲述了什么故事或传递了什么动态。
</visual_analysis_guidelines>

# Output Format
请使用 Markdown 格式，严格按照上述四个标题输出，保持条理清晰。

# Constraints
- 如果图像中包含文字，请转录并指明其位置。
- 不要推测图像画幅之外的内容。
- 如果某些细节模糊不清，请如实描述其模糊性，不要编造细节（无幻觉）。`,
  derivation_generate: (description: string, intensity: number, skinTone?: SkinTone) => {
    let prompt = `Generate a creative variant based on the following description: "${description}".\nCreativity level: ${intensity}/10.\n`;
    
    prompt += `CRITICAL: You MUST preserve the visual style, color grading, lighting atmosphere, and filter effects described. The generated image should look like it belongs to the same photography series or uses the same filter/preset as the original description.\n`;

    if (skinTone) {
      prompt += `IMPORTANT: The subject in the image must have a ${skinTone} skin tone. Ensure this skin tone is applied naturally. Keep all other features such as hair style, facial structure, clothing, and pose consistent with the original description, only modifying the skin tone.\n`;
    }

    prompt += `Maintain the artistic style strictly. Return only the image.`;
    return prompt;
  },
  avatar: `Create a high-quality, professional character image based on these reference photos.
The style should be clean, with a gray-white background and studio-level natural lighting.
The character's makeup, facial features, body shape, skin tone, hairstyle, and hair color must be consistent with the original images, without any changes.
The character wears a white tight yoga outfit.
Subject centered.`,
  tryOn: "Generate a realistic image of the person from the first image wearing the clothing from the second image. Ensure the clothing is exactly consistent with the original, while maintaining natural fit, matching the model’s pose, lighting, and body shape. The garment silhouette, fabric, and structure must not be altered.",
  swap: "Compose the person from the first image into the scene provided by the second image. Harmonize lighting, shadows, and color tones so that the character appears to naturally belong in the environment. Keep the pose of the person in the second image unchanged, and choose a full-body or suitable composition according to the scene."
};

// Helper to convert File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

type StatusCallback = (status: 'retrying' | 'processing_step1' | 'processing_step2') => void;

// Get token helper
const getToken = () => localStorage.getItem('token');

// Create axios instance with auth header
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const generateDerivations = async (
  baseImage: File,
  intensity: number,
  skinTone?: SkinTone,
  onStatusUpdate?: StatusCallback,
  config?: { textModel: string; imageModel: string }
): Promise<{ images: string[], description: string }> => {
  const base64Data = await fileToBase64(baseImage);
  
  if (onStatusUpdate) onStatusUpdate('processing_step1');

  try {
    const response = await api.post('/generations/derivations', {
      base64Data,
      mimeType: baseImage.type,
      intensity,
      skinTone,
      config
    });
    
    if (onStatusUpdate) onStatusUpdate('processing_step2');
    
    return response.data;
  } catch (error) {
    console.error("Generate Derivations Error:", error);
    throw error;
  }
};

export const trainAvatar = async (files: File[], onStatusUpdate?: StatusCallback, model?: string): Promise<string> => {
  const filesData = await Promise.all(files.map(async (file) => ({
    data: await fileToBase64(file),
    mimeType: file.type
  })));

  try {
    const response = await api.post('/generations/avatar', {
      files: filesData,
      model
    });
    return response.data.image;
  } catch (error) {
    console.error("Train Avatar Error:", error);
    throw error;
  }
};

export const generateTryOn = async (modelFile: File, garmentFile: File, onStatusUpdate?: StatusCallback, model?: string): Promise<string> => {
  const modelB64 = await fileToBase64(modelFile);
  const garmentB64 = await fileToBase64(garmentFile);

  try {
    const response = await api.post('/generations/try-on', {
      modelB64,
      modelMime: modelFile.type,
      garmentB64,
      garmentMime: garmentFile.type,
      model
    });
    return response.data.image;
  } catch (error) {
    console.error("Try On Error:", error);
    throw error;
  }
};

export const generateSwap = async (sourceFile: File, sceneFile: File, onStatusUpdate?: StatusCallback, model?: string): Promise<string> => {
  const sourceB64 = await fileToBase64(sourceFile);
  const sceneB64 = await fileToBase64(sceneFile);

  try {
    const response = await api.post('/generations/swap', {
      sourceB64,
      sourceMime: sourceFile.type,
      sceneB64,
      sceneMime: sceneFile.type,
      model
    });
    return response.data.image;
  } catch (error) {
    console.error("Swap Error:", error);
    throw error;
  }
};
