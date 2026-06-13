import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, BarChart3, CreditCard, Receipt,
  Settings, Shield, Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: Globe },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/subscriptions', label: 'Pricing', icon: CreditCard },
  { to: '/billing', label: 'Billing', icon: Receipt },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { to: '/admin', label: 'Admin', icon: Shield },
];

export default function Sidebar({ open, setOpen }) {
  const { user } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)]
          w-60 bg-white dark:bg-dark-bg border-r border-hairline dark:border-dark-border
          transition-transform duration-200 ease-in-out overflow-y-auto
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="p-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-ink dark:text-dark-text bg-gray-100 dark:bg-dark-surface'
                    : 'text-body hover:text-ink dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface'
                }`
              }
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="pt-3 pb-1">
                <p className="px-3 text-xs font-medium text-mute uppercase tracking-wider">Admin</p>
              </div>
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-ink dark:text-dark-text bg-gray-100 dark:bg-dark-surface'
                        : 'text-body hover:text-ink dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface'
                    }`
                  }
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
