import React, { useState } from 'react';
import { UserCheck, UserPlus, Edit2, Power, AlertTriangle } from 'lucide-react';
import { AppUser } from '../types.ts';

interface UsersManagementViewProps {
  users: AppUser[];
  onAddUser: (user: Partial<AppUser>) => Promise<void>;
  onUpdateUser: (id: string, user: Partial<AppUser>) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const [formData, setFormData] = useState({
    Email: '',
    Nama: '',
    Role: 'EDITOR' as 'ADMIN' | 'EDITOR',
    Status: 'Aktif' as 'Aktif' | 'Tidak Aktif'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAdd = () => {
    setEditingUser(null);
    setFormData({
      Email: '',
      Nama: '',
      Role: 'EDITOR',
      Status: 'Aktif'
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEdit = (u: AppUser) => {
    setEditingUser(u);
    setFormData({
      Email: u.Email,
      Nama: u.Nama,
      Role: u.Role,
      Status: u.Status
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (u: AppUser) => {
    const nextStatus = u.Status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
    await onUpdateUser(u.User_ID, { Status: nextStatus });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Email || !formData.Nama) {
      setErrorMsg('Sila lengkapkan alamat e-mel dan nama pengguna.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await onUpdateUser(editingUser.User_ID, {
          Nama: formData.Nama,
          Role: formData.Role,
          Status: formData.Status
        });
      } else {
        await onAddUser({
          Email: formData.Email.toLowerCase().trim(),
          Nama: formData.Nama.trim(),
          Role: formData.Role,
          Status: formData.Status
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ralat berlaku semasa menyimpan pengguna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span>Pengurusan Pengguna Sistem (USERS)</span>
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Hanya e-mel berdaftar berstatus Aktif dibenarkan mengakses e-PENGURUSAN SKTS 2027
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Daftar Pengguna Baharu</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className={`p-4 rounded-2xl flex items-center justify-between text-xs border ${
        isLight
          ? 'bg-slate-50 border-slate-200 text-slate-600'
          : 'bg-slate-900 border-slate-800 text-slate-400'
      }`}>
        <span>
          <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>Polisi Keselamatan:</strong> Sejarah pengguna tidak dipadamkan secara
          kekal bagi memelihara integriti Audit Trail. Gunakan status <em>Tidak Aktif</em> untuk menyekat akses.
        </span>
      </div>

      {/* Users Table */}
      <div className={`border rounded-2xl shadow-xs overflow-hidden transition-colors ${
        isLight ? 'bg-white border-slate-200/90' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`uppercase tracking-wider font-semibold border-b ${
              isLight ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-800/80 text-slate-300 border-slate-700'
            }`}>
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">Alamat E-mel Google</th>
                <th className="py-3 px-4 text-center">Peranan (Role)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Log Masuk Terakhir</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800'}`}>
              {users.map((u, uIdx) => (
                <tr key={`${u.User_ID || 'user'}-${u.Email}-${uIdx}`} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                  <td className={`py-3.5 px-4 font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{u.User_ID}</td>
                  <td className={`py-3.5 px-4 font-semibold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{u.Nama}</td>
                  <td className={`py-3.5 px-4 font-mono ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{u.Email}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        u.Role === 'ADMIN'
                          ? isLight ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : isLight ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {u.Role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        u.Status === 'Aktif'
                          ? isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/20 text-emerald-300'
                          : isLight ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {u.Status}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{u.Last_Login}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => openEdit(u)}
                        title="Edit Pengguna"
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-blue-600'
                            : 'bg-slate-800 hover:bg-slate-700 text-blue-400'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        title={u.Status === 'Aktif' ? 'Nyahaktifkan Akaun' : 'Aktifkan Akaun'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.Status === 'Aktif'
                            ? isLight
                              ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600'
                              : 'bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400'
                            : isLight
                            ? 'bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600'
                            : 'bg-slate-800 hover:bg-emerald-900/40 text-slate-400 hover:text-emerald-400'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-3xl w-full max-w-md p-6 shadow-2xl ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <h3 className={`text-base font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {editingUser ? 'Kemaskini Pengguna' : 'Daftar Pengguna Baharu'}
            </h3>

            {errorMsg && (
              <div className={`mb-4 p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Alamat E-mel Google (Wajib)</label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  disabled={!!editingUser}
                  placeholder="contoh@moe-dl.edu.my"
                  required
                  className={`w-full rounded-xl px-3 py-2 border transition-colors disabled:opacity-60 ${
                    isLight
                      ? 'bg-slate-50 text-slate-800 border-slate-200 placeholder:text-slate-400 focus:bg-white'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Nama Penuh (Wajib)</label>
                <input
                  type="text"
                  value={formData.Nama}
                  onChange={(e) => setFormData({ ...formData, Nama: e.target.value })}
                  placeholder="Nama pegawai / guru"
                  required
                  className={`w-full rounded-xl px-3 py-2 border transition-colors ${
                    isLight
                      ? 'bg-slate-50 text-slate-800 border-slate-200 placeholder:text-slate-400 focus:bg-white'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Peranan (Role)</label>
                  <select
                    value={formData.Role}
                    onChange={(e) => setFormData({ ...formData, Role: e.target.value as any })}
                    className={`w-full rounded-xl px-3 py-2 border transition-colors ${
                      isLight
                        ? 'bg-slate-50 text-slate-800 border-slate-200'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="EDITOR">EDITOR</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Status</label>
                  <select
                    value={formData.Status}
                    onChange={(e) => setFormData({ ...formData, Status: e.target.value as any })}
                    className={`w-full rounded-xl px-3 py-2 border transition-colors ${
                      isLight
                        ? 'bg-slate-50 text-slate-800 border-slate-200'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className={`flex items-center justify-end space-x-2 pt-4 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
