import React, { useState, useEffect } from 'react';
import { X, ClipboardList, Save, AlertCircle, Sparkles } from 'lucide-react';
import { Tugasan, Guru, ConfigData } from '../../types.ts';

interface TambahEditTugasanModalProps {
  taskToEdit: Tugasan | null;
  teachers: Guru[];
  config: ConfigData | null;
  availableCommittees: string[];
  onClose: () => void;
  onSaveTask: (taskData: Partial<Tugasan>, expectedVersion?: number) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const TambahEditTugasanModal: React.FC<TambahEditTugasanModalProps> = ({
  taskToEdit,
  teachers,
  config,
  availableCommittees,
  onClose,
  onSaveTask,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const [selectedGuruId, setSelectedGuruId] = useState('');
  const [bidang, setBidang] = useState(config?.BIDANG[0] || 'Pengurusan & Pentadbiran');
  const [kluster, setKluster] = useState(config?.KLUSTER[0] || 'Pentadbiran');
  const [jawatankuasa, setJawatankuasa] = useState('');
  const [jawatanTugasan, setJawatanTugasan] = useState('');
  const [skopKelasTarikh, setSkopKelasTarikh] = useState('');
  const [pemberatan, setPemberatan] = useState<string | number>(4);
  const [status, setStatus] = useState<string>('Dalam Pelaksanaan');
  const [peratusKemajuan, setPeratusKemajuan] = useState<number>(50);
  const [catatan, setCatatan] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected teacher object
  const selectedTeacher = teachers.find((g) => g.Guru_ID === selectedGuruId);

  useEffect(() => {
    if (taskToEdit) {
      setSelectedGuruId(taskToEdit.Guru_ID);
      setBidang(taskToEdit.Bidang);
      setKluster(taskToEdit.Kluster);
      setJawatankuasa(taskToEdit.Jawatankuasa_Unit);
      setJawatanTugasan(taskToEdit.Jawatan_Tugasan);
      setSkopKelasTarikh(taskToEdit.Skop_Kelas_Tarikh || '');
      setPemberatan(taskToEdit.Pemberatan);
      setStatus(taskToEdit.Status);
      setPeratusKemajuan(taskToEdit.Peratus_Kemajuan);
      setCatatan(taskToEdit.Catatan || '');
    } else {
      const firstActive = teachers.find((g) => g.Status_Aktif === 'Aktif') || teachers[0];
      setSelectedGuruId(firstActive ? firstActive.Guru_ID : '');
      const defaultBidang = config?.BIDANG[0] || 'Pengurusan & Pentadbiran';
      setBidang(defaultBidang);
      setKluster(config?.PEMETAAN_BIDANG[defaultBidang] || 'Pentadbiran');
      setJawatankuasa('');
      setJawatanTugasan('');
      setSkopKelasTarikh('');
      setPemberatan(4);
      setStatus('Dalam Pelaksanaan');
      setPeratusKemajuan(50);
      setCatatan('');
    }
    setErrorMsg('');
  }, [taskToEdit, teachers, config]);

  // When Bidang changes, automatically suggest Kluster from CONFIG PEMETAAN_BIDANG
  const handleBidangChange = (newBidang: string) => {
    setBidang(newBidang);
    if (config?.PEMETAAN_BIDANG && config.PEMETAAN_BIDANG[newBidang]) {
      setKluster(config.PEMETAAN_BIDANG[newBidang]);
    } else {
      setKluster('Belum Dipetakan');
    }
  };

  // When Jawatan changes, suggest default weight if available in config
  const handleJawatanChange = (newJawatan: string) => {
    setJawatanTugasan(newJawatan);
    if (config?.PEMBERATAN_DEFAULT && config.PEMBERATAN_DEFAULT[newJawatan]) {
      setPemberatan(config.PEMBERATAN_DEFAULT[newJawatan]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuruId) {
      setErrorMsg('Sila pilih guru yang memegang tugas ini.');
      return;
    }
    if (!bidang || !jawatankuasa.trim() || !jawatanTugasan.trim()) {
      setErrorMsg('Bidang, Jawatankuasa, dan Jawatan/Tugasan adalah medan wajib.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSaveTask(
        {
          Guru_ID: selectedGuruId,
          Nama_Guru: selectedTeacher?.Nama_Guru || '',
          Bidang: bidang,
          Kluster: kluster,
          Jawatankuasa_Unit: jawatankuasa.trim(),
          Jawatan_Tugasan: jawatanTugasan.trim(),
          Skop_Kelas_Tarikh: skopKelasTarikh.trim(),
          Pemberatan: pemberatan === '' ? 'Belum Ditentukan' : Number(pemberatan),
          Status: status as any,
          Peratus_Kemajuan: Number(peratusKemajuan),
          Catatan: catatan.trim()
        },
        taskToEdit ? taskToEdit.Version : undefined
      );
      onClose();
    } catch (err: any) {
      if (err.status === 409) {
        throw err;
      }
      setErrorMsg(err.message || 'Gagal menyimpan rekod tugasan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className={`border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {taskToEdit ? `Edit Tugasan (${taskToEdit.Record_ID})` : 'Tambah Agihan Tugasan'}
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {taskToEdit ? `Versi: v${taskToEdit.Version}` : 'ID Tugasan dijana automatik (Txxxxxx)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              isLight
                ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className={`m-5 p-3 rounded-xl border text-xs flex items-center space-x-2 ${
            isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* 1. Pilih Guru & Auto Read Gred/Opsyen */}
          <div>
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>1. Pilih Guru (Wajib)</label>
            <select
              value={selectedGuruId}
              onChange={(e) => setSelectedGuruId(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors ${
                isLight
                  ? 'bg-slate-50 text-slate-800 border-slate-200 focus:bg-white'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
              required
            >
              <option value="">-- Pilih Guru --</option>
              {teachers.map((g, idx) => (
                <option key={`${g.Guru_ID}-${idx}`} value={g.Guru_ID}>
                  {g.Nama_Guru} ({g.Guru_ID} - {g.Gred})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-filled details from MASTER_GURU (No typing needed) */}
          {selectedTeacher && (
            <div className={`p-3 rounded-xl border grid grid-cols-2 gap-3 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
            }`}>
              <div>
                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Gred Hakiki (Automatik)</span>
                <span className={`font-bold ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>{selectedTeacher.Gred}</span>
              </div>
              <div>
                <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Opsyen (Automatik)</span>
                <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{selectedTeacher.Opsyen}</span>
              </div>
            </div>
          )}

          {/* 2. Pilih Bidang & Auto-suggest Kluster */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>2. Bidang (Wajib)</label>
              <select
                value={bidang}
                onChange={(e) => handleBidangChange(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors ${
                  isLight
                    ? 'bg-slate-50 text-slate-800 border-slate-200'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                {config?.BIDANG.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block font-semibold mb-1 flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <span>3. Kluster</span>
                <span className={`text-[10px] flex items-center gap-1 font-normal ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  <Sparkles className="w-3 h-3" /> Auto Dicadangkan
                </span>
              </label>
              <select
                value={kluster}
                onChange={(e) => setKluster(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors ${
                  isLight
                    ? 'bg-slate-50 text-slate-800 border-slate-200'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                {config?.KLUSTER.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Jawatankuasa / Unit */}
          <div>
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              4. Jawatankuasa / Unit (Wajib)
            </label>
            <input
              type="text"
              list="committee-list"
              value={jawatankuasa}
              onChange={(e) => setJawatankuasa(e.target.value)}
              placeholder="Pilih atau taip jawatankuasa..."
              required
              className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors ${
                isLight
                  ? 'bg-slate-50 text-slate-800 border-slate-200 placeholder:text-slate-400 focus:bg-white'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            />
            <datalist id="committee-list">
              {availableCommittees.map((c, idx) => (
                <option key={`${c}-${idx}`} value={c} />
              ))}
            </datalist>
          </div>

          {/* 4. Jawatan / Tugasan & Pemberatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                5. Jawatan / Tugasan (Wajib)
              </label>
              <input
                type="text"
                list="jawatan-suggestions"
                value={jawatanTugasan}
                onChange={(e) => handleJawatanChange(e.target.value)}
                placeholder="Contoh: Setiausaha, Ketua Panitia..."
                required
                className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors ${
                  isLight
                    ? 'bg-slate-50 text-slate-800 border-slate-200 placeholder:text-slate-400 focus:bg-white'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              />
              <datalist id="jawatan-suggestions">
                {Object.keys(config?.PEMBERATAN_DEFAULT || {}).map((j, idx) => (
                  <option key={`${j}-${idx}`} value={j} />
                ))}
              </datalist>
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>6. Pemberatan (Mata)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={pemberatan}
                onChange={(e) => setPemberatan(e.target.value)}
                placeholder="Nilai wajaran (1-5)"
                className={`w-full rounded-xl px-3 py-2 text-xs font-mono border transition-colors ${
                  isLight
                    ? 'bg-slate-50 text-slate-800 border-slate-200 focus:bg-white'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              />
            </div>
          </div>

          {/* 5. Skop / Kelas / Tarikh */}
          <div>
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>7. Skop / Kelas / Tarikh</label>
            <input
              type="text"
              value={skopKelasTarikh}
              onChange={(e) => setSkopKelasTarikh(e.target.value)}
              placeholder="Contoh: Tahun 1 hingga 6, Sepanjang Tahun, Mingguan..."
              className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors ${
                isLight
                  ? 'bg-slate-50 text-slate-800 border-slate-200 placeholder:text-slate-400 focus:bg-white'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            />
          </div>

          {/* 6. Status & Kemajuan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>8. Status Pelaksanaan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors ${
                  isLight
                    ? 'bg-slate-50 text-slate-800 border-slate-200'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                {config?.STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                9. Peratus Kemajuan: <span className={`font-mono font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{peratusKemajuan}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={peratusKemajuan}
                onChange={(e) => setPeratusKemajuan(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 7. Catatan */}
          <div>
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>10. Catatan Operasi</label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan status, laporan mesyuarat, atau tindakan susulan..."
              className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors ${
                isLight
                  ? 'bg-slate-50 text-slate-800 border-slate-200 placeholder:text-slate-400 focus:bg-white'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            />
          </div>

          {/* Submit */}
          <div className={`flex items-center justify-end space-x-2 pt-4 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl transition-colors ${
                isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Tugasan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
