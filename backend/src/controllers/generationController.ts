import { Request, Response } from 'express';
import { GenerationHistory } from '../models';
import * as aiService from '../services/aiService';

export const generateDerivations = async (req: Request, res: Response) => {
  try {
    const { base64Data, mimeType, intensity, skinTone, config } = req.body;
    
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const result = await aiService.generateDerivations(base64Data, mimeType, intensity, skinTone, config);
    res.json(result);
  } catch (error: any) {
    console.error('Derivation error:', error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
};

export const trainAvatar = async (req: Request, res: Response) => {
  try {
    const { files, model } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Missing files' });
    }

    const result = await aiService.trainAvatar(files, model);
    res.json({ image: result });
  } catch (error: any) {
    console.error('Avatar error:', error);
    res.status(500).json({ error: error.message || 'Avatar generation failed' });
  }
};

export const generateTryOn = async (req: Request, res: Response) => {
  try {
    const { modelB64, modelMime, garmentB64, garmentMime, model } = req.body;
    if (!modelB64 || !garmentB64) {
      return res.status(400).json({ error: 'Missing images' });
    }

    const result = await aiService.generateTryOn(modelB64, modelMime, garmentB64, garmentMime, model);
    res.json({ image: result });
  } catch (error: any) {
    console.error('TryOn error:', error);
    res.status(500).json({ error: error.message || 'TryOn failed' });
  }
};

export const generateSwap = async (req: Request, res: Response) => {
  try {
    const { sourceB64, sourceMime, sceneB64, sceneMime, model } = req.body;
    if (!sourceB64 || !sceneB64) {
      return res.status(400).json({ error: 'Missing images' });
    }

    const result = await aiService.generateSwap(sourceB64, sourceMime, sceneB64, sceneMime, model);
    res.json({ image: result });
  } catch (error: any) {
    console.error('Swap error:', error);
    res.status(500).json({ error: error.message || 'Swap failed' });
  }
};

export const createGeneration = async (req: any, res: Response) => {
  try {
    const { type, input_files, output_files, parameters, status } = req.body;
    
    const generation = await GenerationHistory.create({
      user_id: req.user.id,
      type,
      input_files,
      output_files,
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
    res.json(generations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteGeneration = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await GenerationHistory.destroy({
      where: { id, user_id: req.user.id }
    });
    
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
