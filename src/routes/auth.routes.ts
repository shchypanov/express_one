import { Router } from 'express';
import { signup, signin, refresh, signout } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/error.middleware';
import { validate } from '../middleware/validation.middleware';
import { signupSchema, signinSchema } from '../validation/auth.validation';

const router = Router();

// POST /auth/signup
router.post('/signup', validate(signupSchema), asyncHandler(signup));

// POST /auth/signin
router.post('/signin', validate(signinSchema), asyncHandler(signin));

// POST /auth/refresh
router.post('/refresh', asyncHandler(refresh));

// POST /auth/signout
router.post('/signout', asyncHandler(signout));

export default router;