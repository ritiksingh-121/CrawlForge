import { Router } from 'express';
import { startScraping, getJobStatus, retryJob, cancelJob, getJobs } from '../controllers/scrapingController.js';
import { authenticate, requireSubscription } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/projects/:projectId/start', startScraping);
router.get('/jobs', getJobs);
router.get('/jobs/:jobId', getJobStatus);
router.post('/jobs/:jobId/retry', retryJob);
router.post('/jobs/:jobId/cancel', cancelJob);

export default router;
