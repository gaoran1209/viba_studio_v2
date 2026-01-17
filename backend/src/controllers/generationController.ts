import { Request, Response } from 'express';
import { GenerationHistory } from '../models';
import * as aiService from '../services/aiService';
import * as r2Service from '../services/r2Service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper to upload base64 images to R2 and return URLs
 */
const uploadImagesToR2 = async (
  userId: string,
  generationId: string,
  images: string[],
  type: 'input' | 'output'
): Promise<string[]> => {
  if (!r2Service.isR2Configured()) {
    // R2 not configured, return original base64 data
    return images;
  }

  const uploadPromises = images.map(async (image, index) => {
    try {
      const key = await r2Service.uploadBase64Image(userId, generationId, image, type, index);
      return await r2Service.getImageUrl(key);
    } catch (error) {
      console.error(`Failed to upload image ${index} to R2:`, error);
      // Fallback to original base64 if upload fails
      return image;
    }
  });

  return Promise.all(uploadPromises);
};

export const generateDerivations = async (req: any, res: Response) => {
  try {
    const { base64Data, mimeType, intensity, skinTone, config, saveToHistory } = req.body;

    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const result = await aiService.generateDerivations(base64Data, mimeType, intensity, skinTone, config);

    // If user is authenticated and wants to save to history, upload to R2
    if (req.user && saveToHistory !== false) {
      const generationId = uuidv4();

      // Upload output images to R2
      const outputUrls = await uploadImagesToR2(
        req.user.id,
        generationId,
        result.images,
        'output'
      );

      // Upload input image to R2
      const inputUrls = await uploadImagesToR2(
        req.user.id,
        generationId,
        [`data:${mimeType};base64,${base64Data}`],
        'input'
      );

      // Save to history
      await GenerationHistory.create({
        id: generationId,
        user_id: req.user.id,
        type: 'derivation',
        input_files: inputUrls,
        output_files: outputUrls,
        parameters: { intensity, skinTone, config },
        status: 'completed'
      });

      res.json({
        images: outputUrls,
        description: result.description,
        generationId
      });
    } else {
      res.json(result);
    }
  } catch (error: any) {
    console.error('Derivation error:', error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
};

export const trainAvatar = async (req: any, res: Response) => {
  try {
    const { files, model, saveToHistory } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Missing files' });
    }

    const result = await aiService.trainAvatar(files, model);

    // If user is authenticated and wants to save to history, upload to R2
    if (req.user && saveToHistory !== false) {
      const generationId = uuidv4();

      // Upload output image to R2
      const outputUrls = await uploadImagesToR2(
        req.user.id,
        generationId,
        [result],
        'output'
      );

      // Upload input images to R2
      const inputBase64s = files.map((f: any) => `data:${f.mimeType};base64,${f.data}`);
      const inputUrls = await uploadImagesToR2(
        req.user.id,
        generationId,
        inputBase64s,
        'input'
      );

      // Save to history
      await GenerationHistory.create({
        id: generationId,
        user_id: req.user.id,
        type: 'avatar',
        input_files: inputUrls,
        output_files: outputUrls,
        parameters: { model },
        status: 'completed'
      });

      res.json({ image: outputUrls[0], generationId });
    } else {
      res.json({ image: result });
    }
  } catch (error: any) {
    console.error('Avatar error:', error);
    res.status(500).json({ error: error.message || 'Avatar generation failed' });
  }
};

export const generateTryOn = async (req: any, res: Response) => {
  try {
    const { modelB64, modelMime, garmentB64, garmentMime, model, saveToHistory } = req.body;
    if (!modelB64 || !garmentB64) {
      return res.status(400).json({ error: 'Missing images' });
    }

    const result = await aiService.generateTryOn(modelB64, modelMime, garmentB64, garmentMime, model);

    // If user is authenticated and wants to save to history, upload to R2
    if (req.user && saveToHistory !== false) {
      const generationId = uuidv4();

      // Upload output image to R2
      const outputUrls = await uploadImagesToR2(
        req.user.id,
        generationId,
        [result],
        'output'
      );

      // Upload input images to R2
      const inputUrls = await uploadImagesToR2(
        req.user.id,
        generationId,
        [
          `data:${modelMime};base64,${modelB64}`,
          `data:${garmentMime};base64,${garmentB64}`
        ],
        'input'
      );

      // Save to history
      await GenerationHistory.create({
        id: generationId,
        user_id: req.user.id,
        type: 'try_on',
        input_files: inputUrls,
        output_files: outputUrls,
        parameters: { model },
        status: 'completed'
      });

      res.json({ image: outputUrls[0], generationId });
    } else {
      res.json({ image: result });
    }
  } catch (error: any) {
    console.error('TryOn error:', error);
    res.status(500).json({ error: error.message || 'TryOn failed' });
  }
};

export const generateSwap = async (req: any, res: Response) => {
  try {
    const { sourceB64, sourceMime, sceneB64, sceneMime, model, saveToHistory } = req.body;
    if (!sourceB64 || !sceneB64) {
      return res.status(400).json({ error: 'Missing images' });
    }

    const result = await aiService.generateSwap(sourceB64, sourceMime, sceneB64, sceneMime, model);

    // If user is authenticated and wants to save to history, upload to R2
    if (req.user && saveToHistory !== false) {
      const generationId = uuidv4();

      // Upload output image to R2
      const outputUrls = await uploadImagesToR2(
        req.user.id,
        generationId,
        [result],
        'output'
      );

      // Upload input images to R2
      const inputUrls = await uploadImagesToR2(
        req.user.id,
        generationId,
        [
          `data:${sourceMime};base64,${sourceB64}`,
          `data:${sceneMime};base64,${sceneB64}`
        ],
        'input'
      );

      // Save to history
      await GenerationHistory.create({
        id: generationId,
        user_id: req.user.id,
        type: 'swap',
        input_files: inputUrls,
        output_files: outputUrls,
        parameters: { model },
        status: 'completed'
      });

      res.json({ image: outputUrls[0], generationId });
    } else {
      res.json({ image: result });
    }
  } catch (error: any) {
    console.error('Swap error:', error);
    res.status(500).json({ error: error.message || 'Swap failed' });
  }
};

export const createGeneration = async (req: any, res: Response) => {
  try {
    const { type, input_files, output_files, parameters, status } = req.body;
    const generationId = uuidv4();

    // Upload images to R2 if configured
    let processedInputFiles = input_files;
    let processedOutputFiles = output_files;

    if (r2Service.isR2Configured()) {
      // Check if files are base64 and need uploading
      if (input_files && Array.isArray(input_files)) {
        const base64Inputs = input_files.filter((f: string) => f.startsWith('data:'));
        if (base64Inputs.length > 0) {
          processedInputFiles = await uploadImagesToR2(
            req.user.id,
            generationId,
            input_files,
            'input'
          );
        }
      }

      if (output_files && Array.isArray(output_files)) {
        const base64Outputs = output_files.filter((f: string) => f.startsWith('data:'));
        if (base64Outputs.length > 0) {
          processedOutputFiles = await uploadImagesToR2(
            req.user.id,
            generationId,
            output_files,
            'output'
          );
        }
      }
    }

    const generation = await GenerationHistory.create({
      id: generationId,
      user_id: req.user.id,
      type,
      input_files: processedInputFiles,
      output_files: processedOutputFiles,
      parameters,
      status: status || 'completed'
    });

    res.status(201).json(generation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getGenerations = async (req: any, res: Response) => {
  try {
    const generations = await GenerationHistory.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    // Refresh signed URLs if needed (for R2 keys stored in DB)
    const processedGenerations = await Promise.all(
      generations.map(async (gen: any) => {
        const data = gen.toJSON();

        // Check if output_files contain R2 keys that need URL refresh
        if (data.output_files && Array.isArray(data.output_files)) {
          data.output_files = await Promise.all(
            data.output_files.map(async (file: string) => {
              if (r2Service.isR2Key(file)) {
                return await r2Service.getImageUrl(file);
              }
              return file;
            })
          );
        }

        if (data.input_files && Array.isArray(data.input_files)) {
          data.input_files = await Promise.all(
            data.input_files.map(async (file: string) => {
              if (r2Service.isR2Key(file)) {
                return await r2Service.getImageUrl(file);
              }
              return file;
            })
          );
        }

        return data;
      })
    );

    res.json(processedGenerations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteGeneration = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // First, fetch the generation to get R2 keys
    const generation = await GenerationHistory.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!generation) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Delete images from R2 if configured
    if (r2Service.isR2Configured()) {
      const data = generation.toJSON();
      const keysToDelete: string[] = [];

      // Collect R2 keys from input_files
      if (data.input_files && Array.isArray(data.input_files)) {
        data.input_files.forEach((file: string) => {
          if (r2Service.isR2Key(file)) {
            keysToDelete.push(file);
          }
        });
      }

      // Collect R2 keys from output_files
      if (data.output_files && Array.isArray(data.output_files)) {
        data.output_files.forEach((file: string) => {
          if (r2Service.isR2Key(file)) {
            keysToDelete.push(file);
          }
        });
      }

      // Delete from R2
      if (keysToDelete.length > 0) {
        try {
          await r2Service.deleteImages(keysToDelete);
        } catch (error) {
          console.error('Failed to delete images from R2:', error);
          // Continue with database deletion even if R2 deletion fails
        }
      }
    }

    // Delete from database
    await GenerationHistory.destroy({
      where: { id, user_id: req.user.id }
    });

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
