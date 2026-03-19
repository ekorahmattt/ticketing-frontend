import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiHeaders, API_BASE } from '../../utils/api';

const EMPTY_FORM = {
  name: '',
  username: '',
  role: 'admin',
  password: '',
  confirmPassword: '',
};

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const isSuperAdmin = role === 'superadmin';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
        ${isSuperAdmin
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
        }`}
    >
      {isSuperAdmin && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )}
      {isSuperAdmin ? 'Super Admin' : 'Admin'}
    </span>
  );
}

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === 'success';
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium transition-all
      ${isSuccess
        ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/40 dark:border-green-700 dark:text-green-300'
        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300'
      }`}
    >
      {isSuccess
        ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      }
      {message}
    </div>
  );
}

// ─── Password Input ───────────────────────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full border ${error ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'}
            bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 pr-10
            outline-none focus:ring-2 focus:ring-blue-500 transition text-sm`}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          {show
            ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          }
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Hapus Akun Admin?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Akun <span className="font-semibold text-gray-700 dark:text-gray-200">{name}</span> akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button onClick={onCancel} className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
            Batal
          </button>
          <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Users() {
  const { user: authUser } = useAuth();
  const isSuperAdmin = authUser?.role === 'superadmin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState(null);

  // --- Modal Tambah ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // --- Modal Edit ---
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // ── Fetch data dari API ──────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin-users`, {
        headers: apiHeaders(authUser),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setUsers(json.data || []);
      } else {
        setFetchError(json.message || 'Gagal memuat data.');
      }
    } catch {
      setFetchError('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Tambah Admin ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi.';
    if (!form.username.trim()) errs.username = 'Username wajib diisi.';
    else if (/\s/.test(form.username)) errs.username = 'Username tidak boleh mengandung spasi.';
    if (!form.password) errs.password = 'Password wajib diisi.';
    else if (form.password.length < 6) errs.password = 'Password minimal 6 karakter.';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Konfirmasi password tidak cocok.';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin-users`, {
        method: 'POST',
        headers: apiHeaders(authUser),
        body: JSON.stringify({
          name: form.name.trim(),
          username: form.username.trim(),
          password: form.password,
          role: form.role,
        }),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast('Akun admin berhasil ditambahkan.');
        setIsModalOpen(false);
        setForm(EMPTY_FORM);
        setErrors({});
        fetchUsers();
      } else {
        setErrors({ api: json.message || 'Gagal menyimpan data.' });
      }
    } catch {
      setErrors({ api: 'Tidak dapat terhubung ke server.' });
    } finally {
      setSaving(false);
    }
  };

  // ── Edit Admin ───────────────────────────────────────────────────────────────
  const validateEdit = () => {
    const errs = {};
    if (!editForm.name?.trim()) errs.name = 'Nama wajib diisi.';
    if (!editForm.username?.trim()) errs.username = 'Username wajib diisi.';
    else if (/\s/.test(editForm.username)) errs.username = 'Username tidak boleh mengandung spasi.';
    if (editForm.password && editForm.password.length < 6) errs.password = 'Password minimal 6 karakter.';
    if (editForm.password && editForm.confirmPassword !== editForm.password) errs.confirmPassword = 'Konfirmasi password tidak cocok.';
    return errs;
  };

  const handleOpenEdit = (u) => {
    setEditTarget(u);
    setEditForm({ ...u, password: '', confirmPassword: '' });
    setEditErrors({});
  };

  const handleSaveEdit = async () => {
    const errs = validateEdit();
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setEditSaving(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        username: editForm.username.trim(),
        role: editForm.role,
      };
      if (editForm.password) payload.password = editForm.password;

      const res = await fetch(`${API_BASE}/api/admin-users/${editTarget.id}`, {
        method: 'PUT',
        headers: apiHeaders(authUser),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast('Akun admin berhasil diperbarui.');
        setEditTarget(null);
        setEditForm({});
        setEditErrors({});
        fetchUsers();
      } else {
        setEditErrors({ api: json.message || 'Gagal memperbarui data.' });
      }
    } catch {
      setEditErrors({ api: 'Tidak dapat terhubung ke server.' });
    } finally {
      setEditSaving(false);
    }
  };

  // ── Hapus Admin ──────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin-users/${id}`, {
        method: 'DELETE',
        headers: apiHeaders(authUser),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast('Akun admin berhasil dihapus.');
        fetchUsers();
      } else {
        showToast(json.message || 'Gagal menghapus akun.', 'error');
      }
    } catch {
      showToast('Tidak dapat terhubung ke server.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Format tanggal ───────────────────────────────────────────────────────────
  const fmtDate = (val) => {
    if (!val) return <span className="text-gray-400 dark:text-gray-600 text-xs italic">—</span>;
    return new Date(val).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ── Inisial avatar ───────────────────────────────────────────────────────────
  const getInitials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Confirm Delete Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.name}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Kelola Akun Admin</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isSuperAdmin
              ? 'Anda dapat menambah, mengedit, dan menghapus akun admin.'
              : 'Anda dapat melihat daftar akun admin. Hanya superadmin yang dapat mengelola akun.'}
          </p>
        </div>

        {/* Tombol Tambah — hanya untuk superadmin */}
        {isSuperAdmin ? (
          <button
            id="btn-tambah-admin"
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Admin
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-medium w-full sm:w-auto justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Hanya Superadmin yang dapat menambah akun
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200 overflow-hidden">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-400">Memuat data admin...</p>
          </div>
        )}

        {/* Error */}
        {!loading && fetchError && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-500 font-medium">{fetchError}</p>
            <button onClick={fetchUsers} className="text-sm text-blue-600 hover:underline">Coba lagi</button>
          </div>
        )}

        {/* Table */}
        {!loading && !fetchError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Admin</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Username</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Role</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">Login Terakhir</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider hidden lg:table-cell">Dibuat</th>
                  {isSuperAdmin && (
                    <th className="text-left py-3.5 px-6 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 6 : 5} className="py-16 text-center text-gray-400 dark:text-gray-600">
                      Tidak ada data admin.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {/* Avatar + Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 select-none">
                            {getInitials(u.name)}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-mono text-xs">{u.username}</td>
                      <td className="py-4 px-6"><RoleBadge role={u.role} /></td>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-500 text-xs hidden md:table-cell">{fmtDate(u.last_login)}</td>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-500 text-xs hidden lg:table-cell">{fmtDate(u.created_at)}</td>
                      {isSuperAdmin && (
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              title="Edit"
                              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {/* Jangan hapus akun diri sendiri */}
                            {u.id !== authUser?.id && (
                              <button
                                onClick={() => setDeleteTarget(u)}
                                title="Hapus"
                                className="p-1.5 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/60 transition"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Tambah Admin ───────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Tambah Admin Baru</h2>
              </div>
              <button onClick={() => { setIsModalOpen(false); setForm(EMPTY_FORM); setErrors({}); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              {errors.api && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {errors.api}
                </div>
              )}

              {/* Nama */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text" placeholder="Masukkan nama lengkap..."
                  value={form.name}
                  onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
                  className={`w-full border ${errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Username <span className="text-red-500">*</span></label>
                <input
                  type="text" placeholder="Masukkan username (tanpa spasi)..."
                  value={form.username}
                  onChange={e => { setForm(p => ({ ...p, username: e.target.value })); setErrors(p => ({ ...p, username: '' })); }}
                  className={`w-full border ${errors.username ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition font-mono`}
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Password <span className="text-red-500">*</span></label>
                <PasswordInput
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="Minimal 6 karakter..."
                  error={errors.password}
                />
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Password <span className="text-red-500">*</span></label>
                <PasswordInput
                  value={form.confirmPassword}
                  onChange={e => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setErrors(p => ({ ...p, confirmPassword: '' })); }}
                  placeholder="Ulangi password..."
                  error={errors.confirmPassword}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => { setIsModalOpen(false); setForm(EMPTY_FORM); setErrors({}); }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold rounded-lg transition shadow-sm flex items-center gap-2"
              >
                {saving
                  ? <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Menyimpan...</>
                  : <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Simpan</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Edit Admin ─────────────────────────────────────────────────── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Edit Akun Admin</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">{editTarget.username}</p>
                </div>
              </div>
              <button onClick={() => { setEditTarget(null); setEditForm({}); setEditErrors({}); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              {editErrors.api && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {editErrors.api}
                </div>
              )}

              {/* Nama */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={e => { setEditForm(p => ({ ...p, name: e.target.value })); setEditErrors(p => ({ ...p, name: '' })); }}
                  className={`w-full border ${editErrors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition`}
                />
                {editErrors.name && <p className="text-red-500 text-xs mt-1">{editErrors.name}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Username <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editForm.username || ''}
                  onChange={e => { setEditForm(p => ({ ...p, username: e.target.value })); setEditErrors(p => ({ ...p, username: '' })); }}
                  className={`w-full border ${editErrors.username ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition font-mono`}
                />
                {editErrors.username && <p className="text-red-500 text-xs mt-1">{editErrors.username}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  value={editForm.role || 'admin'}
                  onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              {/* Ganti Password */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">Ganti Password (opsional — kosongkan jika tidak ingin mengubah)</p>
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Password Baru</label>
                    <PasswordInput
                      value={editForm.password || ''}
                      onChange={e => { setEditForm(p => ({ ...p, password: e.target.value })); setEditErrors(p => ({ ...p, password: '' })); }}
                      placeholder="Minimal 6 karakter..."
                      error={editErrors.password}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Password Baru</label>
                    <PasswordInput
                      value={editForm.confirmPassword || ''}
                      onChange={e => { setEditForm(p => ({ ...p, confirmPassword: e.target.value })); setEditErrors(p => ({ ...p, confirmPassword: '' })); }}
                      placeholder="Ulangi password baru..."
                      error={editErrors.confirmPassword}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => { setEditTarget(null); setEditForm({}); setEditErrors({}); }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold rounded-lg transition shadow-sm flex items-center gap-2"
              >
                {editSaving
                  ? <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Menyimpan...</>
                  : <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Simpan Perubahan</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
