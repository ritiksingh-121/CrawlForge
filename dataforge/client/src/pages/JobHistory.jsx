import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { scraping as scrapingApi } from '../api/client';
import { Card, CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { PageLoading } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Download, Calendar } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function JobHistory() {
  const { id: projectId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await scrapingApi.getJobs({ page, limit: 20, projectId });
      setJobs(data.jobs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [page, projectId]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-mute" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to={`/projects/${projectId}`} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface">
          <ArrowLeft className="w-4 h-4 text-mute" />
        </Link>
        <div>
          <h1 className="text-display-md text-ink dark:text-dark-text">Job History</h1>
          <p className="text-sm text-mute mt-0.5">{total} total jobs</p>
        </div>
      </div>

      {loading ? (
        <PageLoading />
      ) : jobs.length === 0 ? (
        <Card>
          <EmptyState title="No jobs yet" description="Run a scraping job to see history here." />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-hairline dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-surface">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-mute uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-mute uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-mute uppercase">Started</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-mute uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-mute uppercase">Records</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-mute uppercase">Pages</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-mute uppercase">Error</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-hairline dark:divide-dark-border">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <Badge variant={
                          job.status === 'completed' ? 'success' :
                          job.status === 'failed' ? 'danger' :
                          job.status === 'running' ? 'primary' :
                          'default'
                        }>
                          {job.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink dark:text-dark-text capitalize">{job.type}</td>
                    <td className="px-4 py-3 text-sm text-body dark:text-dark-text whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-mute" />
                        {formatDate(job.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-body dark:text-dark-text">
                      {job.metadata?.duration != null ? `${job.metadata.duration}s` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-body dark:text-dark-text">
                      {job.metadata?.recordsScraped != null ? job.metadata.recordsScraped : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-body dark:text-dark-text">
                      {job.pagesScraped ? `${job.pagesScraped}/${job.totalPages || '?'}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-500 max-w-[200px] truncate" title={job.error || ''}>
                      {job.error || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </Card>
      )}
    </div>
  );
}
