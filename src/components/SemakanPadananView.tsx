import React, { useState } from 'react';
import { CheckCheck, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { Guru, AppUser } from '../types.ts';

interface SemakanPadananViewProps {
  teachers: Guru[];
  currentUser: AppUser | null;
  onUpdateStatusPadanan: (guru: Guru, newStatus: 'MATCHED' | 'UNMATCHED' | 'POSSIBLE_MATCH') => void;
  onSelectGuruProfile: (guru: Guru) => void;
  theme?: 'light' | 'dark';
}

export const SemakanPadananView: React.FC<SemakanPadananViewProps> = ({
  teachers,
  currentUser,
  onUpdateStatusPadanan,
  onSelectGuruProfile,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNMATCHED' | 'POSSIBLE_MATCH' | 'MATCHED'>(
    'ALL'
  );
  const [search, setSearch] = useState('');

  const filteredTeachers = teachers.filter((g) => {
    const matchStatus = activeFilter === 'ALL' || g.Status_Padanan === activeFilter;
    const matchSearch =
      g.Nama_Guru.toLowerCase().includes(search.toLowerCase()) ||
      g.Guru_ID.toLowerCase().includes(search.toLowerCase()) ||
      g.Gred.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const unmatchedCount = teachers.filter((g) => g.Status_Padanan === 'UNMATCHED').length;
  const possibleCount = teachers.filter((g) => g.Status_Padanan === 'POSSIBLE_MATCH').length;
  const matchedCount = teachers.filter((g) => g.Status_Padanan === 'MATCHED').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <CheckCheck className="w-5 h-5 text-emerald-600" />
          <span>Semakan Padanan Data Guru (Status_Padanan)</span>
        </h2>
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Semakan integriti data bagi mengesahkan padanan rekod guru mentah dan mengelakkan fuzzy merge yang salah
        </p>
      </div>

      {/* Warning Box */}
      <div className={`p-4 rounded-2xl flex items-start space-x-3 text-xs border ${
        isLight
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
      }`}>
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className={`font-bold text-sm ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>Prinsip Integriti Padanan Data</div>
          <p className={`mt-0.5 leading-relaxed ${isLight ? 'text-amber-800' : 'text-slate-300'}`}>
            Sistem tidak melakukan penggabungan data secara kabur (fuzzy merge) tanpa kebenaran. Setiap rekod yang
            tidak sepadan (UNMATCHED / POSSIBLE_MATCH) memerlukan pengesahan manual oleh Pentadbir Sistem sebelum
            dipadankan.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : isLight
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Semua ({teachers.length})
          </button>
          <button
            onClick={() => setActiveFilter('UNMATCHED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              activeFilter === 'UNMATCHED'
                ? 'bg-rose-600 text-white shadow-xs'
                : isLight
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
            }`}
          >
            <span>UNMATCHED</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeFilter === 'UNMATCHED'
                ? 'bg-white/20 text-white'
                : isLight
                ? 'bg-rose-200 text-rose-900 font-bold'
                : 'bg-rose-950 text-rose-200'
            }`}>
              {unmatchedCount}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter('POSSIBLE_MATCH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              activeFilter === 'POSSIBLE_MATCH'
                ? 'bg-amber-600 text-white shadow-xs'
                : isLight
                ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
            }`}
          >
            <span>POSSIBLE_MATCH</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeFilter === 'POSSIBLE_MATCH'
                ? 'bg-white/20 text-white'
                : isLight
                ? 'bg-amber-200 text-amber-900 font-bold'
                : 'bg-amber-950 text-amber-200'
            }`}>
              {possibleCount}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter('MATCHED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              activeFilter === 'MATCHED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isLight
                ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
            }`}
          >
            <span>MATCHED</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeFilter === 'MATCHED'
                ? 'bg-white/20 text-white'
                : isLight
                ? 'bg-emerald-200 text-emerald-900 font-bold'
                : 'bg-emerald-950 text-emerald-200'
            }`}>
              {matchedCount}
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari rekod..."
            className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs border transition-colors focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 placeholder:text-slate-400'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`border rounded-2xl shadow-xs overflow-hidden transition-colors ${
        isLight ? 'bg-white border-slate-200/90' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`uppercase tracking-wider font-semibold border-b ${
              isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-800/80 text-slate-300 border-slate-700'
            }`}>
              <tr>
                <th className="py-3 px-4">Guru ID</th>
                <th className="py-3 px-4">Nama Guru Dalam Rekod</th>
                <th className="py-3 px-4">Gred & Opsyen</th>
                <th className="py-3 px-4 text-center">Tugasan Semasa</th>
                <th className="py-3 px-4 text-center">Status Padanan</th>
                <th className="py-3 px-4 text-right">Tindakan Pengesahan</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
              {filteredTeachers.map((g, index) => (
                <tr key={`${g.Guru_ID || 'guru'}-${index}`} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                  <td className={`py-3.5 px-4 font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{g.Guru_ID}</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onSelectGuruProfile(g)}
                      className={`font-bold transition-colors ${isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-100 hover:text-blue-400'}`}
                    >
                      {g.Nama_Guru}
                    </button>
                    <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Mula: {g.Tarikh_Mula}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-semibold ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>{g.Gred}</span> •{' '}
                    <span className={isLight ? 'text-slate-600' : 'text-slate-300'}>{g.Opsyen}</span>
                  </td>
                  <td className={`py-3.5 px-4 text-center font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                    {g.Bilangan_Tugasan} tugas
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        g.Status_Padanan === 'MATCHED'
                          ? isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : g.Status_Padanan === 'POSSIBLE_MATCH'
                          ? isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isLight ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {g.Status_Padanan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {g.Status_Padanan !== 'MATCHED' && (
                        <button
                          onClick={() => onUpdateStatusPadanan(g, 'MATCHED')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1 ${
                            isLight
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border-emerald-300'
                              : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white border-emerald-500/30'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sahkan MATCHED</span>
                        </button>
                      )}
                      {g.Status_Padanan === 'MATCHED' && (
                        <button
                          onClick={() => onUpdateStatusPadanan(g, 'POSSIBLE_MATCH')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                            isLight ? 'bg-slate-100 text-slate-600 hover:text-amber-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:text-amber-400'
                          }`}
                        >
                          Tandakan Semak
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
