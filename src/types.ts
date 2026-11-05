export interface Guru {
  Guru_ID: string;
  Nama_Guru: string;
  Gred: string;
  Opsyen: string;
  Status_Aktif: 'Aktif' | 'Tidak Aktif';
  Tarikh_Mula: string;
  Bilangan_Tugasan: number;
  Jumlah_Pemberatan: number;
  Status_Padanan: 'MATCHED' | 'UNMATCHED' | 'POSSIBLE_MATCH';
  Updated_At: string;
  Updated_By: string;
  Version: number;
}

export interface Tugasan {
  Record_ID: string;
  Guru_ID: string;
  Nama_Guru: string;
  Bidang: string;
  Kluster: string;
  Jawatankuasa_Unit: string;
  Jawatan_Tugasan: string;
  Skop_Kelas_Tarikh: string;
  Pemberatan: number | string; // Numeric or 'Belum Ditentukan'
  Status: 'Belum Ditetapkan' | 'Belum Mula' | 'Dalam Pelaksanaan' | 'Selesai' | 'Ditangguhkan';
  Peratus_Kemajuan: number;
  Catatan: string;
  Updated_At: string;
  Updated_By: string;
  Version: number;
}

export interface SasaranGred {
  Gred: string;
  Min: number;
  Sasaran: number;
  Max: number;
}

export interface AmbangBeban {
  RendahMax: number;
  SeimbangMax: number;
}

export interface ConfigData {
  GRED: string[];
  OPSYEN: string[];
  BIDANG: string[];
  KLUSTER: string[];
  STATUS: string[];
  ROLE: string[];
  PEMETAAN_BIDANG: Record<string, string>;
  PEMBERATAN_DEFAULT: Record<string, number>;
  SASARAN_GRED: Record<string, { min: number; sasaran: number; max: number }>;
  AMBANG_BEBAN: { rendahMax: number; seimbangMax: number };
}

export interface AppUser {
  User_ID: string;
  Email: string;
  Nama: string;
  Role: 'ADMIN' | 'EDITOR';
  Status: 'Aktif' | 'Tidak Aktif';
  Last_Login: string;
}

export interface AuditLog {
  Audit_ID: string;
  Record_ID: string;
  Entity_Type: 'GURU' | 'TUGAS' | 'CONFIG' | 'USER';
  Action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  User_Email: string;
  Timestamp: string;
  Old_Value: string;
  New_Value: string;
}

export interface GlobalFilterState {
  namaGuru: string;
  gred: string;
  opsyen: string;
  bidang: string;
  kluster: string;
  jawatankuasa: string;
  status: string;
}

export interface SystemStatusInfo {
  googleLogin: 'Connected' | 'Standby' | 'Failed';
  googleSheets: 'Connected' | 'Demo Mode' | 'Failed';
  spreadsheetId: string;
  counts: {
    masterGuru: number;
    agihanTugas: number;
    config: number;
    users: number;
    auditLog: number;
  };
  lastSyncTime: string;
  isDemoMode: boolean;
}
