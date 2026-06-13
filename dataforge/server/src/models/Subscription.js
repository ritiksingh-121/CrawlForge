import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  planId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  planName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'expired', 'past_due'),
    defaultValue: 'active',
  },
  razorpaySubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  razorpayOrderId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  razorpayPaymentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  currentPeriodStart: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  currentPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

Subscription.associate = (models) => {
  Subscription.belongsTo(models.User, { foreignKey: 'userId' });
};

export default Subscription;
