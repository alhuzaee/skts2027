import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, UserPlus, Save, AlertCircle } from 'lucide-react';
import { Guru, ConfigData } from '../../types.ts';
import { api } from '../../services/api.ts';

interface TambahEditGuruModalProps {
  guruToEdit: Guru | null;
  config: ConfigData | null;
  onClose: () => void;
  onSaveGuru: (guruData: Partial<Guru>, expectedVersion?: number) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const TambahEditGuruModal: React.FC<TambahEditGuruModalProps> = ({
  guruToEdit,
  config,
  onClose,
  onSaveGuru,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const [namaGuru, setNamaGuru] = useState('');
  const [gred, setGred] = useState(config?.GRED[0] || 'DG41');
  const [opsyen, setOpsyen] = useState(config?.OPSYEN[0] || 'Bahasa Melayu');
  const [statusAktif, setStatusAktif] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');
  const [tarikhMula, setTarikhMula] = useState(new Date().toISOString().split('T')[0]);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Duplicate name warning dialog state
  const [duplicateMatches, setDuplicateMatches] = useState<Array<{ Guru_ID: string; Nama_Guru: string; Gred: string }>>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  useEffect(() => {
    if (guruToEdit) {
      setNamaGuru(guruToEdit.Nama_Guru);
      setGred(guruToEdit.Gred);
      setOpsyen(guruToEdit.Opsyen);
      setStatusAktif(guruToEdit.Status_Aktif);
      setTarikhMula(guruToEdit.Tarikh_Mula || new Date().toISOString().split('T')[0]);
    } else {
      setNamaGuru('');
      setGred(config?.GRED[3] || 'DG44');
      setOpsyen(config?.OPSYEN[0] || 'Bahasa Melayu');
      setStatusAktif('Aktif');
      setTarikhMula(new Date().toISOString().split('T')[0]);
    }
    setErrorMsg('');
    setShowDuplicateWarning(false);
  }, [guruToEdit, config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaGuru.trim()) {
      setErrorMsg('Nama Guru adalah medan wajib.');
      return;
    }

    // If adding a new teacher, check for duplicate name first
    if (!guruToEdit && !showDuplicateWarning) {
      try {
        const check = await api.checkDuplicateGuru(namaGuru);
        if (check.hasDuplicate && check.matches.length > 0) {
          setDuplicateMatches(check.matches);
          setShowDuplicateWarning(true);
          return;
        }
      } catch (err) {
        // proceed if check fails
      }
    }

    await performSave();
  };

  const performSave = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSaveGuru(
        {
          Nama_Guru: namaGuru.trim(),
          Gred: gred,
          Opsyen: opsyen,
          Status_Aktif: statusAktif,
          Tarikh_Mula: tarikhMula
        },
        guruToEdit?.Version
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ralat berlaku semasa menyimpan data guru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className={`border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Modal Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {guruToEdit ? 'Kemaskini Maklumat Guru' : 'Tambah Guru Baharu'}
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {guruToEdit ? `Mengemas kini rekod ${guruToEdit.Guru_ID}` : 'Pendaftaran guru SK Taman Seroja'}
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

        {/* Duplicate Warning Dialog (Mandatory Section 15) */}
        {showDuplicateWarning && (
          <div className={`p-5 border-b space-y-3 ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
          }`}>
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <div className="text-xs">
                <strong className={`block text-sm mb-1 ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>
                  Amaran Persamaan Nama Guru
                </strong>
                <p>
                  Nama guru yang hampir sama telah wujud dalam pangkalan data. Adakah anda pasti mahu menambah rekod
                  baharu ini tanpa menggabungkannya?
                </p>
                <div className={`mt-2 space-y-1 p-2 rounded-lg border font-mono text-[11px] ${
                  isLight ? 'bg-white border-amber-200 text-slate-800' : 'bg-slate-900/80 border-amber-900/60 text-slate-300'
                }`}>
                  {duplicateMatches.map((m, idx) => (
                    <div key={`${m.Guru_ID}-${idx}`}>
                      • <strong className={isLight ? 'text-amber-800 font-bold' : 'text-amber-300'}>{m.Nama_Guru}</strong> ({m.Guru_ID} - {m.Gred})
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDuplicateWarning(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Semak Semula Nama
              </button>
              <button
                type="button"
                onClick={performSave}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs"
              >
                {isSubmitting ? 'Menyimpan...' : 'Ya, Teruskan Tambah Rekod'}
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className={`m-5 p-3 rounded-xl border text-xs flex items-center space-x-2 ${
            isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Nama Guru (Wajib)</label>
            <input
              type="text"
              value={namaGuru}
              onChange={(e) => setNamaGuru(e.target.value)}
              placeholder="Contoh: Ahmad bin Abdullah"
              required
              className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
                isLight
                  ? 'bg-slate-50 text-slate-800 border-slate-200 placeholder:text-slate-400 focus:bg-white'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Gred Dropdown from CONFIG */}
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Gred Hakiki (Wajib)</label>
              <select
                value={gred}
                onChange={(e) => setGred(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors ${
                  isLight
                    ? 'bg-slate-50 text-slate-800 border-slate-200'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                {config?.GRED.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Opsyen Dropdown from CONFIG */}
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Opsyen Pengkhususan (Wajib)</label>
              <select
                value={opsyen}
                onChange={(e) => setOpsyen(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors ${
                  isLight
                    ? 'bg-slate-50 text-slate-800 border-slate-200'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                {config?.OPSYEN.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status Aktif */}
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Status Guru</label>
              <select
                value={statusAktif}
                onChange={(e) => setStatusAktif(e.target.value as any)}
                className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors ${
                  isLight
                    ? 'bg-slate-50 text-slate-800 border-slate-200'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>

            {/* Tarikh Mula */}
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Tarikh Mula Berkhidmat</label>
              <input
                type="date"
                value={tarikhMula}
                onChange={(e) => setTarikhMula(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs border transition-colors ${
                  isLight
                    ? 'bg-slate-50 text-slate-800 border-slate-200'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className={`flex items-center justify-end space-x-2.5 pt-4 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-xl transition-colors ${
                isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Rekod Guru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
