import { Router } from 'express';
import { createGeneration, getGenerations, deleteGeneration } from '../controllers/generationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createGeneration);
router.get('/', getGenerations);
router.delete('/:id', deleteGeneration);

export default router;
