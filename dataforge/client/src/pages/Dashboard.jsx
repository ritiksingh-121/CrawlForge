import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analytics, projects as projectsApi } from '../api/client';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Loading';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import {
  Globe, Activity, CheckCircle, Database, ArrowUpRight, Plus, Clock, Zap,
  TrendingUp, TrendingDown, Percent,
} from 'lucide-react';
import { formatNumber, formatRelativeTime } from '../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, projectsRes] = await Promise.all([
          analytics.dashboard(),
          projectsApi.list({ limit: 5 }),
        ]);
        setStats(analyticsRes.data.stats);
        setRecentProjects(projectsRes.data.projects);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalJobs = (stats?.completedJobs || 0) + (stats?.runningJobs || 0);
  const successRate = totalJobs > 0 ? Math.round((stats?.completedJobs / totalJobs) * 100) : 0;

  const statCards = [
    { label: 'Total Projects', value: formatNumber(stats?.totalProjects || 0), icon: Globe, color: 'from-indigo-500 to-purple-600' },
    { label: 'Running Jobs', value: formatNumber(stats?.runningJobs || 0), icon: Activity, color: 'from-emerald-500 to-teal-600' },
    { label: 'Completed Jobs', value: formatNumber(stats?.completedJobs || 0), icon: CheckCircle, color: 'from-blue-500 to-cyan-600' },
    { label: 'Total Records', value: formatNumber(stats?.totalDataPoints || 0), icon: Database, color: 'from-amber-500 to-orange-600' },
  ];

  if (loading) return <CardSkeleton count={4} />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md text-ink dark:text-dark-text">Dashboard</h1>
          <p className="text-sm text-mute mt-0.5">Welcome back, {user?.name?.split(' ')[0]}</p>
        </div>
        <Link to="/projects">
          <button className="inline-flex items-center gap-2 h-10 px-4 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink/90 transition-colors">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="bg-white dark:bg-dark-card rounded-xl p-5 card-shadow animate-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-mute">{card.label}</span>
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-ink dark:text-dark-text">{card.value}</p>
          </div>
        ))}
      </div>

      {totalJobs > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-dark-card rounded-xl p-5 card-shadow col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-4 h-4 text-mute" />
              <span className="text-xs text-mute">Success Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xl font-semibold text-ink dark:text-dark-text">{successRate}%</p>
              {successRate >= 80 ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-surface rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${successRate >= 80 ? 'bg-emerald-500' : successRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-xl p-5 card-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-mute" />
              <span className="text-xs text-mute">Total Runs</span>
            </div>
            <p className="text-xl font-semibold text-ink dark:text-dark-text">{formatNumber(totalJobs)}</p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-xl p-5 card-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-mute" />
              <span className="text-xs text-mute">Avg Records/Run</span>
            </div>
            <p className="text-xl font-semibold text-ink dark:text-dark-text">
              {totalJobs > 0 ? formatNumber(Math.round((stats?.totalDataPoints || 0) / totalJobs)) : 0}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Scraping Activity" description="Last 7 days" />
          <BarChart height={280} />
        </Card>
        <Card>
          <CardHeader title="Recent Projects" action={
            <Link to="/projects" className="text-sm text-link hover:text-link-deep inline-flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          } />
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-mute text-center py-8">No projects yet. Create your first project to start scraping.</p>
            ) : (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink dark:text-dark-text truncate">{project.name}</p>
                      <p className="text-xs text-mute truncate">{project.targetUrl}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={project.status === 'completed' ? 'success' : project.status === 'running' ? 'primary' : 'default'}>
                      {project.status}
                    </Badge>
                    <span className="text-xs text-mute hidden sm:inline">{formatRelativeTime(project.updatedAt)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Job Timeline" description="Last 7 days" />
          <LineChart height={280} />
        </Card>
        <Card>
          <CardHeader title="Quick Actions" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Project', icon: Plus, desc: 'Create a scraping project', href: '/projects' },
              { label: 'View Analytics', icon: Activity, desc: 'Check your metrics', href: '/analytics' },
              { label: 'Upgrade Plan', icon: Zap, desc: 'Unlock more features', href: '/subscriptions' },
              { label: 'Settings', icon: Clock, desc: 'Manage your account', href: '/settings' },
            ].map((action) => (
              <Link key={action.label} to={action.href}
                className="p-4 rounded-xl border border-hairline dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors group"
              >
                <action.icon className="w-5 h-5 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-ink dark:text-dark-text">{action.label}</p>
                <p className="text-xs text-mute">{action.desc}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
