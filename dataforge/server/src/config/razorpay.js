import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

export default razorpay;

export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    jobsPerDay: 5,
    pagesPerJob: 50,
    exportFormats: ['csv'],
    apiAccess: false,
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 99900,
    interval: 'monthly',
    jobsPerDay: 50,
    pagesPerJob: 500,
    exportFormats: ['csv', 'json', 'xlsx'],
    apiAccess: true,
    scheduledJobs: true,
    razorpayPlanId: null,
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    price: 299900,
    interval: 'monthly',
    jobsPerDay: 200,
    pagesPerJob: 2000,
    exportFormats: ['csv', 'json', 'xlsx', 'xml'],
    apiAccess: true,
    scheduledJobs: true,
    priority: true,
    razorpayPlanId: null,
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999900,
    interval: 'monthly',
    jobsPerDay: -1,
    pagesPerJob: -1,
    exportFormats: ['csv', 'json', 'xlsx', 'xml', 'parquet'],
    apiAccess: true,
    scheduledJobs: true,
    priority: true,
    dedicatedSupport: true,
    razorpayPlanId: null,
  },
};
