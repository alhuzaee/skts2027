import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from './services/api.ts';
import {
  Guru,
  Tugasan,
  ConfigData,
  AppUser,
  AuditLog,
  GlobalFilterState,
  SystemStatusInfo
} from './types.ts';
import { Header } from './components/Header.tsx';
import { Sidebar, ActiveTab } from './components/Sidebar.tsx';
import { GlobalFilterBar } from './components/GlobalFilterBar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { GuruListView } from './components/GuruListView.tsx';
import { AgihanTugasanView } from './components/AgihanTugasanView.tsx';
import { JawatankuasaView } from './components/JawatankuasaView.tsx';
import { AnalisisBebanView } from './components/AnalisisBebanView.tsx';
import { AnalisisGredView } from './components/AnalisisGredView.tsx';
import { AnalisisOpsyenView } from './components/AnalisisOpsyenView.tsx';
import { PemantauanView } from './components/PemantauanView.tsx';
import { SemakanPadananView } from './components/SemakanPadananView.tsx';
import { LaporanExportView } from './components/LaporanExportView.tsx';
import { AuditLogView } from './components/AuditLogView.tsx';
import { UsersManagementView } from './components/UsersManagementView.tsx';
import { ConfigManagementView } from './components/ConfigManagementView.tsx';
import { StatusSistemModal } from './components/StatusSistemModal.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { GuruProfileModal } from './components/GuruProfileModal.tsx';
import { TambahEditGuruModal } from './components/Modals/TambahEditGuruModal.tsx';
import { TambahEditTugasanModal } from './components/Modals/TambahEditTugasanModal.tsx';
import { DeleteConfirmModal } from './components/Modals/DeleteConfirmModal.tsx';
import { VersionConflictModal } from './components/Modals/VersionConflictModal.tsx';
import { AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';

export default function App() {
  // Auth state: user starts logged out and must sign in via the login page
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('skts_user_email')) || '';
  });
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCheckingLogin, setIsCheckingLogin] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentUserEmail) {
        localStorage.setItem('skts_user_email', currentUserEmail);
      } else {
        localStorage.removeItem('skts_user_email');
      }
    }
  }, [currentUserEmail]);

  // Theme state: default to 'light' (Mode Cerah) per user request
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('skts_theme') : null;
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('skts_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Core Data state
  const [teachers, setTeachers] = useState<Guru[]>([]);
  const [tasks, setTasks] = useState<Tugasan[]>([]);
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [statusInfo, setStatusInfo] = useState<SystemStatusInfo | null>(null);

  // App UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(15);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Filter state
  const [globalFilters, setGlobalFilters] = useState<GlobalFilterState>({
    namaGuru: '',
    gred: '',
    opsyen: '',
    bidang: '',
    kluster: '',
    jawatankuasa: '',
    status: ''
  });

  // Modal states
  const [selectedTeacherProfile, setSelectedTeacherProfile] = useState<Guru | null>(null);
  const [teacherToEdit, setTeacherToEdit] = useState<Guru | null>(null);
  const [isAddingGuru, setIsAddingGuru] = useState(false);

  const [taskToEdit, setTaskToEdit] = useState<Tugasan | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState<Tugasan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isConflictOpen, setIsConflictOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Whether user is currently editing a form (pauses auto-refresh Section 42)
  const isEditing = Boolean(
    isAddingGuru || teacherToEdit || isAddingTask || taskToEdit || taskToDelete
  );

  // Fetch all data
  const loadData = useCallback(async (showFullLoader = false) => {
    if (showFullLoader) setIsLoading(true);
    setIsRefreshing(true);
    setAuthError(null);

    api.setUserEmail(currentUserEmail);

    try {
      // 1. Verify User
      setIsCheckingLogin(true);
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      setIsCheckingLogin(false);

      // 2. Load Core Data in Parallel
      const [tList, tkList, cfg, uList, st] = await Promise.all([
        api.getGuruList(),
        api.getTugasanList(),
        api.getConfig(),
        api.getUsers(),
        api.getStatus()
      ]);

      setTeachers(tList);
      setTasks(tkList);
      setConfig(cfg);
      setUsers(uList);
      setStatusInfo(st);

      // If user is Admin, load audit logs
      if (user.Role === 'ADMIN') {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      }
    } catch (err: any) {
      console.error('Data load error:', err);
      if (err.message && err.message.includes('Anda tidak mempunyai kebenaran')) {
        setAuthError(err.message);
      } else if (!currentUserEmail) {
        // Login attempt failed for another reason; surface it on the login page
        setAuthError(err.message || 'Log masuk gagal. Sila cuba lagi.');
      }
    } finally {
      setIsCheckingLogin(false);
      setIsLoading(false);
      setIsRefreshing(false);
      setSecondsUntilRefresh(15);
    }
  }, [currentUserEmail]);

  // Data loading only begins once the user has signed in
  useEffect(() => {
    if (currentUserEmail) loadData(true);
  }, [loadData]);

  // 15-second Auto Refresh Timer (Section 28 & 42: pauses during active editing)
  useEffect(() => {
    if (isEditing || authError || !currentUserEmail) return;

    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          loadData(false);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isEditing, authError, loadData]);

  // Available committees list
  const availableCommittees = useMemo(() => {
    const set = new Set(tasks.map((t) => t.Jawatankuasa_Unit).filter(Boolean));
    return Array.from(set).sort();
  }, [tasks]);

  // Apply Global Filters to Teachers and Tasks
  const filteredTeachers = useMemo(() => {
    return teachers.filter((g) => {
      if (globalFilters.namaGuru && g.Nama_Guru !== globalFilters.namaGuru) return false;
      if (globalFilters.gred && g.Gred !== globalFilters.gred) return false;
      if (globalFilters.opsyen && g.Opsyen !== globalFilters.opsyen) return false;

      // Filter by task-related attributes
      if (globalFilters.bidang || globalFilters.kluster || globalFilters.jawatankuasa || globalFilters.status) {
        const teacherTasks = tasks.filter((t) => t.Guru_ID === g.Guru_ID);
        const matchesTasks = teacherTasks.some((t) => {
          if (globalFilters.bidang && t.Bidang !== globalFilters.bidang) return false;
          if (globalFilters.kluster && t.Kluster !== globalFilters.kluster) return false;
          if (globalFilters.jawatankuasa && t.Jawatankuasa_Unit !== globalFilters.jawatankuasa) return false;
          if (globalFilters.status && t.Status !== globalFilters.status) return false;
          return true;
        });
        if (!matchesTasks) return false;
      }

      return true;
    });
  }, [teachers, tasks, globalFilters]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (globalFilters.namaGuru && t.Nama_Guru !== globalFilters.namaGuru) return false;
      if (globalFilters.bidang && t.Bidang !== globalFilters.bidang) return false;
      if (globalFilters.kluster && t.Kluster !== globalFilters.kluster) return false;
      if (globalFilters.jawatankuasa && t.Jawatankuasa_Unit !== globalFilters.jawatankuasa) return false;
      if (globalFilters.status && t.Status !== globalFilters.status) return false;

      // Filter by teacher-related attributes
      const guru = teachers.find((g) => g.Guru_ID === t.Guru_ID);
      if (globalFilters.gred && (!guru || guru.Gred !== globalFilters.gred)) return false;
      if (globalFilters.opsyen && (!guru || guru.Opsyen !== globalFilters.opsyen)) return false;

      return true;
    });
  }, [tasks, teachers, globalFilters]);

  // Reset Filters
  const handleResetFilters = () => {
    setGlobalFilters({
      namaGuru: '',
      gred: '',
      opsyen: '',
      bidang: '',
      kluster: '',
      jawatankuasa: '',
      status: ''
    });
  };

  const handleFilterChange = (key: keyof GlobalFilterState, value: string) => {
    setGlobalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // CRUD Handlers for MASTER_GURU with Version Conflict Detection
  const handleSaveGuru = async (guruData: Partial<Guru>, expectedVersion?: number) => {
    try {
      if (teacherToEdit) {
        await api.updateGuru(teacherToEdit.Guru_ID, guruData, expectedVersion ?? teacherToEdit.Version);
      } else {
        await api.createGuru(guruData);
      }
      await loadData(false);
      setTeacherToEdit(null);
      setIsAddingGuru(false);
    } catch (err: any) {
      if (err.status === 409) {
        setIsConflictOpen(true);
        return;
      }
      throw err;
    }
  };

  const handleToggleGuruStatus = async (guru: Guru) => {
    try {
      const nextStatus = guru.Status_Aktif === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
      await api.toggleGuruStatus(guru.Guru_ID, nextStatus, guru.Version);
      await loadData(false);
    } catch (err: any) {
      if (err.status === 409) {
        setIsConflictOpen(true);
        return;
      }
      alert(err.message || 'Gagal menukar status guru.');
    }
  };

  const handleUpdateStatusPadanan = async (
    guru: Guru,
    newStatus: 'MATCHED' | 'UNMATCHED' | 'POSSIBLE_MATCH'
  ) => {
    try {
      await api.updateGuru(guru.Guru_ID, { Status_Padanan: newStatus }, guru.Version);
      await loadData(false);
    } catch (err: any) {
      if (err.status === 409) {
        setIsConflictOpen(true);
        return;
      }
      alert(err.message || 'Gagal mengemas kini padanan guru.');
    }
  };

  // CRUD Handlers for AGIHAN_TUGAS with Version Conflict Detection
  const handleSaveTask = async (taskData: Partial<Tugasan>, expectedVersion?: number) => {
    try {
      if (taskToEdit) {
        await api.updateTugasan(taskToEdit.Record_ID, taskData, expectedVersion ?? taskToEdit.Version);
      } else {
        await api.createTugasan(taskData);
      }
      await loadData(false);
      setTaskToEdit(null);
      setIsAddingTask(false);
    } catch (err: any) {
      if (err.status === 409) {
        setIsConflictOpen(true);
        return;
      }
      throw err;
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteTugasan(taskToDelete.Record_ID);
      await loadData(false);
      setTaskToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Gagal memadam tugasan.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Config and Users Handlers
  const handleUpdateConfig = async (updated: Partial<ConfigData>) => {
    await api.updateConfig(updated);
    await loadData(false);
  };

  const handleAddUser = async (newUser: Partial<AppUser>) => {
    await api.createUser(newUser);
    await loadData(false);
  };

  const handleUpdateUser = async (id: string, updated: Partial<AppUser>) => {
    await api.updateUser(id, updated);
    await loadData(false);
  };

  // Login Screen: shown when no user has signed in yet
  if (!currentUserEmail) {
    return (
      <LoginPage
        onLogin={(email) => {
          setAuthError(null);
          setCurrentUserEmail(email);
        }}
        isChecking={isCheckingLogin}
        error={authError}
        theme={theme}
      />
    );
  }

  // Unauthorized Forbidden Screen (Section 7)
  if (authError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-800/80 rounded-3xl p-8 max-w-lg w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Akses Disekat</h2>
          <p className="text-base font-semibold text-rose-400">
            Anda tidak mempunyai kebenaran untuk mengakses sistem ini.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Alamat e-mel <code className="text-amber-300 font-mono">{currentUserEmail}</code> tidak berdaftar atau
            berstatus <strong>Tidak Aktif</strong> di dalam helaian USERS e-PENGURUSAN SKTS 2027.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={() => {
                setCurrentUserEmail('iab-1235@moe-dl.edu.my');
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/30"
            >
              Log Masuk Semula Sebagai Pentadbir (iab-1235@moe-dl.edu.my)
            </button>
            <button
              onClick={() => {
                setAuthError(null);
                setCurrentUser(null);
                setCurrentUserEmail('');
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all"
            >
              Log Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white ${
      theme === 'light' ? 'bg-slate-100/90 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Header */}
      <Header
        currentUser={currentUser}
        onSelectUserEmail={setCurrentUserEmail}
        allUsers={users}
        statusInfo={statusInfo}
        onManualRefresh={() => loadData(false)}
        isRefreshing={isRefreshing}
        secondsUntilRefresh={secondsUntilRefresh}
        isEditing={isEditing}
        onOpenStatusModal={() => setIsStatusModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onLogout={() => {
          setAuthError(null);
          setCurrentUser(null);
          setCurrentUserEmail('');
        }}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          theme={theme}
        />

        {/* Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Global Filter Bar */}
          <GlobalFilterBar
            filters={globalFilters}
            setFilters={setGlobalFilters}
            config={config}
            teachers={teachers}
            onResetFilters={handleResetFilters}
            onExportClick={() => setActiveTab('laporan')}
            availableCommittees={availableCommittees}
            theme={theme}
          />

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className={`text-xs font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Memuatkan data sistem e-PENGURUSAN SKTS 2027 (SK Taman Seroja)...
              </p>
            </div>
          ) : (
            <>
              {/* Active Tab View */}
              {activeTab === 'dashboard' && (
                <DashboardView
                  filteredTeachers={filteredTeachers}
                  filteredTasks={filteredTasks}
                  allTeachers={teachers}
                  allTasks={tasks}
                  config={config}
                  onFilterChange={handleFilterChange}
                  onSelectGuruProfile={(g) => setSelectedTeacherProfile(g)}
                  theme={theme}
                />
              )}

              {activeTab === 'guru' && (
                <GuruListView
                  teachers={filteredTeachers}
                  currentUser={currentUser}
                  onOpenAddGuru={() => setIsAddingGuru(true)}
                  onOpenEditGuru={(g) => setTeacherToEdit(g)}
                  onToggleStatus={handleToggleGuruStatus}
                  onSelectGuruProfile={(g) => setSelectedTeacherProfile(g)}
                  theme={theme}
                />
              )}

              {activeTab === 'tugasan' && (
                <AgihanTugasanView
                  tasks={filteredTasks}
                  currentUser={currentUser}
                  onOpenAddTask={() => setIsAddingTask(true)}
                  onOpenEditTask={(t) => setTaskToEdit(t)}
                  onOpenDeleteConfirm={(t) => setTaskToDelete(t)}
                  theme={theme}
                />
              )}

              {activeTab === 'jawatankuasa' && (
                <JawatankuasaView
                  tasks={filteredTasks}
                  teachers={teachers}
                  onSelectGuruProfile={(g) => setSelectedTeacherProfile(g)}
                  onOpenEditTask={(t) => setTaskToEdit(t)}
                  theme={theme}
                />
              )}

              {activeTab === 'analisis-beban' && (
                <AnalisisBebanView
                  teachers={filteredTeachers}
                  tasks={filteredTasks}
                  config={config}
                  onSelectGuruProfile={(g) => setSelectedTeacherProfile(g)}
                  theme={theme}
                />
              )}

              {activeTab === 'analisis-gred' && (
                <AnalisisGredView
                  teachers={filteredTeachers}
                  tasks={filteredTasks}
                  config={config}
                  theme={theme}
                />
              )}

              {activeTab === 'analisis-opsyen' && (
                <AnalisisOpsyenView
                  teachers={filteredTeachers}
                  tasks={filteredTasks}
                  theme={theme}
                />
              )}

              {activeTab === 'pemantauan' && (
                <PemantauanView
                  tasks={filteredTasks}
                  onOpenEditTask={(t) => setTaskToEdit(t)}
                  theme={theme}
                />
              )}

              {activeTab === 'padanan' && (
                <SemakanPadananView
                  teachers={filteredTeachers}
                  currentUser={currentUser}
                  onUpdateStatusPadanan={handleUpdateStatusPadanan}
                  onSelectGuruProfile={(g) => setSelectedTeacherProfile(g)}
                  theme={theme}
                />
              )}

              {activeTab === 'laporan' && (
                <LaporanExportView
                  filteredTeachers={filteredTeachers}
                  filteredTasks={filteredTasks}
                  currentFilter={globalFilters}
                  theme={theme}
                />
              )}

              {activeTab === 'audit-log' && (
                <AuditLogView logs={auditLogs} theme={theme} />
              )}

              {activeTab === 'users' && (
                <UsersManagementView
                  users={users}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  theme={theme}
                />
              )}

              {activeTab === 'config' && (
                <ConfigManagementView
                  config={config}
                  onUpdateConfig={handleUpdateConfig}
                  theme={theme}
                />
              )}

              {activeTab === 'status-sistem' && (
                <div className={`border rounded-3xl p-6 transition-colors shadow-xs ${
                  theme === 'light' ? 'bg-white border-slate-200/90' : 'bg-slate-900 border-slate-800'
                }`}>
                  <h2 className={`text-lg font-bold mb-4 ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>Status Sistem & Helaian Google Sheets</h2>
                  <StatusSistemModal
                    statusInfo={statusInfo}
                    onClose={() => setActiveTab('dashboard')}
                    onRefreshNow={() => loadData(false)}
                    theme={theme}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODALS */}

      {/* 1. Teacher Profile Drilldown */}
      <GuruProfileModal
        guru={selectedTeacherProfile}
        tasks={tasks}
        config={config}
        onClose={() => setSelectedTeacherProfile(null)}
        onEditTask={(t) => {
          setSelectedTeacherProfile(null);
          setTaskToEdit(t);
        }}
        theme={theme}
      />

      {/* 2. Add / Edit Teacher Modal */}
      {(isAddingGuru || teacherToEdit) && (
        <TambahEditGuruModal
          guruToEdit={teacherToEdit}
          config={config}
          onClose={() => {
            setIsAddingGuru(false);
            setTeacherToEdit(null);
          }}
          onSaveGuru={handleSaveGuru}
          theme={theme}
        />
      )}

      {/* 3. Add / Edit Assignment Modal */}
      {(isAddingTask || taskToEdit) && (
        <TambahEditTugasanModal
          taskToEdit={taskToEdit}
          teachers={teachers}
          config={config}
          availableCommittees={availableCommittees}
          onClose={() => {
            setIsAddingTask(false);
            setTaskToEdit(null);
          }}
          onSaveTask={handleSaveTask}
          theme={theme}
        />
      )}

      {/* 4. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        itemDescription={
          taskToDelete
            ? `${taskToDelete.Record_ID}: ${taskToDelete.Jawatankuasa_Unit} - ${taskToDelete.Jawatan_Tugasan} (${taskToDelete.Nama_Guru})`
            : ''
        }
        onConfirm={handleDeleteTask}
        onClose={() => setTaskToDelete(null)}
        isDeleting={isDeleting}
        theme={theme}
      />

      {/* 5. Version Conflict Modal (Section 28) */}
      <VersionConflictModal
        isOpen={isConflictOpen}
        onRefresh={async () => {
          setIsConflictOpen(false);
          await loadData(false);
        }}
        onCancel={() => setIsConflictOpen(false)}
        theme={theme}
      />

      {/* 6. System Status Modal */}
      {isStatusModalOpen && (
        <StatusSistemModal
          statusInfo={statusInfo}
          onClose={() => setIsStatusModalOpen(false)}
          onRefreshNow={() => loadData(false)}
          theme={theme}
        />
      )}
    </div>
  );
}
