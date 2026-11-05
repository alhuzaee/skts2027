import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  ArrowUpDown,
  Edit2,
  Power,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Guru, AppUser } from '../types.ts';

interface GuruListViewProps {
  teachers: Guru[];
  currentUser: AppUser | null;
  onOpenAddGuru: () => void;
  onOpenEditGuru: (guru: Guru) => void;
  onToggleStatus: (guru: Guru) => void;
  onSelectGuruProfile: (guru: Guru) => void;
  theme?: 'light' | 'dark';
}

export const GuruListView: React.FC<GuruListViewProps> = ({
  teachers,
  currentUser,
  onOpenAddGuru,
  onOpenEditGuru,
  onToggleStatus,
  onSelectGuruProfile,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Guru>('Nama_Guru');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter & Search
  const filtered = useMemo(() => {
    return teachers.filter((g) => {
      const q = searchQuery.toLowerCase();
      return (
        g.Nama_Guru.toLowerCase().includes(q) ||
        g.Guru_ID.toLowerCase().includes(q) ||
        g.Gred.toLowerCase().includes(q) ||
        g.Opsyen.toLowerCase().includes(q)
      );
    });
  }, [teachers, searchQuery]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filtered, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage]);

  const handleSort = (field: keyof Guru) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className={`text-lg font-extrabold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Users className="w-5 h-5 text-blue-600" />
            <span>Senarai Induk Guru (MASTER_GURU)</span>
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
            Jumlah rekod: {teachers.length} orang guru berdaftar di SK Taman Seroja (Sesi 2027)
          </p>
        </div>

        <button
          onClick={onOpenAddGuru}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Guru Baharu</span>
        </button>
      </div>

      {/* Search and Quick Summary */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama guru, ID, gred, atau opsyen..."
            className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium border focus:ring-2 focus:ring-blue-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          />
        </div>

        <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Menunjukkan <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{sorted.length}</span> guru
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={`hidden md:block rounded-2xl shadow-xs overflow-hidden border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`uppercase tracking-wider font-bold border-b ${
              isLight ? 'bg-slate-100/90 text-slate-700 border-slate-200' : 'bg-slate-800/80 text-slate-300 border-slate-700'
            }`}>
              <tr>
                <th
                  onClick={() => handleSort('Guru_ID')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center space-x-1">
                    <span>Guru ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Nama_Guru')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center space-x-1">
                    <span>Nama Guru</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Gred')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-600 text-center"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Gred</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Opsyen')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center space-x-1">
                    <span>Opsyen</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th
                  onClick={() => handleSort('Bilangan_Tugasan')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-600 text-center"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Bil. Tugas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Jumlah_Pemberatan')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-600 text-center"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Jumlah Pemberatan</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Padanan</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
              {paginated.map((g, index) => (
                <tr key={`${g.Guru_ID || 'guru'}-${index}`} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">
                    {g.Guru_ID}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onSelectGuruProfile(g)}
                      className={`font-bold hover:text-blue-600 text-left transition-colors flex items-center space-x-1.5 ${
                        isLight ? 'text-slate-900' : 'text-slate-200'
                      }`}
                    >
                      <span>{g.Nama_Guru}</span>
                    </button>
                    <div className="text-[10px] text-slate-400">Mula: {g.Tarikh_Mula}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200">
                      {g.Gred}
                    </span>
                  </td>
                  <td className={`py-3 px-4 font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{g.Opsyen}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        g.Status_Aktif === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {g.Status_Aktif}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-center font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {g.Bilangan_Tugasan}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-lg text-xs ${
                        g.Jumlah_Pemberatan > 24
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : g.Jumlah_Pemberatan < 12
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {g.Jumlah_Pemberatan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        g.Status_Padanan === 'MATCHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : g.Status_Padanan === 'POSSIBLE_MATCH'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {g.Status_Padanan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => onSelectGuruProfile(g)}
                        title="Lihat Profil Guru"
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenEditGuru(g)}
                        title="Edit Data Guru"
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isLight
                            ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(g)}
                        title={g.Status_Aktif === 'Aktif' ? 'Nyahaktifkan Guru' : 'Aktifkan Guru'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          g.Status_Aktif === 'Aktif'
                            ? isLight ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200' : 'bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border-slate-700'
                            : isLight ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-800 hover:bg-emerald-900/40 text-slate-400 hover:text-emerald-400 border-slate-700'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {paginated.map((g, index) => (
          <div
            key={`${g.Guru_ID || 'guru-mob'}-${index}`}
            className={`p-4 rounded-2xl space-y-3 border shadow-xs ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{g.Nama_Guru}</div>
                <div className="text-[11px] text-slate-400 font-mono">{g.Guru_ID}</div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  g.Status_Aktif === 'Aktif'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {g.Status_Aktif}
              </span>
            </div>

            <div className={`grid grid-cols-2 gap-2 text-xs p-2.5 rounded-xl ${
              isLight ? 'bg-slate-50' : 'bg-slate-800/60'
            }`}>
              <div>
                <span className="text-slate-400 block text-[10px]">Gred & Opsyen</span>
                <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  {g.Gred} • {g.Opsyen}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tugasan / Beban</span>
                <span className="font-bold text-amber-600 font-mono">
                  {g.Bilangan_Tugasan} tugas ({g.Jumlah_Pemberatan} mata)
                </span>
              </div>
            </div>

            <div className={`flex items-center justify-end space-x-2 pt-1 border-t ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <button
                onClick={() => onSelectGuruProfile(g)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Profil</span>
              </button>
              <button
                onClick={() => onOpenEditGuru(g)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onToggleStatus(g)}
                className={`p-1.5 rounded-lg ${isLight ? 'bg-slate-100 text-slate-500 hover:text-rose-600' : 'bg-slate-800 text-slate-400 hover:text-rose-400'}`}
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className={`flex items-center justify-between text-xs pt-2 px-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
        <div>
          Halaman <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentPage}</span> daripada{' '}
          <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{totalPages}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed ${
              isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed ${
              isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
