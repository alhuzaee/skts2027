import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
  HelpCircle,
  Layers,
  Award,
  TrendingUp,
  BarChart,
  ChevronRight,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';
import { Guru, Tugasan, GlobalFilterState, ConfigData } from '../types.ts';

interface DashboardViewProps {
  filteredTeachers: Guru[];
  filteredTasks: Tugasan[];
  allTeachers: Guru[];
  allTasks: Tugasan[];
  config: ConfigData | null;
  onFilterChange: (key: keyof GlobalFilterState, value: string) => void;
  onSelectGuruProfile: (guru: Guru) => void;
  theme?: 'light' | 'dark';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  filteredTeachers,
  filteredTasks,
  allTeachers,
  allTasks,
  config,
  onFilterChange,
  onSelectGuruProfile,
  theme = 'light'
}) => {
  const isLight = theme === 'light';

  // 12 KPI Calculations
  const activeTeachersCount = filteredTeachers.filter((g) => g.Status_Aktif === 'Aktif').length;
  const totalTasksCount = filteredTasks.length;

  const uniqueCommittees = new Set(filteredTasks.map((t) => t.Jawatankuasa_Unit).filter(Boolean)).size;
  const uniqueBidang = new Set(filteredTasks.map((t) => t.Bidang).filter(Boolean)).size;
  const uniqueKluster = new Set(filteredTasks.map((t) => t.Kluster).filter(Boolean)).size;

  const avgTasksPerTeacher = activeTeachersCount > 0 ? (totalTasksCount / activeTeachersCount).toFixed(1) : '0';

  const numericWeights = filteredTasks
    .map((t) => (typeof t.Pemberatan === 'number' ? t.Pemberatan : null))
    .filter((w): w is number => w !== null);

  const avgWeight =
    numericWeights.length > 0
      ? (numericWeights.reduce((a, b) => a + b, 0) / numericWeights.length).toFixed(1)
      : '0';

  const statusSelesai = filteredTasks.filter((t) => t.Status === 'Selesai').length;
  const statusDalamPelaksanaan = filteredTasks.filter((t) => t.Status === 'Dalam Pelaksanaan').length;
  const statusBelumMula = filteredTasks.filter((t) => t.Status === 'Belum Mula').length;
  const statusDitangguhkan = filteredTasks.filter((t) => t.Status === 'Ditangguhkan').length;
  const statusBelumDitetapkan = filteredTasks.filter(
    (t) => t.Status === 'Belum Ditetapkan' || !t.Status
  ).length;

  // Chart 1: Tasks by Bidang
  const tasksByBidang: Record<string, number> = {};
  filteredTasks.forEach((t) => {
    const b = t.Bidang || 'Lain-lain';
    tasksByBidang[b] = (tasksByBidang[b] || 0) + 1;
  });

  // Chart 2: Tasks by Kluster
  const tasksByKluster: Record<string, number> = {};
  filteredTasks.forEach((t) => {
    const k = t.Kluster || 'Belum Dipetakan';
    tasksByKluster[k] = (tasksByKluster[k] || 0) + 1;
  });

  // Chart 3 & 6: Tasks and Avg Weight by Gred
  const gredMap: Record<string, { tasks: number; totalWeight: number; teacherCount: number }> = {};
  filteredTeachers.forEach((t) => {
    const g = t.Gred || 'Lain-lain';
    if (!gredMap[g]) gredMap[g] = { tasks: 0, totalWeight: 0, teacherCount: 0 };
    gredMap[g].teacherCount += 1;
    gredMap[g].tasks += t.Bilangan_Tugasan;
    gredMap[g].totalWeight += t.Jumlah_Pemberatan;
  });

  // Chart 4 & 7: Tasks and Avg Weight by Opsyen
  const opsyenMap: Record<string, { tasks: number; totalWeight: number; count: number }> = {};
  filteredTeachers.forEach((t) => {
    const o = t.Opsyen || 'Lain-lain';
    if (!opsyenMap[o]) opsyenMap[o] = { tasks: 0, totalWeight: 0, count: 0 };
    opsyenMap[o].count += 1;
    opsyenMap[o].tasks += t.Bilangan_Tugasan;
    opsyenMap[o].totalWeight += t.Jumlah_Pemberatan;
  });

  // Chart 9 & 10: Top 10 Burden Highest & Lowest
  const sortedByBurden = [...filteredTeachers].sort(
    (a, b) => b.Jumlah_Pemberatan - a.Jumlah_Pemberatan
  );
  const top10Highest = sortedByBurden.slice(0, 10);
  const top10Lowest = [...filteredTeachers]
    .sort((a, b) => a.Jumlah_Pemberatan - b.Jumlah_Pemberatan)
    .slice(0, 10);

  // Helper for max bar scaling
  const maxBidang = Math.max(...Object.values(tasksByBidang), 1);
  const maxKluster = Math.max(...Object.values(tasksByKluster), 1);
  const maxGredTasks = Math.max(...Object.values(gredMap).map((v) => v.tasks), 1);
  const maxOpsyenTasks = Math.max(...Object.values(opsyenMap).map((v) => v.tasks), 1);

  const cardBg = isLight ? 'bg-white border-slate-200/90 text-slate-800 shadow-xs' : 'bg-slate-900/80 border-slate-800 text-white shadow-xs';
  const subText = isLight ? 'text-slate-500' : 'text-slate-400';
  const barBg = isLight ? 'bg-slate-100' : 'bg-slate-800';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-700/40 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sesi Persekolahan 2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Agihan Tugasan Guru
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
              Pemantauan pengagihan tugas berwajaran, analisis beban guru, dan status jawatankuasa SK Taman Seroja.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 rounded-2xl px-4 py-2.5 text-center shadow-md">
              <div className="text-[11px] font-semibold text-slate-300">Status Data</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Penyelarasan Sebenar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: 12 KPI CARDS */}
      <div>
        <h2 className={`text-xs font-bold uppercase tracking-wider mb-3 px-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Petunjuk Prestasi Utama (12 KPI)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* 1. Guru Aktif */}
          <div className={`p-4 rounded-2xl border transition-all ${cardBg}`}>
            <div className={`flex items-center justify-between mb-1.5 ${subText}`}>
              <span className="text-[11px] font-bold">Guru Aktif</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{activeTeachersCount}</div>
            <div className={`text-[10px] mt-1 ${subText}`}>Daripada {filteredTeachers.length} rekod</div>
          </div>

          {/* 2. Jumlah Tugasan */}
          <div className={`p-4 rounded-2xl border transition-all ${cardBg}`}>
            <div className={`flex items-center justify-between mb-1.5 ${subText}`}>
              <span className="text-[11px] font-bold">Rekod Tugasan</span>
              <Award className="w-4 h-4 text-indigo-600" />
            </div>
            <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{totalTasksCount}</div>
            <div className={`text-[10px] mt-1 ${subText}`}>Tugasan diagihkan</div>
          </div>

          {/* 3. Jumlah Jawatankuasa */}
          <div className={`p-4 rounded-2xl border transition-all ${cardBg}`}>
            <div className={`flex items-center justify-between mb-1.5 ${subText}`}>
              <span className="text-[11px] font-bold">Jawatankuasa</span>
              <Layers className="w-4 h-4 text-purple-600" />
            </div>
            <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{uniqueCommittees}</div>
            <div className={`text-[10px] mt-1 ${subText}`}>Unit beroperasi</div>
          </div>

          {/* 4. Jumlah Bidang */}
          <div className={`p-4 rounded-2xl border transition-all ${cardBg}`}>
            <div className={`flex items-center justify-between mb-1.5 ${subText}`}>
              <span className="text-[11px] font-bold">Jumlah Bidang</span>
              <BarChart className="w-4 h-4 text-sky-600" />
            </div>
            <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{uniqueBidang}</div>
            <div className={`text-[10px] mt-1 ${subText}`}>Kategori utama</div>
          </div>

          {/* 5. Jumlah Kluster */}
          <div className={`p-4 rounded-2xl border transition-all ${cardBg}`}>
            <div className={`flex items-center justify-between mb-1.5 ${subText}`}>
              <span className="text-[11px] font-bold">Jumlah Kluster</span>
              <PieIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{uniqueKluster}</div>
            <div className={`text-[10px] mt-1 ${subText}`}>Kluster pemetaan</div>
          </div>

          {/* 6. Purata Tugasan / Guru */}
          <div className={`p-4 rounded-2xl border transition-all ${cardBg}`}>
            <div className={`flex items-center justify-between mb-1.5 ${subText}`}>
              <span className="text-[11px] font-bold">Purata Tugas/Guru</span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">{avgTasksPerTeacher}</div>
            <div className={`text-[10px] mt-1 ${subText}`}>Tugasan setiap guru</div>
          </div>

          {/* 7. Purata Pemberatan */}
          <div className={`p-4 rounded-2xl border transition-all ${cardBg}`}>
            <div className={`flex items-center justify-between mb-1.5 ${subText}`}>
              <span className="text-[11px] font-bold">Purata Pemberatan</span>
              <Award className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-extrabold text-cyan-600">{avgWeight}</div>
            <div className={`text-[10px] mt-1 ${subText}`}>Mata beban setiap tugas</div>
          </div>

          {/* 8. Selesai */}
          <div
            onClick={() => onFilterChange('status', 'Selesai')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              isLight
                ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400'
                : 'bg-slate-900/80 border-emerald-900/50 hover:border-emerald-600'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-700 mb-1.5">
              <span className="text-[11px] font-bold">Tugasan Selesai</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">{statusSelesai}</div>
            <div className={`text-[10px] mt-1 ${subText}`}>
              {totalTasksCount > 0 ? ((statusSelesai / totalTasksCount) * 100).toFixed(0) : 0}% daripada tugasan
            </div>
          </div>

          {/* 9. Dalam Pelaksanaan */}
          <div
            onClick={() => onFilterChange('status', 'Dalam Pelaksanaan')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              isLight
                ? 'bg-blue-50/60 border-blue-200 hover:border-blue-400'
                : 'bg-slate-900/80 border-blue-900/50 hover:border-blue-600'
            }`}
          >
            <div className="flex items-center justify-between text-blue-700 mb-1.5">
              <span className="text-[11px] font-bold">Pelaksanaan</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-blue-700">{statusDalamPelaksanaan}</div>
            <div className={`text-[10px] mt-1 ${subText}`}>Sedang berjalan</div>
          </div>

          {/* 10. Belum Mula */}
          <div
            onClick={() => onFilterChange('status', 'Belum Mula')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${cardBg}`}
          >
            <div className={`flex items-center justify-between mb-1.5 ${subText}`}>
              <span className="text-[11px] font-bold">Belum Mula</span>
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{statusBelumMula}</div>
            <div className={`text-[10px] mt-1 ${subText}`}>Menanti tindakan</div>
          </div>

          {/* 11. Ditangguhkan */}
          <div
            onClick={() => onFilterChange('status', 'Ditangguhkan')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              isLight
                ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                : 'bg-slate-900/80 border-amber-900/50 hover:border-amber-600'
            }`}
          >
            <div className="flex items-center justify-between text-amber-700 mb-1.5">
              <span className="text-[11px] font-bold">Ditangguhkan</span>
              <PauseCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-amber-700">{statusDitangguhkan}</div>
            <div className={`text-[10px] mt-1 ${subText}`}>Tertangguh sementara</div>
          </div>

          {/* 12. Belum Ditetapkan */}
          <div
            onClick={() => onFilterChange('status', 'Belum Ditetapkan')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              isLight
                ? 'bg-rose-50/60 border-rose-200 hover:border-rose-400'
                : 'bg-slate-900/80 border-rose-900/50 hover:border-rose-600'
            }`}
          >
            <div className="flex items-center justify-between text-rose-700 mb-1.5">
              <span className="text-[11px] font-bold">Belum Ditetapkan</span>
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-rose-700">{statusBelumDitetapkan}</div>
            <div className={`text-[10px] mt-1 ${subText}`}>Perlu penetapan status</div>
          </div>
        </div>
      </div>

      {/* SECTION: 10 INTERACTIVE CHARTS & VISUALIZATIONS */}
      <div>
        <h2 className={`text-xs font-bold uppercase tracking-wider mb-3 px-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Analisis Visual & Taburan Data (10 Carta Interaktif)
        </h2>

        {/* Row 1: Bidang & Kluster & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Carta 1: Tugasan Mengikut Bidang */}
          <div className={`rounded-2xl p-5 border ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                1. Tugasan Mengikut Bidang
              </h3>
              <span className={`text-[10px] ${subText}`}>Klik bar untuk tapis</span>
            </div>
            <div className="space-y-3">
              {Object.entries(tasksByBidang).map(([bidang, count]) => {
                const pct = ((count / maxBidang) * 100).toFixed(0);
                return (
                  <div
                    key={bidang}
                    onClick={() => onFilterChange('bidang', bidang)}
                    className={`cursor-pointer group p-1.5 rounded-xl transition-colors ${
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`font-semibold group-hover:text-blue-600 transition-colors ${
                        isLight ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {bidang}
                      </span>
                      <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-slate-400'}`}>{count}</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${barBg}`}>
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carta 2: Tugasan Mengikut Kluster */}
          <div className={`rounded-2xl p-5 border ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                2. Tugasan Mengikut Kluster
              </h3>
              <span className={`text-[10px] ${subText}`}>Klik kluster untuk tapis</span>
            </div>
            <div className="space-y-3">
              {Object.entries(tasksByKluster).map(([kluster, count]) => {
                const pct = ((count / maxKluster) * 100).toFixed(0);
                const isUnmapped = kluster === 'Belum Dipetakan';
                return (
                  <div
                    key={kluster}
                    onClick={() => onFilterChange('kluster', kluster)}
                    className={`cursor-pointer group p-1.5 rounded-xl transition-colors ${
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span
                        className={`font-semibold ${
                          isUnmapped
                            ? isLight ? 'text-amber-700 font-bold' : 'text-amber-400'
                            : isLight ? 'text-slate-700' : 'text-slate-300'
                        } group-hover:text-emerald-600 transition-colors`}
                      >
                        {kluster}
                      </span>
                      <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-slate-400'}`}>{count}</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${barBg}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isUnmapped
                            ? 'bg-amber-500'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carta 8: Status Pelaksanaan */}
          <div className={`rounded-2xl p-5 border ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                8. Status Pelaksanaan Tugasan
              </h3>
              <span className={`text-[10px] ${subText}`}>Keseluruhan</span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Selesai', count: statusSelesai, color: 'bg-emerald-500', text: isLight ? 'text-emerald-700' : 'text-emerald-400' },
                {
                  label: 'Dalam Pelaksanaan',
                  count: statusDalamPelaksanaan,
                  color: 'bg-blue-500',
                  text: isLight ? 'text-blue-700' : 'text-blue-400'
                },
                { label: 'Belum Mula', count: statusBelumMula, color: 'bg-slate-400', text: isLight ? 'text-slate-700' : 'text-slate-400' },
                {
                  label: 'Ditangguhkan',
                  count: statusDitangguhkan,
                  color: 'bg-amber-500',
                  text: isLight ? 'text-amber-700' : 'text-amber-400'
                },
                {
                  label: 'Belum Ditetapkan',
                  count: statusBelumDitetapkan,
                  color: 'bg-rose-500',
                  text: isLight ? 'text-rose-700' : 'text-rose-400'
                }
              ].map((s) => {
                const pct = totalTasksCount > 0 ? ((s.count / totalTasksCount) * 100).toFixed(0) : '0';
                return (
                  <div
                    key={s.label}
                    onClick={() => onFilterChange('status', s.label)}
                    className={`cursor-pointer group p-1.5 rounded-xl transition-colors ${
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`${s.text} font-bold`}>{s.label}</span>
                      <span className={`font-mono font-semibold text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {s.count} ({pct}%)
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${barBg}`}>
                      <div className={`${s.color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Carta 3 & Carta 6 (Gred) & Carta 4 & 7 (Opsyen) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Carta 3 & 6: Analisis Mengikut Gred */}
          <div className={`rounded-2xl p-5 border ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  3 & 6. Tugasan & Purata Pemberatan Mengikut Gred
                </h3>
                <p className={`text-[11px] ${subText}`}>Hubung kait gred hakiki dengan beban tugas</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={`border-b font-bold ${isLight ? 'border-slate-200 text-slate-600 bg-slate-50/80' : 'border-slate-800 text-slate-400'}`}>
                    <th className="text-left py-2 px-2">Gred</th>
                    <th className="text-center py-2 px-2">Guru</th>
                    <th className="text-center py-2 px-2">Tugasan</th>
                    <th className="text-center py-2 px-2">Purata Beban</th>
                    <th className="text-right py-2 px-2">Visual Beban</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                  {Object.entries(gredMap).map(([gred, data]) => {
                    const avgBeban = data.teacherCount > 0 ? (data.totalWeight / data.teacherCount).toFixed(1) : '0';
                    const barPct = ((data.tasks / maxGredTasks) * 100).toFixed(0);
                    return (
                      <tr
                        key={gred}
                        onClick={() => onFilterChange('gred', gred)}
                        className={`cursor-pointer transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/50'}`}
                      >
                        <td className="py-2.5 px-2 font-bold text-blue-600">{gred}</td>
                        <td className={`py-2.5 px-2 text-center font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{data.teacherCount}</td>
                        <td className={`py-2.5 px-2 text-center font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{data.tasks}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-amber-600 font-mono">{avgBeban}</td>
                        <td className="py-2.5 px-2 text-right w-36">
                          <div className={`w-full h-2 rounded-full overflow-hidden ${barBg}`}>
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${barPct}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Carta 4 & 7: Analisis Mengikut Opsyen */}
          <div className={`rounded-2xl p-5 border ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  4 & 7. Tugasan & Beban Mengikut Opsyen
                </h3>
                <p className={`text-[11px] ${subText}`}>Taburan mengikut kepakaran opsyen guru</p>
              </div>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {Object.entries(opsyenMap).map(([opsyen, data]) => {
                const avgBeban = data.count > 0 ? (data.totalWeight / data.count).toFixed(1) : '0';
                const pct = ((data.tasks / maxOpsyenTasks) * 100).toFixed(0);
                return (
                  <div
                    key={opsyen}
                    onClick={() => onFilterChange('opsyen', opsyen)}
                    className={`p-2 rounded-xl cursor-pointer transition-colors border ${
                      isLight ? 'hover:bg-slate-50 border-transparent hover:border-slate-200' : 'hover:bg-slate-800/60 border-transparent hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{opsyen}</span>
                      <div className="flex items-center space-x-2 text-[11px]">
                        <span className={subText}>{data.count} guru</span>
                        <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>|</span>
                        <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{data.tasks} tugas</span>
                        <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>|</span>
                        <span className="font-bold text-emerald-600">Purata {avgBeban}</span>
                      </div>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${barBg}`}>
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Carta 9 & 10: Top 10 Beban Tertinggi vs Beban Terendah */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Carta 9: Top 10 Beban Tertinggi */}
          <div className={`rounded-2xl p-5 border ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  9. Top 10 Guru Beban Tertinggi
                </h3>
                <p className={`text-[11px] ${subText}`}>Perhatian diperlukan bagi mengelakkan bebanan berlebihan</p>
              </div>
            </div>
            <div className="space-y-2">
              {top10Highest.map((g, idx) => (
                <div
                  key={`top-high-${g.Guru_ID || 'guru'}-${idx}`}
                  onClick={() => onSelectGuruProfile(g)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isLight
                      ? 'bg-slate-50/70 hover:bg-slate-100 border-slate-200'
                      : 'bg-slate-850/60 hover:bg-slate-800 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx < 3
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{g.Nama_Guru}</div>
                      <div className={`text-[10px] ${subText}`}>
                        {g.Gred} • {g.Opsyen}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <div className="text-xs font-bold text-rose-600 font-mono">
                        {g.Jumlah_Pemberatan} mata
                      </div>
                      <div className={`text-[10px] ${subText}`}>{g.Bilangan_Tugasan} tugas</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carta 10: Top 10 Beban Terendah */}
          <div className={`rounded-2xl p-5 border ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 rotate-180" />
                  10. Top 10 Guru Beban Terendah
                </h3>
                <p className={`text-[11px] ${subText}`}>Kapasiti tersedia untuk agihan tugas tambahan</p>
              </div>
            </div>
            <div className="space-y-2">
              {top10Lowest.map((g, idx) => (
                <div
                  key={`top-low-${g.Guru_ID || 'guru'}-${idx}`}
                  onClick={() => onSelectGuruProfile(g)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isLight
                      ? 'bg-slate-50/70 hover:bg-slate-100 border-slate-200'
                      : 'bg-slate-850/60 hover:bg-slate-800 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{g.Nama_Guru}</div>
                      <div className={`text-[10px] ${subText}`}>
                        {g.Gred} • {g.Opsyen}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <div className="text-xs font-bold text-emerald-700 font-mono">
                        {g.Jumlah_Pemberatan} mata
                      </div>
                      <div className={`text-[10px] ${subText}`}>{g.Bilangan_Tugasan} tugas</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
