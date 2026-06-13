import { useState } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { auth } from '../api/client';
import { User, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    setProfileLoading(true);
    try {
      const { data } = await auth.updateProfile({ name: profile.name });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 8) { toast.error('Password must be 8+ characters'); return; }
    if (pw.newPassword !== pw.confirmPassword) { toast.error('Passwords do not match'); return; }
    setPwLoading(true);
    try {
      await auth.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-display-md text-ink dark:text-dark-text">Settings</h1>
        <p className="text-sm text-mute mt-0.5">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader title="Profile" description="Update your personal information" />
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <Input
            label="Full Name"
            icon={User}
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
          <div className="opacity-60">
            <Input label="Email" icon={Mail} value={user?.email || ''} disabled />
          </div>
          <div className="pt-2">
            <Button type="submit" variant="primary" loading={profileLoading}>Save Changes</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Change Password" description="Update your password" />
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            icon={Lock}
            value={pw.currentPassword}
            onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
          />
          <Input
            label="New Password"
            type="password"
            icon={Lock}
            value={pw.newPassword}
            onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            icon={Lock}
            value={pw.confirmPassword}
            onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })}
          />
          <div className="pt-2">
            <Button type="submit" variant="primary" loading={pwLoading}>Change Password</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
