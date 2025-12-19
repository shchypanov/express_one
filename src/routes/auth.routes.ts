import { Router } from 'express';
import { signup, signin, refresh, signout } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// POST /auth/signup
router.post('/signup', asyncHandler(signup));

// POST /auth/signin
router.post('/signin', asyncHandler(signin));

// POST /auth/refresh
router.post('/refresh', asyncHandler(refresh));

// POST /auth/signout
router.post('/signout', asyncHandler(signout));

export default router;