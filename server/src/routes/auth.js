import express from 'express';
import { signup, login, getMe, refreshToken, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

export default router; 