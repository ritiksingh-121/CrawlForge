import { useState, useEffect } from 'react';
import { payments } from '../api/client';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'INR',
    description: 'Perfect for getting started',
    features: ['5 jobs per day', '50 pages per job', 'CSV export', 'Basic support'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99900,
    currency: 'INR',
    description: 'For professionals and teams',
    features: ['50 jobs per day', '500 pages per job', 'CSV, JSON, XLSX export', 'API access', 'Scheduled jobs', 'Priority support'],
    cta: 'Subscribe',
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 299900,
    currency: 'INR',
    description: 'For growing businesses',
    features: ['200 jobs per day', '2000 pages per job', 'All export formats', 'API access', 'Scheduled jobs', 'Priority queue', 'Dedicated support'],
    cta: 'Subscribe',
    highlighted: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999900,
    currency: 'INR',
    description: 'For large-scale operations',
    features: ['Unlimited jobs', 'Unlimited pages', 'All export formats', 'API access', 'Scheduled jobs', 'Priority queue', 'Dedicated support', 'Custom integrations'],
    cta: 'Contact Us',
    highlighted: false,
  },
];

function loadRazorpay(src) {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(window.Razorpay); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(window.Razorpay);
    document.body.appendChild(script);
  });
}

export default function Subscriptions() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (planId) => {
    if (planId === 'free') return;
    if (planId === 'enterprise') {
      window.location.href = 'mailto:sales@dataforge.com';
      return;
    }
    setLoading(planId);
    try {
      const { data } = await payments.createOrder(planId);

      const Razorpay = await loadRazorpay('https://checkout.razorpay.com/v1/checkout.js');
      const rzp = new Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_placeholder',
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'CrawlForge',
        description: `${data.plan.name} Plan`,
        order_id: data.order.id,
        prefill: { name: user.name, email: user.email },
        handler: async function (response) {
          try {
            const verifyRes = await payments.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: planId.toUpperCase(),
            });
            toast.success('Subscription activated!');
            updateUser({
              subscriptionId: planId.toUpperCase(),
              subscriptionStatus: 'active',
            });
          } catch {
            toast.error('Payment verification failed');
          }
        },
        modal: { ondismiss: () => setLoading(null) },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 items-center justify-center mb-3">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-display-md text-ink dark:text-dark-text">Choose your plan</h1>
        <p className="text-sm text-mute mt-2">
          You're currently on the <strong className="text-ink dark:text-dark-text">{user?.subscriptionId || 'Free'}</strong> plan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = user?.subscriptionId === plan.id.toUpperCase();
          return (
            <div
              key={plan.id}
              className={`
                relative rounded-xl p-6 card-shadow-lg flex flex-col
                ${plan.highlighted
                  ? 'bg-ink text-white ring-2 ring-indigo-500 scale-[1.02]'
                  : 'bg-white dark:bg-dark-card text-ink dark:text-dark-text'
                }
              `}
            >
              {plan.highlighted && (
                <Badge variant="primary" className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}

              <div className="mb-5">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className={`text-sm mt-0.5 ${plan.highlighted ? 'text-white/70' : 'text-mute'}`}>{plan.description}</p>
              </div>

              <div className="mb-5">
                <span className="text-display-lg">{plan.price === 0 ? 'Free' : `₹${(plan.price / 100).toLocaleString('en-IN')}`}</span>
                {plan.price > 0 && <span className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-mute'}`}>/month</span>}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    {feat}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? 'secondary' : 'primary'}
                className="w-full"
                onClick={() => handleSubscribe(plan.id)}
                loading={loading === plan.id}
                disabled={isCurrent}
              >
                {isCurrent ? 'Current Plan' : plan.cta}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
