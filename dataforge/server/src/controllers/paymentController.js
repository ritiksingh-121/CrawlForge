import razorpay, { PLANS } from '../config/razorpay.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import { AppError } from '../middleware/errorHandler.js';

export const createOrder = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId?.toUpperCase()];

    if (!plan || plan.price === 0) {
      throw new AppError('Invalid plan.', 400);
    }

    const options = {
      amount: plan.price,
      currency: 'INR',
      receipt: `order_${req.user.id}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        planId: plan.id,
      },
    };

    const order = await razorpay.orders.create(options);
    res.json({ order, plan });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    const crypto = await import('crypto');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new AppError('Invalid payment signature.', 400);
    }

    const plan = PLANS[planId?.toUpperCase()];
    if (!plan) {
      throw new AppError('Invalid plan.', 400);
    }

    const subscription = await Subscription.create({
      userId: req.user.id,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      status: 'active',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    req.user.subscriptionId = plan.id;
    req.user.subscriptionStatus = 'active';
    req.user.subscriptionEndsAt = subscription.currentPeriodEnd;
    await req.user.save();

    res.json({ subscription, message: 'Payment verified and subscription activated.' });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    res.json({ subscriptions });
  } catch (error) {
    next(error);
  }
};

export const getCurrentSubscription = async (req, res) => {
  const plan = PLANS[req.user.subscriptionId?.toUpperCase()] || PLANS.FREE;
  res.json({
    subscription: {
      planId: req.user.subscriptionId,
      planName: plan.name,
      status: req.user.subscriptionStatus,
      endsAt: req.user.subscriptionEndsAt,
      plan,
    },
  });
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' },
      order: [['createdAt', 'DESC']],
    });

    if (!subscription) {
      throw new AppError('No active subscription found.', 404);
    }

    if (subscription.razorpaySubscriptionId) {
      try {
        await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);
      } catch {}
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    req.user.subscriptionId = 'free';
    req.user.subscriptionStatus = 'cancelled';
    await req.user.save();

    res.json({ message: 'Subscription cancelled.' });
  } catch (error) {
    next(error);
  }
};
