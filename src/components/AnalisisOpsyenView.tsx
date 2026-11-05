import React, { useMemo } from 'react';
import { Compass, BookOpen, Layers, BarChart3 } from 'lucide-react';
import { Guru, Tugasan } from '../types.ts';

interface AnalisisOpsyenViewProps {
  teachers: Guru[];
  tasks: Tugasan[];
  theme?: 'light' | 'dark';
}

export const AnalisisOpsyenView: React.FC<AnalisisOpsyenViewProps> = ({
  teachers,
  tasks,
  theme = 'light'
}) => {
  const isLight = theme === 'light';

  const opsyenAnalysis = useMemo(() => {
    const map: Record<
      string,
      {
        opsyen: string;
        bilanganGuru: number;
        bilanganTugasan: number;
        jumlahPemberatan: number;
        bidangCounts: Record<string, number>;
        klusterCounts: Record<string, number>;
      }
    > = {};

    teachers.forEach((t) => {
      const o = t.Opsyen || 'Umum';
      if (!map[o]) {
        map[o] = {
          opsyen: o,
          bilanganGuru: 0,
          bilanganTugasan: 0,
          jumlahPemberatan: 0,
          bidangCounts: {},
          klusterCounts: {}
        };
      }
      map[o].bilanganGuru += 1;
      map[o].bilanganTugasan += t.Bilangan_Tugasan;
      map[o].jumlahPemberatan += t.Jumlah_Pemberatan;

      // Find all tasks belonging to this teacher
      const tTasks = tasks.filter((task) => task.Guru_ID === t.Guru_ID);
      tTasks.forEach((tsk) => {
        const b = tsk.Bidang || 'Lain-lain';
        const k = tsk.Kluster || 'Belum Dipetakan';
        map[o].bidangCounts[b] = (map[o].bidangCounts[b] || 0) + 1;
        map[o].klusterCounts[k] = (map[o].klusterCounts[k] || 0) + 1;
      });
    });

    return Object.values(map).map((item) => {
      // Find dominant bidang
      let dominantBidang = 'Tiada';
      let maxB = 0;
      Object.entries(item.bidangCounts).forEach(([b, count]) => {
        if (count > maxB) {
          maxB = count;
          dominantBidang = b;
        }
      });

      // Find dominant kluster
      let dominantKluster = 'Tiada';
      let maxK = 0;
      Object.entries(item.klusterCounts).forEach(([k, count]) => {
        if (count > maxK) {
          maxK = count;
          dominantKluster = k;
        }
      });

      const purataPemberatan =
        item.bilanganGuru > 0 ? (item.jumlahPemberatan / item.bilanganGuru).toFixed(1) : '0';

      return {
        ...item,
        purataPemberatan,
        bidangDominan: dominantBidang,
        klusterDominan: dominantKluster
      };
    });
  }, [teachers, tasks]);

  const maxTasks = Math.max(...opsyenAnalysis.map((o) => o.bilanganTugasan), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <Compass className="w-5 h-5 text-indigo-600" />
          <span>Modul Analisis Opsyen Guru</span>
        </h2>
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Analisis peranan opsyen kepakaran guru, bidang dominan, dan purata beban mengikut opsyen
        </p>
      </div>

      {/* Visual Chart Bars */}
      <div className={`border rounded-2xl p-6 shadow-xs transition-colors ${
        isLight ? 'bg-white border-slate-200/90' : 'bg-slate-900 border-slate-800'
      }`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          Perbandingan Bilangan Tugasan Mengikut Opsyen
        </h3>
        <div className="space-y-3">
          {opsyenAnalysis.map((item) => {
            const pct = Math.round((item.bilanganTugasan / maxTasks) * 100);
            return (
              <div key={item.opsyen} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{item.opsyen}</span>
                  <div className="flex items-center space-x-3 text-[11px]">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{item.bilanganGuru} guru</span>
                    <span className={`font-mono font-bold ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>{item.bilanganTugasan} tugas</span>
                    <span className={`font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>Purata {item.purataPemberatan}</span>
                  </div>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className={`border rounded-2xl shadow-xs overflow-hidden transition-colors ${
        isLight ? 'bg-white border-slate-200/90' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className={`p-4 border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'border-slate-800'}`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
            Jadual Terperinci Analisis Opsyen
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`uppercase tracking-wider font-semibold border-b ${
              isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-800/80 text-slate-300 border-slate-700'
            }`}>
              <tr>
                <th className="py-3 px-4">Opsyen</th>
                <th className="py-3 px-4 text-center">Bilangan Guru</th>
                <th className="py-3 px-4 text-center">Bilangan Tugasan</th>
                <th className="py-3 px-4 text-center">Jumlah Pemberatan</th>
                <th className="py-3 px-4 text-center">Purata Pemberatan</th>
                <th className="py-3 px-4">Bidang Dominan</th>
                <th className="py-3 px-4">Kluster Dominan</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
              {opsyenAnalysis.map((item) => (
                <tr key={item.opsyen} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                  <td className={`py-3.5 px-4 font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{item.opsyen}</td>
                  <td className={`py-3.5 px-4 text-center font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {item.bilanganGuru}
                  </td>
                  <td className={`py-3.5 px-4 text-center font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {item.bilanganTugasan}
                  </td>
                  <td className={`py-3.5 px-4 text-center font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                    {item.jumlahPemberatan}
                  </td>
                  <td className={`py-3.5 px-4 text-center font-bold font-mono ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    {item.purataPemberatan}
                  </td>
                  <td className={`py-3.5 px-4 font-medium ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>{item.bidangDominan}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {item.klusterDominan}
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
