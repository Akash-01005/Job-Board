import express from 'express';
import { authenticateToken, requireEmployer } from '../middlewares/auth.js';
import {
  getJobRecommendations,
  getCandidateRecommendations,
  applyForJob
} from '../controllers/matchingController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/recommend/:userId', getJobRecommendations);
router.get('/match/:jobId', requireEmployer, getCandidateRecommendations);
router.post('/apply/:jobId', applyForJob);

export default router; 