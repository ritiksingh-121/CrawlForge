import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Lock } from 'lucide-react';
import { auth } from '../api/client';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { toast.error('Invalid reset link'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await auth.resetPassword({ token, password: form.password });
      setDone(true);
      toast.success('Password reset successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-canvas-soft">
        <div className="text-center">
          <p className="text-body">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="text-link text-sm mt-2 inline-block">Request new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas-soft dark:bg-dark-bg">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-dark-card rounded-xl card-shadow-lg p-6">
          <h1 className="text-display-sm text-ink dark:text-dark-text mb-1">Reset password</h1>
          <p className="text-sm text-mute mb-5">Enter your new password</p>

          {done ? (
            <div className="text-center py-4">
              <p className="text-sm text-body mb-3">Password has been reset.</p>
              <Link to="/login">
                <Button variant="primary">Sign In</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                icon={Lock}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Input
                label="Confirm Password"
                type="password"
                icon={Lock}
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
              <Button type="submit" className="w-full" loading={loading}>
                Reset Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
