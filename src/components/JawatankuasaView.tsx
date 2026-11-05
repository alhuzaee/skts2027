import React, { useState, useMemo } from 'react';
import { Layers, Search, Users, Award, ChevronDown, ChevronRight } from 'lucide-react';
import { Tugasan, Guru } from '../types.ts';

interface JawatankuasaViewProps {
  tasks: Tugasan[];
  teachers: Guru[];
  onSelectGuruProfile: (guru: Guru) => void;
  onOpenEditTask: (task: Tugasan) => void;
  theme?: 'light' | 'dark';
}

export const JawatankuasaView: React.FC<JawatankuasaViewProps> = ({
  tasks,
  teachers,
  onSelectGuruProfile,
  onOpenEditTask,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const [search, setSearch] = useState('');
  const [selectedBidang, setSelectedBidang] = useState<string>('Semua');

  // Group tasks by Jawatankuasa_Unit
  const committees = useMemo(() => {
    const map: Record<
      string,
      {
        nama: string;
        bidang: string;
        kluster: string;
        tasks: Tugasan[];
        totalWeight: number;
      }
    > = {};

    tasks.forEach((t) => {
      const name = t.Jawatankuasa_Unit || 'Lain-lain';
      if (!map[name]) {
        map[name] = {
          nama: name,
          bidang: t.Bidang,
          kluster: t.Kluster,
          tasks: [],
          totalWeight: 0
        };
      }
      map[name].tasks.push(t);
      const w = typeof t.Pemberatan === 'number' ? t.Pemberatan : 0;
      map[name].totalWeight += w;
    });

    return Object.values(map);
  }, [tasks]);

  const bidangList = ['Semua', ...Array.from(new Set(committees.map((c) => c.bidang).filter(Boolean)))];

  const filteredCommittees = useMemo(() => {
    return committees.filter((c) => {
      const matchSearch =
        c.nama.toLowerCase().includes(search.toLowerCase()) ||
        c.tasks.some((t) => t.Nama_Guru.toLowerCase().includes(search.toLowerCase()));
      const matchBidang = selectedBidang === 'Semua' || c.bidang === selectedBidang;
      return matchSearch && matchBidang;
    });
  }, [committees, search, selectedBidang]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <Layers className="w-5 h-5 text-purple-600" />
          <span>Jawatankuasa & Unit SK Taman Seroja (Sesi 2027)</span>
        </h2>
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Paparan berstruktur mengikut unit pengurusan, carta jawatan (Pengerusi, Setiausaha, Penyelaras, AJK)
        </p>
      </div>

      {/* Filter and Search */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {bidangList.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBidang(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedBidang === b
                  ? 'bg-purple-600 text-white shadow-xs'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari jawatankuasa atau ahli guru..."
            className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs transition-colors border focus:outline-hidden focus:ring-1 focus:ring-purple-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 placeholder:text-slate-400'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          />
        </div>
      </div>

      {/* Grid of Committees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCommittees.map((com) => (
          <div
            key={com.nama}
            className={`border rounded-2xl p-5 shadow-xs space-y-3 transition-all ${
              isLight
                ? 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  isLight
                    ? 'text-purple-700 bg-purple-50 border-purple-200'
                    : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                }`}>
                  {com.bidang} • {com.kluster}
                </span>
                <h3 className={`font-bold text-sm mt-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{com.nama}</h3>
              </div>
              <div className="text-right">
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${
                  isLight
                    ? 'text-amber-800 bg-amber-50 border-amber-200'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}>
                  {com.totalWeight} mata
                </span>
                <div className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{com.tasks.length} peranan</div>
              </div>
            </div>

            {/* List of members in this committee */}
            <div className={`space-y-1.5 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/80'}`}>
              {com.tasks.map((t, idx) => {
                const teacherObj = teachers.find((g) => g.Guru_ID === t.Guru_ID);
                return (
                  <div
                    key={`${t.Record_ID || 'com-task'}-${idx}`}
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors text-xs ${
                      isLight
                        ? 'bg-slate-50 hover:bg-slate-100/90 border border-slate-100'
                        : 'bg-slate-850/60 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <button
                        onClick={() => teacherObj && onSelectGuruProfile(teacherObj)}
                        className={`font-semibold text-left transition-colors ${
                          isLight
                            ? 'text-slate-800 hover:text-blue-600'
                            : 'text-slate-200 hover:text-blue-400'
                        }`}
                      >
                        {t.Nama_Guru}
                      </button>
                      <div className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {t.Jawatan_Tugasan}{' '}
                        {t.Skop_Kelas_Tarikh && <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>({t.Skop_Kelas_Tarikh})</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`font-mono font-bold text-[11px] ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                        +{t.Pemberatan}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                          t.Status === 'Selesai'
                            ? isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-300'
                            : t.Status === 'Dalam Pelaksanaan'
                            ? isLight ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-blue-500/20 text-blue-300'
                            : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {t.Status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
