import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemDescription: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  isDeleting: boolean;
  theme?: 'light' | 'dark';
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Pengesahan Pemadaman Rekod',
  itemDescription,
  onConfirm,
  onClose,
  isDeleting,
  theme = 'light'
}) => {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-start space-x-3.5">
          <div className={`p-3 rounded-2xl border ${
            isLight
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-rose-600/20 border-rose-500/30 text-rose-400'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{title}</h3>
            <p className={`text-xs font-semibold mt-1 ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>
              Anda pasti mahu memadam rekod ini? Tindakan ini akan direkodkan dalam Audit Log.
            </p>
          </div>
        </div>

        <div className={`p-3 rounded-xl border text-xs font-mono ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-850 border-slate-800 text-slate-300'
        }`}>
          {itemDescription}
        </div>

        <div className={`flex items-center justify-end space-x-2 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 flex items-center space-x-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Memadam...' : 'Ya, Padam Rekod'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
