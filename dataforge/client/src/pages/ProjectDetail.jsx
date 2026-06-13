import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projects as projectsApi, scraping as scrapingApi, analytics as analyticsApi } from '../api/client';
import { Card, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ResultsTable from '../components/scraping/ResultsTable';
import EmptyState from '../components/ui/EmptyState';
import { PageLoading } from '../components/ui/Loading';
import PieChart from '../components/charts/PieChart';
import {
  ArrowLeft, Play, RotateCcw, XCircle, Clock, Globe, Database, BarChart3, Calendar, RefreshCw,
  Loader2, ChevronRight,
} from 'lucide-react';
import { formatDate, formatNumber } from '../utils/formatters';
import { joinJob, onScrapingProgress } from '../utils/socket';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrapingLoading, setScrapingLoading] = useState(false);

  const [scrapedData, setScrapedData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [dataTotal, setDataTotal] = useState(0);
  const [dataPage, setDataPage] = useState(1);

  const [progress, setProgress] = useState(null);
  const cleanupRef = useRef(null);

  const fetchProject = useCallback(async () => {
    try {
      const [projRes, analRes] = await Promise.all([
        projectsApi.get(id),
        analyticsApi.project(id),
      ]);
      setProject(projRes.data.project);
      setAnalyticsData(analRes.data.analytics);
    } catch (err) {
      console.error('[ProjectDetail] Failed to load project:', err);
      toast.error('Failed to load project');
    }
  }, [id]);

  const fetchData = useCallback(async (page = 1) => {
    setDataLoading(true);
    setDataError(null);
    try {
      const res = await projectsApi.getData(id, { page, limit: 50 });
      setScrapedData(res.data.data || []);
      setDataTotal(res.data.total || 0);
      setDataPage(page);
    } catch (err) {
      setDataError(err.message || 'Failed to load scraped data');
    } finally {
      setDataLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchProject();
      setLoading(false);
    };
    init();
  }, [fetchProject]);

  useEffect(() => {
    if (id) fetchData(1);
  }, [id, fetchData]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchProject(), fetchData(1)]);
  }, [fetchProject, fetchData]);

  const startScraping = async () => {
    setScrapingLoading(true);
    setProgress({ status: 'starting', message: 'Starting scraping job...', progress: 0 });
    try {
      const { data } = await scrapingApi.start(id);
      toast.success('Scraping started');
      setProject((prev) => ({ ...prev, status: 'running' }));

      // Join socket room for real-time progress
      const leave = joinJob(data.job.id);
      const unsubscribe = onScrapingProgress(data.job.id, (evt) => {
        if (evt.status === 'launching') {
          setProgress({ status: 'launching', message: evt.message, progress: 0 });
        } else if (evt.status === 'navigating') {
          setProgress({ status: 'navigating', message: evt.message, progress: evt.page ? Math.round((evt.page / evt.totalPages) * 100) : 0 });
        } else if (evt.status === 'scraping') {
          setProgress({
            status: 'scraping',
            message: `Scraping page ${evt.page || '?'}...`,
            page: evt.page,
            totalPages: evt.totalPages,
            recordsSoFar: evt.recordsSoFar,
            progress: evt.totalPages ? Math.round(((evt.page || 1) / evt.totalPages) * 100) : 50,
          });
        } else if (evt.type === 'progress' || evt.page !== undefined) {
          setProgress({
            status: 'scraping',
            page: evt.page,
            totalPages: evt.totalPages,
            recordsSoFar: evt.recordsSoFar,
            progress: evt.progress || 0,
            currentUrl: evt.currentUrl,
          });
        } else if (evt.type === 'complete') {
          setProgress({ status: 'completed', message: 'Scraping completed!', progress: 100 });
          setTimeout(() => setProgress(null), 3000);
        } else if (evt.error) {
          setProgress({ status: 'error', message: evt.error, progress: 0 });
        }
      });
      cleanupRef.current = () => { leave(); unsubscribe(); };

      pollJob(data.job.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start');
      setProgress(null);
    } finally {
      setScrapingLoading(false);
    }
  };

  const pollJob = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await scrapingApi.getJob(jobId);
        if (data.job.status === 'completed' || data.job.status === 'failed') {
          clearInterval(interval);
          if (cleanupRef.current) cleanupRef.current();
          await Promise.all([fetchProject(), fetchData(1)]);
          if (data.job.status === 'completed') {
            toast.success(`Scraping completed — ${data.job.metadata?.recordsScraped || ''} records`);
            setProgress(null);
          } else {
            toast.error(`Scraping failed: ${data.job.error || ''}`);
            setProgress({ status: 'error', message: data.job.error || 'Scraping failed', progress: 0 });
          }
        }
      } catch { clearInterval(interval); }
    }, 3000);
  };

  const retryJob = async (jobId) => {
    try {
      await scrapingApi.retryJob(jobId);
      toast.success('Retrying job');
      pollJob(jobId);
    } catch {
      toast.error('Failed to retry');
    }
  };

  const cancelJob = async (jobId) => {
    try {
      await scrapingApi.cancelJob(jobId);
      toast.success('Job cancelled');
      setProject((prev) => ({ ...prev, status: 'draft' }));
      setProgress(null);
    } catch {
      toast.error('Failed to cancel');
    }
  };

  const handleExport = async (format) => {
    try {
      const { data: blob } = await projectsApi.export(id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('[ProjectDetail] Export failed:', err);
      toast.error('Export failed');
    }
  };

  if (loading) return <PageLoading />;
  if (!project) return <EmptyState title="Project not found" />;

  const latestJob = project.Jobs?.[0];
  const extractedData = scrapedData.map((d) => d.data);

  const pieData = analyticsData ? {
    labels: ['Completed', 'Running', 'Failed', 'Pending'],
    datasets: [{
      data: [
        analyticsData.jobs?.filter((j) => j.status === 'completed').length || 0,
        analyticsData.jobs?.filter((j) => j.status === 'running').length || 0,
        analyticsData.jobs?.filter((j) => j.status === 'failed').length || 0,
        analyticsData.jobs?.filter((j) => j.status === 'pending').length || 0,
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 166, 35, 0.8)',
      ],
      borderWidth: 0,
    }],
  } : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link to="/projects" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface">
            <ArrowLeft className="w-4 h-4 text-mute" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-display-sm text-ink dark:text-dark-text">{project.name}</h1>
              <Badge variant={
                project.status === 'completed' ? 'success' :
                project.status === 'running' ? 'primary' :
                project.status === 'failed' ? 'danger' :
                'default'
              } dot>
                {project.status}
              </Badge>
            </div>
            <p className="text-sm text-mute flex items-center gap-1.5 mt-0.5">
              <Globe className="w-3.5 h-3.5" />
              {project.targetUrl}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            icon={Play}
            onClick={startScraping}
            loading={scrapingLoading}
            disabled={project.status === 'running'}
          >
            {project.status === 'running' ? 'Running...' : 'Start Scraping'}
          </Button>
          {latestJob?.status === 'failed' && (
            <Button variant="secondary" size="sm" icon={RotateCcw} onClick={() => retryJob(latestJob.id)}>
              Retry
            </Button>
          )}
          {project.status === 'running' && latestJob && (
            <Button variant="ghost" size="sm" icon={XCircle} onClick={() => cancelJob(latestJob.id)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Real-time scraping progress */}
      {progress && (
        <div className="bg-white dark:bg-dark-card rounded-xl card-shadow p-4 border border-hairline dark:border-dark-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {progress.status === 'error' ? (
                <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="w-3 h-3 text-red-500" />
                </div>
              ) : progress.status === 'completed' ? (
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <RefreshCw className="w-3 h-3 text-green-500" />
                </div>
              ) : (
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
              )}
              <span className="text-sm font-medium text-ink dark:text-dark-text">
                {progress.message || progress.status}
              </span>
            </div>
            {progress.progress != null && (
              <span className="text-xs font-medium text-mute">{progress.progress}%</span>
            )}
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-dark-surface rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress.status === 'error' ? 'bg-red-500' :
                progress.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, progress.progress || 0))}%` }}
            />
          </div>
          {progress.recordsSoFar != null && (
            <div className="flex items-center gap-4 mt-2 text-xs text-mute">
              <span>Records: {formatNumber(progress.recordsSoFar)}</span>
              {progress.page && <span>Page: {progress.page}{progress.totalPages ? ` / ${progress.totalPages}` : ''}</span>}
              {progress.currentUrl && <span className="truncate max-w-[200px]">{progress.currentUrl}</span>}
            </div>
          )}
          {progress.error && (
            <p className="text-xs text-red-500 mt-2">{progress.error}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Runs', value: analyticsData?.totalRuns || 0, icon: Clock },
          { label: 'Data Points', value: formatNumber(dataTotal || analyticsData?.totalDataPoints || 0), icon: Database },
          { label: 'Avg/Run', value: analyticsData?.avgDataPerRun || 0, icon: BarChart3 },
          { label: 'Success Rate', value: `${analyticsData?.successRate || 0}%`, icon: Globe },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-dark-card rounded-xl card-shadow p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="w-4 h-4 text-mute" />
              <span className="text-xs text-mute">{stat.label}</span>
            </div>
            <p className="text-xl font-semibold text-ink dark:text-dark-text">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title={`Scraped Data (${dataTotal})`}
              description={
                project.lastRunAt
                  ? `Last scraped ${formatDate(project.lastRunAt)}`
                  : undefined
              }
              action={
                <div className="flex items-center gap-2">
                  <span className="text-xs text-mute hidden sm:block">
                    {project.fields?.length > 0
                      ? `${project.fields.length} field${project.fields.length !== 1 ? 's' : ''}`
                      : 'No fields configured'}
                  </span>
                  <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleRefresh} />
                </div>
              }
            />
            <ResultsTable
              data={extractedData}
              fields={project.fields}
              loading={dataLoading}
              error={dataError}
              totalCount={dataTotal}
              onExport={handleExport}
              onRetry={() => fetchData(dataPage)}
            />
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Job Status" />
            <div className="h-64 flex items-center justify-center">
              {pieData ? <PieChart data={pieData} height={250} /> : <p className="text-sm text-mute">No job data</p>}
            </div>
          </Card>

          <Card>
            <CardHeader title="Job History" action={
              project.Jobs?.length > 5 && (
                <Link to={`/projects/${project.id}/jobs`} className="text-xs text-link hover:text-link-deep inline-flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              )
            } />
            <div className="space-y-2">
              {project.Jobs?.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b border-hairline dark:border-dark-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm text-ink dark:text-dark-text capitalize">{job.type}</p>
                    <p className="text-xs text-mute flex items-center gap-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      {formatDate(job.createdAt)}
                      {job.metadata?.duration && ` · ${job.metadata.duration}s`}
                      {job.metadata?.recordsScraped != null && ` · ${job.metadata.recordsScraped} records`}
                    </p>
                    {job.error && (
                      <p className="text-xs text-red-500 mt-0.5 truncate max-w-[180px]" title={job.error}>
                        {job.error}
                      </p>
                    )}
                  </div>
                  <Badge variant={
                    job.status === 'completed' ? 'success' :
                    job.status === 'running' ? 'primary' :
                    job.status === 'failed' ? 'danger' :
                    'default'
                  }>
                    {job.status}
                  </Badge>
                </div>
              ))}
              {(!project.Jobs || project.Jobs.length === 0) && (
                <p className="text-sm text-mute text-center py-4">No jobs yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
