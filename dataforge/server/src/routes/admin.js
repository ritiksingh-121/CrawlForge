import { Router } from 'express';
import { getDashboardStats, getUsers, updateUser, deleteUser, getAllJobs, getSystemLogs, getRevenueReport } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/jobs', getAllJobs);
router.get('/logs', getSystemLogs);
router.get('/revenue', getRevenueReport);

export default router;
