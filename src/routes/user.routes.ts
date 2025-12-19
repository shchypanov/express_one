import { Router } from 'express';
import { profile } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';


const router = Router();

router.get('/profile', authMiddleware, asyncHandler(profile));

export default router;