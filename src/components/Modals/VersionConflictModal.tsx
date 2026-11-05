import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface VersionConflictModalProps {
  isOpen: boolean;
  onRefresh: () => void;
  onCancel: () => void;
  theme?: 'light' | 'dark';
}

export const VersionConflictModal: React.FC<VersionConflictModalProps> = ({
  isOpen,
  onRefresh,
  onCancel,
  theme = 'light'
}) => {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 ${
        isLight
          ? 'bg-white border-amber-400'
          : 'bg-slate-900 border-amber-600/80'
      }`}>
        <div className="flex items-start space-x-3.5">
          <div className={`p-3 rounded-2xl border ${
            isLight
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-base ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>Konflik Versi Rekod Dikesan</h3>
            <p className={`text-xs mt-2 font-medium leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
              Rekod ini telah dikemas kini oleh pengguna lain. Sila muat semula rekod untuk mendapatkan versi
              terkini.
            </p>
          </div>
        </div>

        <div className={`p-3 rounded-xl border text-[11px] ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-850 border-slate-800 text-slate-400'
        }`}>
          Untuk mengelakkan data bertindih atau hilang (race condition), perubahan anda belum disimpan.
          Muat semula untuk menyemak versi terkini sebelum membuat suntingan semula.
        </div>

        <div className={`flex items-center justify-end space-x-2 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Semula</span>
          </button>
        </div>
      </div>
    </div>
  );
};
