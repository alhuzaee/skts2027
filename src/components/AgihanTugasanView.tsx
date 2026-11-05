import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Tugasan, AppUser } from '../types.ts';

interface AgihanTugasanViewProps {
  tasks: (Tugasan & { Gred?: string; Opsyen?: string })[];
  currentUser: AppUser | null;
  onOpenAddTask: () => void;
  onOpenEditTask: (task: Tugasan) => void;
  onOpenDeleteConfirm: (task: Tugasan) => void;
  theme?: 'light' | 'dark';
}

export const AgihanTugasanView: React.FC<AgihanTugasanViewProps> = ({
  tasks,
  currentUser,
  onOpenAddTask,
  onOpenEditTask,
  onOpenDeleteConfirm,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Tugasan>('Record_ID');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const q = searchQuery.toLowerCase();
      return (
        t.Nama_Guru.toLowerCase().includes(q) ||
        t.Record_ID.toLowerCase().includes(q) ||
        t.Jawatankuasa_Unit.toLowerCase().includes(q) ||
        t.Jawatan_Tugasan.toLowerCase().includes(q) ||
        t.Bidang.toLowerCase().includes(q) ||
        (t.Skop_Kelas_Tarikh && t.Skop_Kelas_Tarikh.toLowerCase().includes(q))
      );
    });
  }, [tasks, searchQuery]);

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

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage]);

  const handleSort = (field: keyof Tugasan) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className={`text-lg font-extrabold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <span>Modul Agihan Tugasan (AGIHAN_TUGAS)</span>
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
            Jumlah rekod: {tasks.length} tugasan berwajaran dengan padanan automatik Gred & Opsyen
          </p>
        </div>

        <button
          onClick={onOpenAddTask}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugasan Baharu</span>
        </button>
      </div>

      {/* Search and Summary */}
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
            placeholder="Cari tugasan, guru, jawatankuasa, atau bidang..."
            className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium border focus:ring-2 focus:ring-indigo-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          />
        </div>

        <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Menunjukkan <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{sorted.length}</span> rekod tugasan
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={`hidden lg:block rounded-2xl shadow-xs overflow-hidden border ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`uppercase tracking-wider font-bold border-b ${
              isLight ? 'bg-slate-100/90 text-slate-700 border-slate-200' : 'bg-slate-800/80 text-slate-300 border-slate-700'
            }`}>
              <tr>
                <th onClick={() => handleSort('Record_ID')} className="py-3 px-3.5 cursor-pointer hover:text-indigo-600">
                  <div className="flex items-center space-x-1">
                    <span>Record ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('Nama_Guru')} className="py-3 px-3.5 cursor-pointer hover:text-indigo-600">
                  <div className="flex items-center space-x-1">
                    <span>Nama Guru</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center">Gred & Opsyen</th>
                <th onClick={() => handleSort('Bidang')} className="py-3 px-3.5 cursor-pointer hover:text-indigo-600">
                  <div className="flex items-center space-x-1">
                    <span>Bidang & Kluster</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('Jawatankuasa_Unit')} className="py-3 px-3.5 cursor-pointer hover:text-indigo-600">
                  <div className="flex items-center space-x-1">
                    <span>Jawatankuasa / Unit</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('Jawatan_Tugasan')} className="py-3 px-3.5 cursor-pointer hover:text-indigo-600">
                  <div className="flex items-center space-x-1">
                    <span>Jawatan / Skop</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('Pemberatan')} className="py-3 px-3.5 cursor-pointer hover:text-indigo-600 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Pemberatan</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Kemajuan</th>
                <th className="py-3 px-3.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
              {paginated.map((t, index) => (
                <tr key={`${t.Record_ID || 'task'}-${index}`} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-500">
                    {t.Record_ID}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{t.Nama_Guru}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{t.Guru_ID}</div>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <div className="font-bold text-blue-600">{t.Gred || 'DG41'}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[120px] mx-auto">
                      {t.Opsyen || 'Umum'}
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{t.Bidang}</div>
                    <div
                      className={`text-[10px] font-bold ${
                        t.Kluster === 'Belum Dipetakan'
                          ? isLight ? 'text-amber-700' : 'text-amber-400'
                          : isLight ? 'text-emerald-700' : 'text-emerald-400'
                      }`}
                    >
                      {t.Kluster}
                    </div>
                  </td>
                  <td className={`py-3 px-3.5 font-medium max-w-[180px] ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    <div className="truncate" title={t.Jawatankuasa_Unit}>
                      {t.Jawatankuasa_Unit}
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{t.Jawatan_Tugasan}</div>
                    {t.Skop_Kelas_Tarikh && (
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={t.Skop_Kelas_Tarikh}>
                        {t.Skop_Kelas_Tarikh}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {t.Pemberatan}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                        t.Status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : t.Status === 'Dalam Pelaksanaan'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : t.Status === 'Belum Mula'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : t.Status === 'Ditangguhkan'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {t.Status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center w-28">
                    <div className="flex items-center space-x-1.5 justify-center mb-0.5">
                      <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{t.Peratus_Kemajuan}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${t.Peratus_Kemajuan}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onOpenEditTask(t)}
                        title="Edit Tugasan"
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isLight
                            ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenDeleteConfirm(t)}
                        title="Padam Tugasan"
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isLight
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border-slate-700'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
      <div className="lg:hidden space-y-3">
        {paginated.map((t, index) => (
          <div
            key={`${t.Record_ID || 'task-mob'}-${index}`}
            className={`p-4 rounded-2xl space-y-2.5 border shadow-xs ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                  {t.Record_ID}
                </span>
                <h4 className={`font-bold text-sm mt-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{t.Jawatankuasa_Unit}</h4>
                <div className="text-xs text-blue-600 font-bold">{t.Jawatan_Tugasan}</div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  t.Status === 'Selesai'
                    ? 'bg-emerald-100 text-emerald-800'
                    : t.Status === 'Dalam Pelaksanaan'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {t.Status}
              </span>
            </div>

            <div className={`text-xs p-2.5 rounded-xl space-y-1 ${
              isLight ? 'bg-slate-50' : 'bg-slate-800/60'
            }`}>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Guru:</span>
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.Nama_Guru}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Bidang / Kluster:</span>
                <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                  {t.Bidang} • {t.Kluster}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Pemberatan:</span>
                <span className="font-bold font-mono text-amber-700">{t.Pemberatan} mata</span>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className={`flex justify-between text-[11px] mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <span>Kemajuan</span>
                <span className="font-mono font-bold">{t.Peratus_Kemajuan}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${t.Peratus_Kemajuan}%` }} />
              </div>
            </div>

            <div className={`flex items-center justify-end space-x-2 pt-1 border-t ${
              isLight ? 'border-slate-100' : 'border-slate-800'
            }`}>
              <button
                onClick={() => onOpenEditTask(t)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onOpenDeleteConfirm(t)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Padam</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
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
