/**
 * Buat headers standar untuk semua request ke API backend.
 * Menyertakan:
 *  - Content-Type: application/json
 *  - X-User-Role : role user yang sedang login (untuk otorisasi di backend)
 *  - X-User-Id   : ID user yang sedang login (untuk audit trail created_by / updated_by)
 *
 * @param {Object|null} user - objek user dari AuthContext (atau null jika tidak login)
 * @returns {Object} headers object
 */
export function apiHeaders(user) {
  return {
    'Content-Type': 'application/json',
    'X-User-Role': user?.role ?? '',
    'X-User-Id': user?.id != null ? String(user.id) : '',
  };
}

/**
 * Baca variabel wajib dari .env (Vite: prefix VITE_).
 * Nilai tidak di-hardcode di repo agar URL backend/websocket tidak ikut ter-commit.
 */
function requireEnv(name) {
  const value = import.meta.env[name];
  if (!value || String(value).trim() === '') {
    throw new Error(
      `Environment variable "${name}" belum diatur. Salin .env.example menjadi .env lalu isi URL backend dan websocket.`
    );
  }
  return String(value).trim().replace(/\/$/, '');
}

/** URL dasar backend (CodeIgniter index.php) */
export const API_BASE = requireEnv('VITE_API_BASE_URL');

/** URL server Socket.IO */
export const SOCKET_URL = requireEnv('VITE_SOCKET_URL');
