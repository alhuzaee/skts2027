import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Layers,
  BarChart3,
  GraduationCap,
  Compass,
  Activity,
  CheckCheck,
  FileSpreadsheet,
  History,
  UserCheck,
  Settings,
  Server
} from 'lucide-react';
import { AppUser } from '../types.ts';

export type ActiveTab =
  | 'dashboard'
  | 'guru'
  | 'tugasan'
  | 'jawatankuasa'
  | 'analisis-beban'
  | 'analisis-gred'
  | 'analisis-opsyen'
  | 'pemantauan'
  | 'padanan'
  | 'laporan'
  | 'audit-log'
  | 'users'
  | 'config'
  | 'status-sistem';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: AppUser | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  theme?: 'light' | 'dark';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isOpenMobile,
  onCloseMobile,
  theme = 'light'
}) => {
  const isAdmin = currentUser?.Role === 'ADMIN';
  const isLight = theme === 'light';

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; adminOnly?: boolean }> = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'guru', label: 'Senarai Guru', icon: <Users className="w-4 h-4" /> },
    { id: 'tugasan', label: 'Agihan Tugasan', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'jawatankuasa', label: 'Jawatankuasa & Unit', icon: <Layers className="w-4 h-4" /> },
    { id: 'analisis-beban', label: 'Analisis Beban Tugas', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'analisis-gred', label: 'Analisis Gred', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'analisis-opsyen', label: 'Analisis Opsyen', icon: <Compass className="w-4 h-4" /> },
    { id: 'pemantauan', label: 'Modul Pemantauan', icon: <Activity className="w-4 h-4" /> },
    { id: 'padanan', label: 'Semakan Padanan Guru', icon: <CheckCheck className="w-4 h-4" /> },
    { id: 'laporan', label: 'Laporan & Eksport', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'audit-log', label: 'Audit Log', icon: <History className="w-4 h-4" />, adminOnly: true },
    { id: 'users', label: 'Pengurusan Pengguna', icon: <UserCheck className="w-4 h-4" />, adminOnly: true },
    { id: 'config', label: 'Tetapan & CONFIG', icon: <Settings className="w-4 h-4" />, adminOnly: true },
    { id: 'status-sistem', label: 'Setup Apps Script & Status', icon: <Server className="w-4 h-4" /> }
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 z-40 md:z-20 h-[calc(100vh-4rem)] w-64 border-r flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isLight ? 'bg-white border-slate-200/90 text-slate-700 shadow-xs' : 'bg-slate-900 border-slate-800 text-slate-300'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className={`px-3 pb-2 text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            Navigasi Utama
          </div>

          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;

            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`${isActive ? 'text-white' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.adminOnly && (
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    isLight ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        <div className={`p-3 border-t text-[11px] space-y-1 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/50 border-slate-800/80 text-slate-500'
        }`}>
          <div className="flex items-center justify-between">
            <span>Sekolah</span>
            <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>SK Taman Seroja</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tahun Persekolahan</span>
            <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>2027</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Pangkalan Data</span>
            <span className="text-emerald-600 font-bold font-mono">Google Sheets</span>
          </div>
        </div>
      </aside>
    </>
  );
};
