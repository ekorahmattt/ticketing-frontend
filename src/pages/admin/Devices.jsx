import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiHeaders, API_BASE } from '../../utils/api';
import StatCard from '../../components/ui/StatCard';
import ViewSwitcher from '../../components/feature-specific/ViewSwitcher';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// ─── Helper: konversi data API → format UI ────────────────────────────────────
function apiToUi(d) {
  return {
    id: d.id,
    hostname: d.device_name || '',
    brand: d.brand || '',
    model: d.model || '',
    serial: d.serial_number || '',
    // Gunakan device_type_name dari JOIN device_types
    type: d.device_type_name || d.device_type || '',
    ip: d.ip_address || '',
    mac: d.mac_address || '',
    remote: d.remote_address || '-',
    os: d.os || '',
    // unit_id (FK) dan unit_name dari JOIN units
    unit_id: d.unit_id || null,
    unit: d.unit_name || '',          // untuk ditampilkan di tabel / search
    coordX: d.coord_x || '',
    coordY: d.coord_y || '',
    status: d.status || 'Aktif',
    // users = array of { id, name } dari API
    users: Array.isArray(d.users) ? d.users : [],
    // parentConnections = perangkat induk (komputer) yang terhubung ke device ini
    parentConnections: Array.isArray(d.parent_connections) ? d.parent_connections : [],
  };
}

