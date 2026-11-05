import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle2, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Guru, Tugasan, GlobalFilterState } from '../types.ts';

interface LaporanExportViewProps {
  filteredTeachers: Guru[];
  filteredTasks: (Tugasan & { Gred?: string; Opsyen?: string })[];
  currentFilter: GlobalFilterState;
  theme?: 'light' | 'dark';
}

export const LaporanExportView: React.FC<LaporanExportViewProps> = ({
  filteredTeachers,
  filteredTasks,
  currentFilter,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const [selectedReport, setSelectedReport] = useState<string>('semua-guru');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');

  const reportOptions = [
    { id: 'semua-guru', label: '1. Laporan Semua Guru', desc: 'Senarai penuh guru, gred, opsyen, dan jumlah beban terkumpul' },
    { id: 'semua-tugasan', label: '2. Laporan Semua Tugasan', desc: 'Senarai agihan tugasan, jawatankuasa, skop, dan peratus kemajuan' },
    { id: 'beban-guru', label: '3. Laporan Analisis Beban Tugas', desc: 'Perincian beban tugas guru berbanding sasaran gred' },
    { id: 'mengikut-bidang', label: '4. Laporan Mengikut Bidang', desc: 'Ringkasan agihan tugasan dikelaskan mengikut bidang' },
    { id: 'mengikut-kluster', label: '5. Laporan Mengikut Kluster', desc: 'Agihan tugas mengikut kluster (Pentadbiran, Kurikulum, HEM, Kokurikulum)' },
    { id: 'mengikut-gred', label: '6. Laporan Mengikut Gred', desc: 'Analisis perbandingan beban mengikut gred jawatan' },
    { id: 'status-pelaksanaan', label: '7. Laporan Status Pelaksanaan', desc: 'Penjejakan tugasan selesai, dalam pelaksanaan, dan tertangguh' }
  ];

  const handleExport = () => {
    let dataToExport: any[] = [];
    let fileName = `SK_Taman_Seroja_2027_${selectedReport}`;

    if (selectedReport === 'semua-guru') {
      dataToExport = filteredTeachers.map((g) => ({
        'Guru ID': g.Guru_ID,
        'Nama Guru': g.Nama_Guru,
        Gred: g.Gred,
        Opsyen: g.Opsyen,
        Status: g.Status_Aktif,
        'Tarikh Mula': g.Tarikh_Mula,
        'Bilangan Tugasan': g.Bilangan_Tugasan,
        'Jumlah Pemberatan': g.Jumlah_Pemberatan,
        'Status Padanan': g.Status_Padanan
      }));
    } else if (selectedReport === 'semua-tugasan') {
      dataToExport = filteredTasks.map((t) => ({
        'Record ID': t.Record_ID,
        'Guru ID': t.Guru_ID,
        'Nama Guru': t.Nama_Guru,
        Gred: t.Gred || '',
        Opsyen: t.Opsyen || '',
        Bidang: t.Bidang,
        Kluster: t.Kluster,
        'Jawatankuasa / Unit': t.Jawatankuasa_Unit,
        'Jawatan / Tugasan': t.Jawatan_Tugasan,
        'Skop / Kelas / Tarikh': t.Skop_Kelas_Tarikh,
        Pemberatan: t.Pemberatan,
        Status: t.Status,
        'Peratus Kemajuan': `${t.Peratus_Kemajuan}%`,
        Catatan: t.Catatan,
        'Dikemas Kini Oleh': t.Updated_By,
        'Tarikh Kemas Kini': t.Updated_At
      }));
    } else if (selectedReport === 'beban-guru') {
      dataToExport = filteredTeachers.map((g) => {
        let tahap = 'Seimbang';
        if (g.Jumlah_Pemberatan < 12) tahap = 'Rendah';
        if (g.Jumlah_Pemberatan > 24) tahap = 'Tinggi';
        return {
          'Guru ID': g.Guru_ID,
          'Nama Guru': g.Nama_Guru,
          Gred: g.Gred,
          Opsyen: g.Opsyen,
          'Bilangan Tugasan': g.Bilangan_Tugasan,
          'Jumlah Beban': g.Jumlah_Pemberatan,
          'Purata Beban/Tugas':
            g.Bilangan_Tugasan > 0 ? (g.Jumlah_Pemberatan / g.Bilangan_Tugasan).toFixed(1) : 0,
          'Tahap Beban': tahap
        };
      });
    } else if (selectedReport === 'mengikut-bidang') {
      dataToExport = filteredTasks.map((t) => ({
        Bidang: t.Bidang,
        Kluster: t.Kluster,
        'Jawatankuasa / Unit': t.Jawatankuasa_Unit,
        'Jawatan / Tugasan': t.Jawatan_Tugasan,
        'Nama Guru': t.Nama_Guru,
        Pemberatan: t.Pemberatan,
        Status: t.Status
      }));
    } else if (selectedReport === 'mengikut-kluster') {
      dataToExport = filteredTasks.map((t) => ({
        Kluster: t.Kluster,
        Bidang: t.Bidang,
        'Jawatankuasa / Unit': t.Jawatankuasa_Unit,
        'Nama Guru': t.Nama_Guru,
        'Jawatan / Tugasan': t.Jawatan_Tugasan,
        Status: t.Status
      }));
    } else if (selectedReport === 'mengikut-gred') {
      const gredMap: Record<string, { guruCount: number; taskCount: number; totalWeight: number }> = {};
      filteredTeachers.forEach((g) => {
        if (!gredMap[g.Gred]) gredMap[g.Gred] = { guruCount: 0, taskCount: 0, totalWeight: 0 };
        gredMap[g.Gred].guruCount += 1;
        gredMap[g.Gred].taskCount += g.Bilangan_Tugasan;
        gredMap[g.Gred].totalWeight += g.Jumlah_Pemberatan;
      });
      dataToExport = Object.entries(gredMap).map(([gred, d]) => ({
        Gred: gred,
        'Jumlah Guru': d.guruCount,
        'Jumlah Tugasan': d.taskCount,
        'Jumlah Pemberatan': d.totalWeight,
        'Purata Pemberatan / Guru': d.guruCount > 0 ? (d.totalWeight / d.guruCount).toFixed(1) : 0
      }));
    } else if (selectedReport === 'status-pelaksanaan') {
      dataToExport = filteredTasks.map((t) => ({
        Status: t.Status,
        'Kemajuan (%)': t.Peratus_Kemajuan,
        'Nama Guru': t.Nama_Guru,
        Jawatankuasa: t.Jawatankuasa_Unit,
        Tugasan: t.Jawatan_Tugasan,
        Catatan: t.Catatan,
        'Tarikh Kemas Kini': t.Updated_At
      }));
    }

    if (dataToExport.length === 0) {
      alert('Tiada data untuk dieksport berdasarkan penapis semasa.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan SK Taman Seroja 2027');

    if (exportFormat === 'xlsx') {
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } else {
      XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: 'csv' });
    }
  };

  const activeFilters = Object.entries(currentFilter).filter(([_, v]) => Boolean(v));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <span>Pusat Laporan & Eksport Data SK Taman Seroja 2027</span>
        </h2>
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Eksport laporan komprehensif ke format Microsoft Excel (.xlsx) atau CSV mengikut penapis semasa
        </p>
      </div>

      {/* Active Filter Note */}
      {activeFilters.length > 0 && (
        <div className={`p-3.5 rounded-2xl flex items-center space-x-3 text-xs border ${
          isLight
            ? 'bg-blue-50 border-blue-200 text-blue-900'
            : 'bg-blue-950/40 border-blue-800/60 text-blue-200'
        }`}>
          <Filter className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <span className={`font-semibold ${isLight ? 'text-blue-950' : 'text-white'}`}>Penapis Semasa Aktif: </span>
            {activeFilters.map(([k, v]) => `${k}: ${v}`).join(' | ')}
            <span className={`block text-[11px] mt-0.5 ${isLight ? 'text-blue-700' : 'text-slate-400'}`}>
              Data laporan yang dimuat turun akan diselaraskan mengikut {filteredTeachers.length} orang guru dan{' '}
              {filteredTasks.length} rekod tugasan terpilih.
            </span>
          </div>
        </div>
      )}

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportOptions.map((rep) => (
          <div
            key={rep.id}
            onClick={() => setSelectedReport(rep.id)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3.5 ${
              selectedReport === rep.id
                ? isLight
                  ? 'bg-blue-50 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-blue-900/30 border-blue-500 shadow-md shadow-blue-500/10'
                : isLight
                ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div
              className={`p-2 rounded-xl mt-0.5 ${
                selectedReport === rep.id
                  ? 'bg-blue-600 text-white'
                  : isLight
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{rep.label}</h4>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{rep.desc}</p>
            </div>
            {selectedReport === rep.id && (
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Export Format & Button */}
      <div className={`border rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center space-x-3">
          <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Pilih Format:</span>
          <div className={`flex items-center space-x-1.5 p-1 rounded-xl ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
            <button
              onClick={() => setExportFormat('xlsx')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                exportFormat === 'xlsx'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Excel (.xlsx)
            </button>
            <button
              onClick={() => setExportFormat('csv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                exportFormat === 'csv'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CSV (.csv)
            </button>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Muat Turun Laporan Terpilih</span>
        </button>
      </div>
    </div>
  );
};
