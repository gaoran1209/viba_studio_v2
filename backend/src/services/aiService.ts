import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure GEMINI_API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

export type SkinTone = 'Light' | 'Medium' | 'Dark';

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

// Utility for Timeout and Retry
async function withTimeoutAndRetry<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 30000, 
  maxRetries: number = 3
): Promise<T> {
  let attempt = 0;
  
  while (true) {
    try {
      if (attempt > 0) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying attempt ${attempt} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      );

      return await Promise.race([operation(), timeoutPromise]);

    } catch (error: any) {
      attempt++;
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        console.error("Quota exceeded, stopping retries.");
        throw error;
      }

      if (attempt > maxRetries) {
        throw error;
      }
    }
  }
}

export const generateDerivations = async (
  base64Data: string,
  mimeType: string,
  intensity: number,
  skinTone?: SkinTone,
  config?: { textModel: string; imageModel: string }
): Promise<{ images: string[], description: string }> => {
  const ai = getClient();
  
  // Step 1: Image to Text (Description)
  const description = await withTimeoutAndRetry(async () => {
    const response = await ai.models.generateContent({
      model: config?.textModel || 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: PROMPTS.derivation_describe },
        ],
      },
    });
    return response.text || "A creative image.";
  }, 60000, 2);

  // Step 2: Text to Image (Generation)
  const prompt = PROMPTS.derivation_generate(description, intensity, skinTone);

  const generateSingle = async () => {
    return withTimeoutAndRetry(async () => {
      const response = await ai.models.generateContent({
        model: config?.imageModel || 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: prompt },
          ],
        },
        config: {
          systemInstruction: 'Image aspect ratio 3:4',
          imageConfig: {
            imageSize: '1K',
            aspectRatio: '3:4'
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image generated");
    }, 90000, 2); 
  };

  const results = await Promise.all([
    generateSingle(),
    generateSingle(),
    generateSingle(),
    generateSingle()
  ]);
  
  return { images: results, description };
};

export const trainAvatar = async (files: { data: string, mimeType: string }[], model?: string): Promise<string> => {
  const ai = getClient();
  
  return withTimeoutAndRetry(async () => {
    const parts: any[] = [];
    for (const file of files) {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data
        }
      });
    }
    
    parts.push({ text: PROMPTS.avatar });

    const response = await ai.models.generateContent({
      model: model || 'gemini-3-pro-image-preview',
      contents: { parts },
      config: {
        systemInstruction: 'Image aspect ratio 3:4',
        imageConfig: {
          imageSize: '4K',
          aspectRatio: '3:4'
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Failed to generate avatar preview");
  }, 120000, 2);
};

export const generateTryOn = async (modelB64: string, modelMime: string, garmentB64: string, garmentMime: string, model?: string): Promise<string> => {
  const ai = getClient();

  return withTimeoutAndRetry(async () => {
    const response = await ai.models.generateContent({
      model: model || 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: modelMime, data: modelB64 } },
          { inlineData: { mimeType: garmentMime, data: garmentB64 } },
          { text: PROMPTS.tryOn }
        ]
      },
      config: {
        systemInstruction: 'Image aspect ratio 3:4',
        imageConfig: {
          imageSize: '2K',
          aspectRatio: '3:4'
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Failed to generate try-on image");
  }, 120000, 2);
};

export const generateSwap = async (sourceB64: string, sourceMime: string, sceneB64: string, sceneMime: string, model?: string): Promise<string> => {
  const ai = getClient();

  return withTimeoutAndRetry(async () => {
    const response = await ai.models.generateContent({
      model: model || 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: sourceMime, data: sourceB64 } },
          { inlineData: { mimeType: sceneMime, data: sceneB64 } },
          { text: PROMPTS.swap }
        ]
      },
      config: {
        systemInstruction: 'Image aspect ratio 3:4',
        imageConfig: {
          imageSize: '2K',
          aspectRatio: '3:4'
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Failed to generate swap image");
  }, 120000, 2);
};
