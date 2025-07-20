import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import { parseResume, getParsedResume } from '../controllers/parserController.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/parse-resume', upload.single('resume'), parseResume);
router.get('/parsed-resume', getParsedResume);

export default router; 