// ─── Helper: konversi form UI → payload API ───────────────────────────────────
function uiToApi(form) {
  const deviceId = form.id ? parseInt(form.id) : null;
  return {
    device_name: form.hostname,
    brand: form.brand,
    model: form.model,
    serial_number: form.serial,
    // Kirim nama tipe; backend akan lookup ke device_type_id
    device_type: form.type,
    ip_address: form.ip,
    mac_address: form.mac,
    remote_address: form.remote,
    os: form.os,
    // Kirim unit_id langsung (integer FK), bukan nama string
    unit_id: form.unit_id ? parseInt(form.unit_id) : null,
    coord_x: form.coordX ? parseInt(form.coordX) : null,
    coord_y: form.coordY ? parseInt(form.coordY) : null,
    // Kirim array of user id
    users: Array.isArray(form.selectedUsers) ? form.selectedUsers.map(u => u.id) : [],
    // Koneksi: selectedConnections berisi komputer yang terhubung (sebagai parent)
    connections: Array.isArray(form.selectedConnections)
      ? form.selectedConnections.map(c => ({
        parent_device_id: c.device_id,
        child_device_id: deviceId,
      }))
      : [],
  };
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

// ─── Searchable Single-Select Unit Dropdown ────────────────────────────────────
function UnitDropdown({ units, selectedUnitId, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedUnit = units.find(u => u.id === selectedUnitId);

  const filtered = useMemo(() =>
    units.filter(u =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      (u.code || '').toLowerCase().includes(query.toLowerCase())
    ),
    [units, query]);

  return (
    <div className="relative">
      <div
        className="w-full min-h-[42px] border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5 cursor-pointer flex items-center justify-between gap-2"
        onClick={() => setOpen(!open)}
      >
        {selectedUnit ? (
          <span className="text-gray-800 dark:text-gray-200 text-sm">
            {selectedUnit.name}
            {selectedUnit.code && <span className="ml-1.5 text-xs text-gray-400">({selectedUnit.code})</span>}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 text-sm">-- Pilih Unit --</span>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <input
              type="text"
              placeholder="Cari nama unit..."
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            <div
              className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800"
              onClick={() => { onChange(null); setOpen(false); setQuery(''); }}
            >
              <span className="text-sm text-gray-400">-- Tidak ada unit --</span>
            </div>
            {filtered.map(u => (
              <div
                key={u.id}
                className={`flex items-center justify-between p-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition ${selectedUnitId === u.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => { onChange(u.id); setOpen(false); setQuery(''); }}
              >
                <span className={`text-sm font-medium ${selectedUnitId === u.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
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

// ─── Searchable Multi-Select Device Dropdown (untuk Koneksi Perangkat) ──────────
function DeviceDropdown({ allDevices, selectedDevices, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!allDevices || allDevices.length === 0) return [];
    return allDevices.filter(d => {
      const name = (d.hostname || d.device_name || '').toLowerCase();
      const unitStr = (d.unit || '').toLowerCase();
      return name.includes(query.toLowerCase()) || unitStr.includes(query.toLowerCase());
    });
  }, [allDevices, query]);

  const toggle = (device) => {
    const exists = selectedDevices.some(d => d.device_id === device.id);
    if (exists) {
      onChange(selectedDevices.filter(d => d.device_id !== device.id));
    } else {
      // hostname = field dari apiToUi; fallback ke device_name jika dari raw API
      onChange([...selectedDevices, { device_id: device.id, device_name: device.hostname || device.device_name || '' }]);
    }
  };

  const remove = (device) => onChange(selectedDevices.filter(d => d.device_id !== device.device_id));

  return (
    <div className="relative">
      <div
        className="w-full min-h-[42px] border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1.5 cursor-pointer flex flex-wrap gap-1.5 items-center"
        onClick={() => setOpen(!open)}
      >
        {selectedDevices.length > 0 ? (
          <>
            {selectedDevices.map(d => (
              <span key={d.device_id} className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {d.device_name}
                <button type="button" className="ml-0.5 text-indigo-400 hover:text-indigo-700 transition" onClick={e => { e.stopPropagation(); remove(d); }}>✕</button>
              </span>
            ))}
            <span className="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </>
        ) : (
          <>
            <span className="text-gray-400 dark:text-gray-500 text-sm">{placeholder || '-- Pilih Perangkat --'}</span>
            <span className="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </>
        )}
      </div>

      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <input
              type="text"
              placeholder="Cari nama perangkat atau unit..."
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map(d => {
                const isSelected = selectedDevices.some(s => s.device_id === d.id);
                return (
                  <div
                    key={d.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    onClick={() => toggle(d)}
                  >
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'}`}>
                        {d.hostname || d.device_name || '(tanpa nama)'}
                      </p>
                      {d.unit && <p className="text-xs text-gray-400">{d.unit}</p>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-sm text-gray-500 text-center">Perangkat tidak ditemukan</div>
            )}
          </div>
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedDevices.length > 0 ? `${selectedDevices.length} dipilih` : 'Belum ada yang dipilih'}
            </span>
            <button type="button" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition" onClick={() => { setOpen(false); setQuery(''); }}>
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Searchable Multi-Select User Dropdown ────────────────────────────────────
function UserDropdown({ allUsers, selectedUsers, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() =>
    allUsers.filter(u => u.name.toLowerCase().includes(query.toLowerCase())),
    [allUsers, query]);

  const toggle = (user) => {
    const exists = selectedUsers.some(u => u.id === user.id);
    if (exists) {
      onChange(selectedUsers.filter(u => u.id !== user.id));
    } else {
      onChange([...selectedUsers, user]);
    }
  };

  const remove = (user) => onChange(selectedUsers.filter(u => u.id !== user.id));

  return (
    <div className="relative">
      <div
        className="w-full min-h-[42px] border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1.5 cursor-pointer flex flex-wrap gap-1.5 items-center"
        onClick={() => setOpen(!open)}
      >
        {selectedUsers.length > 0 ? (
          <>
            {selectedUsers.map(u => (
              <span key={u.id} className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                {u.name}
                <button type="button" className="ml-0.5 text-blue-400 hover:text-blue-700 transition" onClick={e => { e.stopPropagation(); remove(u); }}>✕</button>
              </span>
            ))}
            <span className="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </>
        ) : (
          <>
            <span className="text-gray-400 dark:text-gray-500 text-sm">-- Pilih Nama Pengguna --</span>
            <span className="ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </>
        )}
      </div>

      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <input
              type="text"
              placeholder="Cari nama pegawai..."
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map(u => {
                const isSelected = selectedUsers.some(s => s.id === u.id);
                return (
                  <div
                    key={u.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    onClick={() => toggle(u)}
                  >
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>{u.name}</p>
                      {u.unit && <p className="text-xs text-gray-400">{u.unit}</p>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-sm text-gray-500 text-center">Nama tidak ditemukan</div>
            )}
          </div>
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedUsers.length > 0 ? `${selectedUsers.length} pengguna dipilih` : 'Belum ada yang dipilih'}
            </span>
            <button type="button" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition" onClick={() => { setOpen(false); setQuery(''); }}>
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty add form ───────────────────────────────────────────────────────────
const EMPTY_ADD_FORM = {
  hostname: '', brand: '', model: '', serial: '',
  type: '', ip: '', mac: '', remote: '',
  os: '', unit_id: null, coordX: '', coordY: '',
  status: 'Aktif', loc: '',
  selectedUsers: [],
  selectedConnections: [],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Devices() {
  const { user: authUser } = useAuth();

  const [view, setView] = useState('list');

  // ── Data State ───────────────────────────────────────────────────────────────
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Daftar semua device users untuk dropdown pengguna
  const [allUsers, setAllUsers] = useState([]);

  // Daftar tipe perangkat dari device_types
  const [deviceTypes, setDeviceTypes] = useState([]);

  // Daftar unit dari tabel units
  const [units, setUnits] = useState([]);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // Search / filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterUnit, setFilterUnit] = useState('');

  // ── Modal Tambah ─────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState('');

  // ── Modal Edit ───────────────────────────────────────────────────────────────
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // ── Modal Delete ─────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch Devices ─────────────────────────────────────────────────────────────
  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(`${API_BASE}/api/devices`, { headers: apiHeaders(authUser) });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setDevices((json.data || []).map(apiToUi));
      } else {
        setFetchError(json.message || 'Gagal memuat data perangkat.');
      }
    } catch {
      setFetchError('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  // ── Fetch Device Users (untuk dropdown pengguna) ─────────────────────────────
  const fetchDeviceUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/device-users`, { headers: apiHeaders(authUser) });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setAllUsers(json.data || []);
      }
    } catch {
      // tidak fatal
    }
  }, [authUser]);

  // ── Fetch Device Types (untuk dropdown tipe perangkat) ───────────────────────
  const fetchDeviceTypes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/device-types`, { headers: apiHeaders(authUser) });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setDeviceTypes(json.data || []);
      }
    } catch {
      // tidak fatal
    }
  }, [authUser]);

  // ── Fetch Units (untuk dropdown unit) ──────────────────────────────────────
  const fetchUnits = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/units`, { headers: apiHeaders(authUser) });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setUnits(json.data || []);
      }
    } catch {
      // tidak fatal
    }
  }, [authUser]);

  useEffect(() => {
    fetchDevices();
    fetchDeviceUsers();
    fetchDeviceTypes();
    fetchUnits();
  }, [fetchDevices, fetchDeviceUsers, fetchDeviceTypes, fetchUnits]);

  // ── Devices yang difilter ─────────────────────────────────────────────────────
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchSearch = !searchQuery ||
        d.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||     // unit_name dari join
        d.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = !filterType || d.type === filterType;
      const matchUnit = !filterUnit || d.unit === filterUnit;
      return matchSearch && matchType && matchUnit;
    });
  }, [devices, searchQuery, filterType, filterUnit]);

  // ── Tipe unik untuk filter dropdown ──────────────────────────────────────────
  const uniqueTypes = useMemo(() => [...new Set(devices.map(d => d.type).filter(Boolean))], [devices]);

  // ── Daftar perangkat Computer untuk opsi dropdown koneksi ────────────────────
  // DeviceDropdown hanya menampilkan perangkat bertipe 'Computer'
  const computerDevices = useMemo(() =>
    devices.filter(d => d.type === 'Computer'),
    [devices]);

  // ── Tambah Device ─────────────────────────────────────────────────────────────
  const handleAddSave = async () => {
    if (!addForm.hostname.trim()) {
      setAddError('Nama perangkat (Hostname) wajib diisi.');
      return;
    }
    setAddSaving(true);
    setAddError('');
    try {
      const payload = uiToApi(addForm);
      const res = await fetch(`${API_BASE}/api/devices`, {
        method: 'POST',
        headers: apiHeaders(authUser),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast('Perangkat berhasil ditambahkan.');
        setIsModalOpen(false);
        setAddForm(EMPTY_ADD_FORM);
        fetchDevices();
      } else {
        setAddError(json.message || 'Gagal menyimpan perangkat.');
      }
    } catch {
      setAddError('Tidak dapat terhubung ke server.');
    } finally {
      setAddSaving(false);
    }
  };

  // ── Edit Device ───────────────────────────────────────────────────────────────
  const handleOpenEdit = (device) => {
    setSelectedDevice(device);
    setEditForm({
      ...device,
      selectedUsers: device.users,
      // unit_id sudah ada di device dari apiToUi
      unit_id: device.unit_id || null,
      // Pre-populate dari parentConnections
      selectedConnections: Array.isArray(device.parentConnections) ? device.parentConnections : [],
    });
    setEditError('');
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editForm.hostname?.trim()) {
      setEditError('Nama perangkat (Hostname) wajib diisi.');
      return;
    }
    setEditSaving(true);
    setEditError('');
    try {
      const payload = uiToApi(editForm);
      const res = await fetch(`${API_BASE}/api/devices/${selectedDevice.id}`, {
        method: 'PUT',
        headers: apiHeaders(authUser),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast('Perangkat berhasil diperbarui.');
        setSelectedDevice(null);
        setEditForm({});
        fetchDevices();
      } else {
        setEditError(json.message || 'Gagal memperbarui perangkat.');
      }
    } catch {
      setEditError('Tidak dapat terhubung ke server.');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete Device ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/devices/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: apiHeaders(authUser),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast(`Perangkat "${deleteTarget.hostname}" berhasil dihapus.`);
        setDeleteTarget(null);
        fetchDevices();
      } else {
        showToast(json.message || 'Gagal menghapus perangkat.', 'error');
        setDeleteTarget(null);
      }
    } catch {
      showToast('Tidak dapat terhubung ke server.', 'error');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Statistik ─────────────────────────────────────────────────────────────────
  const aktif = devices.filter(d => d.status === 'Aktif').length;
  const rusak = devices.filter(d => d.status === 'Rusak').length;
  const tidakAktif = devices.filter(d => d.status === 'Tidak Aktif').length;

  const statusData = [
    { name: 'Aktif', value: aktif, color: '#22c55e' },
    { name: 'Rusak', value: rusak, color: '#ef4444' },
    { name: 'Tidak Aktif', value: tidakAktif, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const typeCounts = devices.reduce((acc, d) => {
    if (d.type) acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(typeCounts).map(([name, total]) => ({ name, total }));

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // ─── Shared Form Fields ───────────────────────────────────────────────────────────
  // allDevices = hanya tipe Computer, untuk opsi dropdown koneksi
  // units = daftar unit dari tabel units untuk dropdown unit
  const renderFormFields = (form, onChange, allUsers, deviceTypes, allDevices, units) => (
    <>
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-1">
          Nama Pengguna <span className="text-xs font-normal text-gray-400">(bisa pilih lebih dari satu)</span>
        </label>
        <UserDropdown
          allUsers={allUsers}
          selectedUsers={form.selectedUsers || []}
          onChange={val => onChange('selectedUsers', val)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Hostname / Nama Perangkat <span className="text-red-500">*</span></label>
          <input type="text" value={form.hostname || ''} onChange={e => onChange('hostname', e.target.value)} placeholder="Masukkan hostname..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Brand</label>
          <input type="text" value={form.brand || ''} onChange={e => onChange('brand', e.target.value)} placeholder="Masukkan brand..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Model</label>
          <input type="text" value={form.model || ''} onChange={e => onChange('model', e.target.value)} placeholder="Masukkan model..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Serial Number</label>
          <input type="text" value={form.serial || ''} onChange={e => onChange('serial', e.target.value)} placeholder="Masukkan serial number..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Tipe Perangkat</label>
          <select
            value={form.type || ''}
            onChange={e => onChange('type', e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Tipe Perangkat --</option>
            {deviceTypes.length > 0
              ? deviceTypes.map(dt => (
                <option key={dt.id} value={dt.name}>{dt.name}</option>
              ))
              : (
                // Fallback statis jika API belum tersedia
                <>
                  <option value="Computer">Computer</option>
                  <option value="Printer">Printer</option>
                  <option value="Access Point">Access Point</option>
                  <option value="CCTV">CCTV</option>
                </>
              )
            }
          </select>
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
          <input type="text" value={form.ip || ''} onChange={e => onChange('ip', e.target.value)} placeholder="Contoh: 192.168.1.10" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">MAC Address</label>
          <input type="text" value={form.mac || ''} onChange={e => onChange('mac', e.target.value)} placeholder="Masukkan MAC Address..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Remote Address</label>
          <input type="text" value={form.remote || ''} onChange={e => onChange('remote', e.target.value)} placeholder="Remote address (opsional)..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">OS</label>
          <input type="text" value={form.os || ''} onChange={e => onChange('os', e.target.value)} placeholder="Contoh: Windows 10, Linux..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Unit</label>
          <UnitDropdown
            units={units}
            selectedUnitId={form.unit_id || null}
            onChange={val => onChange('unit_id', val)}
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Koordinat X</label>
          <input type="number" value={form.coordX || ''} onChange={e => onChange('coordX', e.target.value)} placeholder="Contoh: 120" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Koordinat Y</label>
          <input type="number" value={form.coordY || ''} onChange={e => onChange('coordY', e.target.value)} placeholder="Contoh: 350" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select value={form.status || 'Aktif'} onChange={e => onChange('status', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Aktif">Aktif</option>
            <option value="Rusak">Rusak</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Koneksi Perangkat — tampil hanya jika ada perangkat Computer tersedia */}
      {allDevices.length > 0 && (
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            Komputer yang Terhubung
            <span className="text-xs font-normal text-gray-400 ml-1">(khusus printer/scanner sharing — bisa pilih lebih dari satu)</span>
          </label>
          <DeviceDropdown
            allDevices={allDevices}
            selectedDevices={form.selectedConnections || []}
            onChange={val => onChange('selectedConnections', val)}
            placeholder="-- Pilih komputer yang terhubung --"
          />
        </div>
      )}
    </>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Kelola Perangkat</h1>
        <button
          onClick={() => { setAddForm(EMPTY_ADD_FORM); setAddError(''); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Perangkat
        </button>
      </div>

      {/* ─── Grafik Statistik ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut - Status Perangkat */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Distribusi Status Perangkat</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Aktif, Rusak, dan Tidak Aktif</p>
          {statusData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} labelLine={false} label={renderCustomLabel}>
                    {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }} formatter={(value, name) => [`${value} unit`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-2">
                {statusData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{item.name}</span>
                    <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400">Belum ada data</div>
          )}
        </div>

        {/* Bar - Jumlah per Kategori */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Jumlah Perangkat per Tipe</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Berdasarkan tipe perangkat terdaftar</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }} formatter={(value) => [`${value} unit`, 'Jumlah']} cursor={{ fill: 'rgba(99,102,241,0.07)' }} />
                <Bar dataKey="total" fill="#6366f1" radius={[0, 5, 5, 0]} barSize={20}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 7]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400">Belum ada data</div>
          )}
        </div>
      </div>

      {/* ─── StatCards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Total Perangkat" value={devices.length} colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400" icon={<span className="font-bold text-xl">🖥️</span>} />
        <StatCard title="Perangkat Aktif" value={aktif} colorClass="text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400" icon={<span className="font-bold text-xl">✅</span>} />
        <StatCard title="Perangkat Rusak" value={rusak} colorClass="text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400" icon={<span className="font-bold text-xl">⚠️</span>} />
        <StatCard title="Tidak Aktif" value={tidakAktif} colorClass="text-gray-500 bg-gray-100 dark:bg-gray-700/50 dark:text-gray-400" icon={<span className="font-bold text-xl">⏸️</span>} />
      </div>

      {/* ─── Tabel / Peta ─── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <ViewSwitcher view={view} setView={setView} />
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* Filter Tipe */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Tipe</option>
              {(deviceTypes.length > 0 ? deviceTypes.map(dt => dt.name) : uniqueTypes).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {/* Filter Unit */}
            <select
              value={filterUnit}
              onChange={e => setFilterUnit(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Unit</option>
              {units.map(u => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Cari perangkat..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {view === 'list' ? (
          <>
            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-gray-400">Memuat data perangkat...</p>
              </div>
            )}

            {/* Error */}
            {!loading && fetchError && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-500 font-medium">{fetchError}</p>
                <button onClick={fetchDevices} className="text-sm text-blue-600 hover:underline">Coba lagi</button>
              </div>
            )}

            {/* Table */}
            {!loading && !fetchError && (
              <Table headers={["ID", "Hostname", "Pengguna", "Unit", "Tipe", "IP Address", "OS", "Status", "Aksi"]}>
                {filteredDevices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
                      {searchQuery || filterType || filterUnit ? 'Tidak ada perangkat yang cocok dengan filter.' : 'Belum ada perangkat terdaftar.'}
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100 font-mono text-xs">{item.id}</td>
                      <td className="py-4 px-6 font-medium text-gray-800 dark:text-gray-100">{item.hostname || '-'}</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                        {item.users.length > 0
                          ? item.users.map(u => u.name).join(', ')
                          : <span className="text-gray-300 dark:text-gray-600 italic">-</span>}
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{item.unit || '-'}</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{item.type || '-'}</td>
                      <td className="py-4 px-6 font-mono text-xs text-gray-600 dark:text-gray-400">{item.ip || '-'}</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{item.os || '-'}</td>
                      <td className="py-4 px-6"><StatusBadge status={item.status} /></td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-lg transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </Table>
            )}
          </>
        ) : (
          <div className="p-6 h-[500px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden">
            <div className="text-gray-400 dark:text-gray-500 font-medium text-xl opacity-50 text-center">
              <p className="mb-2">[ Denah Pemetaan Perangkat ]</p>
              <p className="text-sm font-normal">Klik pada denah untuk menambah perangkat baru.</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modal Tambah Perangkat ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Tambah Perangkat</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-medium text-sm">
              {addError && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {addError}
                </div>
              )}
              {renderFormFields(
                addForm,
                (field, val) => setAddForm(prev => ({ ...prev, [field]: val })),
                allUsers,
                deviceTypes,
                computerDevices,
                units
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
                Batal
              </button>
              <button
                onClick={handleAddSave}
                disabled={addSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium rounded-lg transition shadow-sm flex items-center gap-2"
              >
                {addSaving
                  ? <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Menyimpan...</>
                  : <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Simpan</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Edit Perangkat ─── */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Edit Perangkat</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">{selectedDevice.hostname} (ID: {selectedDevice.id})</p>
              </div>
              <button onClick={() => { setSelectedDevice(null); setEditForm({}); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-medium text-sm">
              {editError && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {editError}
                </div>
              )}
              {renderFormFields(editForm, handleEditChange, allUsers, deviceTypes, computerDevices, units)}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
              <button onClick={() => { setSelectedDevice(null); setEditForm({}); }} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium rounded-lg transition shadow-sm flex items-center gap-2"
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

      {/* ─── Modal Konfirmasi Hapus ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Hapus Perangkat</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Apakah kamu yakin ingin menghapus perangkat{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-100">"{deleteTarget.hostname}"</span>?
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white font-medium rounded-lg transition shadow-sm flex items-center gap-2"
              >
                {deleteLoading ? (
                  <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Menghapus...</>
                ) : (
                  <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Ya, Hapus</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
