/**
 * e-PENGURUSAN SKTS 2027
 * Sistem Pengurusan Tugasan Guru Berasaskan Google Sheets
 * SK Taman Seroja
 * 
 * Skrip Google Apps Script untuk integrasi pangkalan data 5 helaian:
 * 1. MASTER_GURU
 * 2. AGIHAN_TUGAS
 * 3. CONFIG
 * 4. USERS
 * 5. AUDIT_LOG
 */

const SHEETS = {
  MASTER_GURU: 'MASTER_GURU',
  AGIHAN_TUGAS: 'AGIHAN_TUGAS',
  CONFIG: 'CONFIG',
  USERS: 'USERS',
  AUDIT_LOG: 'AUDIT_LOG'
};

const HEADERS = {
  [SHEETS.MASTER_GURU]: [
    'Guru_ID', 'Nama_Guru', 'Gred', 'Opsyen', 'Status_Aktif', 'Tarikh_Mula',
    'Bilangan_Tugasan', 'Jumlah_Pemberatan', 'Status_Padanan', 'Updated_At', 'Updated_By', 'Version'
  ],
  [SHEETS.AGIHAN_TUGAS]: [
    'Record_ID', 'Guru_ID', 'Nama_Guru', 'Bidang', 'Kluster', 'Jawatankuasa_Unit',
    'Jawatan_Tugasan', 'Skop_Kelas_Tarikh', 'Pemberatan', 'Status', 'Peratus_Kemajuan',
    'Catatan', 'Updated_At', 'Updated_By', 'Version'
  ],
  [SHEETS.CONFIG]: ['Kategori', 'Nilai', 'Keterangan', 'Extra'],
  [SHEETS.USERS]: ['User_ID', 'Email', 'Nama', 'Role', 'Status', 'Last_Login'],
  [SHEETS.AUDIT_LOG]: [
    'Audit_ID', 'Record_ID', 'Entity_Type', 'Action', 'User_Email', 'Timestamp', 'Old_Value', 'New_Value'
  ]
};

// 1. Inisialisasi 5 Helaian & Tajuk Lajur Rasmi
function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  for (const sheetName in HEADERS) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    if (sheet.getLastRow() === 0) {
      const headerRow = HEADERS[sheetName];
      sheet.appendRow(headerRow);
      const range = sheet.getRange(1, 1, 1, headerRow.length);
      range.setBackground('#1e293b');
      range.setFontColor('#ffffff');
      range.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }

  // Daftarkan akaun Pentadbir jika USERS masih kosong
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  if (usersSheet && usersSheet.getLastRow() <= 1) {
    usersSheet.appendRow([
      'U001',
      'iab-1235@moe-dl.edu.my',
      'Pentadbir Sistem (IAB)',
      'ADMIN',
      'Aktif',
      new Date().toISOString()
    ]);
    usersSheet.appendRow([
      'U002',
      'alhuzaee5181@gmail.com',
      'Alhuzaee (Pentadbir Sistem)',
      'ADMIN',
      'Aktif',
      new Date().toISOString()
    ]);
  }

  return { status: 'success', message: '5 Helaian e-PENGURUSAN SKTS 2027 berjaya dimulakan!' };
}

// 2. HTTP GET - Bacaan Semua Data Helaian
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'getAll';
  
  if (action === 'ping') {
    return createJsonResponse({
      status: 'success',
      message: 'Sambungan Google Apps Script e-PENGURUSAN SKTS 2027 Berjaya!',
      timestamp: new Date().toISOString()
    });
  }

  if (action === 'init') {
    return createJsonResponse(initSheets());
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  function getRows(sName) {
    const s = ss.getSheetByName(sName);
    if (!s || s.getLastRow() <= 1) return [];
    const h = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0];
    const r = s.getRange(2, 1, s.getLastRow() - 1, s.getLastColumn()).getValues();
    return r.map(row => {
      const o = {};
      h.forEach((head, i) => o[head] = row[i]);
      return o;
    });
  }

  return createJsonResponse({
    status: 'success',
    data: {
      masterGuru: getRows(SHEETS.MASTER_GURU),
      agihanTugas: getRows(SHEETS.AGIHAN_TUGAS),
      config: getRows(SHEETS.CONFIG),
      users: getRows(SHEETS.USERS),
      auditLog: getRows(SHEETS.AUDIT_LOG)
    },
    counts: {
      masterGuru: Math.max(0, (ss.getSheetByName(SHEETS.MASTER_GURU)?.getLastRow() || 1) - 1),
      agihanTugas: Math.max(0, (ss.getSheetByName(SHEETS.AGIHAN_TUGAS)?.getLastRow() || 1) - 1),
      config: Math.max(0, (ss.getSheetByName(SHEETS.CONFIG)?.getLastRow() || 1) - 1),
      users: Math.max(0, (ss.getSheetByName(SHEETS.USERS)?.getLastRow() || 1) - 1),
      auditLog: Math.max(0, (ss.getSheetByName(SHEETS.AUDIT_LOG)?.getLastRow() || 1) - 1)
    },
    timestamp: new Date().toISOString()
  });
}

