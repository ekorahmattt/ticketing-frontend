import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiHeaders, API_BASE } from '../../utils/api';

const EMPTY_FORM = {
  name: '',
  full_name: '',
  unit_id: null,
  phone: '',
};

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

// ─── Confirm Delete Dialog ───────────────────────────────────────────────────── 
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
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Hapus Device User?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pengguna <span className="font-semibold text-gray-700 dark:text-gray-200">{name}</span> akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
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

// ─── Searchable Unit Dropdown ──────────────────────────────────────────────────

function UnitDropdown({ units, selectedUnitId, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({});
  const triggerRef = useRef(null);

  const selectedUnit = units.find(u => u.id === selectedUnitId);

  const filtered = useMemo(() =>
    units.filter(u =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      (u.code || '').toLowerCase().includes(query.toLowerCase())
    ),
    [units, query]);

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setOpen(prev => !prev);
  };

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        className="w-full min-h-[42px] border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5 cursor-pointer flex items-center justify-between gap-2 text-sm"
        onClick={handleOpen}
      >
        {selectedUnit ? (
          <span className="text-gray-800 dark:text-gray-200">
            {selectedUnit.name}
            {selectedUnit.code && <span className="ml-1.5 text-xs text-gray-400">({selectedUnit.code})</span>}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">-- Pilih Unit --</span>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {open && (
        <div
          style={dropdownStyle}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl"
        >
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <input
              type="text"
              placeholder="Cari nama unit..."
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            <div
              className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800 text-sm text-gray-400"
              onClick={() => { onChange(null); setOpen(false); setQuery(''); }}
            >
              -- Tidak ada unit --
            </div>
            {filtered.map(u => (
              <div
                key={u.id}
                className={`flex items-center justify-between p-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition text-sm ${selectedUnitId === u.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => { onChange(u.id); setOpen(false); setQuery(''); }}
              >
                <span className={`font-medium ${selectedUnitId === u.id ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-800 dark:text-gray-200'}`}>
                  {u.name}
                </span>
                {u.code && (
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{u.code}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Avatar Initials ──────────────────────────────────────────────────────────
function Avatar({ name = '' }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0 select-none">
      {initials || '?'}
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
function FormModal({ title, iconColor, form, errors, saving, units, onChange, onSave, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] min-h-[520px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${iconColor}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-visible space-y-4 text-sm flex-1">
          {errors.api && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {errors.api}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan username (login / identifikasi)..."
              value={form.name}
              onChange={e => onChange('name', e.target.value)}
              className={`w-full border ${errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 transition font-mono`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap..."
              value={form.full_name}
              onChange={e => onChange('full_name', e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Unit</label>
            <UnitDropdown
              units={units}
              selectedUnitId={form.unit_id}
              onChange={val => onChange('unit_id', val)}
            />
          </div>

          {/* No. HP */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">No. Telepon / HP</label>
            <input
              type="text"
              placeholder="Contoh: 08120000000..."
              value={form.phone}
              onChange={e => onChange('phone', e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-semibold rounded-lg transition shadow-sm flex items-center gap-2"
          >
            {saving
              ? <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Menyimpan...</>
              : <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Simpan</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DeviceUsers() {
  const { user: authUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('');

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal Tambah
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addErrors, setAddErrors] = useState({});
  const [addSaving, setAddSaving] = useState(false);

  // Modal Edit
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // ── Fetch Data ────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(`${API_BASE}/api/device-users`, { headers: apiHeaders(authUser) });
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

  const fetchUnits = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/units`, { headers: apiHeaders(authUser) });
      const json = await res.json();
      if (res.ok && json.status === 'success') setUnits(json.data || []);
    } catch { /* tidak fatal */ }
  }, [authUser]);

  useEffect(() => {
    fetchUsers();
    fetchUnits();
  }, [fetchUsers, fetchUnits]);

  // ── Filter data ───────────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.phone || '').includes(q) ||
        (u.unit_name || '').toLowerCase().includes(q);
      const matchUnit = !filterUnit || String(u.unit_id) === filterUnit;
      return matchSearch && matchUnit;
    });
  }, [users, searchQuery, filterUnit]);

  // ── Tambah ────────────────────────────────────────────────────────────────────
  const validateAdd = () => {
    const errs = {};
    if (!addForm.name.trim()) errs.name = 'Username wajib diisi.';
    return errs;
  };

  const handleAddSave = async () => {
    const errs = validateAdd();
    if (Object.keys(errs).length > 0) { setAddErrors(errs); return; }
    setAddSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/device-users`, {
        method: 'POST',
        headers: apiHeaders(authUser),
        body: JSON.stringify(addForm),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast('Device user berhasil ditambahkan.');
        setIsModalOpen(false);
        setAddForm(EMPTY_FORM);
        setAddErrors({});
        fetchUsers();
      } else {
        setAddErrors({ api: json.message || 'Gagal menyimpan data.' });
      }
    } catch {
      setAddErrors({ api: 'Tidak dapat terhubung ke server.' });
    } finally {
      setAddSaving(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────────
  const handleOpenEdit = (u) => {
    setEditTarget(u);
    setEditForm({
      name: u.name || '',
      full_name: u.full_name || '',
      unit_id: u.unit_id || null,
      phone: u.phone || '',
    });
    setEditErrors({});
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.name?.trim()) errs.name = 'Username wajib diisi.';
    return errs;
  };

  const handleSaveEdit = async () => {
    const errs = validateEdit();
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setEditSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/device-users/${editTarget.id}`, {
        method: 'PUT',
        headers: apiHeaders(authUser),
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast('Device user berhasil diperbarui.');
        setEditTarget(null);
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

  // ── Hapus ─────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/device-users/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: apiHeaders(authUser),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast(`Pengguna "${deleteTarget.full_name || deleteTarget.name}" berhasil dihapus.`);
        setDeleteTarget(null);
        fetchUsers();
      } else {
        showToast(json.message || 'Gagal menghapus data.', 'error');
        setDeleteTarget(null);
      }
    } catch {
      showToast('Tidak dapat terhubung ke server.', 'error');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Format tanggal ────────────────────────────────────────────────────────────
  const fmtDate = (val) => {
    if (!val) return <span className="text-gray-400 dark:text-gray-600 text-xs italic">—</span>;
    return new Date(val).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Confirm Delete */}
      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.full_name || deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Kelola Device Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Daftar pengguna perangkat yang terdaftar di sistem. Dapat ditambah, diedit, dan dihapus.
          </p>
        </div>
        <button
          id="btn-tambah-device-user"
          onClick={() => { setAddForm(EMPTY_FORM); setAddErrors({}); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengguna
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Unit filter */}
        <select
          value={filterUnit}
          onChange={e => setFilterUnit(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition"
        >
          <option value="">Semua Unit</option>
          {units.map(u => (
            <option key={u.id} value={String(u.id)}>{u.name}</option>
          ))}
        </select>

        {/* Search */}
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama, username, unit, atau no. HP..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-400">Memuat data pengguna...</p>
          </div>
        )}

        {/* Error */}
        {!loading && fetchError && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-500 font-medium">{fetchError}</p>
            <button onClick={fetchUsers} className="text-sm text-emerald-600 hover:underline">Coba lagi</button>
          </div>
        )}

        {/* Table */}
        {!loading && !fetchError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Pengguna</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Username</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">Unit</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider hidden lg:table-cell">No. HP</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider hidden lg:table-cell">Dibuat</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400 dark:text-gray-600">
                      {searchQuery || filterUnit ? 'Tidak ada pengguna yang cocok dengan filter.' : 'Belum ada data device user.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {/* Avatar & Nama Lengkap */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.full_name || u.name} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{u.full_name || <span className="italic text-gray-400">—</span>}</p>
                          </div>
                        </div>
                      </td>
                      {/* Username */}
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-mono text-xs">{u.name}</td>
                      {/* Unit */}
                      <td className="py-4 px-6 hidden md:table-cell">
                        {u.unit_name ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            {u.unit_name}
                            {u.unit_code && <span className="opacity-60">({u.unit_code})</span>}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600 text-xs italic">—</span>
                        )}
                      </td>
                      {/* Phone */}
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-500 text-xs hidden lg:table-cell">
                        {u.phone || <span className="italic text-gray-400 dark:text-gray-600">—</span>}
                      </td>
                      {/* Created At */}
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-500 text-xs hidden lg:table-cell">{fmtDate(u.created_at)}</td>
                      {/* Aksi */}
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
                          <button
                            onClick={() => setDeleteTarget(u)}
                            title="Hapus"
                            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/60 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Footer count */}
            {filteredUsers.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-500">
                Menampilkan <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredUsers.length}</span> dari <span className="font-semibold text-gray-700 dark:text-gray-300">{users.length}</span> pengguna
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal Tambah ─────────────────────────────────────────────── */}
      {isModalOpen && (
        <FormModal
          title="Tambah Device User"
          iconColor="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
          form={addForm}
          errors={addErrors}
          saving={addSaving}
          units={units}
          onChange={(field, val) => { setAddForm(p => ({ ...p, [field]: val })); setAddErrors(p => ({ ...p, [field]: '' })); }}
          onSave={handleAddSave}
          onClose={() => { setIsModalOpen(false); setAddForm(EMPTY_FORM); setAddErrors({}); }}
        />
      )}

      {/* ── Modal Edit ──────────────────────────────────────────────── */}
      {editTarget && (
        <FormModal
          title={`Edit: ${editTarget.full_name || editTarget.name}`}
          iconColor="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
          form={editForm}
          errors={editErrors}
          saving={editSaving}
          units={units}
          onChange={(field, val) => { setEditForm(p => ({ ...p, [field]: val })); setEditErrors(p => ({ ...p, [field]: '' })); }}
          onSave={handleSaveEdit}
          onClose={() => { setEditTarget(null); setEditForm({}); setEditErrors({}); }}
        />
      )}
    </div>
  );
}
