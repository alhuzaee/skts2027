import { Guru, Tugasan, ConfigData, AppUser, AuditLog, SystemStatusInfo } from '../types.ts';

class ApiService {
  private userEmail: string = 'alhuzaee5181@gmail.com';

  setUserEmail(email: string) {
    this.userEmail = email;
  }

  getUserEmail(): string {
    return this.userEmail;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});
    headers.set('x-user-email', this.userEmail);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, { ...options, headers });
    return response;
  }

  async getStatus(): Promise<SystemStatusInfo> {
    const res = await this.fetchWithAuth('/api/status');
    if (!res.ok) throw new Error('Gagal menyemak status sistem');
    return res.json();
  }

  async connectGoogleSheetsUrl(webAppUrl: string, spreadsheetId?: string): Promise<{ success: boolean; message: string; rowsFound?: { masterGuru: number; agihanTugas: number } }> {
    const res = await this.fetchWithAuth('/api/config/sheets-url', {
      method: 'POST',
      body: JSON.stringify({ webAppUrl, spreadsheetId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyambungkan Google Apps Script.');
    }
    return res.json();
  }

  async pullFromGoogleSheets(): Promise<{ success: boolean; message: string; counts: { masterGuru: number; agihanTugas: number }; lastSyncTime: string }> {
    const res = await this.fetchWithAuth('/api/sync/pull', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menarik data dari Google Sheets.');
    }
    return res.json();
  }

  async seedToGoogleSheets(): Promise<{ success: boolean; message: string }> {
    const res = await this.fetchWithAuth('/api/sync/seed-to-sheets', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menghantar data ke Google Sheets.');
    }
    return res.json();
  }

  async getCurrentUser(): Promise<AppUser> {
    const res = await this.fetchWithAuth('/api/auth/me');
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Anda tidak mempunyai kebenaran untuk mengakses sistem ini.');
    }
    return res.json();
  }

  async getGuruList(): Promise<Guru[]> {
    const res = await this.fetchWithAuth('/api/guru');
    if (!res.ok) throw new Error('Gagal memuatkan senarai guru');
    return res.json();
  }

  async checkDuplicateGuru(name: string): Promise<{ hasDuplicate: boolean; matches: Array<{ Guru_ID: string; Nama_Guru: string; Gred: string }> }> {
    const res = await this.fetchWithAuth(`/api/guru/check-duplicate?name=${encodeURIComponent(name)}`);
    if (!res.ok) return { hasDuplicate: false, matches: [] };
    return res.json();
  }

  async createGuru(guru: Partial<Guru>): Promise<Guru> {
    const res = await this.fetchWithAuth('/api/guru', {
      method: 'POST',
      body: JSON.stringify(guru)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan rekod guru.');
    }
    return res.json();
  }

  async updateGuru(id: string, guru: Partial<Guru>, expectedVersion: number): Promise<Guru> {
    const res = await this.fetchWithAuth(`/api/guru/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...guru, expectedVersion })
    });
    if (res.status === 409) {
      const conflict = await res.json();
      const err: any = new Error(conflict.error);
      err.status = 409;
      err.conflict = conflict;
      throw err;
    }
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal mengemas kini guru.');
    }
    return res.json();
  }

  async toggleGuruStatus(id: string, status: 'Aktif' | 'Tidak Aktif', expectedVersion: number): Promise<Guru> {
    const res = await this.fetchWithAuth(`/api/guru/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ Status_Aktif: status, expectedVersion })
    });
    if (res.status === 409) {
      const conflict = await res.json();
      const err: any = new Error(conflict.error);
      err.status = 409;
      throw err;
    }
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menukar status guru.');
    }
    return res.json();
  }

  async getTugasanList(): Promise<Tugasan[]> {
    const res = await this.fetchWithAuth('/api/tugas');
    if (!res.ok) throw new Error('Gagal memuatkan senarai tugasan');
    return res.json();
  }

  async createTugasan(tugasan: Partial<Tugasan>): Promise<Tugasan> {
    const res = await this.fetchWithAuth('/api/tugas', {
      method: 'POST',
      body: JSON.stringify(tugasan)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan rekod tugasan.');
    }
    return res.json();
  }

  async updateTugasan(id: string, tugasan: Partial<Tugasan>, expectedVersion: number): Promise<Tugasan> {
    const res = await this.fetchWithAuth(`/api/tugas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...tugasan, expectedVersion })
    });
    if (res.status === 409) {
      const conflict = await res.json();
      const err: any = new Error(conflict.error);
      err.status = 409;
      err.conflict = conflict;
      throw err;
    }
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal mengemas kini tugasan.');
    }
    return res.json();
  }

  async deleteTugasan(id: string): Promise<{ success: boolean; message: string }> {
    const res = await this.fetchWithAuth(`/api/tugas/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memadam tugasan.');
    }
    return res.json();
  }

  async getConfig(): Promise<ConfigData> {
    const res = await this.fetchWithAuth('/api/config');
    if (!res.ok) throw new Error('Gagal memuatkan konfigurasi');
    return res.json();
  }

  async updateConfig(config: Partial<ConfigData>): Promise<ConfigData> {
    const res = await this.fetchWithAuth('/api/config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal mengemas kini konfigurasi.');
    }
    return res.json();
  }

  async getUsers(): Promise<AppUser[]> {
    const res = await this.fetchWithAuth('/api/users');
    if (!res.ok) throw new Error('Gagal memuatkan senarai pengguna');
    return res.json();
  }

  async createUser(user: Partial<AppUser>): Promise<AppUser> {
    const res = await this.fetchWithAuth('/api/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal mendaftar pengguna.');
    }
    return res.json();
  }

  async updateUser(id: string, user: Partial<AppUser>): Promise<AppUser> {
    const res = await this.fetchWithAuth(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal mengemas kini pengguna.');
    }
    return res.json();
  }

  async getAuditLogs(params?: { entity?: string; action?: string; user?: string }): Promise<AuditLog[]> {
    const query = new URLSearchParams();
    if (params?.entity) query.append('entity', params.entity);
    if (params?.action) query.append('action', params.action);
    if (params?.user) query.append('user', params.user);

    const res = await this.fetchWithAuth(`/api/audit-logs?${query.toString()}`);
    if (!res.ok) throw new Error('Gagal memuatkan log audit');
    return res.json();
  }

  async testGoogleSheetsConnection(webAppUrl: string, spreadsheetId?: string): Promise<{ connected: boolean; message: string; rowsFound?: any }> {
    const res = await this.fetchWithAuth('/api/sync/test-connection', {
      method: 'POST',
      body: JSON.stringify({ webAppUrl, spreadsheetId })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menyambung ke Google Sheets');
    }
    return {
      connected: data.success,
      message: data.message,
      rowsFound: data.rowsFound
    };
  }

  async syncPushToSheets(): Promise<{ success: boolean; message: string }> {
    const res = await this.fetchWithAuth('/api/sync/seed-to-sheets', {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menghantar data ke Google Sheets');
    }
    return data;
  }

  async syncPullFromSheets(): Promise<{ success: boolean; message: string }> {
    const res = await this.fetchWithAuth('/api/sync/pull', {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menarik data dari Google Sheets');
    }
    return data;
  }
}

export const api = new ApiService();
