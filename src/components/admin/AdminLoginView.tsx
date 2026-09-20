import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, Store, AlertCircle } from 'lucide-react';
import { adminLoginApi } from '../../lib/api.js';
import { User } from '../../types.js';

interface AdminLoginViewProps {
  onLoginSuccess: (user: User) => void;
  onBackToStore: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await adminLoginApi(email, password);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@lunarafashion.com');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-stone-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-400 text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-white tracking-wide">
            LUNARA FASHION
          </h2>
          <p className="mt-2 text-sm text-stone-400">
            Administrative Control Panel & Store Management
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-stone-800/80 border border-stone-700/60 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@lunarafashion.com"
                  className="w-full pl-10 pr-4 py-3 bg-stone-900/90 border border-stone-700 rounded-xl text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-stone-900/90 border border-stone-700 rounded-xl text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill for fast verification */}
          <div className="mt-6 pt-6 border-t border-stone-700/60">
            <div className="bg-stone-900/80 rounded-xl p-3 border border-stone-700/40 flex items-center justify-between text-xs text-stone-400">
              <div>
                <p className="font-semibold text-stone-300">Initial Setup Credentials:</p>
                <p className="text-stone-400">admin@lunarafashion.com / admin123</p>
              </div>
              <button
                type="button"
                onClick={handleDemoFill}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
