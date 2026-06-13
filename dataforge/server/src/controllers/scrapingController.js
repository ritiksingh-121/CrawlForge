import Project from '../models/Project.js';
import Job from '../models/Job.js';
import ScrapedData from '../models/ScrapedData.js';
import scrapingService from '../services/scrapingService.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export const startScraping = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      where: { id: projectId, userId: req.user.id },
    });

    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    const job = await Job.create({
      userId: req.user.id,
      projectId: project.id,
      type: 'scrape',
      status: 'running',
      startedAt: new Date(),
    });

    project.status = 'running';
    await project.save();

    scrapingService.runScrapingJob(project, job)
      .catch((err) => console.error('[Scraping] Job failed:', err.message));

    res.json({ job, message: 'Scraping job started.' });
  } catch (error) {
    next(error);
  }
};

export const getJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      where: { id: req.params.jobId, userId: req.user.id },
    });

    if (!job) {
      throw new AppError('Job not found.', 404);
    }

    res.json({ job });
  } catch (error) {
    next(error);
  }
};

export const retryJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      where: { id: req.params.jobId, userId: req.user.id },
    });

    if (!job) {
      throw new AppError('Job not found.', 404);
    }

    if (job.retryCount >= job.maxRetries) {
      throw new AppError('Maximum retry limit reached.', 400);
    }

    const project = await Project.findByPk(job.projectId);
    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    job.status = 'running';
    job.error = null;
    job.retryCount += 1;
    job.startedAt = new Date();
    job.completedAt = null;
    await job.save();

    project.status = 'running';
    await project.save();

    scrapingService.runScrapingJob(project, job)
      .catch((err) => console.error('[Scraping] Retry failed:', err.message));

    res.json({ job, message: 'Job retry started.' });
  } catch (error) {
    next(error);
  }
};

export const cancelJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      where: { id: req.params.jobId, userId: req.user.id },
    });

    if (!job) {
      throw new AppError('Job not found.', 404);
    }

    job.status = 'cancelled';
    await job.save();

    res.json({ message: 'Job cancelled.' });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const { page, limit, status, projectId } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100);

    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      order: [['createdAt', 'DESC']],
      include: [{ model: Project, attributes: ['name', 'targetUrl'] }],
    });

    res.json({ jobs, total: count, page: pageNum, totalPages: Math.ceil(count / limitNum) });
  } catch (error) {
    next(error);
  }
};
