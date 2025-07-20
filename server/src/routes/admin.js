import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import {
  getApplicationsPerJob,
  getTopSkills,
  getDashboardStats,
  getApplicationStats
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/metrics/applications-per-job', getApplicationsPerJob);
router.get('/metrics/top-skills', getTopSkills);
router.get('/dashboard', getDashboardStats);
router.get('/applications/:jobId', getApplicationStats);

export default router; 