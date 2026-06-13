import { useState, useEffect } from 'react';
import { admin } from '../api/client';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { PageLoading } from '../components/ui/Loading';
import { CardSkeleton } from '../components/ui/Loading';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import {
  Users, FolderKanban, Activity, IndianRupee, Search, Shield,
  CheckCircle, XCircle,
} from 'lucide-react';
import { formatDate, formatCurrency, formatRelativeTime } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [jobPage, setJobPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const statsRes = await admin.getStats();
        setStats(statsRes.data);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (tab === 'users') {
      admin.getUsers({ page: userPage }).then((res) => {
        setUsers(res.data.users);
        setUserTotal(res.data.total);
        setUserTotalPages(res.data.totalPages);
      });
    }
  }, [tab, userPage]);

  useEffect(() => {
    if (tab === 'jobs') {
      admin.getJobs({ page: jobPage }).then((res) => setJobs(res.data.jobs));
    }
  }, [tab, jobPage]);

  const toggleUserStatus = async (user) => {
    try {
      await admin.updateUser(user.id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      const res = await admin.getUsers({ page: userPage });
      setUsers(res.data.users);
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return <CardSkeleton count={6} />;

  const tabs = ['overview', 'users', 'jobs'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-indigo-500" />
        <div>
          <h1 className="text-display-md text-ink dark:text-dark-text">Admin Panel</h1>
          <p className="text-sm text-mute">System management and monitoring</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-surface rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-white dark:bg-dark-card shadow-sm text-ink dark:text-dark-text' : 'text-mute hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.stats.totalUsers, icon: Users, color: 'from-indigo-500 to-purple-600' },
              { label: 'Active Users', value: stats.stats.activeUsers, icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
              { label: 'Total Projects', value: stats.stats.totalProjects, icon: FolderKanban, color: 'from-blue-500 to-cyan-600' },
              { label: 'Revenue', value: formatCurrency(stats.stats.revenue), icon: IndianRupee, color: 'from-amber-500 to-orange-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-dark-card rounded-xl card-shadow p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-mute">{s.label}</span>
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-ink dark:text-dark-text">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader title="Recent Users" />
              <div className="space-y-2">
                {stats.recentUsers?.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-hairline dark:border-dark-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-ink dark:text-dark-text">{u.name}</p>
                      <p className="text-xs text-mute">{u.email}</p>
                    </div>
                    <Badge variant="default">{u.subscriptionId}</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader title="Recent Jobs" />
              <div className="space-y-2">
                {stats.recentJobs?.map((j) => (
                  <div key={j.id} className="flex items-center justify-between py-2 border-b border-hairline dark:border-dark-border last:border-0">
                    <div>
                      <p className="text-sm text-ink dark:text-dark-text">{j.User?.name}</p>
                      <p className="text-xs text-mute">{formatRelativeTime(j.createdAt)}</p>
                    </div>
                    <Badge variant={j.status === 'completed' ? 'success' : j.status === 'running' ? 'primary' : j.status === 'failed' ? 'danger' : 'default'}>
                      {j.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {tab === 'users' && (
        <Card>
          <CardHeader title={`Users (${userTotal})`} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline dark:border-dark-border">
                  <th className="text-left py-3 px-3 text-xs font-medium text-mute uppercase">Name</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-mute uppercase">Email</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-mute uppercase">Plan</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-mute uppercase">Role</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-mute uppercase">Status</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-mute uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-hairline dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface/50">
                    <td className="py-3 px-3 font-medium text-ink dark:text-dark-text">{u.name}</td>
                    <td className="py-3 px-3 text-body">{u.email}</td>
                    <td className="py-3 px-3"><Badge variant="default">{u.subscriptionId}</Badge></td>
                    <td className="py-3 px-3">
                      <Badge variant={u.role === 'admin' ? 'purple' : 'default'}>{u.role}</Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={u.isActive ? 'success' : 'danger'} dot>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleUserStatus(u)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface text-mute hover:text-ink"
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={userPage} totalPages={userTotalPages} onPageChange={setUserPage} />
        </Card>
      )}

      {tab === 'jobs' && (
        <Card>
          <CardHeader title="Job Monitoring" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline dark:border-dark-border">
                  <th className="text-left py-3 px-3 text-xs font-medium text-mute uppercase">User</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-mute uppercase">Project</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-mute uppercase">Type</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-mute uppercase">Status</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-mute uppercase">Progress</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-mute uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-hairline dark:border-dark-border">
                    <td className="py-3 px-3 text-body">{job.User?.name || 'Unknown'}</td>
                    <td className="py-3 px-3 text-body">{job.Project?.name || 'Unknown'}</td>
                    <td className="py-3 px-3"><Badge variant="default">{job.type}</Badge></td>
                    <td className="py-3 px-3">
                      <Badge variant={
                        job.status === 'completed' ? 'success' :
                        job.status === 'running' ? 'primary' :
                        job.status === 'failed' ? 'danger' : 'default'
                      }>{job.status}</Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-dark-surface rounded-full max-w-[100px]">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${job.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-mute">{job.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-mute">{formatRelativeTime(job.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={jobPage} totalPages={Math.ceil(jobs.length / 20)} onPageChange={setJobPage} />
        </Card>
      )}
    </div>
  );
}
