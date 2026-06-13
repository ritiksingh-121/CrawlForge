import { useState, useEffect } from 'react';
import { analytics } from '../api/client';
import { Card, CardHeader } from '../components/ui/Card';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import PieChart from '../components/charts/PieChart';
import { CardSkeleton } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await analytics.dashboard();
        setData(res);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <CardSkeleton count={3} />;
  if (!data) return <EmptyState title="No analytics data" />;

  const { stats, jobsByDay, projectsByStatus } = data;

  const barData = jobsByDay?.length ? {
    labels: jobsByDay.map((j) => j.date),
    datasets: [{ data: jobsByDay.map((j) => j.count), backgroundColor: 'rgba(99, 102, 241, 0.8)', borderRadius: 6 }],
  } : null;

  const pieStatusData = projectsByStatus?.length ? {
    labels: projectsByStatus.map((p) => p.status),
    datasets: [{
      data: projectsByStatus.map((p) => parseInt(p.count)),
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(99,102,241,0.8)', 'rgba(239,68,68,0.8)', 'rgba(245,166,35,0.8)', 'rgba(107,114,128,0.8)'],
      borderWidth: 0,
    }],
  } : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-display-md text-ink dark:text-dark-text">Analytics</h1>
        <p className="text-sm text-mute mt-0.5">Your scraping performance and usage metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: stats?.totalProjects || 0, icon: BarChart3, color: 'from-indigo-500 to-purple-600' },
          { label: 'Running Jobs', value: stats?.runningJobs || 0, icon: Activity, color: 'from-emerald-500 to-teal-600' },
          { label: 'Completed', value: stats?.completedJobs || 0, icon: TrendingUp, color: 'from-blue-500 to-cyan-600' },
          { label: 'Data Points', value: formatNumber(stats?.totalDataPoints || 0), icon: BarChart3, color: 'from-amber-500 to-orange-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-dark-card rounded-xl card-shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-mute">{stat.label}</span>
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-ink dark:text-dark-text">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Jobs Per Day" description="Last 7 days" />
          <div className="h-72">
            {barData ? <BarChart data={barData} height={280} /> : <p className="text-sm text-mute text-center pt-20">No job data yet</p>}
          </div>
        </Card>
        <Card>
          <CardHeader title="Projects by Status" />
          <div className="h-72 flex items-center justify-center">
            {pieStatusData ? <PieChart data={pieStatusData} height={250} /> : <p className="text-sm text-mute">No project data</p>}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Job Timeline" description="Activity over time" />
        <div className="h-72">
          <LineChart height={280} />
        </div>
      </Card>
    </div>
  );
}
