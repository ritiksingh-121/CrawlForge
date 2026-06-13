import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [1, 200] },
  },
  targetUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isUrl: true },
  },
  fields: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  },
  schedule: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  scheduleEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'running', 'completed', 'failed', 'scheduled'),
    defaultValue: 'draft',
  },
  pagination: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  nextPageSelector: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  headers: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  lastRunAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  totalRows: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  errorCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['userId', 'status'] },
  ],
});

Project.associate = (models) => {
  Project.belongsTo(models.User, { foreignKey: 'userId' });
  Project.hasMany(models.ScrapedData, { foreignKey: 'projectId' });
  Project.hasMany(models.Job, { foreignKey: 'projectId' });
};

export default Project;
