import Project from '../models/Project.js';
import Job from '../models/Job.js';
import ScrapedData from '../models/ScrapedData.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalProjects = await Project.count({ where: { userId } });
    const runningJobs = await Job.count({ where: { userId, status: 'running' } });
    const completedJobs = await Job.count({ where: { userId, status: 'completed' } });
    const totalDataPoints = await ScrapedData.count({
      include: [{
        model: Project,
        where: { userId },
      }],
    });

    const recentActivity = await Job.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [{ model: Project, attributes: ['name'] }],
    });

    const jobsByDay = await Job.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        userId,
        createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
    });

    const projectsByStatus = await Project.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { userId },
      group: ['status'],
    });

    res.json({
      stats: {
        totalProjects,
        runningJobs,
        completedJobs,
        totalDataPoints,
      },
      recentActivity,
      jobsByDay,
      projectsByStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectAnalytics = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const jobs = await Job.findAll({
      where: { projectId: project.id },
      order: [['createdAt', 'ASC']],
    });

    const totalData = await ScrapedData.count({ where: { projectId: project.id } });

    const avgDataPerRun = jobs.length > 0 ? Math.round(totalData / jobs.length) : 0;
    const successRate = jobs.length > 0
      ? Math.round((jobs.filter((j) => j.status === 'completed').length / jobs.length) * 100)
      : 0;

    const avgTime = jobs
      .filter((j) => j.startedAt && j.completedAt)
      .reduce((sum, j) => {
        return sum + (new Date(j.completedAt) - new Date(j.startedAt));
      }, 0);
    const avgDuration = jobs.filter((j) => j.startedAt && j.completedAt).length > 0
      ? Math.round(avgTime / jobs.filter((j) => j.startedAt && j.completedAt).length / 1000)
      : 0;

    res.json({
      analytics: {
        totalRuns: jobs.length,
        totalDataPoints: totalData,
        avgDataPerRun,
        successRate,
        avgDurationSeconds: avgDuration,
        jobs,
      },
    });
  } catch (error) {
    next(error);
  }
};
