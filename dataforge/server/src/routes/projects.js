import { Router } from 'express';
import { createProject, getProjects, getProject, updateProject, deleteProject, getProjectData, exportProjectData } from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get('/:id/data', getProjectData);
router.get('/:id/export', exportProjectData);

export default router;
