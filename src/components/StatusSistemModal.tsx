import React, { useState } from 'react';
import {
  X,
  Server,
  Database,
  CheckCircle2,
  Clock,
  Code,
  Copy,
  Check,
  Play,
  AlertCircle,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  Download
} from 'lucide-react';
import { SystemStatusInfo } from '../types.ts';
import { api } from '../services/api.ts';
import { fullAppsScriptCode } from '../data/appsScriptTemplate.ts';

interface StatusSistemModalProps {
  statusInfo: SystemStatusInfo | null;
  onClose: () => void;
  onRefreshNow: () => void;
  theme?: 'light' | 'dark';
}

export const StatusSistemModal: React.FC<StatusSistemModalProps> = ({
  statusInfo,
  onClose,
  onRefreshNow,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'skrip'>('status');
  const [webAppUrl, setWebAppUrl] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; msg?: string; rowsFound?: any }>({
    loading: false
  });
  const [syncActionStatus, setSyncActionStatus] = useState<{ loading: boolean; msg?: string; error?: string }>({
    loading: false
  });

  const appsScriptCode = fullAppsScriptCode;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(appsScriptCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // fallback
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([appsScriptCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConnectLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webAppUrl.trim()) return;

    setTestStatus({ loading: true });
    try {
      const res = await api.testGoogleSheetsConnection(webAppUrl.trim(), spreadsheetId.trim());
      setTestStatus({
        loading: false,
        success: res.connected,
        msg: res.message,
        rowsFound: res.rowsFound
      });
      if (res.connected) {
        onRefreshNow();
      }
    } catch (err: any) {
      setTestStatus({
        loading: false,
        success: false,
        msg: err.message || 'Gagal menghubungi Web App Google Apps Script.'
      });
    }
  };

  const handleSeedToSheets = async () => {
    setSyncActionStatus({ loading: true });
    try {
      const res = await api.syncPushToSheets();
      setSyncActionStatus({ loading: false, msg: res.message });
      onRefreshNow();
    } catch (err: any) {
      setSyncActionStatus({ loading: false, error: err.message });
    }
  };

  const handlePullFromSheets = async () => {
    setSyncActionStatus({ loading: true });
    try {
      const res = await api.syncPullFromSheets();
      setSyncActionStatus({ loading: false, msg: res.message });
      onRefreshNow();
    } catch (err: any) {
      setSyncActionStatus({ loading: false, error: err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className={`border rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isLight
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-slate-200'
            : 'bg-gradient-to-r from-blue-900/60 to-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isLight
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-blue-600/30 text-blue-300 border-blue-400/40'
            }`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Status Sistem & Pangkalan Data Google Sheets
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                e-PENGURUSAN SKTS 2027 · SK Taman Seroja · Pemantauan Sambungan Data Langsung
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

        {/* Subtabs */}
        <div className={`flex items-center space-x-2 px-6 pt-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <button
            onClick={() => setActiveSubTab('status')}
            className={`px-4 py-2 font-bold text-xs rounded-t-xl transition-colors flex items-center space-x-1.5 ${
              activeSubTab === 'status'
                ? 'bg-blue-600 text-white shadow-xs'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Status Sambungan & Penyelarasan (Sync)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('skrip')}
            className={`px-4 py-2 font-bold text-xs rounded-t-xl transition-colors flex items-center space-x-1.5 ${
              activeSubTab === 'skrip'
                ? 'bg-blue-600 text-white shadow-xs'
                : isLight
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Skrip Apps Script & Panduan Pasang</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeSubTab === 'status' && (
            <div className="space-y-5">
              {/* Action alert message if any */}
              {syncActionStatus.msg && (
                <div className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 border ${
                  isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncActionStatus.msg}</span>
                </div>
              )}
              {syncActionStatus.error && (
                <div className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 border ${
                  isLight
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-rose-950/60 border-rose-800 text-rose-300'
                }`}>
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{syncActionStatus.error}</span>
                </div>
              )}

              {/* Status Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Pengesahan Pengguna (Google Login)</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border flex items-center gap-1 ${
                      isLight
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{statusInfo?.googleLogin || 'Connected'}</span>
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Akaun Pentadbir aktif: <strong className={isLight ? 'text-slate-900' : 'text-white'}>alhuzaee5181@gmail.com</strong>
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Pangkalan Data Google Sheets</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 border ${
                        statusInfo?.isDemoMode
                          ? isLight ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <Database className="w-3 h-3" />
                      <span>{statusInfo?.isDemoMode ? 'MOD DATA DEMO' : 'GOOGLE SHEETS AKTIF'}</span>
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {statusInfo?.isDemoMode
                      ? 'Sambungan langsung Google Sheets belum aktif atau helaian spreadsheet anda masih belum diisi data.'
                      : 'Aplikasi kini membaca dan menulis secara terus ke Google Spreadsheet anda!'}
                  </p>
                </div>
              </div>

              {/* Action Box: Why no change on dashboard? Explained + 1-Click Fix */}
              <div className={`p-5 rounded-2xl space-y-3 border ${
                isLight
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50/70 border-indigo-200'
                  : 'bg-gradient-to-br from-slate-900 to-indigo-950/40 border-indigo-700/50'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-2.5 rounded-xl border ${
                    isLight
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                      : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                  }`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Kenapa Paparan Dashboard Belum Berubah?
                    </h4>
                    <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      Apabila fungsi <code className={`font-mono font-bold ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>initSheets()</code> baru sahaja dijalankan pada
                      Google Spreadsheet, spreadsheet anda telah menghasilkan 5 helaian tetapi baris datanya masih kosong (hanya ada tajuk lajur).
                    </p>
                    <p className={`text-xs mt-1 font-semibold ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                      Gunakan butang di bawah untuk memasukkan 20 guru dan 42 tugasan awal terus ke Google Sheet anda, atau tarik data terkini yang anda taip sendiri di spreadsheet:
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={handleSeedToSheets}
                    disabled={syncActionStatus.loading}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center space-x-2 transition-all"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Hantar / Eksport Data Sistem ke Google Sheet (1-Click)</span>
                  </button>

                  <button
                    onClick={handlePullFromSheets}
                    disabled={syncActionStatus.loading}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center justify-center space-x-2 transition-all"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>Tarik Data Terkini dari Google Sheet (Pull Sync)</span>
                  </button>
                </div>
              </div>

              {/* 5 Sheet Counts */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Kiraan Rekod 5 Helaian Google Sheets
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className={`p-3 rounded-xl border text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
                    <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>MASTER_GURU</div>
                    <div className={`text-xl font-extrabold mt-1 ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>
                      {statusInfo?.counts.masterGuru ?? 0}
                    </div>
                    <div className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Guru Berdaftar</div>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
                    <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>AGIHAN_TUGAS</div>
                    <div className={`text-xl font-extrabold mt-1 ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>
                      {statusInfo?.counts.agihanTugas ?? 0}
                    </div>
                    <div className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Rekod Tugasan</div>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
                    <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>CONFIG</div>
                    <div className={`text-xl font-extrabold mt-1 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      {statusInfo?.counts.config ?? 0}
                    </div>
                    <div className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Kategori Tetapan</div>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
                    <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>USERS</div>
                    <div className={`text-xl font-extrabold mt-1 ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>
                      {statusInfo?.counts.users ?? 0}
                    </div>
                    <div className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Pengguna Sistem</div>
                  </div>

                  <div className={`p-3 rounded-xl border text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
                    <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>AUDIT_LOG</div>
                    <div className={`text-xl font-extrabold mt-1 ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>
                      {statusInfo?.counts.auditLog ?? 0}
                    </div>
                    <div className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Log Audit</div>
                  </div>
                </div>
              </div>

              {/* Sync Time */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700/60'
              }`}>
                <div className={`flex items-center space-x-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  <Clock className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                  <span>
                    Penyelarasan Terakhir:{' '}
                    <strong className={isLight ? 'text-slate-900' : 'text-white'}>
                      {statusInfo?.lastSyncTime
                        ? new Date(statusInfo.lastSyncTime).toLocaleTimeString('ms-MY')
                        : 'Baru sahaja'}
                    </strong>
                  </span>
                </div>
                <button
                  onClick={onRefreshNow}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors text-xs flex items-center space-x-1 ${
                    isLight
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'skrip' && (
            <div className="space-y-5">
              {/* Step by Step Guide */}
              <div className={`border p-5 rounded-2xl space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
              }`}>
                <h4 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <Play className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  <span>Langkah Memasang Skrip Pada Google Spreadsheet Anda:</span>
                </h4>
                <ol className={`list-decimal list-inside space-y-2 text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  <li>Buka Google Spreadsheet anda di Google Drive.</li>
                  <li>
                    Di bar menu atas, klik <strong>Extensions</strong> (Pelanjutan) ➔ <strong>Apps Script</strong>.
                  </li>
                  <li>
                    Padam semua kod asal dalam fail <code className={`font-mono font-bold ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>Code.gs</code>, kemudian klik butang biru di bawah untuk salin kod skrip lengkap.
                  </li>
                  <li>
                    Pilih fungsi <strong>initSheets</strong> daripada dropdown fungsi di atas Apps Script, kemudian klik <strong>Run</strong> (Jalankan). 
                    <span className={`font-medium block ml-5 mt-0.5 ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                      ✓ Ini akan menjana 5 helaian tepat: MASTER_GURU, AGIHAN_TUGAS, CONFIG, USERS, AUDIT_LOG secara automatik!
                    </span>
                  </li>
                  <li>
                    Klik butang biru <strong>Deploy</strong> (Gunakan) ➔ <strong>New deployment</strong> (Penggunaan baharu).
                  </li>
                  <li>
                    Pilih jenis: <strong>Web app</strong>. Tetapkan <em>Execute as:</em> <strong>Me</strong> dan <em>Who has access:</em> <strong>Anyone</strong>.
                  </li>
                  <li>
                    Klik <strong>Deploy</strong>, salin URL Web App yang terhasil dan tampal di bawah untuk mengaktifkan sambungan!
                  </li>
                </ol>
              </div>

              {/* Code Box with One-Click Copy */}
              <div className={`border rounded-2xl p-4 space-y-2 ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                    <span className={`font-mono text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>google-apps-script/Code.gs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleDownloadCode}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                        isLight
                          ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                      title="Muat turun fail Code.gs terus ke komputer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Muat Turun Code.gs</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Telah Disalin!' : 'Salin Kod Skrip'}</span>
                    </button>
                  </div>
                </div>

                <pre className={`p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 border ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}>
                  {appsScriptCode}
                </pre>
              </div>

              {/* Live Connection Form */}
              <div className={`border p-5 rounded-2xl space-y-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
              }`}>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Sambungkan Web App Google Apps Script
                  </h4>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Tampal URL Web App anda di bawah untuk menguji sambungan langsung:
                  </p>
                </div>

                {testStatus.msg && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                      testStatus.success
                        ? isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                        : isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/60 border-rose-800 text-rose-300'
                    }`}
                  >
                    {testStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{testStatus.msg}</span>
                  </div>
                )}

                <form onSubmit={handleConnectLive} className="space-y-3">
                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      URL Web App Google Apps Script (Wajib)
                    </label>
                    <input
                      type="url"
                      value={webAppUrl}
                      onChange={(e) => setWebAppUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      required
                      className={`w-full rounded-xl px-3 py-2 text-xs font-mono border transition-colors ${
                        isLight
                          ? 'bg-white text-slate-800 border-slate-300 placeholder:text-slate-400'
                          : 'bg-slate-800 text-slate-100 border-slate-700'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Spreadsheet ID (Pilihan)
                    </label>
                    <input
                      type="text"
                      value={spreadsheetId}
                      onChange={(e) => setSpreadsheetId(e.target.value)}
                      placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className={`w-full rounded-xl px-3 py-2 text-xs font-mono border transition-colors ${
                        isLight
                          ? 'bg-white text-slate-800 border-slate-300 placeholder:text-slate-400'
                          : 'bg-slate-800 text-slate-100 border-slate-700'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={testStatus.loading}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center space-x-1.5 transition-all"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{testStatus.loading ? 'Menyemak Sambungan...' : 'Uji & Sambungkan Sekarang'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isLight
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
