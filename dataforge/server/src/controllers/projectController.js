import Project from '../models/Project.js';
import ScrapedData from '../models/ScrapedData.js';
import Job from '../models/Job.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate } from '../utils/helpers.js';
import { Op } from 'sequelize';
import XLSX from 'xlsx';

export const createProject = async (req, res, next) => {
  try {
    const { name, targetUrl, fields, pagination, headers, nextPageSelector } = req.body;

    const project = await Project.create({
      name,
      targetUrl,
      fields: fields || [],
      pagination: pagination || null,
      headers: headers || null,
      nextPageSelector: nextPageSelector || null,
      userId: req.user.id,
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { count, rows: projects } = await Project.findAndCountAll({
      where,
      limit: pageLimit,
      offset,
      order: [['updatedAt', 'DESC']],
    });

    res.json({ projects, total: count, page: parseInt(page) || 1, totalPages: Math.ceil(count / pageLimit) });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: ScrapedData, limit: 50, order: [['createdAt', 'DESC']] },
        { model: Job, limit: 10, order: [['createdAt', 'DESC']] },
      ],
    });

    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    const { name, targetUrl, fields, pagination, headers, schedule, scheduleEnabled, nextPageSelector } = req.body;
    if (name !== undefined) project.name = name;
    if (targetUrl !== undefined) project.targetUrl = targetUrl;
    if (fields !== undefined) project.fields = fields;
    if (pagination !== undefined) project.pagination = pagination;
    if (headers !== undefined) project.headers = headers;
    if (schedule !== undefined) project.schedule = schedule;
    if (scheduleEnabled !== undefined) project.scheduleEnabled = scheduleEnabled;
    if (nextPageSelector !== undefined) project.nextPageSelector = nextPageSelector;

    await project.save();
    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    await ScrapedData.destroy({ where: { projectId: project.id } });
    await Job.destroy({ where: { projectId: project.id } });
    await project.destroy();

    res.json({ message: 'Project deleted.' });
  } catch (error) {
    next(error);
  }
};

export const getProjectData = async (req, res, next) => {
  try {
    const { page, limit, batchId } = req.query;
    const { limit: pageLimit, offset } = paginate(page, limit);

    const where = { projectId: req.params.id };
    if (batchId) where.batchId = batchId;

    const { count, rows: data } = await ScrapedData.findAndCountAll({
      where,
      limit: pageLimit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({ data, total: count });
  } catch (error) {
    next(error);
  }
};

export const exportProjectData = async (req, res, next) => {
  try {
    const { format = 'csv' } = req.query;
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!project) {
      throw new AppError('Project not found.', 404);
    }

    const allData = await ScrapedData.findAll({
      where: { projectId: project.id },
      order: [['createdAt', 'DESC']],
    });

    let fieldNames = project.fields.map((f) => f.name).filter(Boolean);
    const rows = allData.map((d) => d.data);

    if (fieldNames.length === 0 && rows.length > 0) {
      const keys = new Set();
      for (const row of rows) {
        if (row && typeof row === 'object') {
          for (const key of Object.keys(row)) {
            if (key) keys.add(key);
          }
        }
      }
      fieldNames = [...keys];
    }

    const sanitizeCSV = (val) => {
      if (val == null) return '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    if (format === 'csv') {
      const BOM = '\uFEFF';
      const header = fieldNames.join(',');
      const csvRows = rows.map((row) => fieldNames.map((f) => sanitizeCSV(row?.[f])).join(','));
      const csv = BOM + [header, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv"`);
      return res.send(csv);
    }

    if (format === 'json') {
      const jsonStr = JSON.stringify(rows, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.json"`);
      return res.send(jsonStr);
    }

    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new();
      const headerRow = fieldNames.reduce((acc, f) => { acc[f] = f; return acc; }, {});
      const dataRows = rows.map((row) => {
        const obj = {};
        fieldNames.forEach((f) => { obj[f] = row?.[f] ?? ''; });
        return obj;
      });
      const ws = XLSX.utils.json_to_sheet(dataRows, { header: fieldNames });

      const colWidths = fieldNames.map((f) => ({
        wch: Math.max(
          f.length,
          ...dataRows.slice(0, 100).map((r) => String(r[f] || '').length)
        ) + 2,
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Scraped Data');

      const wbout = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx"`);
      return res.send(wbout);
    }

    throw new AppError('Unsupported export format. Supported: csv, json, xlsx.', 400);
  } catch (error) {
    next(error);
  }
};
