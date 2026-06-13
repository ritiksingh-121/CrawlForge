import User from '../models/User.js';
import Project from '../models/Project.js';
import Job from '../models/Job.js';
import Subscription from '../models/Subscription.js';
import { Sequelize, Op } from 'sequelize';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const totalProjects = await Project.count();
    const totalScrapes = await Job.count({ where: { type: 'scrape' } });
    const failedJobs = await Job.count({ where: { status: 'failed' } });
    const runningJobs = await Job.count({ where: { status: 'running' } });
    const revenue = await Subscription.sum('amount', { where: { status: 'active' } });

    const subsByPlan = await Subscription.findAll({
      attributes: ['planId', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      where: { status: 'active' },
      group: ['planId'],
    });

    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'name', 'email', 'subscriptionId', 'createdAt'],
    });

    const recentJobs = await Job.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [{ model: User, attributes: ['name', 'email'] }],
    });

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalProjects,
        totalScrapes,
        failedJobs,
        runningJobs,
        revenue: revenue || 0,
        subscriptionsByPlan: subsByPlan,
      },
      recentUsers,
      recentJobs,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      order: [['createdAt', 'DESC']],
    });

    res.json({ users, total: count, page: pageNum, totalPages: Math.ceil(count / limitNum) });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { isActive, role, subscriptionId, subscriptionStatus } = req.body;
    if (isActive !== undefined) user.isActive = isActive;
    if (role !== undefined) user.role = role;
    if (subscriptionId !== undefined) user.subscriptionId = subscriptionId;
    if (subscriptionStatus !== undefined) user.subscriptionStatus = subscriptionStatus;

    await user.save();
    res.json({ user: user.toJSON(), message: 'User updated.' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users.' });
    }

    await Subscription.destroy({ where: { userId: user.id } });
    await Job.destroy({ where: { userId: user.id } });
    await user.destroy();

    res.json({ message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

export const getAllJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);

    const where = {};
    if (status) where.status = status;

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Project, attributes: ['name', 'targetUrl'] },
      ],
    });

    res.json({ jobs, total: count, page: pageNum, totalPages: Math.ceil(count / limitNum) });
  } catch (error) {
    next(error);
  }
};

export const getSystemLogs = async (req, res) => {
  res.json({ message: 'Logs endpoint', logs: [] });
};

export const getRevenueReport = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100,
      include: [{ model: User, attributes: ['name', 'email'] }],
    });

    const totalRevenue = subscriptions.reduce((sum, s) => sum + s.amount, 0);
    const activeSubs = subscriptions.filter((s) => s.status === 'active').length;

    res.json({
      totalRevenue,
      activeSubscriptions: activeSubs,
      subscriptions,
    });
  } catch (error) {
    next(error);
  }
};
