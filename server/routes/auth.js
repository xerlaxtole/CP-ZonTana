import express from 'express';
import { login, logout, me } from '../controllers/auth.js';
import { VerifyToken } from '../middlewares/VerifyToken.js';

const router = express.Router();

// POST /api/auth/login - Unified login/register endpoint
router.post('/login', login);

// POST /api/auth/logout - Logout and clear cookie
router.post('/logout', logout);

// GET /api/auth/me - Get current logged-in user (protected route)
router.get('/me', VerifyToken, me);

export default router;
