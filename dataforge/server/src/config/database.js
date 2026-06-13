import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? false : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
});

const models = {};

export const initModels = () => {
  const User = sequelize.models.User;
  const Project = sequelize.models.Project;
  const Job = sequelize.models.Job;
  const ScrapedData = sequelize.models.ScrapedData;
  const Subscription = sequelize.models.Subscription;

  Object.assign(models, { User, Project, Job, ScrapedData, Subscription });

  if (Project.associate) Project.associate(models);
  if (Job.associate) Job.associate(models);
  if (ScrapedData.associate) ScrapedData.associate(models);
  if (Subscription.associate) Subscription.associate(models);
};

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] PostgreSQL connected successfully');
    initModels();
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('[DB] Models synchronized');
  } catch (error) {
    console.error('[DB] Connection failed:', error.message);
    process.exit(1);
  }
};

export default sequelize;
