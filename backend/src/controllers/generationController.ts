import { Request, Response } from 'express';
import { GenerationHistory } from '../models';

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
