import React, { useState } from 'react';
import { LogIn, Mail, School, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
  isChecking: boolean;
  error: string | null;
  theme: 'light' | 'dark';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isChecking, error }) => {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setLocalError('Sila masukkan alamat e-mel yang sah.');
      return;
    }
    setLocalError(null);
    onLogin(trimmed);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {/* Branding */}
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <School className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">e-PENGURUSAN SKTS 2027</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sistem Pengurusan Tugasan SK Taman Seroja.
              <br />
              Sila log masuk dengan e-mel MOE anda.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-300 mb-2">
                Alamat E-mel
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  placeholder="nama@moe-dl.edu.my"
                  disabled={isChecking}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {(localError || error) && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-xs font-semibold text-rose-300">
                {localError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={isChecking}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyemak... </span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log Masuk</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-slate-500 leading-relaxed">
            Akses adalah terhad kepada pengguna berdaftar dalam helaian USERS sistem ini sahaja.
          </p>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-600">
          e-PENGURUSAN SKTS 2027 · SK Taman Seroja
        </p>
      </div>
    </div>
  );
};
