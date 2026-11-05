import React, { useState } from 'react';
import { Settings, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { ConfigData } from '../types.ts';

interface ConfigManagementViewProps {
  config: ConfigData | null;
  onUpdateConfig: (updated: Partial<ConfigData>) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const ConfigManagementView: React.FC<ConfigManagementViewProps> = ({
  config,
  onUpdateConfig,
  theme = 'light'
}) => {
  if (!config) return null;
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'kategori' | 'pemetaan' | 'sasaran' | 'ambang'>('pemetaan');
  const [pemetaan, setPemetaan] = useState<Record<string, string>>({ ...config.PEMETAAN_BIDANG });
  const [sasaranGred, setSasaranGred] = useState({ ...config.SASARAN_GRED });
  const [ambang, setAmbang] = useState({ ...config.AMBANG_BEBAN });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Bidang Mapping state
  const [newBidangKey, setNewBidangKey] = useState('');
  const [newKlusterVal, setNewKlusterVal] = useState(config.KLUSTER[0] || 'Pentadbiran');

  const handleSavePemetaan = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateConfig({ PEMETAAN_BIDANG: pemetaan });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSasaran = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateConfig({ SASARAN_GRED: sasaranGred, AMBANG_BEBAN: ambang });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPemetaan = () => {
    if (!newBidangKey.trim()) return;
    setPemetaan((prev) => ({ ...prev, [newBidangKey.trim()]: newKlusterVal }));
    setNewBidangKey('');
  };

  const handleRemovePemetaan = (key: string) => {
    const updated = { ...pemetaan };
    delete updated[key];
    setPemetaan(updated);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <Settings className="w-5 h-5 text-indigo-600" />
          <span>Pengurusan Konfigurasi Sistem (CONFIG)</span>
        </h2>
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Urus senarai rujukan, pemetaan bidang kepada kluster, sasaran pemberatan gred, dan ambang beban
        </p>
      </div>

      {saveSuccess && (
        <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
          isLight
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Konfigurasi berjaya dikemas kini dan disimpan ke dalam pangkalan data.</span>
        </div>
      )}

      {/* Tabs */}
      <div className={`flex items-center space-x-2 border-b pb-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <button
          onClick={() => setActiveTab('pemetaan')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'pemetaan'
              ? 'bg-indigo-600 text-white shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-200/70'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Pemetaan Bidang ➔ Kluster
        </button>
        <button
          onClick={() => setActiveTab('sasaran')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'sasaran'
              ? 'bg-indigo-600 text-white shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-200/70'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Sasaran Pemberatan Gred
        </button>
        <button
          onClick={() => setActiveTab('ambang')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'ambang'
              ? 'bg-indigo-600 text-white shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-200/70'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Ambang Beban Tugas
        </button>
        <button
          onClick={() => setActiveTab('kategori')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'kategori'
              ? 'bg-indigo-600 text-white shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-200/70'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Nilai Dropdown Asas
        </button>
      </div>

      {/* Tab 1: Pemetaan Bidang ke Kluster */}
      {activeTab === 'pemetaan' && (
        <div className={`border rounded-2xl p-5 space-y-4 transition-colors ${
          isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Pemetaan Bidang Kepada Kluster</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Menetapkan cadangan automatik bagi kluster tugasan apabila bidang dipilih
              </p>
            </div>
            <button
              onClick={handleSavePemetaan}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pemetaan'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {Object.entries(pemetaan).map(([bidang, kluster]) => (
              <div
                key={bidang}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-850 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{bidang}</span>
                  <span className="text-slate-400">➔</span>
                  <span
                    className={`font-semibold ${
                      kluster === 'Belum Dipetakan'
                        ? isLight ? 'text-amber-700' : 'text-amber-400'
                        : isLight ? 'text-emerald-700' : 'text-emerald-400'
                    }`}
                  >
                    {kluster}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={kluster}
                    onChange={(e) =>
                      setPemetaan({ ...pemetaan, [bidang]: e.target.value })
                    }
                    className={`rounded-lg px-2.5 py-1 text-xs border ${
                      isLight
                        ? 'bg-white text-slate-800 border-slate-300'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    {config.KLUSTER.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemovePemetaan(bidang)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Mapping */}
          <div className={`pt-3 border-t flex flex-col sm:flex-row items-center gap-2 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <input
              type="text"
              value={newBidangKey}
              onChange={(e) => setNewBidangKey(e.target.value)}
              placeholder="Nama Bidang baharu..."
              className={`flex-1 rounded-xl px-3 py-1.5 text-xs border ${
                isLight
                  ? 'bg-slate-50 text-slate-800 border-slate-200 placeholder:text-slate-400 focus:bg-white'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            />
            <select
              value={newKlusterVal}
              onChange={(e) => setNewKlusterVal(e.target.value)}
              className={`rounded-xl px-3 py-1.5 text-xs border ${
                isLight
                  ? 'bg-slate-50 text-slate-800 border-slate-200'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              {config.KLUSTER.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddPemetaan}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Sasaran Gred */}
      {activeTab === 'sasaran' && (
        <div className={`border rounded-2xl p-5 space-y-4 transition-colors ${
          isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Sasaran Pemberatan Mengikut Gred</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Nilai Minimum, Sasaran Ideal, dan Maksimum bagi penentuan status beban guru
              </p>
            </div>
            <button
              onClick={handleSaveSasaran}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Sasaran'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(sasaranGred).map(([gred, vals]) => (
              <div key={gred} className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
              }`}>
                <span className={`font-bold text-sm block ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>{gred}</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Min</label>
                    <input
                      type="number"
                      value={vals.min}
                      onChange={(e) =>
                        setSasaranGred({
                          ...sasaranGred,
                          [gred]: { ...vals, min: Number(e.target.value) }
                        })
                      }
                      className={`w-full rounded-lg p-1 font-mono text-center border ${
                        isLight
                          ? 'bg-white text-slate-800 border-slate-300'
                          : 'bg-slate-800 text-white border-slate-700'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Sasaran</label>
                    <input
                      type="number"
                      value={vals.sasaran}
                      onChange={(e) =>
                        setSasaranGred({
                          ...sasaranGred,
                          [gred]: { ...vals, sasaran: Number(e.target.value) }
                        })
                      }
                      className={`w-full rounded-lg p-1 font-mono text-center border ${
                        isLight
                          ? 'bg-white text-slate-800 border-slate-300'
                          : 'bg-slate-800 text-white border-slate-700'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Maks</label>
                    <input
                      type="number"
                      value={vals.max}
                      onChange={(e) =>
                        setSasaranGred({
                          ...sasaranGred,
                          [gred]: { ...vals, max: Number(e.target.value) }
                        })
                      }
                      className={`w-full rounded-lg p-1 font-mono text-center border ${
                        isLight
                          ? 'bg-white text-slate-800 border-slate-300'
                          : 'bg-slate-800 text-white border-slate-700'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Ambang Beban */}
      {activeTab === 'ambang' && (
        <div className={`border rounded-2xl p-5 space-y-4 transition-colors ${
          isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Ambang Beban Tugas Keseluruhan</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Nilai had untuk mengelaskan tahap beban kepada Rendah, Seimbang, atau Tinggi
              </p>
            </div>
            <button
              onClick={handleSaveSasaran}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Ambang'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border space-y-2 text-xs ${
              isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-850 border-slate-800'
            }`}>
              <label className={`font-semibold block ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>Had Maksimum Beban Rendah</label>
              <input
                type="number"
                value={ambang.rendahMax}
                onChange={(e) => setAmbang({ ...ambang, rendahMax: Number(e.target.value) })}
                className={`w-full rounded-xl p-2 font-mono text-sm border ${
                  isLight
                    ? 'bg-white text-slate-800 border-slate-300'
                    : 'bg-slate-800 text-white border-slate-700'
                }`}
              />
              <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Mana-mana guru dengan jumlah mata di bawah nilai ini dikelaskan sebagai <strong>Beban Rendah</strong>.
              </span>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 text-xs ${
              isLight ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-850 border-slate-800'
            }`}>
              <label className={`font-semibold block ${isLight ? 'text-rose-800' : 'text-rose-400'}`}>Had Maksimum Beban Seimbang</label>
              <input
                type="number"
                value={ambang.seimbangMax}
                onChange={(e) => setAmbang({ ...ambang, seimbangMax: Number(e.target.value) })}
                className={`w-full rounded-xl p-2 font-mono text-sm border ${
                  isLight
                    ? 'bg-white text-slate-800 border-slate-300'
                    : 'bg-slate-800 text-white border-slate-700'
                }`}
              />
              <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Mana-mana guru dengan jumlah mata melebihi nilai ini dikelaskan sebagai <strong>Beban Tinggi</strong>.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Nilai Dropdown Asas */}
      {activeTab === 'kategori' && (
        <div className={`border rounded-2xl p-5 space-y-4 transition-colors ${
          isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'
        }`}>
          <div>
            <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Nilai Rujukan Dropdown Sistem</h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Semua nilai dropdown dijana secara dinamik daripada helaian CONFIG
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
              <h4 className={`font-bold mb-2 ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>GRED ({config.GRED.length})</h4>
              <div className="space-y-1">
                {config.GRED.map((g) => (
                  <div key={g} className={`px-2 py-0.5 rounded ${isLight ? 'bg-white text-slate-800 border border-slate-200' : 'bg-slate-800 text-slate-300'}`}>
                    {g}
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
              <h4 className={`font-bold mb-2 ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>KLUSTER ({config.KLUSTER.length})</h4>
              <div className="space-y-1">
                {config.KLUSTER.map((k) => (
                  <div key={k} className={`px-2 py-0.5 rounded ${isLight ? 'bg-white text-slate-800 border border-slate-200' : 'bg-slate-800 text-slate-300'}`}>
                    {k}
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
              <h4 className={`font-bold mb-2 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>STATUS ({config.STATUS.length})</h4>
              <div className="space-y-1">
                {config.STATUS.map((s) => (
                  <div key={s} className={`px-2 py-0.5 rounded ${isLight ? 'bg-white text-slate-800 border border-slate-200' : 'bg-slate-800 text-slate-300'}`}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'}`}>
              <h4 className={`font-bold mb-2 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>BIDANG ({config.BIDANG.length})</h4>
              <div className="space-y-1">
                {config.BIDANG.map((b) => (
                  <div key={b} className={`px-2 py-0.5 rounded ${isLight ? 'bg-white text-slate-800 border border-slate-200' : 'bg-slate-800 text-slate-300'}`}>
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
