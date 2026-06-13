import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/ui/Logo';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('All fields required'); return; }
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas-soft dark:bg-dark-bg">
      <div className="absolute inset-0 mesh-gradient-hero pointer-events-none" />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Logo size="md" />
          </div>
          <h1 className="text-display-md text-ink dark:text-dark-text">Welcome back</h1>
          <p className="text-sm text-mute mt-1">Sign in to your CrawlForge account</p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl card-shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                icon={Lock}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-[38px] text-mute hover:text-ink"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-error bg-error-soft rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-link hover:text-link-deep">
              Forgot your password?
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-mute mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-link font-medium hover:text-link-deep">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
