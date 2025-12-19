import { Router } from 'express';
import { signup, signin, refresh, signout } from '../controllers/auth.controller';

const router = Router();

// POST /auth/signup
router.post('/signup', signup);

// POST /auth/signin
router.post('/signin', signin);

// POST /auth/refresh
router.post('/refresh', refresh);

// POST /auth/signout
router.post('/signout', signout);

export default router;