import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiHeaders, API_BASE } from '../../utils/api';

const EMPTY_FORM = { category_id: '', name: '' };

// ─── Badge Kategori ───────────────────────────────────────────────────────────
const CATEGORY_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
];

function categoryColor(id) {
  return CATEGORY_COLORS[(id - 1) % CATEGORY_COLORS.length];
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const ok = type === 'success';
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium
      ${ok ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/40 dark:border-green-700 dark:text-green-300'
           : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300'}`}
    >
      {ok
        ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      }
      {message}
    </div>
  );
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────
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
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Hapus Jenis Gangguan?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span className="font-semibold text-gray-700 dark:text-gray-200">"{name}"</span> akan dihapus secara permanen.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button onClick={onCancel} className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">Batal</button>
          <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Dropdown (Fixed Position) ──────────────────────────────────────
function CategoryDropdown({ categories, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState({});
  const triggerRef = useRef(null);

  const selected = categories.find(c => String(c.id) === String(value));
  const filtered = useMemo(() =>
    categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase())),
    [categories, query]
  );

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setStyle({ position: 'fixed', top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 });
    }
    setOpen(p => !p);
  };

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className={`w-full min-h-[42px] border ${error ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5 cursor-pointer flex items-center justify-between gap-2 text-sm`}
      >
        {selected
          ? <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryColor(selected.id)}`}>{selected.name}</span>
          : <span className="text-gray-400 dark:text-gray-500">-- Pilih Kategori --</span>
        }
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {open && (
        <div style={style} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <input
              type="text"
              placeholder="Cari kategori..."
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map(c => (
              <div
                key={c.id}
                className={`flex items-center gap-2.5 p-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition text-sm ${String(value) === String(c.id) ? 'bg-violet-50 dark:bg-violet-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => { onChange(String(c.id)); setOpen(false); setQuery(''); }}
              >
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${categoryColor(c.id)}`}>{c.name}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="p-4 text-center text-sm text-gray-400">Kategori tidak ditemukan</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
function FormModal({ title, iconColor, form, errors, saving, categories, onChange, onSave, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg flex flex-col min-h-[460px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${iconColor}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-visible space-y-5 text-sm flex-1">
          {errors.api && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {errors.api}
            </div>
          )}

          {/* Kategori */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Kategori <span className="text-red-500">*</span>
            </label>
            <CategoryDropdown
              categories={categories}
              value={form.category_id}
              onChange={val => onChange('category_id', val)}
              error={errors.category_id}
            />
            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
          </div>

          {/* Nama Jenis Gangguan */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Nama Jenis Gangguan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Komputer tidak menyala..."
              value={form.name}
              onChange={e => onChange('name', e.target.value)}
              className={`w-full border ${errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-violet-500 transition`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>


        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">Batal</button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-70 text-white font-semibold rounded-lg transition shadow-sm flex items-center gap-2"
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

// ─── Detail Modal (View) ──────────────────────────────────────────────────────
function DetailModal({ item, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.026.076-.055.15-.085.224A9.957 9.957 0 0121.542 12C20.268 16.057 16.477 19 12 19c-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Detail Jenis Gangguan</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Nama Jenis Gangguan</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">Kategori</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColor(item.category_id)}`}>
                {item.category_name || '—'}
              </span>
            </div>

          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">ID Rekam</p>
            <p className="text-xs font-mono text-gray-600 dark:text-gray-400">#{item.id}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition text-sm">Tutup</button>
          <button onClick={onEdit} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SubCategories() {
  const { user: authUser } = useAuth();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addErrors, setAddErrors] = useState({});
  const [addSaving, setAddSaving] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true); setFetchError('');
    try {
      const res = await fetch(`${API_BASE}/api/subcategories`, { headers: apiHeaders(authUser) });
      const json = await res.json();
      if (res.ok && json.status === 'success') setItems(json.data || []);
      else setFetchError(json.message || 'Gagal memuat data.');
    } catch { setFetchError('Tidak dapat terhubung ke server.'); }
    finally { setLoading(false); }
  }, [authUser]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`, { headers: apiHeaders(authUser) });
      const json = await res.json();
      if (res.ok && json.status === 'success') setCategories(json.data || []);
    } catch { /* tidak fatal */ }
  }, [authUser]);

  useEffect(() => { fetchItems(); fetchCategories(); }, [fetchItems, fetchCategories]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return items.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery || item.name.toLowerCase().includes(q) || (item.category_name || '').toLowerCase().includes(q);
      const matchCat = !filterCat || String(item.category_id) === filterCat;
      return matchSearch && matchCat;
    });
  }, [items, searchQuery, filterCat]);

  // Kelompokkan per kategori supaya mudah dilihat
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(item => {
      const key = item.category_name || 'Tanpa Kategori';
      if (!map[key]) map[key] = { category_id: item.category_id, items: [] };
      map[key].items.push(item);
    });
    return map;
  }, [filtered]);

  // ── Tambah ─────────────────────────────────────────────────────────────────
  const validateAdd = () => {
    const e = {};
    if (!addForm.name.trim()) e.name = 'Nama jenis gangguan wajib diisi.';
    if (!addForm.category_id) e.category_id = 'Kategori wajib dipilih.';
    return e;
  };

  const handleAddSave = async () => {
    const errs = validateAdd();
    if (Object.keys(errs).length > 0) { setAddErrors(errs); return; }
    setAddSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/subcategories`, {
        method: 'POST',
        headers: apiHeaders(authUser),
        body: JSON.stringify(addForm),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast('Jenis gangguan berhasil ditambahkan.');
        setIsAddOpen(false); setAddForm(EMPTY_FORM); setAddErrors({});
        fetchItems();
      } else {
        setAddErrors({ api: json.message || 'Gagal menyimpan data.' });
      }
    } catch { setAddErrors({ api: 'Tidak dapat terhubung ke server.' }); }
    finally { setAddSaving(false); }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (item) => {
    setViewTarget(null);
    setEditTarget(item);
    setEditForm({ category_id: String(item.category_id || ''), name: item.name || '' });
    setEditErrors({});
  };

  const validateEdit = () => {
    const e = {};
    if (!editForm.name?.trim()) e.name = 'Nama jenis gangguan wajib diisi.';
    if (!editForm.category_id) e.category_id = 'Kategori wajib dipilih.';
    return e;
  };

  const handleEditSave = async () => {
    const errs = validateEdit();
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setEditSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/subcategories/${editTarget.id}`, {
        method: 'PUT',
        headers: apiHeaders(authUser),
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast('Jenis gangguan berhasil diperbarui.');
        setEditTarget(null); fetchItems();
      } else {
        setEditErrors({ api: json.message || 'Gagal memperbarui data.' });
      }
    } catch { setEditErrors({ api: 'Tidak dapat terhubung ke server.' }); }
    finally { setEditSaving(false); }
  };

  // ── Hapus ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE}/api/subcategories/${deleteTarget.id}`, {
        method: 'DELETE', headers: apiHeaders(authUser),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast(`"${deleteTarget.name}" berhasil dihapus.`);
        setDeleteTarget(null); fetchItems();
      } else {
        showToast(json.message || 'Gagal menghapus data.', 'error');
        setDeleteTarget(null);
      }
    } catch { showToast('Tidak dapat terhubung ke server.', 'error'); setDeleteTarget(null); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <ConfirmDialog
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Kelola Jenis Gangguan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Daftar sub-kategori / jenis gangguan yang tersedia untuk pelaporan tiket.
          </p>
        </div>
        <button
          id="btn-tambah-subcat"
          onClick={() => { setAddForm(EMPTY_FORM); setAddErrors({}); setIsAddOpen(true); }}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-sm w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Jenis Gangguan
        </button>
      </div>

      {/* Stats */}
      {!loading && !fetchError && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{items.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Jenis Gangguan</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{categories.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Kategori Tersedia</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition"
        >
          <option value="">Semua Kategori</option>
          {categories.map(c => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>

        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama jenis gangguan atau kategori..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-violet-500 transition"
          />
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-400">Memuat data jenis gangguan...</p>
        </div>
      )}

      {!loading && fetchError && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-red-500 font-medium">{fetchError}</p>
          <button onClick={fetchItems} className="text-sm text-violet-600 hover:underline">Coba lagi</button>
        </div>
      )}

      {!loading && !fetchError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || filterCat ? 'Tidak ada data yang cocok dengan filter.' : 'Belum ada jenis gangguan. Klik "Tambah" untuk memulai.'}
          </p>
        </div>
      )}

      {/* Grouped Cards */}
      {!loading && !fetchError && filtered.length > 0 && (
        <div className="space-y-5">
          {Object.entries(grouped).map(([catName, group]) => (
            <div key={catName} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Category Header */}
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
                <div className="flex items-center gap-2.5">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${categoryColor(group.category_id)}`}>
                    {catName}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{group.items.length} jenis gangguan</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 dark:border-gray-800">
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">#</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Jenis Gangguan</th>

                      <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {group.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                        <td className="py-3.5 px-6 text-xs text-gray-400 dark:text-gray-600 font-mono">{idx + 1}</td>
                        <td className="py-3.5 px-6">
                          <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {item.name}
                          </span>
                        </td>

                        <td className="py-3.5 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setViewTarget(item)}
                              title="Lihat Detail"
                              className="p-1.5 rounded-lg text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.026.076-.055.15-.085.224A9.957 9.957 0 0121.542 12C20.268 16.057 16.477 19 12 19c-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openEdit(item)}
                              title="Edit"
                              className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Footer count */}
          <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
            Menampilkan <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span> dari <span className="font-semibold text-gray-600 dark:text-gray-300">{items.length}</span> jenis gangguan
          </p>
        </div>
      )}

      {/* ── Modal Tambah ─── */}
      {isAddOpen && (
        <FormModal
          title="Tambah Jenis Gangguan"
          iconColor="bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400"
          form={addForm}
          errors={addErrors}
          saving={addSaving}
          categories={categories}
          onChange={(f, v) => { setAddForm(p => ({ ...p, [f]: v })); setAddErrors(p => ({ ...p, [f]: '' })); }}
          onSave={handleAddSave}
          onClose={() => { setIsAddOpen(false); setAddForm(EMPTY_FORM); setAddErrors({}); }}
        />
      )}

      {/* ── Modal Edit ─── */}
      {editTarget && (
        <FormModal
          title={`Edit: ${editTarget.name}`}
          iconColor="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
          form={editForm}
          errors={editErrors}
          saving={editSaving}
          categories={categories}
          onChange={(f, v) => { setEditForm(p => ({ ...p, [f]: v })); setEditErrors(p => ({ ...p, [f]: '' })); }}
          onSave={handleEditSave}
          onClose={() => { setEditTarget(null); setEditForm({}); setEditErrors({}); }}
        />
      )}

      {/* ── Modal Detail ─── */}
      {viewTarget && (
        <DetailModal
          item={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={() => openEdit(viewTarget)}
        />
      )}
    </div>
  );
}
