import { Router } from 'express';
import { getDashboardAnalytics, getProjectAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardAnalytics);
router.get('/projects/:id', getProjectAnalytics);

export default router;
