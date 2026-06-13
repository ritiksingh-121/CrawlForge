import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import FieldSelector from './FieldSelector';
import { Globe, ChevronDown } from 'lucide-react';

const scheduleOptions = [
  { value: '', label: 'No schedule' },
  { value: 'every_5_min', label: 'Every 5 minutes' },
  { value: 'every_15_min', label: 'Every 15 minutes' },
  { value: 'hourly', label: 'Every hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function ProjectForm({ onSubmit, initial, loading }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    targetUrl: initial?.targetUrl || '',
    fields: initial?.fields || [],
    schedule: initial?.schedule || '',
    scheduleEnabled: initial?.scheduleEnabled || false,
    pagination: initial?.pagination || { enabled: false, maxPages: 1, pageParam: '{page}' },
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Project name is required';
    if (!form.targetUrl.trim()) errs.targetUrl = 'Target URL is required';
    else {
      try { new URL(form.targetUrl); } catch { errs.targetUrl = 'Invalid URL format'; }
    }
    if (form.fields.length === 0) errs.fields = 'Add at least one data field';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Project Name"
          placeholder="My Scraping Project"
          icon={Globe}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
        />
        <Input
          label="Target URL"
          placeholder="https://example.com/products"
          value={form.targetUrl}
          onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
          error={errors.targetUrl}
        />
      </div>

      <FieldSelector
        fields={form.fields}
        onChange={(fields) => setForm({ ...form, fields })}
      />
      {errors.fields && <p className="text-xs text-error">{errors.fields}</p>}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pagination"
            checked={form.pagination.enabled}
            onChange={(e) => setForm({
              ...form,
              pagination: { ...form.pagination, enabled: e.target.checked },
            })}
            className="rounded border-hairline text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="pagination" className="text-sm font-medium text-body dark:text-dark-text">
            Enable Pagination
          </label>
        </div>

        {form.pagination.enabled && (
          <div className="flex gap-4 pl-6">
            <Input
              label="Max Pages"
              type="number"
              value={form.pagination.maxPages}
              onChange={(e) => setForm({
                ...form,
                pagination: { ...form.pagination, maxPages: parseInt(e.target.value) || 1 },
              })}
            />
            <Input
              label="Page Parameter"
              value={form.pagination.pageParam}
              onChange={(e) => setForm({
                ...form,
                pagination: { ...form.pagination, pageParam: e.target.value },
              })}
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="schedule"
            checked={form.scheduleEnabled}
            onChange={(e) => setForm({ ...form, scheduleEnabled: e.target.checked })}
            className="rounded border-hairline text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="schedule" className="text-sm font-medium text-body dark:text-dark-text">
            Schedule Recurring Scraping
          </label>
        </div>

        {form.scheduleEnabled && (
          <div className="pl-6">
            <select
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
              className="w-full h-10 px-3 bg-white dark:bg-dark-surface border border-hairline dark:border-dark-border rounded-lg text-sm text-ink dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {scheduleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" loading={loading}>
          {initial ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
