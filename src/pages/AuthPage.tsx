import React, { useState } from 'react';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface AuthPageProps {
  navigate: (path: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ navigate }) => {
  const { login, register, quickDemoLogin, user } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    navigate('/account');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 px-4 flex items-center justify-center font-bangla">
      <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <span className="font-display text-2xl font-bold tracking-widest text-stone-900">
            LUNARA FASHION
          </span>
          <p className="text-xs text-stone-500">
            {mode === 'login' ? 'আপনার লুনারা একাউন্টে সাইন ইন করুন' : 'নতুন গ্রাহক হিসেবে একাউন্ট খুলুন'}
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            লগইন (Login)
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            রেজিস্টার (Register)
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <div>
              <label className="font-bold text-stone-800 block mb-1">পূর্ণ নাম</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-800"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-stone-800 block mb-1">ইমেইল ঠিকানা</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-800"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="font-bold text-stone-800 block mb-1">মোবাইল নম্বর (১১ ডিজিট)</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-800"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-stone-800 block mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-800"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold transition-colors mt-2 shadow-sm"
          >
            {submitting ? 'প্রসেসিং...' : mode === 'login' ? 'সাইন ইন করুন' : 'একাউন্ট তৈরি করুন'}
          </button>
        </form>

        {/* 1-Click Demo Shortcut */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          <div className="flex items-center gap-1 text-[11px] text-stone-400 font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>১-ক্লিকে ডেমো লগইন:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                quickDemoLogin('CUSTOMER');
                navigate('/account');
              }}
              className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold text-center transition-colors"
            >
              Demo Customer
            </button>
            <button
              onClick={() => {
                quickDemoLogin('ADMIN');
                navigate('/admin');
              }}
              className="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl font-semibold text-center transition-colors"
            >
              Demo Admin 👑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
