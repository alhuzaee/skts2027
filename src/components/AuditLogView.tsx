import React, { useState } from 'react';
import { History, Search, Shield, Eye, X } from 'lucide-react';
import { AuditLog } from '../types.ts';

interface AuditLogViewProps {
  logs: AuditLog[];
  theme?: 'light' | 'dark';
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, theme = 'light' }) => {
  const isLight = theme === 'light';
  const [selectedEntity, setSelectedEntity] = useState<string>('Semua');
  const [selectedAction, setSelectedAction] = useState<string>('Semua');
  const [search, setSearch] = useState('');
  const [activeDiff, setActiveDiff] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchEntity = selectedEntity === 'Semua' || log.Entity_Type === selectedEntity;
    const matchAction = selectedAction === 'Semua' || log.Action === selectedAction;
    const matchSearch =
      log.User_Email.toLowerCase().includes(search.toLowerCase()) ||
      log.Record_ID.toLowerCase().includes(search.toLowerCase()) ||
      log.Audit_ID.toLowerCase().includes(search.toLowerCase());
    return matchEntity && matchAction && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <History className="w-5 h-5 text-purple-600" />
            <span>Audit Trail & Log Perubahan Sistem (AUDIT_LOG)</span>
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Rekod keselamatan kekal bagi setiap operasi CREATE, UPDATE, DELETE dan LOGIN pengguna (Khusus Pentadbir)
          </p>
        </div>
        <div className={`hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
          isLight
            ? 'bg-purple-50 text-purple-800 border-purple-200'
            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
        }`}>
          <Shield className="w-3.5 h-3.5" />
          <span>Akses Terkawal Admin</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Entity Filter */}
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className={`rounded-xl px-3 py-1.5 text-xs border transition-colors ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="Semua">Semua Entiti</option>
            <option value="GURU">GURU</option>
            <option value="TUGAS">TUGAS</option>
            <option value="CONFIG">CONFIG</option>
            <option value="USER">USER</option>
          </select>

          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className={`rounded-xl px-3 py-1.5 text-xs border transition-colors ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="Semua">Semua Tindakan</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari e-mel, Record ID..."
            className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs border transition-colors focus:outline-hidden focus:ring-1 focus:ring-purple-500 ${
              isLight
                ? 'bg-slate-50 text-slate-800 border-slate-200 placeholder:text-slate-400'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`border rounded-2xl shadow-xs overflow-hidden transition-colors ${
        isLight ? 'bg-white border-slate-200/90' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`uppercase tracking-wider font-semibold border-b ${
              isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-800/80 text-slate-300 border-slate-700'
            }`}>
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Tarikh & Masa</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4 text-center">Entiti</th>
                <th className="py-3 px-4 text-center">Tindakan</th>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4 text-right">Perincian Diff</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
              {filteredLogs.map((log, index) => (
                <tr key={`${log.Audit_ID || 'audit'}-${index}`} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                  <td className={`py-3 px-4 font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{log.Audit_ID}</td>
                  <td className={`py-3 px-4 whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {new Date(log.Timestamp).toLocaleString('ms-MY')}
                  </td>
                  <td className={`py-3 px-4 font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{log.User_Email}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                      isLight
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {log.Entity_Type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.Action === 'CREATE'
                          ? isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-300'
                          : log.Action === 'UPDATE'
                          ? isLight ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-blue-500/20 text-blue-300'
                          : log.Action === 'DELETE'
                          ? isLight ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-rose-500/20 text-rose-300'
                          : isLight ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {log.Action}
                    </span>
                  </td>
                  <td className={`py-3 px-4 font-mono ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{log.Record_ID}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveDiff(log)}
                      className={`px-2.5 py-1 rounded-lg transition-colors inline-flex items-center space-x-1 ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Lihat Perubahan</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diff Viewer Modal */}
      {activeDiff && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className={`p-5 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
            }`}>
              <div>
                <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Perincian Audit: {activeDiff.Audit_ID} ({activeDiff.Entity_Type} - {activeDiff.Action})
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Oleh: {activeDiff.User_Email} pada {new Date(activeDiff.Timestamp).toLocaleString('ms-MY')}
                </p>
              </div>
              <button
                onClick={() => setActiveDiff(null)}
                className={`p-1.5 rounded-full transition-colors ${
                  isLight
                    ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
                  Nilai Asal (Old_Value)
                </h4>
                <pre className={`p-3 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-80 border ${
                  isLight
                    ? 'bg-rose-50/50 border-rose-200 text-slate-800'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}>
                  {activeDiff.Old_Value}
                </pre>
              </div>

              <div>
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                  Nilai Baharu (New_Value)
                </h4>
                <pre className={`p-3 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-80 border ${
                  isLight
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}>
                  {activeDiff.New_Value}
                </pre>
              </div>
            </div>

            <div className={`p-4 border-t flex justify-end ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
            }`}>
              <button
                onClick={() => setActiveDiff(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
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
      )}
    </div>
  );
};
