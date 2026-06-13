import { useState, useEffect } from 'react';
import { payments } from '../api/client';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { PageLoading } from '../components/ui/Loading';
import { Receipt, CreditCard, Download } from 'lucide-react';
import { formatDate, formatCurrency, statusColor } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function Billing() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [subsRes, curRes] = await Promise.all([
          payments.getSubscriptions(),
          payments.getCurrent(),
        ]);
        setSubscriptions(subsRes.data.subscriptions);
        setCurrent(curRes.data.subscription);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    try {
      await payments.cancel();
      toast.success('Subscription cancelled');
      const curRes = await payments.getCurrent();
      setCurrent(curRes.data.subscription);
    } catch {
      toast.error('Failed to cancel');
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-display-md text-ink dark:text-dark-text">Billing</h1>
        <p className="text-sm text-mute mt-0.5">Manage your subscription and billing history</p>
      </div>

      <Card>
        <CardHeader title="Current Plan" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-ink dark:text-dark-text">
                {current?.planName || 'Free'} Plan
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={current?.status === 'active' ? 'success' : 'default'} dot>
                  {current?.status || 'active'}
                </Badge>
                {current?.endsAt && (
                  <span className="text-sm text-mute">
                    {current?.status === 'cancelled' ? 'Ends' : 'Renews'} {formatDate(current.endsAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {current?.planId !== 'free' && current?.status === 'active' && (
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel Subscription
            </Button>
          )}
        </div>

        {current?.plan && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-hairline dark:border-dark-border">
            {[
              { label: 'Jobs/Day', value: current.plan.jobsPerDay === -1 ? '∞' : current.plan.jobsPerDay },
              { label: 'Pages/Job', value: current.plan.pagesPerJob === -1 ? '∞' : current.plan.pagesPerJob },
              { label: 'Scheduled Jobs', value: current.plan.scheduledJobs ? '✓' : '—' },
              { label: 'API Access', value: current.plan.apiAccess ? '✓' : '—' },
            ].map((feat) => (
              <div key={feat.label} className="text-center">
                <p className="text-xl font-semibold text-ink dark:text-dark-text">{feat.value}</p>
                <p className="text-xs text-mute">{feat.label}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Billing History" description="Your past invoices and payments" />
        {subscriptions.length === 0 ? (
          <EmptyState icon={Receipt} title="No billing history" description="Your invoices will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline dark:border-dark-border">
                  <th className="text-left py-3 px-2 text-xs font-medium text-mute uppercase">Date</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-mute uppercase">Plan</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-mute uppercase">Amount</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-mute uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-hairline dark:border-dark-border last:border-0">
                    <td className="py-3 px-2 text-body dark:text-dark-text">{formatDate(sub.createdAt)}</td>
                    <td className="py-3 px-2 font-medium text-ink dark:text-dark-text">{sub.planName}</td>
                    <td className="py-3 px-2 text-body">{formatCurrency(sub.amount)}</td>
                    <td className="py-3 px-2">
                      <Badge variant={sub.status === 'active' ? 'success' : 'default'}>{sub.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
