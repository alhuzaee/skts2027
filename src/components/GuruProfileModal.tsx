import React from 'react';
import {
  X,
  Award,
  Layers,
  CheckCircle2,
  Clock,
  Briefcase,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Guru, Tugasan, ConfigData } from '../types.ts';

interface GuruProfileModalProps {
  guru: Guru | null;
  tasks: Tugasan[];
  config: ConfigData | null;
  onClose: () => void;
  onEditTask: (task: Tugasan) => void;
  theme?: 'light' | 'dark';
}

export const GuruProfileModal: React.FC<GuruProfileModalProps> = ({
  guru,
  tasks,
  config,
  onClose,
  onEditTask,
  theme = 'light'
}) => {
  if (!guru) return null;
  const isLight = theme === 'light';

  const teacherTasks = tasks.filter((t) => t.Guru_ID === guru.Guru_ID);

  // Group by Bidang
  const bidangCount: Record<string, number> = {};
  const klusterCount: Record<string, number> = {};
  const statusCount: Record<string, number> = {};

  teacherTasks.forEach((t) => {
    const b = t.Bidang || 'Lain-lain';
    const k = t.Kluster || 'Belum Dipetakan';
    const s = t.Status || 'Belum Ditetapkan';

    bidangCount[b] = (bidangCount[b] || 0) + 1;
    klusterCount[k] = (klusterCount[k] || 0) + 1;
    statusCount[s] = (statusCount[s] || 0) + 1;
  });

  const klusterList = Object.keys(klusterCount);

  // Target comparison
  const sasaran = config?.SASARAN_GRED[guru.Gred];
  let targetStatus = 'Seimbang';
  let targetColor = isLight
    ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  if (sasaran) {
    if (guru.Jumlah_Pemberatan < sasaran.min) {
      targetStatus = 'Di Bawah Sasaran';
      targetColor = isLight
        ? 'text-amber-800 bg-amber-50 border-amber-200'
        : 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    } else if (guru.Jumlah_Pemberatan > sasaran.max) {
      targetStatus = 'Melebihi Sasaran';
      targetColor = isLight
        ? 'text-rose-800 bg-rose-50 border-rose-200'
        : 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    } else {
      targetStatus = 'Dalam Julat Sasaran';
      targetColor = isLight
        ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className={`border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b flex items-start justify-between ${
          isLight
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-slate-200'
            : 'bg-gradient-to-r from-blue-900/60 to-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-md">
              {guru.Nama_Guru.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-mono text-xs px-2 py-0.5 rounded-md font-bold border ${
                  isLight ? 'bg-white text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {guru.Guru_ID}
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                    guru.Status_Aktif === 'Aktif'
                      ? isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/20 text-emerald-300'
                      : isLight ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {guru.Status_Aktif}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold border ${targetColor}`}>
                  {targetStatus}
                </span>
              </div>
              <h2 className={`text-xl font-extrabold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{guru.Nama_Guru}</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Gred: <strong className={isLight ? 'text-blue-700' : 'text-blue-400'}>{guru.Gred}</strong> • Opsyen:{' '}
                <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{guru.Opsyen}</strong> • Mula Berkhidmat:{' '}
                {guru.Tarikh_Mula}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isLight
                ? 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Workload Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
              <span className={`text-[11px] block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Bilangan Tugasan</span>
              <div className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{guru.Bilangan_Tugasan}</div>
              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Portfolio & Jawatan</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
              <span className={`text-[11px] block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Jumlah Pemberatan</span>
              <div className={`text-2xl font-extrabold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>{guru.Jumlah_Pemberatan}</div>
              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Mata Beban Terkumpul</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
              <span className={`text-[11px] block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Bilangan Kluster</span>
              <div className={`text-2xl font-extrabold ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>{klusterList.length}</div>
              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                {klusterList.join(', ') || 'Tiada'}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
              <span className={`text-[11px] block mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Sasaran Gred ({guru.Gred})</span>
              <div className={`text-lg font-bold mt-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {sasaran ? `${sasaran.min} - ${sasaran.max} mata` : 'Tiada had'}
              </div>
              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                {sasaran ? `Sasaran ideal: ${sasaran.sasaran}` : 'Standard'}
              </span>
            </div>
          </div>

          {/* Visual Breakdown Charts (Bidang, Kluster, Status) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bidang */}
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Tugasan Mengikut Bidang
              </h4>
              <div className="space-y-2">
                {Object.entries(bidangCount).map(([b, count]) => (
                  <div key={b}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`truncate ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{b}</span>
                      <span className={`font-mono font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{count}</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${(count / Math.max(1, guru.Bilangan_Tugasan)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {Object.keys(bidangCount).length === 0 && (
                  <div className="text-xs text-slate-400">Tiada tugasan didaftarkan</div>
                )}
              </div>
            </div>

            {/* Kluster */}
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Tugasan Mengikut Kluster
              </h4>
              <div className="space-y-2">
                {Object.entries(klusterCount).map(([k, count]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`truncate ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{k}</span>
                      <span className={`font-mono font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{count}</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${(count / Math.max(1, guru.Bilangan_Tugasan)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {Object.keys(klusterCount).length === 0 && (
                  <div className="text-xs text-slate-400">Tiada tugasan didaftarkan</div>
                )}
              </div>
            </div>

            {/* Status Pelaksanaan */}
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Status Pelaksanaan Tugasan
              </h4>
              <div className="space-y-2">
                {Object.entries(statusCount).map(([s, count]) => (
                  <div key={s}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`truncate ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{s}</span>
                      <span className={`font-mono font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{count}</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${(count / Math.max(1, guru.Bilangan_Tugasan)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {Object.keys(statusCount).length === 0 && (
                  <div className="text-xs text-slate-400">Tiada tugasan didaftarkan</div>
                )}
              </div>
            </div>
          </div>

          {/* List of All Assigned Committees & Tasks */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
              Senarai Lengkap Jawatankuasa & Tugasan ({teacherTasks.length})
            </h4>

            <div className="space-y-2.5">
              {teacherTasks.map((task, tIdx) => (
                <div
                  key={`${task.Record_ID || 'gtask'}-${tIdx}`}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      : 'bg-slate-850/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                          isLight ? 'text-slate-600 bg-white border-slate-200' : 'text-slate-400 bg-slate-800 border-slate-700'
                        }`}>
                          {task.Record_ID}
                        </span>
                        <span className={`font-bold text-xs ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>
                          {task.Bidang} • {task.Kluster}
                        </span>
                      </div>
                      <h5 className={`font-bold text-sm mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {task.Jawatankuasa_Unit} —{' '}
                        <span className={`font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{task.Jawatan_Tugasan}</span>
                      </h5>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border ${
                        isLight
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        Pemberatan: {task.Pemberatan}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          task.Status === 'Selesai'
                            ? isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/20 text-emerald-300'
                            : task.Status === 'Dalam Pelaksanaan'
                            ? isLight ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-blue-500/20 text-blue-300'
                            : isLight ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {task.Status}
                      </span>
                    </div>
                  </div>

                  {task.Skop_Kelas_Tarikh && (
                    <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      <span className={isLight ? 'text-slate-400 font-semibold' : 'text-slate-500'}>Skop/Kelas:</span> {task.Skop_Kelas_Tarikh}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className={`flex justify-between text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      <span>Kemajuan: {task.Peratus_Kemajuan}%</span>
                      {task.Catatan && <span className="italic truncate max-w-xs">{task.Catatan}</span>}
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${task.Peratus_Kemajuan}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {teacherTasks.length === 0 && (
                <div className={`text-center py-8 text-xs rounded-2xl border ${
                  isLight ? 'text-slate-400 bg-slate-50 border-slate-200' : 'text-slate-500 bg-slate-850 border-slate-800'
                }`}>
                  Guru ini belum mempunyai agihan tugasan atau jawatankuasa bagi sesi 2027.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex justify-end ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            Tutup Profil
          </button>
        </div>
      </div>
    </div>
  );
};
