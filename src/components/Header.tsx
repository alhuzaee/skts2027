import React from 'react';
import { RefreshCw, Shield, Database, Sun, Moon, LogOut } from 'lucide-react';
import { AppUser, SystemStatusInfo } from '../types.ts';

interface HeaderProps {
  currentUser: AppUser | null;
  onSelectUserEmail: (email: string) => void;
  allUsers: AppUser[];
  statusInfo: SystemStatusInfo | null;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  secondsUntilRefresh: number;
  isEditing: boolean;
  onOpenStatusModal: () => void;
  onOpenMobileMenu: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUserEmail,
  allUsers,
  statusInfo,
  onManualRefresh,
  isRefreshing,
  secondsUntilRefresh,
  isEditing,
  onOpenStatusModal,
  onOpenMobileMenu,
  theme,
  onToggleTheme,
  onLogout
}) => {
  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-30 transition-colors shadow-xs ${
      isLight ? 'bg-white border-b border-slate-200/90 text-slate-800' : 'bg-slate-900 border-b border-slate-800 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & School title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenMobileMenu}
              className={`md:hidden p-2 rounded-xl transition-colors ${
                isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-label="Buka Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center space-x-3 cursor-pointer" onClick={onOpenStatusModal}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center font-bold text-white shadow-md tracking-wider text-xs border border-blue-500/30">
                SKTS
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className={`font-extrabold text-base sm:text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    e-PENGURUSAN SKTS 2027
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/80">
                    Sesi 2027
                  </span>
                </div>
                <p className={`text-xs hidden sm:block ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
                  SK Taman Seroja · Pengurusan Tugasan Guru Berasaskan Google Sheets
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions, Database Mode, Refresh, Theme Toggle, User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Database Mode Badge */}
            <button
              onClick={onOpenStatusModal}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                statusInfo?.isDemoMode
                  ? isLight
                    ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : isLight
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
              title="Klik untuk melihat Status Pangkalan Data & Google Sheets"
            >
              <span className={`w-2 h-2 rounded-full ${
                statusInfo?.isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <span className="hidden md:inline font-mono font-bold tracking-wide">
                {statusInfo?.isDemoMode ? 'DATA DEMO' : 'GOOGLE SHEETS'}
              </span>
              <Database className="w-3.5 h-3.5" />
            </button>

            {/* Auto Refresh & Manual Refresh Button */}
            <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl border ${
              isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-800/80 border-slate-700/60'
            }`}>
              <button
                onClick={onManualRefresh}
                disabled={isRefreshing}
                className={`flex items-center space-x-1.5 text-xs font-semibold transition-colors ${
                  isLight ? 'text-slate-700 hover:text-blue-700' : 'text-slate-300 hover:text-white'
                }`}
                title="Muat semula data sekarang"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden lg:inline text-xs">Refresh</span>
              </button>
              <span className={isLight ? 'text-slate-300 hidden sm:inline' : 'text-slate-600 hidden sm:inline'}>|</span>
              <span
                className={`text-[11px] font-mono hidden sm:inline ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
                title={isEditing ? 'Auto-refresh dijeda semasa borang diedit' : 'Auto-refresh seterusnya'}
              >
                {isEditing ? (
                  <span className="text-amber-600 font-sans font-bold">Sedang Edit</span>
                ) : (
                  `${secondsUntilRefresh}s`
                )}
              </span>
            </div>

            {/* Theme Toggle Button (Mod Cerah / Mod Gelap) */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl transition-colors border flex items-center space-x-1.5 text-xs font-semibold ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
              title={isLight ? 'Tukar kepada Mod Gelap' : 'Tukar kepada Mod Cerah'}
            >
              {isLight ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4 text-amber-300" />}
              <span className="hidden sm:inline">{isLight ? 'Cerah' : 'Gelap'}</span>
            </button>

            {/* User Profile & Quick Role Switcher */}
            <div className="relative group">
              <div className={`flex items-center space-x-2 pl-2 border-l ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-700 font-bold text-xs">
                  {currentUser?.Nama ? currentUser.Nama.charAt(0) : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <div className={`text-xs font-bold truncate max-w-[140px] ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    {currentUser?.Nama || 'Pengguna'}
                  </div>
                  <div className="flex items-center space-x-1 text-[11px]">
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                        currentUser?.Role === 'ADMIN'
                          ? isLight ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : isLight ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {currentUser?.Role || 'GUEST'}
                    </span>
                    <span className={`truncate max-w-[110px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {currentUser?.Email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dropdown for Role Switching */}
              <div className={`hidden group-hover:block absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl p-2 z-50 text-xs border ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}>
                <div className={`px-2 py-1.5 font-bold flex items-center justify-between border-b ${
                  isLight ? 'text-slate-600 border-slate-100' : 'text-slate-400 border-slate-700'
                }`}>
                  <span>Tukar Akaun Pengguna</span>
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                  {allUsers.map((u, uIdx) => (
                    <button
                      key={`${u.User_ID || 'user'}-${u.Email}-${uIdx}`}
                      onClick={() => onSelectUserEmail(u.Email)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        currentUser?.Email === u.Email
                          ? isLight ? 'bg-blue-50 text-blue-900 border border-blue-200' : 'bg-blue-600/30 text-blue-200 border border-blue-500/40'
                          : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold truncate">{u.Nama}</div>
                        <div className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {u.Email}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          u.Role === 'ADMIN'
                            ? isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-900/60 text-purple-300'
                            : isLight ? 'bg-sky-100 text-sky-700' : 'bg-sky-900/60 text-sky-300'
                        }`}
                      >
                        {u.Role}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => onSelectUserEmail('tiada-kebenaran@skts.edu.my')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between text-[11px] font-medium ${
                      isLight ? 'text-amber-700 hover:bg-amber-50' : 'text-amber-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>Uji Akaun Tanpa Kebenaran</span>
                    <span className="text-amber-500 font-bold">403</span>
                  </button>
                  <div className={`pt-1 mt-1 border-t ${isLight ? 'border-slate-100' : 'border-slate-700'}`}>
                    <button
                      onClick={onLogout}
                      className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between text-xs font-bold ${
                        isLight ? 'text-rose-700 hover:bg-rose-50' : 'text-rose-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>Log Keluar</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
