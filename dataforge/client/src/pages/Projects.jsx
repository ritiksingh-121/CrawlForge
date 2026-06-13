import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { projects as projectsApi } from '../api/client';
import { Card, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ProjectForm from '../components/scraping/ProjectForm';
import Pagination from '../components/ui/Pagination';
import { PageLoading } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import TemplatesModal from '../components/scraping/TemplatesModal';
import { Plus, Globe, Search, ArrowUpRight, MoreHorizontal, Play, Trash2, Edit, Sparkles } from 'lucide-react';
import { formatDate, statusColor } from '../utils/formatters';
import Dropdown, { DropdownItem } from '../components/ui/Dropdown';
import toast from 'react-hot-toast';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await projectsApi.list({ page, limit: 12, search: searchTerm });
      setProjects(data.projects);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(search);
  };

  const handleCreate = async (form) => {
    try {
      await projectsApi.create(form);
      toast.success('Project created');
      setShowCreate(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    }
  };

  const handleEdit = async (form) => {
    try {
      await projectsApi.update(editing.id, form);
      toast.success('Project updated');
      setEditing(null);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleTemplateSelect = (template) => {
    const form = {
      name: template.name,
      targetUrl: template.url,
      fields: template.fields,
      pagination: template.pagination,
      nextPageSelector: template.nextPageSelector || '',
    };
    handleCreate(form);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its data?')) return;
    try {
      await projectsApi.delete(id);
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-display-md text-ink dark:text-dark-text">Projects</h1>
          <p className="text-sm text-mute mt-0.5">{total} total projects</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={Sparkles} onClick={() => setShowTemplates(true)}>
            Templates
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowCreate(true)}>
            New Project
          </Button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-3 bg-white dark:bg-dark-surface border border-hairline dark:border-dark-border rounded-lg text-sm text-ink dark:text-dark-text placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </form>

      {loading ? (
        <PageLoading />
      ) : projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={Globe}
            title="No projects yet"
            description="Create your first scraping project to start collecting data."
            action={() => setShowCreate(true)}
            actionLabel="Create Project"
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-white dark:bg-dark-card rounded-xl card-shadow p-5 hover:card-shadow-lg transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <Link to={`/projects/${project.id}`} className="text-sm font-semibold text-ink dark:text-dark-text hover:text-link truncate block">
                        {project.name}
                      </Link>
                      <p className="text-xs text-mute truncate">{project.targetUrl}</p>
                    </div>
                  </div>
                  <Dropdown
                    trigger={
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4 text-mute" />
                      </button>
                    }
                  >
                    <DropdownItem onClick={() => window.location.href = `/projects/${project.id}`}>
                      View Details
                    </DropdownItem>
                    <DropdownItem onClick={() => setEditing(project)} icon={Edit}>
                      Edit
                    </DropdownItem>
                    <DropdownItem onClick={() => handleDelete(project.id)} icon={Trash2} danger>
                      Delete
                    </DropdownItem>
                  </Dropdown>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={
                    project.status === 'completed' ? 'success' :
                    project.status === 'running' ? 'primary' :
                    project.status === 'failed' ? 'danger' :
                    'default'
                  } dot>
                    {project.status}
                  </Badge>
                  <span className="text-xs text-mute">{project.totalRows} rows</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-hairline dark:border-dark-border">
                  <span className="text-xs text-mute">{formatDate(project.updatedAt)}</span>
                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-link hover:text-link-deep"
                  >
                    View <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Project" size="lg">
        <ProjectForm onSubmit={handleCreate} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Project" size="lg">
        <ProjectForm onSubmit={handleEdit} initial={editing} />
      </Modal>

      <TemplatesModal open={showTemplates} onClose={() => setShowTemplates(false)} onSelect={handleTemplateSelect} />
    </div>
  );
}
