import React from 'react';
import { GraduationCap, BarChart2, TrendingUp, Users } from 'lucide-react';
import { Guru, Tugasan, ConfigData } from '../types.ts';

interface AnalisisGredViewProps {
  teachers: Guru[];
  tasks: Tugasan[];
  config: ConfigData | null;
  theme?: 'light' | 'dark';
}

export const AnalisisGredView: React.FC<AnalisisGredViewProps> = ({
  teachers,
  tasks,
  config,
  theme = 'light'
}) => {
  const isLight = theme === 'light';

  // Aggregate strictly using grades found in the database
  const gredStats = React.useMemo(() => {
    const map: Record<
      string,
      {
        gred: string;
        jumlahGuru: number;
        jumlahTugasan: number;
        jumlahPemberatan: number;
      }
    > = {};

    teachers.forEach((t) => {
      const g = t.Gred || 'Lain-lain';
      if (!map[g]) {
        map[g] = {
          gred: g,
          jumlahGuru: 0,
          jumlahTugasan: 0,
          jumlahPemberatan: 0
        };
      }
      map[g].jumlahGuru += 1;
      map[g].jumlahTugasan += t.Bilangan_Tugasan;
      map[g].jumlahPemberatan += t.Jumlah_Pemberatan;
    });

    return Object.values(map).map((item) => ({
      ...item,
      purataTugasan: item.jumlahGuru > 0 ? (item.jumlahTugasan / item.jumlahGuru).toFixed(1) : '0',
      purataPemberatan: item.jumlahGuru > 0 ? (item.jumlahPemberatan / item.jumlahGuru).toFixed(1) : '0'
    }));
  }, [teachers]);

  const maxWeight = Math.max(...gredStats.map((s) => Number(s.purataPemberatan)), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <span>Modul Analisis Gred Hakiki & Beban Tugas</span>
        </h2>
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Analisis perbandingan bilangan guru, jumlah tugasan, dan purata beban mengikut gred dalam database
        </p>
      </div>

      {/* Chart: Gred vs Beban Tugas */}
      <div className={`border rounded-2xl p-6 shadow-xs transition-colors ${
        isLight ? 'bg-white border-slate-200/90' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>Carta: Gred vs Purata Beban Tugas</span>
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Purata mata pemberatan bagi setiap gred</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-end pt-8 pb-4">
          {gredStats.map((item) => {
            const heightPct = Math.round((Number(item.purataPemberatan) / maxWeight) * 160);
            return (
              <div key={item.gred} className="flex flex-col items-center">
                <div className={`text-xs font-bold font-mono mb-2 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                  {item.purataPemberatan} mata
                </div>
                <div className={`w-full max-w-[48px] rounded-t-xl overflow-hidden flex flex-col justify-end h-44 ${
                  isLight ? 'bg-slate-100' : 'bg-slate-800'
                }`}>
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-xl transition-all duration-700 shadow-xs"
                    style={{ height: `${Math.max(12, heightPct)}px` }}
                  />
                </div>
                <div className="mt-3 text-center">
                  <div className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.gred}</div>
                  <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.jumlahGuru} guru</div>
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
            Jadual Lengkap Analisis Gred
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`uppercase tracking-wider font-semibold border-b ${
              isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-800/80 text-slate-300 border-slate-700'
            }`}>
              <tr>
                <th className="py-3 px-4">Gred</th>
                <th className="py-3 px-4 text-center">Jumlah Guru</th>
                <th className="py-3 px-4 text-center">Jumlah Tugasan</th>
                <th className="py-3 px-4 text-center">Purata Tugasan</th>
                <th className="py-3 px-4 text-center">Jumlah Pemberatan</th>
                <th className="py-3 px-4 text-center">Purata Pemberatan</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
              {gredStats.map((item) => (
                <tr key={item.gred} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                  <td className={`py-3.5 px-4 font-bold text-sm ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>{item.gred}</td>
                  <td className={`py-3.5 px-4 text-center font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    {item.jumlahGuru}
                  </td>
                  <td className={`py-3.5 px-4 text-center font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {item.jumlahTugasan}
                  </td>
                  <td className={`py-3.5 px-4 text-center font-mono ${isLight ? 'text-cyan-700 font-semibold' : 'text-cyan-400'}`}>
                    {item.purataTugasan}
                  </td>
                  <td className={`py-3.5 px-4 text-center font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                    {item.jumlahPemberatan}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-lg font-bold font-mono text-xs border ${
                      isLight
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                    }`}>
                      {item.purataPemberatan}
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
