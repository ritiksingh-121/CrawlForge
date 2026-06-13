import { Router } from 'express';
import { createOrder, verifyPayment, getSubscriptions, getCurrentSubscription, cancelSubscription } from '../controllers/paymentController.js';
import { authenticate, requireSubscription } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/subscriptions', getSubscriptions);
router.get('/current', getCurrentSubscription);
router.post('/cancel', cancelSubscription);

export default router;
