import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('scrape', 'schedule'),
    defaultValue: 'scrape',
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending',
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  pagesScraped: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalPages: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  maxRetries: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['projectId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] },
    { fields: ['userId', 'status'] },
    { fields: ['projectId', 'status'] },
  ],
});

Job.associate = (models) => {
  Job.belongsTo(models.User, { foreignKey: 'userId' });
  Job.belongsTo(models.Project, { foreignKey: 'projectId' });
};

export default Job;
