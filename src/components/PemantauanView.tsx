import React, { useState, useMemo } from 'react';
import { Activity, Search } from 'lucide-react';
import { Tugasan } from '../types.ts';

interface PemantauanViewProps {
  tasks: Tugasan[];
  onOpenEditTask: (task: Tugasan) => void;
  theme?: 'light' | 'dark';
}

export const PemantauanView: React.FC<PemantauanViewProps> = ({
  tasks,
  onOpenEditTask,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [search, setSearch] = useState('');

  const statusOptions = [
    'Semua',
    'Dalam Pelaksanaan',
    'Selesai',
    'Belum Mula',
    'Ditangguhkan',
    'Belum Ditetapkan'
  ];

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.Nama_Guru.toLowerCase().includes(search.toLowerCase()) ||
        t.Jawatankuasa_Unit.toLowerCase().includes(search.toLowerCase()) ||
        t.Jawatan_Tugasan.toLowerCase().includes(search.toLowerCase()) ||
        t.Catatan.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        selectedStatus === 'Semua' ||
        t.Status === selectedStatus ||
        (selectedStatus === 'Belum Ditetapkan' && (!t.Status || t.Status === 'Belum Ditetapkan'));
      return matchSearch && matchStatus;
    });
  }, [tasks, search, selectedStatus]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <Activity className="w-5 h-5 text-emerald-600" />
          <span>Modul Pemantauan & Kemajuan Tugasan</span>
        </h2>
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Penjejakan status kemajuan (0% - 100%), catatan operasi, dan rekod kemas kini terkini
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className={`flex flex-col md:flex-row items-center justify-between gap-3 p-3 rounded-2xl border transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {statusOptions.map((s) => {
            const count =
              s === 'Semua'
                ? tasks.length
                : tasks.filter((t) => (s === 'Belum Ditetapkan' ? !t.Status || t.Status === s : t.Status === s))
                    .length;
            return (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  selectedStatus === s
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{s}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedStatus === s
                      ? 'bg-white/20 text-white'
                      : isLight
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari guru, tugasan, catatan..."
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
                <th className="py-3 px-4">Nama Guru</th>
                <th className="py-3 px-4">Jawatankuasa & Unit</th>
                <th className="py-3 px-4">Tugasan & Peranan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-36">Kemajuan</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-right">Dikemas Kini</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
              {filtered.map((t, index) => (
                <tr
                  key={`${t.Record_ID || 'peman'}-${index}`}
                  onClick={() => onOpenEditTask(t)}
                  className={`cursor-pointer transition-colors ${
                    isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3.5 px-4 font-semibold">
                    <div className={isLight ? 'text-slate-900' : 'text-slate-100'}>{t.Nama_Guru}</div>
                    <div className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{t.Guru_ID}</div>
                  </td>
                  <td className={`py-3.5 px-4 font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{t.Jawatankuasa_Unit}</td>
                  <td className="py-3.5 px-4">
                    <div className={`font-bold ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>{t.Jawatan_Tugasan}</div>
                    {t.Skop_Kelas_Tarikh && (
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t.Skop_Kelas_Tarikh}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        t.Status === 'Selesai'
                          ? isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-300'
                          : t.Status === 'Dalam Pelaksanaan'
                          ? isLight ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-blue-500/20 text-blue-300'
                          : t.Status === 'Belum Mula'
                          ? isLight ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-400'
                          : t.Status === 'Ditangguhkan'
                          ? isLight ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-amber-500/20 text-amber-300'
                          : isLight ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {t.Status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                      <span className={isLight ? 'text-slate-700 font-bold' : 'text-slate-300'}>{t.Peratus_Kemajuan}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          t.Peratus_Kemajuan === 100
                            ? 'bg-emerald-500'
                            : t.Peratus_Kemajuan > 50
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${t.Peratus_Kemajuan}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className={`text-xs truncate ${isLight ? 'text-slate-600' : 'text-slate-300'}`} title={t.Catatan}>
                      {t.Catatan || <span className={isLight ? 'text-slate-400 italic' : 'text-slate-600 italic'}>Tiada catatan</span>}
                    </p>
                  </td>
                  <td className={`py-3.5 px-4 text-right text-[11px] whitespace-nowrap ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <div>{new Date(t.Updated_At).toLocaleDateString('ms-MY')}</div>
                    <div className={`text-[10px] truncate max-w-[120px] ml-auto ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t.Updated_By}
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
