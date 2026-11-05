import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initialConfig,
  initialUsers,
  initialTeachersRaw,
  initialTasks,
  initialAuditLogs,
  computeTeacherStats
} from './src/data/initialData.ts';
import { Guru, Tugasan, ConfigData, AppUser, AuditLog } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// In-Memory Database Store (Emulating Google Sheets with Strict Versioning & Audit Trail)
let teachersDb: Omit<Guru, 'Bilangan_Tugasan' | 'Jumlah_Pemberatan'>[] = [...initialTeachersRaw];
let tasksDb: Tugasan[] = [...initialTasks];
let configDb: ConfigData = JSON.parse(JSON.stringify(initialConfig));
let usersDb: AppUser[] = [...initialUsers];
let auditLogDb: AuditLog[] = [...initialAuditLogs];

let lastSyncTimestamp = new Date().toISOString();
let isDemoMode = !process.env.SPREADSHEET_ID;

// Simple Mutex Lock for concurrency simulation
let isLocked = false;
async function acquireLock(timeoutMs = 5000): Promise<boolean> {
  const start = Date.now();
  while (isLocked) {
    if (Date.now() - start > timeoutMs) return false;
    await new Promise((r) => setTimeout(r, 50));
  }
  isLocked = true;
  return true;
}
function releaseLock() {
  isLocked = false;
}

