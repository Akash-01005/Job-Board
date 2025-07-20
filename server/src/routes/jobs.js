import express from 'express';
import { authenticateToken, requireEmployer } from '../middlewares/auth.js';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs
} from '../controllers/jobController.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobById);

router.use(authenticateToken);

router.get('/my/jobs', getMyJobs);
router.post('/', requireEmployer, createJob);
router.put('/:id', requireEmployer, updateJob);
router.delete('/:id', requireEmployer, deleteJob);

export default router; 