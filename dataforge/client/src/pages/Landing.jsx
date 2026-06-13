import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Zap, Globe, BarChart3, Clock, Download, Github,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

export default function Landing() {
  return (
    <div className="min-h-screen bg-canvas dark:bg-dark-bg">
      <header className="sticky top-0 z-50 h-16 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-hairline dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-full flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient-hero pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-20 lg:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-6">
              <Zap className="w-3.5 h-3.5" /> Enterprise-Grade Web Scraping
            </div>
            <h1 className="text-display-xl text-ink dark:text-dark-text mb-4">
              Turn websites into structured data
            </h1>
            <p className="text-lg text-body dark:text-dark-text-muted mb-8 max-w-xl mx-auto leading-relaxed">
              Crawl, extract, and forage web data at scale. No code required.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/register">
                <Button variant="primary" size="xl">
                  Start Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="xl">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-canvas-soft dark:bg-dark-surface/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-display-lg text-ink dark:text-dark-text mb-3">Everything you need to scrape the web</h2>
            <p className="text-body text-mute max-w-xl mx-auto">Powerful features designed for developers and data teams</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Globe, title: 'CSS Selectors', desc: 'Precise data extraction using CSS selector syntax. Supports complex nested selectors.' },
              { icon: Clock, title: 'Scheduled Scraping', desc: 'Automate data collection with cron-based scheduling. Set it and forget it.' },
              { icon: Download, title: 'Multiple Export Formats', desc: 'Export data as CSV, JSON, XLSX, or XML. Integrate with any pipeline.' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track job performance, success rates, and data volume with rich charts.' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access control, encrypted data storage, and audit logging.' },
              { icon: Zap, title: 'High Performance', desc: 'Built on Playwright for reliable rendering of modern JavaScript websites.' },
            ].map((feat) => (
              <div key={feat.title} className="bg-white dark:bg-dark-card rounded-xl p-6 card-shadow hover:card-shadow-lg transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-ink dark:text-dark-text mb-1.5">{feat.title}</h3>
                <p className="text-sm text-body dark:text-dark-text-muted leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-ink text-white">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-display-lg mb-4">Ready to start scraping?</h2>
            <p className="text-lg text-white/70 mb-8 max-w-lg mx-auto">Join thousands of teams using CrawlForge to power their data pipelines.</p>
          <Link to="/register">
            <Button variant="secondary" size="xl">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-hairline dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="text-sm text-mute">© 2026 CrawlForge. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-mute">
            <a href="#" className="hover:text-ink transition-colors">Privacy</a>
            <a href="#" className="hover:text-ink transition-colors">Terms</a>
            <a href="#" className="hover:text-ink transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
