import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Globe, BookOpen, Newspaper, Package, FileText, Sparkles, ArrowRight } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'quotes',
    name: 'QuotesToScrape',
    desc: 'Extract quotes and authors from quotes.toscrape.com',
    icon: Globe,
    color: 'from-indigo-500 to-purple-600',
    url: 'https://quotes.toscrape.com/',
    fields: [
      { name: 'quote', selector: '.text', attribute: '', multiple: false },
      { name: 'author', selector: '.author', attribute: '', multiple: false },
    ],
    pagination: { enabled: true, maxPages: 10, pageParam: '/page/{page}/' },
    nextPageSelector: '.next a',
  },
  {
    id: 'books',
    name: 'BooksToScrape',
    desc: 'Scrape book titles, prices, and ratings from books.toscrape.com',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600',
    url: 'https://books.toscrape.com/',
    fields: [
      { name: 'title', selector: 'h3 a', attribute: 'title', multiple: false },
      { name: 'price', selector: '.price_color', attribute: '', multiple: false },
      { name: 'rating', selector: '.star-rating', attribute: 'class', multiple: false },
    ],
    pagination: { enabled: true, maxPages: 5, pageParam: 'catalogue/page-{page}.html' },
    nextPageSelector: '.next a',
  },
  {
    id: 'hackernews',
    name: 'Hacker News',
    desc: 'Extract top stories from news.ycombinator.com',
    icon: Newspaper,
    color: 'from-orange-500 to-red-600',
    url: 'https://news.ycombinator.com/',
    fields: [
      { name: 'title', selector: '.titleline > a', attribute: '', multiple: false },
      { name: 'link', selector: '.titleline > a', attribute: 'href', multiple: false },
    ],
    pagination: { enabled: false, maxPages: 1, pageParam: '' },
    nextPageSelector: '.morelink',
  },
  {
    id: 'products',
    name: 'Product Listings',
    desc: 'Generic product scraper template',
    icon: Package,
    color: 'from-blue-500 to-cyan-600',
    url: 'https://example.com/products',
    fields: [
      { name: 'title', selector: '.product-title', attribute: '', multiple: false },
      { name: 'price', selector: '.product-price', attribute: '', multiple: false },
      { name: 'image', selector: '.product-image img', attribute: 'src', multiple: false },
    ],
    pagination: { enabled: true, maxPages: 5, pageParam: '?page={page}' },
    nextPageSelector: '.pagination .next a',
  },
  {
    id: 'blog',
    name: 'Blog Articles',
    desc: 'Extract blog post titles and summaries',
    icon: FileText,
    color: 'from-pink-500 to-rose-600',
    url: 'https://example.com/blog',
    fields: [
      { name: 'title', selector: '.post-title', attribute: '', multiple: false },
      { name: 'summary', selector: '.post-summary', attribute: '', multiple: false },
      { name: 'date', selector: '.post-date', attribute: '', multiple: false },
    ],
    pagination: { enabled: true, maxPages: 5, pageParam: '/page/{page}/' },
    nextPageSelector: '.next a',
  },
];

export default function TemplatesModal({ open, onClose, onSelect }) {
  const [selected, setSelected] = useState(null);

  const handleUse = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Quick Start Templates" size="lg">
      <p className="text-sm text-mute mb-4">
        Choose a template to pre-configure a project with fields, selectors, and pagination settings.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          const isSelected = selected?.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-hairline dark:border-dark-border hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-dark-surface'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink dark:text-dark-text">{t.name}</p>
                </div>
                {isSelected && <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-mute leading-relaxed">{t.desc}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-dark-surface text-mute">
                  {t.fields.length} fields
                </span>
                {t.pagination?.enabled && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-dark-surface text-mute">
                    Paginated
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-hairline dark:border-dark-border">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleUse} disabled={!selected} icon={ArrowRight}>
          Use Template
        </Button>
      </div>
    </Modal>
  );
}
