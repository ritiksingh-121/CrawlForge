import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu, X, Bell, LogOut, User, Settings, CreditCard, Moon, Sun,
} from 'lucide-react';
import Dropdown, { DropdownItem } from '../ui/Dropdown';
import Badge from '../ui/Badge';
import Logo from '../ui/Logo';

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/projects', label: 'Projects' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/subscriptions', label: 'Pricing' },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-hairline dark:border-dark-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/dashboard">
            <Logo />
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${location.pathname === link.path
                  ? 'text-ink dark:text-dark-text bg-gray-100 dark:bg-dark-surface'
                  : 'text-body hover:text-ink dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface'
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors text-mute"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors text-mute relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
          </button>

          <Dropdown
            trigger={
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-ink dark:text-dark-text">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>
            }
          >
            <div className="px-3.5 py-2 border-b border-hairline dark:border-dark-border">
              <p className="text-sm font-medium text-ink dark:text-dark-text">{user?.name}</p>
              <p className="text-xs text-mute">{user?.email}</p>
              {user?.role === 'admin' && <Badge variant="purple" className="mt-1">Admin</Badge>}
            </div>
            <DropdownItem icon={User} onClick={() => window.location.href = '/settings'}>Profile</DropdownItem>
            <DropdownItem icon={Settings} onClick={() => window.location.href = '/settings'}>Settings</DropdownItem>
            <DropdownItem icon={CreditCard} onClick={() => window.location.href = '/billing'}>Billing</DropdownItem>
            {user?.role === 'admin' && (
              <DropdownItem onClick={() => window.location.href = '/admin'}>Admin Panel</DropdownItem>
            )}
            <div className="border-t border-hairline dark:border-dark-border my-1" />
            <DropdownItem icon={LogOut} danger onClick={logout}>Sign Out</DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
