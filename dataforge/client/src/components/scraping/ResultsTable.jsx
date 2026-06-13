import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Download, Search, AlertCircle, Database, RefreshCw, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';
import { truncate } from '../../utils/formatters';

function formatCellValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function renderRawJson(row) {
  try {
    return JSON.stringify(row, null, 2);
  } catch {
    return String(row);
  }
}

export default function ResultsTable({
  data = [],
  fields = [],
  loading = false,
  error = null,
  totalCount,
  onExport,
  onRetry,
  actionable = true,
}) {
  const [expanded, setExpanded] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [showColMenu, setShowColMenu] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const allHeaders = useMemo(() => {
    if (fields?.length > 0 && fields.some((f) => f.name)) {
      return fields.map((f) => f.name);
    }
    const keys = new Set();
    for (const row of data) {
      if (row && typeof row === 'object') {
        for (const key of Object.keys(row)) {
          if (key) keys.add(key);
        }
      }
    }
    return [...keys];
  }, [data, fields]);

  const headers = useMemo(() => allHeaders.filter((h) => !hiddenCols.has(h)), [allHeaders, hiddenCols]);

  const processed = useMemo(() => {
    let items = [...data];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter((row) => {
        if (!row || typeof row !== 'object') return false;
        return Object.values(row).some((v) => String(v).toLowerCase().includes(q));
      });
    }
    if (sortKey) {
      items.sort((a, b) => {
        const va = String(a?.[sortKey] ?? '').toLowerCase();
        const vb = String(b?.[sortKey] ?? '').toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [data, searchTerm, sortKey, sortDir]);

  const totalPages = Math.ceil(processed.length / pageSize);
  const pagedData = useMemo(() => processed.slice(page * pageSize, (page + 1) * pageSize), [processed, page]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleCol = (name) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="h-10 w-64 bg-gray-100 dark:bg-dark-surface rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-16 bg-gray-100 dark:bg-dark-surface rounded-lg animate-pulse" />
            <div className="h-10 w-16 bg-gray-100 dark:bg-dark-surface rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="border border-hairline dark:border-dark-border rounded-xl overflow-hidden">
          <div className="bg-gray-50 dark:bg-dark-surface px-4 py-3 border-b border-hairline dark:border-dark-border">
            <div className="flex gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-3 w-20 bg-gray-100 dark:bg-dark-surface rounded animate-pulse" />
              ))}
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-4 py-3 border-b border-hairline dark:border-dark-border last:border-0">
              <div className="flex gap-8">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-3 w-24 bg-gray-100 dark:bg-dark-surface rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-sm font-medium text-ink dark:text-dark-text mb-1">Failed to load data</p>
        <p className="text-xs text-mute mb-4">{error}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute pointer-events-none" />
          <input
            type="text"
            placeholder="Search data..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            className="w-full h-10 pl-10 pr-3 bg-white dark:bg-dark-surface border border-hairline dark:border-dark-border rounded-lg text-sm text-ink dark:text-dark-text placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Button variant="secondary" size="sm" icon={SlidersHorizontal} onClick={() => setShowColMenu(!showColMenu)}>
              Columns
            </Button>
            {showColMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-dark-card border border-hairline dark:border-dark-border rounded-lg shadow-lg p-2 space-y-1">
                <p className="text-xs font-medium text-mute px-2 py-1">Toggle Columns</p>
                {allHeaders.map((name) => (
                  <label key={name} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-dark-surface cursor-pointer text-sm text-ink dark:text-dark-text">
                    <input
                      type="checkbox"
                      checked={!hiddenCols.has(name)}
                      onChange={() => toggleCol(name)}
                      className="rounded border-hairline text-indigo-600 focus:ring-indigo-500"
                    />
                    {name}
                  </label>
                ))}
              </div>
            )}
          </div>
          {actionable && onExport && (
            <>
              <Button variant="secondary" size="sm" icon={Download} onClick={() => onExport('csv')}>
                CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onExport('xlsx')}>
                Excel
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onExport('json')}>
                JSON
              </Button>
            </>
          )}
        </div>
      </div>

      {pagedData.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center mx-auto mb-4">
            <Database className="w-7 h-7 text-mute" />
          </div>
          <p className="text-sm font-medium text-ink dark:text-dark-text mb-1">
            {searchTerm ? 'No results match your search.' : 'No scraped data yet'}
          </p>
          <p className="text-xs text-mute max-w-xs mx-auto">
            {searchTerm ? 'Try a different search term.' : 'Run a scraping job to collect data from your target website.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden rounded-xl border border-hairline dark:border-dark-border">
                <table className="min-w-full divide-y divide-hairline dark:divide-dark-border">
                  <thead className="bg-gray-50 dark:bg-dark-surface">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-mute uppercase tracking-wider w-10" />
                      {headers.map((name) => (
                        <th
                          key={name}
                          className="px-4 py-3 text-left text-xs font-medium text-mute uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-ink dark:hover:text-dark-text"
                          onClick={() => handleSort(name)}
                        >
                          <div className="flex items-center gap-1.5">
                            {name}
                            {sortKey === name ? (
                              sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-30" />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-card divide-y divide-hairline dark:divide-dark-border">
                    {pagedData.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors">
                        <td className="px-4 py-3 align-top">
                          <button
                            onClick={() => setExpanded(expanded === page * pageSize + i ? null : page * pageSize + i)}
                            className="p-1 text-mute hover:text-ink transition-colors rounded hover:bg-gray-100 dark:hover:bg-dark-surface"
                            aria-label={expanded === page * pageSize + i ? 'Collapse' : 'Expand'}
                          >
                            {expanded === page * pageSize + i
                              ? <ChevronUp className="w-4 h-4" />
                              : <ChevronDown className="w-4 h-4" />
                            }
                          </button>
                        </td>
                        {headers.map((name) => {
                          const val = formatCellValue(row?.[name]);
                          return (
                            <td key={name} className="px-4 py-3 text-sm text-body dark:text-dark-text max-w-[200px]">
                              <div className="truncate" title={val}>
                                {expanded === page * pageSize + i ? val || '—' : truncate(val, 40) || '—'}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-mute flex-wrap gap-2">
            <span>
              Showing {processed.length > 0 ? page * pageSize + 1 : 0}-{Math.min((page + 1) * pageSize, processed.length)} of {processed.length}{totalCount != null && totalCount !== processed.length ? ` (filtered from ${totalCount})` : ''} results
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 rounded border border-hairline dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface disabled:opacity-40 disabled:cursor-not-allowed text-ink dark:text-dark-text"
              >
                Prev
              </button>
              <span className="text-ink dark:text-dark-text font-medium">{page + 1}/{Math.max(1, totalPages)}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded border border-hairline dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface disabled:opacity-40 disabled:cursor-not-allowed text-ink dark:text-dark-text"
              >
                Next
              </button>
            </div>
          </div>

          {expanded != null && data[expanded] && (
            <div className="bg-gray-50 dark:bg-dark-surface rounded-lg border border-hairline dark:border-dark-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-hairline dark:border-dark-border">
                <span className="text-xs font-medium text-mute uppercase tracking-wider">Raw JSON</span>
                <button
                  onClick={() => navigator.clipboard.writeText(renderRawJson(data[expanded]))}
                  className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-body dark:text-dark-text overflow-x-auto max-h-64 overflow-y-auto whitespace-pre leading-relaxed">
                {renderRawJson(data[expanded])}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
