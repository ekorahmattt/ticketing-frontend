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
 * URL dasar backend — baca dari env, fallback ke XAMPP lokal.
 */
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost/ticketing-backend/index.php';
