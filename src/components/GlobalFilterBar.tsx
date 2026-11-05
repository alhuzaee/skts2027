import React from 'react';
import { Filter, RotateCcw, Download } from 'lucide-react';
import { GlobalFilterState, ConfigData, Guru } from '../types.ts';

interface GlobalFilterBarProps {
  filters: GlobalFilterState;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  config: ConfigData | null;
  teachers: Guru[];
  onResetFilters: () => void;
  onExportClick: () => void;
  availableCommittees: string[];
  theme?: 'light' | 'dark';
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  filters,
  setFilters,
  config,
  teachers,
  onResetFilters,
  onExportClick,
  availableCommittees,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const activeCount = Object.values(filters).filter((v) => v !== '').length;

  const handleFilterChange = (key: keyof GlobalFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`rounded-2xl p-4 mb-6 shadow-xs border transition-colors ${
      isLight ? 'bg-white border-slate-200/90' : 'bg-slate-900/90 border-slate-800'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-600/10 text-blue-700">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h2 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? 'text-slate-800' : 'text-slate-200'
            }`}>
              Penapis Global
              {activeCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
                  {activeCount} Aktif
                </span>
              )}
            </h2>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Menyelaraskan 12 KPI, 10 carta visual, dan jadual data secara automatik
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeCount > 0 && (
            <button
              onClick={onResetFilters}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Reset Filter</span>
            </button>
          )}

          <button
            onClick={onExportClick}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Eksport Laporan</span>
          </button>
        </div>
      </div>

      {/* Grid of Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {/* 1. Guru Filter */}
        <div>
          <label className={`block text-[10px] font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Guru</label>
          <select
            value={filters.namaGuru}
            onChange={(e) => handleFilterChange('namaGuru', e.target.value)}
            className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-medium border focus:ring-2 focus:ring-blue-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="">Semua Guru</option>
            {teachers.map((g, idx) => (
              <option key={`${g.Guru_ID}-${idx}`} value={g.Nama_Guru}>
                {g.Nama_Guru}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Gred Filter */}
        <div>
          <label className={`block text-[10px] font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Gred</label>
          <select
            value={filters.gred}
            onChange={(e) => handleFilterChange('gred', e.target.value)}
            className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-medium border focus:ring-2 focus:ring-blue-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="">Semua Gred</option>
            {config?.GRED.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Opsyen Filter */}
        <div>
          <label className={`block text-[10px] font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Opsyen</label>
          <select
            value={filters.opsyen}
            onChange={(e) => handleFilterChange('opsyen', e.target.value)}
            className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-medium border focus:ring-2 focus:ring-blue-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="">Semua Opsyen</option>
            {config?.OPSYEN.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Bidang Filter */}
        <div>
          <label className={`block text-[10px] font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Bidang</label>
          <select
            value={filters.bidang}
            onChange={(e) => handleFilterChange('bidang', e.target.value)}
            className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-medium border focus:ring-2 focus:ring-blue-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="">Semua Bidang</option>
            {config?.BIDANG.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Kluster Filter */}
        <div>
          <label className={`block text-[10px] font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Kluster</label>
          <select
            value={filters.kluster}
            onChange={(e) => handleFilterChange('kluster', e.target.value)}
            className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-medium border focus:ring-2 focus:ring-blue-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="">Semua Kluster</option>
            {config?.KLUSTER.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Jawatankuasa Filter */}
        <div>
          <label className={`block text-[10px] font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Jawatankuasa</label>
          <select
            value={filters.jawatankuasa}
            onChange={(e) => handleFilterChange('jawatankuasa', e.target.value)}
            className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-medium border focus:ring-2 focus:ring-blue-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="">Semua Jawatankuasa</option>
            {availableCommittees.map((c, idx) => (
              <option key={`${c}-${idx}`} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 7. Status Filter */}
        <div>
          <label className={`block text-[10px] font-bold mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-medium border focus:ring-2 focus:ring-blue-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="">Semua Status</option>
            {config?.STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