// Generate next IDs
function getNextGuruId(): string {
  const existingNums = teachersDb
    .map((g) => {
      const match = g.Guru_ID.match(/^G(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  return `G${String(max + 1).padStart(3, '0')}`;
}

function getNextTaskId(): string {
  const existingNums = tasksDb
    .map((t) => {
      const match = t.Record_ID.match(/^T(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  return `T${String(max + 1).padStart(6, '0')}`;
}

function getNextAuditId(): string {
  const count = auditLogDb.length + 1;
  return `AUD${String(count).padStart(4, '0')}`;
}

// Audit Logger Helper
function recordAudit(
  recordId: string,
  entityType: 'GURU' | 'TUGAS' | 'CONFIG' | 'USER',
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT',
  userEmail: string,
  oldVal: any,
  newVal: any
) {
  const log: AuditLog = {
    Audit_ID: getNextAuditId(),
    Record_ID: recordId,
    Entity_Type: entityType,
    Action: action,
    User_Email: userEmail || 'sistem@skts.edu.my',
    Timestamp: new Date().toISOString(),
    Old_Value: typeof oldVal === 'string' ? oldVal : JSON.stringify(oldVal, null, 2),
    New_Value: typeof newVal === 'string' ? newVal : JSON.stringify(newVal, null, 2)
  };
  auditLogDb.unshift(log);
}

// Auth & Permissions Middleware
function authenticateUser(req: Request, res: Response, next: () => void) {
  const userEmail = (req.headers['x-user-email'] as string) || (req.query.userEmail as string) || 'iab-1235@moe-dl.edu.my';
  const foundUser = usersDb.find((u) => u.Email.toLowerCase() === userEmail.toLowerCase());

  if (!foundUser || foundUser.Status !== 'Aktif') {
    return res.status(403).json({
      error: 'Anda tidak mempunyai kebenaran untuk mengakses sistem ini.',
      reason: !foundUser ? 'E-mel tidak berdaftar dalam senarai USERS' : 'Akaun pengguna berstatus Tidak Aktif'
    });
  }

  (req as any).currentUser = foundUser;
  next();
}

// Admin Only Middleware
function requireAdmin(req: Request, res: Response, next: () => void) {
  const currentUser: AppUser = (req as any).currentUser;
  if (!currentUser || currentUser.Role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Tindakan ini memerlukan kebenaran ADMIN.',
      userRole: currentUser?.Role
    });
  }
  next();
}

// API Routes

// Google Sheets Web App Synchronizer Helpers
async function syncFromGoogleSheets(): Promise<boolean> {
  const url = process.env.GOOGLE_SCRIPT_WEBAPP_URL;
  if (!url) return false;

  try {
    const res = await fetch(`${url}?action=getAll`, { redirect: 'follow' });
    if (!res.ok) return false;
    const json = await res.json();
    if (json && json.status === 'success' && json.data) {
      if (Array.isArray(json.data.masterGuru)) {
        const seenGIds = new Set<string>();
        teachersDb = json.data.masterGuru.map((g: any, idx: number) => {
          let gId = g.Guru_ID || `G${String(idx + 1).padStart(3, '0')}`;
          if (seenGIds.has(gId)) {
            gId = `${gId}_${idx}`;
          }
          seenGIds.add(gId);
          return {
            ...g,
            Guru_ID: gId,
            Bilangan_Tugasan: Number(g.Bilangan_Tugasan) || 0,
            Jumlah_Pemberatan: Number(g.Jumlah_Pemberatan) || 0,
            Version: Number(g.Version) || 1
          };
        });
      }
      if (Array.isArray(json.data.agihanTugas)) {
        const seenTIds = new Set<string>();
        tasksDb = json.data.agihanTugas.map((t: any, idx: number) => {
          let recId = t.Record_ID || `T${String(idx + 1).padStart(6, '0')}`;
          if (seenTIds.has(recId)) {
            recId = `${recId}_${idx}`;
          }
          seenTIds.add(recId);
          return {
            ...t,
            Record_ID: recId,
            Pemberatan: !isNaN(Number(t.Pemberatan)) ? Number(t.Pemberatan) : (t.Pemberatan || 'Belum Ditentukan'),
            Peratus_Kemajuan: Number(t.Peratus_Kemajuan) || 0,
            Version: Number(t.Version) || 1
          };
        });
      }
      lastSyncTimestamp = new Date().toISOString();
      return true;
    }
  } catch (err) {
    console.error('Error syncing from Google Sheets:', err);
  }
  return false;
}

async function forwardMutationToSheets(action: string, data: any, userEmail: string): Promise<any> {
  const url = process.env.GOOGLE_SCRIPT_WEBAPP_URL;
  if (!url) return null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data, userEmail }),
      redirect: 'follow'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error forwarding mutation to Google Sheets:', err);
  }
  return null;
}

// 1. Status & Health Check
app.get('/api/status', (req, res) => {
  const computedTeachers = computeTeacherStats(teachersDb, tasksDb);
  res.json({
    googleLogin: 'Connected',
    googleSheets: process.env.GOOGLE_SCRIPT_WEBAPP_URL || process.env.SPREADSHEET_ID ? 'Connected' : 'Demo Mode',
    spreadsheetId: process.env.SPREADSHEET_ID || '',
    webAppUrl: process.env.GOOGLE_SCRIPT_WEBAPP_URL || '',
    counts: {
      masterGuru: computedTeachers.length,
      agihanTugas: tasksDb.length,
      config: Object.keys(configDb).length,
      users: usersDb.length,
      auditLog: auditLogDb.length
    },
    lastSyncTime: lastSyncTimestamp,
    isDemoMode: isDemoMode,
    appName: 'e-PENGURUSAN SKTS 2027',
    version: '1.0.0'
  });
});

// Configure Google Apps Script Web App URL and test live connection
app.post(['/api/config/sheets-url', '/api/sync/test-connection'], authenticateUser, async (req, res) => {
  const { webAppUrl, spreadsheetId } = req.body;
  if (!webAppUrl) {
    return res.status(400).json({ error: 'Sila masukkan URL Google Apps Script Web App yang sah.' });
  }

  try {
    const cleanUrl = webAppUrl.trim();
    const testRes = await fetch(`${cleanUrl}?action=ping`, { redirect: 'follow' });
    if (!testRes.ok) {
      return res.status(400).json({
        error: 'Sambungan ke Google Apps Script gagal. Sila pastikan Web App telah dideploy dengan akses "Anyone".'
      });
    }

    const testJson = await testRes.json();
    process.env.GOOGLE_SCRIPT_WEBAPP_URL = cleanUrl;
    if (spreadsheetId) process.env.SPREADSHEET_ID = spreadsheetId.trim();

    // Fetch live sheets data
    const dataRes = await fetch(`${cleanUrl}?action=getAll`, { redirect: 'follow' });
    let rowsFound = { masterGuru: 0, agihanTugas: 0 };
    if (dataRes.ok) {
      const liveData = await dataRes.json();
      if (liveData && liveData.data) {
        if (Array.isArray(liveData.data.masterGuru)) {
          rowsFound.masterGuru = liveData.data.masterGuru.length;
          if (liveData.data.masterGuru.length > 0) {
            const seenGIds = new Set<string>();
            teachersDb = liveData.data.masterGuru.map((g: any, idx: number) => {
              let gId = g.Guru_ID || `G${String(idx + 1).padStart(3, '0')}`;
              if (seenGIds.has(gId)) {
                gId = `${gId}_${idx}`;
              }
              seenGIds.add(gId);
              return {
                ...g,
                Guru_ID: gId,
                Bilangan_Tugasan: Number(g.Bilangan_Tugasan) || 0,
                Jumlah_Pemberatan: Number(g.Jumlah_Pemberatan) || 0,
                Version: Number(g.Version) || 1
              };
            });
          }
        }
        if (Array.isArray(liveData.data.agihanTugas)) {
          rowsFound.agihanTugas = liveData.data.agihanTugas.length;
          if (liveData.data.agihanTugas.length > 0) {
            const seenTIds = new Set<string>();
            tasksDb = liveData.data.agihanTugas.map((t: any, idx: number) => {
              let recId = t.Record_ID || `T${String(idx + 1).padStart(6, '0')}`;
              if (seenTIds.has(recId)) {
                recId = `${recId}_${idx}`;
              }
              seenTIds.add(recId);
              return {
                ...t,
                Record_ID: recId,
                Pemberatan: !isNaN(Number(t.Pemberatan)) ? Number(t.Pemberatan) : (t.Pemberatan || 'Belum Ditentukan'),
                Peratus_Kemajuan: Number(t.Peratus_Kemajuan) || 0,
                Version: Number(t.Version) || 1
              };
            });
          }
        }
      }
    }

    isDemoMode = false;
    lastSyncTimestamp = new Date().toISOString();

    recordAudit('SHEETS-CONNECT', 'CONFIG', 'UPDATE', (req as any).currentUser.Email, 'Demo Mode', {
      status: 'Connected',
      webAppUrl: cleanUrl,
      rowsFound
    });

    res.json({
      success: true,
      message: 'Sambungan ke Google Spreadsheet melalui Google Apps Script berjaya!',
      details: testJson,
      rowsFound
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Ralat penyambungan: ${err.message || 'Tidak dapat menghubungi Google Apps Script'}`
    });
  }
});

// Tarik data terkini daripada Google Sheets
app.post('/api/sync/pull', authenticateUser, async (req, res) => {
  if (!process.env.GOOGLE_SCRIPT_WEBAPP_URL) {
    return res.status(400).json({ error: 'URL Google Apps Script belum dikonfigurasikan.' });
  }

  const success = await syncFromGoogleSheets();
  if (!success) {
    return res.status(500).json({ error: 'Gagal menarik data dari Google Sheets. Sila semak sambungan Web App.' });
  }

  res.json({
    success: true,
    message: 'Data berjaya diselaraskan daripada Google Sheets!',
    counts: {
      masterGuru: teachersDb.length,
      agihanTugas: tasksDb.length
    },
    lastSyncTime: lastSyncTimestamp
  });
});

// Hantar / Seed data semasa ke Google Sheets
app.post('/api/sync/seed-to-sheets', authenticateUser, async (req, res) => {
  const url = process.env.GOOGLE_SCRIPT_WEBAPP_URL;
  if (!url) {
    return res.status(400).json({ error: 'Sila sambungkan URL Google Apps Script terlebih dahulu.' });
  }

  const payload = {
    masterGuru: teachersDb,
    agihanTugas: tasksDb,
    users: usersDb
  };

  try {
    const forwardRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'seedAll',
        data: payload,
        userEmail: (req as any).currentUser.Email
      }),
      redirect: 'follow'
    });

    if (!forwardRes.ok) {
      return res.status(500).json({ error: 'Gagal memindahkan data ke Google Sheets.' });
    }

    const json = await forwardRes.json();
    lastSyncTimestamp = new Date().toISOString();
    isDemoMode = false;

    res.json({
      success: true,
      message: `Berjaya memindahkan ${teachersDb.length} rekod guru dan ${tasksDb.length} rekod tugasan ke Google Spreadsheet anda!`,
      details: json
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ralat semasa menghantar data ke Google Sheets.' });
  }
});

// 2. Auth / Current User
app.get('/api/auth/me', (req, res) => {
  const userEmail = (req.headers['x-user-email'] as string) || 'iab-1235@moe-dl.edu.my';
  const foundUser = usersDb.find((u) => u.Email.toLowerCase() === userEmail.toLowerCase());

  if (!foundUser || foundUser.Status !== 'Aktif') {
    return res.status(403).json({
      error: 'Anda tidak mempunyai kebenaran untuk mengakses sistem ini.',
      email: userEmail
    });
  }

  foundUser.Last_Login = new Date().toISOString();
  res.json(foundUser);
});

// 3. MASTER_GURU - Read
app.get('/api/guru', authenticateUser, (req, res) => {
  const computed = computeTeacherStats(teachersDb, tasksDb);
  res.json(computed);
});

// Check Duplicate Name
app.get('/api/guru/check-duplicate', authenticateUser, (req, res) => {
  const nameQuery = ((req.query.name as string) || '').trim().toLowerCase();
  if (!nameQuery) {
    return res.json({ hasDuplicate: false, matches: [] });
  }

  const matches = teachersDb.filter((g) => {
    const existing = g.Nama_Guru.trim().toLowerCase();
    return existing === nameQuery || existing.includes(nameQuery) || nameQuery.includes(existing);
  });

  res.json({
    hasDuplicate: matches.length > 0,
    matches: matches.map((m) => ({ Guru_ID: m.Guru_ID, Nama_Guru: m.Nama_Guru, Gred: m.Gred }))
  });
});

// MASTER_GURU - Create
app.post('/api/guru', authenticateUser, async (req, res) => {
  const locked = await acquireLock();
  if (!locked) return res.status(503).json({ error: 'Sistem sedang sibuk. Sila cuba lagi sebentar.' });

  try {
    const { Nama_Guru, Gred, Opsyen, Status_Aktif, Tarikh_Mula } = req.body;
    const currentUser: AppUser = (req as any).currentUser;

    if (!Nama_Guru || !Gred || !Opsyen) {
      return res.status(400).json({ error: 'Nama Guru, Gred dan Opsyen adalah medan wajib.' });
    }

    const newId = getNextGuruId();
    const newGuru: Omit<Guru, 'Bilangan_Tugasan' | 'Jumlah_Pemberatan'> = {
      Guru_ID: newId,
      Nama_Guru: Nama_Guru.trim(),
      Gred,
      Opsyen,
      Status_Aktif: Status_Aktif || 'Aktif',
      Tarikh_Mula: Tarikh_Mula || new Date().toISOString().split('T')[0],
      Status_Padanan: 'MATCHED',
      Updated_At: new Date().toISOString(),
      Updated_By: currentUser.Email,
      Version: 1
    };

    teachersDb.push(newGuru);
    lastSyncTimestamp = new Date().toISOString();

    recordAudit(newId, 'GURU', 'CREATE', currentUser.Email, 'Tiada rekod lama', newGuru);

    // Forward mutation to Google Sheets if connected
    forwardMutationToSheets('createGuru', newGuru, currentUser.Email);

    const [computed] = computeTeacherStats([newGuru], tasksDb);
    res.status(201).json(computed);
  } finally {
    releaseLock();
  }
});

// MASTER_GURU - Update with Version Optimistic Locking
app.put('/api/guru/:id', authenticateUser, async (req, res) => {
  const locked = await acquireLock();
  if (!locked) return res.status(503).json({ error: 'Sistem sedang sibuk. Sila cuba lagi.' });

  try {
    const { id } = req.params;
    const { Nama_Guru, Gred, Opsyen, Status_Aktif, Tarikh_Mula, Status_Padanan, expectedVersion } = req.body;
    const currentUser: AppUser = (req as any).currentUser;

    const index = teachersDb.findIndex((g) => g.Guru_ID === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Rekod guru tidak ditemui.' });
    }

    const currentRecord = teachersDb[index];

    // Optimistic Version Conflict Check
    if (expectedVersion !== undefined && currentRecord.Version !== expectedVersion) {
      return res.status(409).json({
        error: 'Rekod ini telah dikemas kini oleh pengguna lain. Sila muat semula rekod untuk mendapatkan versi terkini.',
        currentVersion: currentRecord.Version,
        currentRecord: currentRecord
      });
    }

    const oldRecordCopy = { ...currentRecord };

    const updatedRecord: Omit<Guru, 'Bilangan_Tugasan' | 'Jumlah_Pemberatan'> = {
      ...currentRecord,
      Nama_Guru: Nama_Guru !== undefined ? Nama_Guru.trim() : currentRecord.Nama_Guru,
      Gred: Gred !== undefined ? Gred : currentRecord.Gred,
      Opsyen: Opsyen !== undefined ? Opsyen : currentRecord.Opsyen,
      Status_Aktif: Status_Aktif !== undefined ? Status_Aktif : currentRecord.Status_Aktif,
      Tarikh_Mula: Tarikh_Mula !== undefined ? Tarikh_Mula : currentRecord.Tarikh_Mula,
      Status_Padanan: Status_Padanan !== undefined ? Status_Padanan : currentRecord.Status_Padanan,
      Updated_At: new Date().toISOString(),
      Updated_By: currentUser.Email,
      Version: currentRecord.Version + 1
    };

    teachersDb[index] = updatedRecord;

    // Also sync teacher name in tasksDb if updated
    if (Nama_Guru && Nama_Guru.trim() !== oldRecordCopy.Nama_Guru) {
      tasksDb = tasksDb.map((t) =>
        t.Guru_ID === id ? { ...t, Nama_Guru: Nama_Guru.trim() } : t
      );
    }

    lastSyncTimestamp = new Date().toISOString();

    recordAudit(id, 'GURU', 'UPDATE', currentUser.Email, oldRecordCopy, updatedRecord);

    // Forward mutation to Google Sheets if connected
    forwardMutationToSheets('updateGuru', updatedRecord, currentUser.Email);

    const [computed] = computeTeacherStats([updatedRecord], tasksDb);
    res.json(computed);
  } finally {
    releaseLock();
  }
});

// MASTER_GURU - Deactivate / Toggle Status
app.patch('/api/guru/:id/status', authenticateUser, async (req, res) => {
  const locked = await acquireLock();
  if (!locked) return res.status(503).json({ error: 'Sistem sedang sibuk.' });

  try {
    const { id } = req.params;
    const { Status_Aktif, expectedVersion } = req.body;
    const currentUser: AppUser = (req as any).currentUser;

    const index = teachersDb.findIndex((g) => g.Guru_ID === id);
    if (index === -1) return res.status(404).json({ error: 'Guru tidak ditemui.' });

    const currentRecord = teachersDb[index];
    if (expectedVersion !== undefined && currentRecord.Version !== expectedVersion) {
      return res.status(409).json({
        error: 'Rekod ini telah dikemas kini oleh pengguna lain. Sila muat semula rekod untuk mendapatkan versi terkini.',
        currentVersion: currentRecord.Version
      });
    }

    const oldRecord = { ...currentRecord };
    currentRecord.Status_Aktif = Status_Aktif;
    currentRecord.Version += 1;
    currentRecord.Updated_At = new Date().toISOString();
    currentRecord.Updated_By = currentUser.Email;

    lastSyncTimestamp = new Date().toISOString();

    recordAudit(id, 'GURU', 'UPDATE', currentUser.Email, oldRecord, currentRecord);

    const [computed] = computeTeacherStats([currentRecord], tasksDb);
    res.json(computed);
  } finally {
    releaseLock();
  }
});

// 4. AGIHAN_TUGAS - Read
app.get('/api/tugas', authenticateUser, (req, res) => {
  // Join tasks with MASTER_GURU to ensure Gred and Opsyen are always in sync
  const enrichedTasks = tasksDb.map((t) => {
    const guru = teachersDb.find((g) => g.Guru_ID === t.Guru_ID);
    return {
      ...t,
      Gred: guru ? guru.Gred : 'DG41',
      Opsyen: guru ? guru.Opsyen : 'Umum'
    };
  });
  res.json(enrichedTasks);
});

// AGIHAN_TUGAS - Create
app.post('/api/tugas', authenticateUser, async (req, res) => {
  const locked = await acquireLock();
  if (!locked) return res.status(503).json({ error: 'Sistem sedang sibuk.' });

  try {
    const {
      Guru_ID,
      Bidang,
      Kluster,
      Jawatankuasa_Unit,
      Jawatan_Tugasan,
      Skop_Kelas_Tarikh,
      Pemberatan,
      Status,
      Peratus_Kemajuan,
      Catatan
    } = req.body;
    const currentUser: AppUser = (req as any).currentUser;

    if (!Guru_ID || !Bidang || !Jawatankuasa_Unit || !Jawatan_Tugasan) {
      return res.status(400).json({ error: 'Guru, Bidang, Jawatankuasa, dan Jawatan adalah medan wajib.' });
    }

    const guru = teachersDb.find((g) => g.Guru_ID === Guru_ID);
    if (!guru) {
      return res.status(404).json({ error: 'Guru yang dipilih tidak sah.' });
    }

    // Auto determine Kluster from PEMETAAN_BIDANG if not specified
    const resolvedKluster = Kluster || configDb.PEMETAAN_BIDANG[Bidang] || 'Belum Dipetakan';

    // Parse pemberatan
    let resolvedPemberatan: number | string = Pemberatan;
    if (resolvedPemberatan === '' || resolvedPemberatan === undefined || resolvedPemberatan === null) {
      resolvedPemberatan = 'Belum Ditentukan';
    } else if (!isNaN(Number(resolvedPemberatan))) {
      resolvedPemberatan = Number(resolvedPemberatan);
    }

    const requestedId = req.body.Record_ID;
    const newId = requestedId && !tasksDb.some((t) => t.Record_ID === requestedId)
      ? requestedId
      : getNextTaskId();
    const newTask: Tugasan = {
      Record_ID: newId,
      Guru_ID,
      Nama_Guru: guru.Nama_Guru,
      Bidang,
      Kluster: resolvedKluster,
      Jawatankuasa_Unit: Jawatankuasa_Unit.trim(),
      Jawatan_Tugasan: Jawatan_Tugasan.trim(),
      Skop_Kelas_Tarikh: (Skop_Kelas_Tarikh || '').trim(),
      Pemberatan: resolvedPemberatan,
      Status: Status || 'Belum Ditetapkan',
      Peratus_Kemajuan: Math.min(100, Math.max(0, Number(Peratus_Kemajuan) || 0)),
      Catatan: (Catatan || '').trim(),
      Updated_At: new Date().toISOString(),
      Updated_By: currentUser.Email,
      Version: 1
    };

    tasksDb.push(newTask);
    lastSyncTimestamp = new Date().toISOString();

    recordAudit(newId, 'TUGAS', 'CREATE', currentUser.Email, 'Tiada rekod lama', newTask);

    // Forward mutation to Google Sheets
    forwardMutationToSheets('createTugas', newTask, currentUser.Email);

    res.status(201).json({
      ...newTask,
      Gred: guru.Gred,
      Opsyen: guru.Opsyen
    });
  } finally {
    releaseLock();
  }
});

// AGIHAN_TUGAS - Update with Version Optimistic Locking
app.put('/api/tugas/:id', authenticateUser, async (req, res) => {
  const locked = await acquireLock();
  if (!locked) return res.status(503).json({ error: 'Sistem sedang sibuk.' });

  try {
    const { id } = req.params;
    const {
      Guru_ID,
      Bidang,
      Kluster,
      Jawatankuasa_Unit,
      Jawatan_Tugasan,
      Skop_Kelas_Tarikh,
      Pemberatan,
      Status,
      Peratus_Kemajuan,
      Catatan,
      expectedVersion
    } = req.body;
    const currentUser: AppUser = (req as any).currentUser;

    const index = tasksDb.findIndex((t) => t.Record_ID === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Rekod tugasan tidak ditemui.' });
    }

    const currentRecord = tasksDb[index];

    // Optimistic Locking Version Check
    if (expectedVersion !== undefined && currentRecord.Version !== expectedVersion) {
      return res.status(409).json({
        error: 'Rekod ini telah dikemas kini oleh pengguna lain. Sila muat semula rekod untuk mendapatkan versi terkini.',
        currentVersion: currentRecord.Version,
        currentRecord: currentRecord
      });
    }

    const oldRecordCopy = { ...currentRecord };

    // Resolve teacher name & info
    const effectiveGuruId = Guru_ID || currentRecord.Guru_ID;
    const guru = teachersDb.find((g) => g.Guru_ID === effectiveGuruId);

    // Resolve Pemberatan
    let resolvedPemberatan: number | string = Pemberatan !== undefined ? Pemberatan : currentRecord.Pemberatan;
    if (resolvedPemberatan === '' || resolvedPemberatan === undefined || resolvedPemberatan === null) {
      resolvedPemberatan = 'Belum Ditentukan';
    } else if (!isNaN(Number(resolvedPemberatan))) {
      resolvedPemberatan = Number(resolvedPemberatan);
    }

    const updatedTask: Tugasan = {
      ...currentRecord,
      Guru_ID: effectiveGuruId,
      Nama_Guru: guru ? guru.Nama_Guru : currentRecord.Nama_Guru,
      Bidang: Bidang !== undefined ? Bidang : currentRecord.Bidang,
      Kluster: Kluster !== undefined ? Kluster : currentRecord.Kluster,
      Jawatankuasa_Unit: Jawatankuasa_Unit !== undefined ? Jawatankuasa_Unit.trim() : currentRecord.Jawatankuasa_Unit,
      Jawatan_Tugasan: Jawatan_Tugasan !== undefined ? Jawatan_Tugasan.trim() : currentRecord.Jawatan_Tugasan,
      Skop_Kelas_Tarikh: Skop_Kelas_Tarikh !== undefined ? Skop_Kelas_Tarikh.trim() : currentRecord.Skop_Kelas_Tarikh,
      Pemberatan: resolvedPemberatan,
      Status: Status !== undefined ? Status : currentRecord.Status,
      Peratus_Kemajuan: Peratus_Kemajuan !== undefined ? Math.min(100, Math.max(0, Number(Peratus_Kemajuan))) : currentRecord.Peratus_Kemajuan,
      Catatan: Catatan !== undefined ? Catatan.trim() : currentRecord.Catatan,
      Updated_At: new Date().toISOString(),
      Updated_By: currentUser.Email,
      Version: currentRecord.Version + 1
    };

    tasksDb[index] = updatedTask;
    lastSyncTimestamp = new Date().toISOString();

    recordAudit(id, 'TUGAS', 'UPDATE', currentUser.Email, oldRecordCopy, updatedTask);

    // Forward mutation to Google Sheets
    forwardMutationToSheets('updateTugas', updatedTask, currentUser.Email);

    res.json({
      ...updatedTask,
      Gred: guru ? guru.Gred : 'DG41',
      Opsyen: guru ? guru.Opsyen : 'Umum'
    });
  } finally {
    releaseLock();
  }
});

// AGIHAN_TUGAS - Delete
app.delete('/api/tugas/:id', authenticateUser, async (req, res) => {
  const locked = await acquireLock();
  if (!locked) return res.status(503).json({ error: 'Sistem sedang sibuk.' });

  try {
    const { id } = req.params;
    const currentUser: AppUser = (req as any).currentUser;

    const index = tasksDb.findIndex((t) => t.Record_ID === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Rekod tugasan tidak ditemui.' });
    }

    const removedTask = tasksDb[index];
    tasksDb.splice(index, 1);
    lastSyncTimestamp = new Date().toISOString();

    recordAudit(id, 'TUGAS', 'DELETE', currentUser.Email, removedTask, 'Rekod dipadam dari sistem');

    // Forward mutation to Google Sheets
    forwardMutationToSheets('deleteTugas', { recordId: id }, currentUser.Email);

    res.json({ success: true, message: 'Tugasan berjaya dipadam.', recordId: id });
  } finally {
    releaseLock();
  }
});

// 5. CONFIG - Read
app.get('/api/config', authenticateUser, (req, res) => {
  res.json(configDb);
});

// CONFIG - Update (Admin Only)
app.put('/api/config', authenticateUser, requireAdmin, async (req, res) => {
  const locked = await acquireLock();
  if (!locked) return res.status(503).json({ error: 'Sistem sedang sibuk.' });

  try {
    const updatedConfig = req.body;
    const currentUser: AppUser = (req as any).currentUser;

    const oldConfigCopy = JSON.parse(JSON.stringify(configDb));
    configDb = { ...configDb, ...updatedConfig };
    lastSyncTimestamp = new Date().toISOString();

    recordAudit('CONFIG-MAIN', 'CONFIG', 'UPDATE', currentUser.Email, oldConfigCopy, configDb);

    res.json(configDb);
  } finally {
    releaseLock();
  }
});

// 6. USERS - Read & Write (Admin Only)
app.get('/api/users', authenticateUser, (req, res) => {
  res.json(usersDb);
});

app.post('/api/users', authenticateUser, requireAdmin, async (req, res) => {
  const { Email, Nama, Role, Status } = req.body;
  const currentUser: AppUser = (req as any).currentUser;

  if (!Email || !Nama || !Role) {
    return res.status(400).json({ error: 'Email, Nama dan Role adalah medan wajib.' });
  }

  const existing = usersDb.find((u) => u.Email.toLowerCase() === Email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Alamat e-mel ini telah pun didaftarkan.' });
  }

  const existingNums = usersDb
    .map((u) => {
      const match = u.User_ID.match(/^U(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  const newId = `U${String(max + 1).padStart(3, '0')}`;
  const newUser: AppUser = {
    User_ID: newId,
    Email: Email.toLowerCase().trim(),
    Nama: Nama.trim(),
    Role: Role || 'EDITOR',
    Status: Status || 'Aktif',
    Last_Login: '-'
  };

  usersDb.push(newUser);
  recordAudit(newId, 'USER', 'CREATE', currentUser.Email, 'Pengguna baru ditambah', newUser);

  res.status(201).json(newUser);
});

app.put('/api/users/:id', authenticateUser, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { Nama, Role, Status } = req.body;
  const currentUser: AppUser = (req as any).currentUser;

  const index = usersDb.findIndex((u) => u.User_ID === id);
  if (index === -1) return res.status(404).json({ error: 'Pengguna tidak ditemui.' });

  const oldUser = { ...usersDb[index] };
  usersDb[index] = {
    ...usersDb[index],
    Nama: Nama !== undefined ? Nama.trim() : usersDb[index].Nama,
    Role: Role !== undefined ? Role : usersDb[index].Role,
    Status: Status !== undefined ? Status : usersDb[index].Status
  };

  recordAudit(id, 'USER', 'UPDATE', currentUser.Email, oldUser, usersDb[index]);

  res.json(usersDb[index]);
});

// 7. AUDIT_LOG - Read (Admin Only)
app.get('/api/audit-logs', authenticateUser, requireAdmin, (req, res) => {
  const { entity, action, user } = req.query;
  let filtered = [...auditLogDb];

  if (entity) {
    filtered = filtered.filter((l) => l.Entity_Type === entity);
  }
  if (action) {
    filtered = filtered.filter((l) => l.Action === action);
  }
  if (user) {
    const uQuery = (user as string).toLowerCase();
    filtered = filtered.filter((l) => l.User_Email.toLowerCase().includes(uQuery));
  }

  res.json(filtered.slice(0, 200)); // Cap at 200 most recent
});

// Connect Vite Middlewares in Development or Serve Static in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[e-PENGURUSAN SKTS 2027] Server berjalan di port ${PORT}`);
  });
}

startServer();
