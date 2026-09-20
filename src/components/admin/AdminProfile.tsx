import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Key, 
  Save, 
  Lock, 
  Mail, 
  Clock, 
  User,
  CheckCircle2
} from 'lucide-react';
import { updateAdminProfileApi, changeAdminPasswordApi } from '../../lib/api.js';

interface AdminProfileProps {
  adminUser: any;
  onRefresh: () => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({
  adminUser,
  onRefresh,
  showToast
}) => {
  const [name, setName] = useState(adminUser?.name || 'Store Administrator');
  const [email, setEmail] = useState(adminUser?.email || 'admin@lunarafashion.com');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateAdminProfileApi(name, email);
      showToast('Admin profile updated successfully');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      await changeAdminPasswordApi(currentPassword, newPassword);
      showToast('Admin password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-serif-luxury font-bold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span>Admin Security & Profile</span>
          </h2>
          <p className="text-xs text-stone-500">
            Manage authenticated store manager credentials, security keys & session privileges
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Role: Super Admin
          </span>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white font-serif-luxury text-2xl font-bold flex items-center justify-center shadow-md">
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-base font-bold text-stone-900">{name}</h3>
          <p className="text-xs text-stone-500">{email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Active Session</span>
            </span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Authenticated</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change Name & Email */}
        <form onSubmit={handleUpdateProfile} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <User className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold text-stone-900">Admin Account Info</h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Admin Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {savingProfile ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Key className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold text-stone-900">Change Admin Password</h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {savingPassword ? 'Changing Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
