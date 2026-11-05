import React, { useState, useMemo } from 'react';
import { BarChart3, AlertTriangle, CheckCircle, Search, Info } from 'lucide-react';
import { Guru, ConfigData, Tugasan } from '../types.ts';

interface AnalisisBebanViewProps {
  teachers: Guru[];
  tasks: Tugasan[];
  config: ConfigData | null;
  onSelectGuruProfile: (guru: Guru) => void;
  theme?: 'light' | 'dark';
}

export const AnalisisBebanView: React.FC<AnalisisBebanViewProps> = ({
  teachers,
  tasks,
  config,
  onSelectGuruProfile,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const [search, setSearch] = useState('');
  const [selectedTahap, setSelectedTahap] = useState<string>('Semua');

  // Compute cluster count per teacher
  const clusterCountPerTeacher = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach((t) => {
      if (!map[t.Guru_ID]) map[t.Guru_ID] = 0;
    });
    teachers.forEach((g) => {
      const teacherTasks = tasks.filter((t) => t.Guru_ID === g.Guru_ID);
      const uniqueClusters = new Set(teacherTasks.map((t) => t.Kluster).filter(Boolean));
      map[g.Guru_ID] = uniqueClusters.size;
    });
    return map;
  }, [teachers, tasks]);

  const rendahMax = config?.AMBANG_BEBAN?.rendahMax ?? 12;
  const seimbangMax = config?.AMBANG_BEBAN?.seimbangMax ?? 24;

  const analyzed = useMemo(() => {
    return teachers.map((g) => {
      const avgPemberatan =
        g.Bilangan_Tugasan > 0 ? (g.Jumlah_Pemberatan / g.Bilangan_Tugasan).toFixed(1) : '0';

      // Tahap Beban based on CONFIG
      let tahapBeban: 'Rendah' | 'Seimbang' | 'Tinggi' = 'Seimbang';
      if (g.Jumlah_Pemberatan < rendahMax) {
        tahapBeban = 'Rendah';
      } else if (g.Jumlah_Pemberatan > seimbangMax) {
        tahapBeban = 'Tinggi';
      }

      // Sasaran Gred
      const sasaran = config?.SASARAN_GRED[g.Gred];
      let sasaranStatus = 'Dalam Julat Sasaran';
      let sasaranBadge = isLight
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

      if (sasaran) {
        if (g.Jumlah_Pemberatan < sasaran.min) {
          sasaranStatus = 'Di Bawah Sasaran';
          sasaranBadge = isLight
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        } else if (g.Jumlah_Pemberatan > sasaran.max) {
          sasaranStatus = 'Melebihi Sasaran';
          sasaranBadge = isLight
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : 'bg-rose-500/20 text-rose-400 border-rose-500/30';
        } else {
          sasaranStatus = 'Dalam Julat Sasaran';
          sasaranBadge = isLight
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        }
      }

      return {
        ...g,
        avgPemberatan,
        bilanganKluster: clusterCountPerTeacher[g.Guru_ID] || 0,
        tahapBeban,
        sasaranStatus,
        sasaranBadge,
        sasaran
      };
    });
  }, [teachers, clusterCountPerTeacher, rendahMax, seimbangMax, config, isLight]);

  const filtered = useMemo(() => {
    return analyzed.filter((g) => {
      const matchesSearch =
        g.Nama_Guru.toLowerCase().includes(search.toLowerCase()) ||
        g.Gred.toLowerCase().includes(search.toLowerCase()) ||
        g.Opsyen.toLowerCase().includes(search.toLowerCase());
      const matchesTahap = selectedTahap === 'Semua' || g.tahapBeban === selectedTahap;
      return matchesSearch && matchesTahap;
    });
  }, [analyzed, search, selectedTahap]);

  const countTinggi = analyzed.filter((g) => g.tahapBeban === 'Tinggi').length;
  const countSeimbang = analyzed.filter((g) => g.tahapBeban === 'Seimbang').length;
  const countRendah = analyzed.filter((g) => g.tahapBeban === 'Rendah').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <BarChart3 className="w-5 h-5 text-amber-600" />
          <span>Analisis Beban Tugas Guru Berdasarkan Sasaran Gred</span>
        </h2>
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Ambang beban berpandukan tetapan CONFIG (Rendah &lt; {rendahMax}, Seimbang {rendahMax}-{seimbangMax}, Tinggi &gt; {seimbangMax})
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setSelectedTahap(selectedTahap === 'Tinggi' ? 'Semua' : 'Tinggi')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedTahap === 'Tinggi'
              ? isLight
                ? 'bg-rose-50 border-rose-500 shadow-sm ring-2 ring-rose-400/20'
                : 'bg-rose-950/60 border-rose-500'
              : isLight
              ? 'bg-white border-slate-200 hover:border-rose-300 shadow-xs'
              : 'bg-slate-900 border-slate-800 hover:border-rose-900'
          }`}
        >
          <div className="flex justify-between items-center text-rose-600 mb-1">
            <span className="text-xs font-bold uppercase">Beban Tinggi</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{countTinggi} orang</div>
          <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Melebihi had maksimum ambang (&gt; {seimbangMax} mata)</p>
        </div>

        <div
          onClick={() => setSelectedTahap(selectedTahap === 'Seimbang' ? 'Semua' : 'Seimbang')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedTahap === 'Seimbang'
              ? isLight
                ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-400/20'
                : 'bg-emerald-950/60 border-emerald-500'
              : isLight
              ? 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
              : 'bg-slate-900 border-slate-800 hover:border-emerald-900'
          }`}
        >
          <div className="flex justify-between items-center text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase">Beban Seimbang</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{countSeimbang} orang</div>
          <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Dalam julat optimum ({rendahMax} - {seimbangMax} mata)</p>
        </div>

        <div
          onClick={() => setSelectedTahap(selectedTahap === 'Rendah' ? 'Semua' : 'Rendah')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedTahap === 'Rendah'
              ? isLight
                ? 'bg-amber-50 border-amber-500 shadow-sm ring-2 ring-amber-400/20'
                : 'bg-amber-950/60 border-amber-500'
              : isLight
              ? 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
              : 'bg-slate-900 border-slate-800 hover:border-amber-900'
          }`}
        >
          <div className="flex justify-between items-center text-amber-600 mb-1">
            <span className="text-xs font-bold uppercase">Beban Rendah</span>
            <Info className="w-4 h-4" />
          </div>
          <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{countRendah} orang</div>
          <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Kapasiti boleh diagihkan (&lt; {rendahMax} mata)</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="relative flex-1 max-w-md w-full">
          <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama guru, gred, atau opsyen..."
            className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs border transition-colors focus:outline-hidden focus:ring-1 focus:ring-amber-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 placeholder:text-slate-400'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className={isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}>Tapis Tahap:</span>
          {['Semua', 'Tinggi', 'Seimbang', 'Rendah'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTahap(t)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedTahap === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
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
                <th className="py-3 px-4 text-center">Gred</th>
                <th className="py-3 px-4">Opsyen</th>
                <th className="py-3 px-4 text-center">Bil. Tugas</th>
                <th className="py-3 px-4 text-center">Jumlah Beban</th>
                <th className="py-3 px-4 text-center">Purata Beban</th>
                <th className="py-3 px-4 text-center">Kluster</th>
                <th className="py-3 px-4 text-center">Tahap Beban</th>
                <th className="py-3 px-4 text-center">Sasaran Gred</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
              {filtered.map((g, index) => (
                <tr
                  key={`${g.Guru_ID || 'guru'}-${index}`}
                  onClick={() => onSelectGuruProfile(g)}
                  className={`cursor-pointer transition-colors ${
                    isLight ? 'hover:bg-slate-50/90' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className={`font-semibold transition-colors ${
                      isLight ? 'text-slate-900 hover:text-blue-600' : 'text-slate-200 hover:text-blue-400'
                    }`}>
                      {g.Nama_Guru}
                    </div>
                    <div className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{g.Guru_ID}</div>
                  </td>
                  <td className={`py-3 px-4 text-center font-bold ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>{g.Gred}</td>
                  <td className={`py-3 px-4 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{g.Opsyen}</td>
                  <td className={`py-3 px-4 text-center font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {g.Bilangan_Tugasan}
                  </td>
                  <td className={`py-3 px-4 text-center font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                    {g.Jumlah_Pemberatan}
                  </td>
                  <td className={`py-3 px-4 text-center font-mono ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {g.avgPemberatan}
                  </td>
                  <td className={`py-3 px-4 text-center font-semibold ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>
                    {g.bilanganKluster}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        g.tahapBeban === 'Tinggi'
                          ? isLight ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : g.tahapBeban === 'Seimbang'
                          ? isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isLight ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {g.tahapBeban}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${g.sasaranBadge}`}
                      title={
                        g.sasaran
                          ? `Julat sasaran ${g.Gred}: ${g.sasaran.min} - ${g.sasaran.max} mata`
                          : 'Tiada sasaran'
                      }
                    >
                      {g.sasaranStatus}
                    </span>
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
