import { Router } from 'express';
import { 
  createGeneration, 
  getGenerations, 
  deleteGeneration,
  generateDerivations,
  trainAvatar,
  generateTryOn,
  generateSwap
} from '../controllers/generationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// AI Generation Routes
router.post('/derivations', generateDerivations);
router.post('/avatar', trainAvatar);
router.post('/try-on', generateTryOn);
router.post('/swap', generateSwap);

// History Routes
router.post('/', createGeneration);
router.get('/', getGenerations);
router.delete('/:id', deleteGeneration);

export default router;