// 3. HTTP POST - Operasi Simpan, Kemaskini, Padam & LockService
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // 15 saat timeout
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: 'Sistem sedang sibuk. Sila cuba lagi.'
    });
  }

  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    
    const action = payload.action;
    const userEmail = payload.userEmail || 'alhuzaee5181@gmail.com';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    initSheets();

    let result = {};

    switch (action) {
      case 'seedAll':
        result = handleSeedAll(ss, payload.data, userEmail);
        break;
      case 'createGuru':
        result = handleCreateGuru(ss, payload.data, userEmail);
        break;
      case 'updateGuru':
        result = handleUpdateGuru(ss, payload.data, userEmail);
        break;
      case 'createTugas':
        result = handleCreateTugas(ss, payload.data, userEmail);
        break;
      case 'updateTugas':
        result = handleUpdateTugas(ss, payload.data, userEmail);
        break;
      case 'deleteTugas':
        result = handleDeleteTugas(ss, payload.recordId, userEmail);
        break;
      case 'init':
        result = initSheets();
        break;
      default:
        result = { status: 'error', message: 'Tindakan tidak dikenali: ' + action };
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// HANTAR SEMUA DATA DARI SISTEM KE GOOGLE SHEETS DALAM SATU BATCH
function handleSeedAll(ss, data, userEmail) {
  const teacherList = data.masterGuru || data.teachers;
  if (teacherList && Array.isArray(teacherList)) {
    const s = ss.getSheetByName(SHEETS.MASTER_GURU);
    // Kosongkan baris lama kecuali header
    if (s.getLastRow() > 1) {
      s.deleteRows(2, s.getLastRow() - 1);
    }
    const headers = HEADERS[SHEETS.MASTER_GURU];
    const rows = teacherList.map(g => headers.map(h => g[h] !== undefined ? g[h] : ''));
    if (rows.length > 0) {
      s.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
  }

  const taskList = data.agihanTugas || data.tasks;
  if (taskList && Array.isArray(taskList)) {
    const s = ss.getSheetByName(SHEETS.AGIHAN_TUGAS);
    if (s.getLastRow() > 1) {
      s.deleteRows(2, s.getLastRow() - 1);
    }
    const headers = HEADERS[SHEETS.AGIHAN_TUGAS];
    const rows = taskList.map(t => headers.map(h => t[h] !== undefined ? t[h] : ''));
    if (rows.length > 0) {
      s.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
  }

  appendAudit(ss, 'SYNC-SEED', 'SYSTEM', 'UPDATE', userEmail, 'Data awal dihantar', 'Batch seed selesai');

  return { status: 'success', message: 'Semua rekod guru dan tugasan berjaya dihantar ke Google Sheets!' };
}

// TAMBAH GURU
function handleCreateGuru(ss, data, userEmail) {
  const sheet = ss.getSheetByName(SHEETS.MASTER_GURU);
  const rows = readSheetObjects(sheet);
  
  let maxId = 0;
  rows.forEach(r => {
    const m = String(r.Guru_ID).match(/^G(\d+)$/);
    if (m) maxId = Math.max(maxId, parseInt(m[1], 10));
  });
  const newId = 'G' + ('000' + (maxId + 1)).slice(-3);
  const now = new Date().toISOString();

  const newRow = [
    newId,
    data.Nama_Guru,
    data.Gred,
    data.Opsyen,
    data.Status_Aktif || 'Aktif',
    data.Tarikh_Mula || now.split('T')[0],
    data.Bilangan_Tugasan || 0,
    data.Jumlah_Pemberatan || 0,
    data.Status_Padanan || 'MATCHED',
    now,
    userEmail,
    1
  ];

  sheet.appendRow(newRow);
  appendAudit(ss, newId, 'GURU', 'CREATE', userEmail, 'Tiada rekod lama', data);

  return { status: 'success', data: { ...data, Guru_ID: newId, Version: 1, Updated_At: now, Updated_By: userEmail } };
}

// KEMASKINI GURU (DENGAN VERSION CONFLICT CHECK)
function handleUpdateGuru(ss, data, userEmail) {
  const sheet = ss.getSheetByName(SHEETS.MASTER_GURU);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return { status: 'error', message: 'Rekod tidak ditemui' };

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0];
  const idColIdx = headers.indexOf('Guru_ID');
  const verColIdx = headers.indexOf('Version');

  for (let r = 1; r < values.length; r++) {
    if (values[r][idColIdx] === data.Guru_ID) {
      const currentVersion = Number(values[r][verColIdx]);
      
      if (data.expectedVersion !== undefined && currentVersion !== Number(data.expectedVersion)) {
        return {
          status: 'conflict',
          message: 'Rekod ini telah dikemas kini oleh pengguna lain. Sila muat semula rekod untuk mendapatkan versi terkini.',
          currentVersion: currentVersion
        };
      }

      const oldObj = {};
      headers.forEach((h, i) => oldObj[h] = values[r][i]);

      const now = new Date().toISOString();
      const nextVersion = currentVersion + 1;

      if (data.Nama_Guru !== undefined) values[r][headers.indexOf('Nama_Guru')] = data.Nama_Guru;
      if (data.Gred !== undefined) values[r][headers.indexOf('Gred')] = data.Gred;
      if (data.Opsyen !== undefined) values[r][headers.indexOf('Opsyen')] = data.Opsyen;
      if (data.Status_Aktif !== undefined) values[r][headers.indexOf('Status_Aktif')] = data.Status_Aktif;
      if (data.Tarikh_Mula !== undefined) values[r][headers.indexOf('Tarikh_Mula')] = data.Tarikh_Mula;
      if (data.Status_Padanan !== undefined) values[r][headers.indexOf('Status_Padanan')] = data.Status_Padanan;
      
      values[r][headers.indexOf('Updated_At')] = now;
      values[r][headers.indexOf('Updated_By')] = userEmail;
      values[r][headers.indexOf('Version')] = nextVersion;

      sheet.getRange(r + 1, 1, 1, lastCol).setValues([values[r]]);
      appendAudit(ss, data.Guru_ID, 'GURU', 'UPDATE', userEmail, oldObj, data);

      return { status: 'success', version: nextVersion };
    }
  }

  return { status: 'error', message: 'Rekod Guru ID tidak ditemui: ' + data.Guru_ID };
}

// TAMBAH TUGASAN
function handleCreateTugas(ss, data, userEmail) {
  const sheet = ss.getSheetByName(SHEETS.AGIHAN_TUGAS);
  const rows = readSheetObjects(sheet);

  let maxId = 0;
  rows.forEach(r => {
    const m = String(r.Record_ID).match(/^T(\d+)$/);
    if (m) maxId = Math.max(maxId, parseInt(m[1], 10));
  });
  const newId = 'T' + ('000000' + (maxId + 1)).slice(-6);
  const now = new Date().toISOString();

  const newRow = [
    newId,
    data.Guru_ID,
    data.Nama_Guru,
    data.Bidang,
    data.Kluster,
    data.Jawatankuasa_Unit,
    data.Jawatan_Tugasan,
    data.Skop_Kelas_Tarikh || '',
    data.Pemberatan,
    data.Status || 'Belum Ditetapkan',
    data.Peratus_Kemajuan || 0,
    data.Catatan || '',
    now,
    userEmail,
    1
  ];

  sheet.appendRow(newRow);
  appendAudit(ss, newId, 'TUGAS', 'CREATE', userEmail, 'Tiada rekod lama', data);

  return { status: 'success', data: { ...data, Record_ID: newId, Version: 1 } };
}

// KEMASKINI TUGASAN
function handleUpdateTugas(ss, data, userEmail) {
  const sheet = ss.getSheetByName(SHEETS.AGIHAN_TUGAS);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return { status: 'error', message: 'Rekod tidak ditemui' };

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0];
  const idColIdx = headers.indexOf('Record_ID');
  const verColIdx = headers.indexOf('Version');

  for (let r = 1; r < values.length; r++) {
    if (values[r][idColIdx] === data.Record_ID) {
      const currentVersion = Number(values[r][verColIdx]);

      if (data.expectedVersion !== undefined && currentVersion !== Number(data.expectedVersion)) {
        return {
          status: 'conflict',
          message: 'Rekod ini telah dikemas kini oleh pengguna lain. Sila muat semula rekod untuk mendapatkan versi terkini.',
          currentVersion: currentVersion
        };
      }

      const oldObj = {};
      headers.forEach((h, i) => oldObj[h] = values[r][i]);

      const now = new Date().toISOString();
      const nextVersion = currentVersion + 1;

      if (data.Guru_ID !== undefined) values[r][headers.indexOf('Guru_ID')] = data.Guru_ID;
      if (data.Nama_Guru !== undefined) values[r][headers.indexOf('Nama_Guru')] = data.Nama_Guru;
      if (data.Bidang !== undefined) values[r][headers.indexOf('Bidang')] = data.Bidang;
      if (data.Kluster !== undefined) values[r][headers.indexOf('Kluster')] = data.Kluster;
      if (data.Jawatankuasa_Unit !== undefined) values[r][headers.indexOf('Jawatankuasa_Unit')] = data.Jawatankuasa_Unit;
      if (data.Jawatan_Tugasan !== undefined) values[r][headers.indexOf('Jawatan_Tugasan')] = data.Jawatan_Tugasan;
      if (data.Skop_Kelas_Tarikh !== undefined) values[r][headers.indexOf('Skop_Kelas_Tarikh')] = data.Skop_Kelas_Tarikh;
      if (data.Pemberatan !== undefined) values[r][headers.indexOf('Pemberatan')] = data.Pemberatan;
      if (data.Status !== undefined) values[r][headers.indexOf('Status')] = data.Status;
      if (data.Peratus_Kemajuan !== undefined) values[r][headers.indexOf('Peratus_Kemajuan')] = data.Peratus_Kemajuan;
      if (data.Catatan !== undefined) values[r][headers.indexOf('Catatan')] = data.Catatan;

      values[r][headers.indexOf('Updated_At')] = now;
      values[r][headers.indexOf('Updated_By')] = userEmail;
      values[r][headers.indexOf('Version')] = nextVersion;

      sheet.getRange(r + 1, 1, 1, lastCol).setValues([values[r]]);
      appendAudit(ss, data.Record_ID, 'TUGAS', 'UPDATE', userEmail, oldObj, data);

      return { status: 'success', version: nextVersion };
    }
  }

  return { status: 'error', message: 'Rekod tidak ditemui' };
}

// PADAM TUGASAN
function handleDeleteTugas(ss, recordId, userEmail) {
  const sheet = ss.getSheetByName(SHEETS.AGIHAN_TUGAS);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return { status: 'error', message: 'Helaian kosong' };

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const idColIdx = values[0].indexOf('Record_ID');

  for (let r = 1; r < values.length; r++) {
    if (values[r][idColIdx] === recordId) {
      const oldObj = {};
      values[0].forEach((h, i) => oldObj[h] = values[r][i]);

      sheet.deleteRow(r + 1);
      appendAudit(ss, recordId, 'TUGAS', 'DELETE', userEmail, oldObj, 'Rekod dipadam dari Google Sheets');

      return { status: 'success', message: 'Rekod berjaya dipadam' };
    }
  }

  return { status: 'error', message: 'Rekod ID tidak ditemui' };
}

function readSheetObjects(sheet) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx];
    });
    return obj;
  });
}

function appendAudit(ss, recordId, entityType, action, userEmail, oldVal, newVal) {
  const sheet = ss.getSheetByName(SHEETS.AUDIT_LOG);
  if (!sheet) return;

  const count = Math.max(1, sheet.getLastRow());
  const auditId = 'AUD' + ('0000' + count).slice(-4);
  const now = new Date().toISOString();

  sheet.appendRow([
    auditId,
    recordId,
    entityType,
    action,
    userEmail,
    now,
    typeof oldVal === 'string' ? oldVal : JSON.stringify(oldVal),
    typeof newVal === 'string' ? newVal : JSON.stringify(newVal)
  ]);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
