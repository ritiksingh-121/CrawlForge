import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ScrapedData = sequelize.define('ScrapedData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  pageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  scrapedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  batchId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['projectId'] },
    { fields: ['batchId'] },
    { fields: ['projectId', 'createdAt'] },
  ],
});

ScrapedData.associate = (models) => {
  ScrapedData.belongsTo(models.Project, { foreignKey: 'projectId' });
};

export default ScrapedData;
