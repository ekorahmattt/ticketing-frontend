import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE, apiHeaders } from '../../utils/api';
import StatusBadge from '../../components/ui/StatusBadge';

// ─── Helers API ────────────────────────────────────────────────────────────────
function apiToUi(d) {
  return {
    id: d.id,
    hostname: d.device_name || '',
    brand: d.brand || '',
    model: d.model || '',
    serial: d.serial_number || '',
    type: d.device_type_name || d.device_type || '',
    ip: d.ip_address || '',
    mac: d.mac_address || '',
    remote: d.remote_address || '-',
    os: d.os || '',
    unit_id: d.unit_id || null,
    unit: d.unit_name || '',
    coordX: d.coord_x || '',
    coordY: d.coord_y || '',
    status: d.status || 'Aktif',
    keterangan: d.keterangan || '',
    users: Array.isArray(d.users) ? d.users : [],
    parentConnections: Array.isArray(d.parent_connections) ? d.parent_connections : [],
  };
}

function uiToApi(form) {
  const deviceId = form.id ? parseInt(form.id) : null;
  return {
    device_name: form.hostname,
    brand: form.brand,
    model: form.model,
    serial_number: form.serial,
    device_type: form.type,
    ip_address: form.ip,
    mac_address: form.mac,
    remote_address: form.remote,
    os: form.os,
    unit_id: form.unit_id ? parseInt(form.unit_id) : null,
    coord_x: form.coordX ? parseInt(form.coordX) : null,
    coord_y: form.coordY ? parseInt(form.coordY) : null,
    status: form.status,
    keterangan: form.keterangan,
    users: Array.isArray(form.selectedUsers) ? form.selectedUsers.map(u => u.id) : [],
    connections: Array.isArray(form.selectedConnections)
      ? form.selectedConnections.map(c => ({
          parent_device_id: c.device_id,
          child_device_id: deviceId,
        }))
      : [],
  };
}

// ─── Dropdowns Components ───────────────────────────────────────────────────────
function UnitDropdown({ units, selectedUnitId, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const filtered = useMemo(() => units.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || (u.code || '').toLowerCase().includes(query.toLowerCase())), [units, query]);
  return (
    <div className="relative">
      <div className="w-full min-h-[42px] border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5 cursor-pointer flex items-center justify-between gap-2" onClick={() => setOpen(!open)}>
        {selectedUnit ? (
          <span className="text-gray-800 dark:text-gray-200 text-sm">{selectedUnit.name} {selectedUnit.code && <span className="ml-1.5 text-xs text-gray-400">({selectedUnit.code})</span>}</span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 text-sm">-- Pilih Unit --</span>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </div>
      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800"><input type="text" placeholder="Cari nama unit..." className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none" value={query} onChange={e => setQuery(e.target.value)} autoFocus /></div>
          <div className="max-h-40 overflow-y-auto">
            <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800" onClick={() => { onChange(null); setOpen(false); setQuery(''); }}><span className="text-sm text-gray-400">-- Tidak ada unit --</span></div>
            {filtered.map(u => (
              <div key={u.id} className={`flex items-center justify-between p-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 transition ${selectedUnitId === u.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => { onChange(u.id); setOpen(false); setQuery(''); }}>
                <span className={`text-sm font-medium ${selectedUnitId === u.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>{u.name}</span>
                {u.code && <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{u.code}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DeviceDropdown({ allDevices, selectedDevices, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => (allDevices || []).filter(d => ((d.hostname || d.device_name || '').toLowerCase().includes(query.toLowerCase()) || (d.unit || '').toLowerCase().includes(query.toLowerCase()))), [allDevices, query]);
  const toggle = (device) => selectedDevices.some(d => d.device_id === device.id) ? onChange(selectedDevices.filter(d => d.device_id !== device.id)) : onChange([...selectedDevices, { device_id: device.id, device_name: device.hostname || device.device_name || '' }]);
  const remove = (device) => onChange(selectedDevices.filter(d => d.device_id !== device.device_id));
  return (
    <div className="relative">
      <div className="w-full min-h-[42px] border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1.5 cursor-pointer flex flex-wrap gap-1.5 items-center" onClick={() => setOpen(!open)}>
        {selectedDevices.length > 0 ? (
          <>
            {selectedDevices.map(d => <span key={d.device_id} className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2 py-0.5 rounded-full">{d.device_name} <button type="button" className="ml-0.5 text-indigo-400 hover:text-indigo-700 transition" onClick={e => { e.stopPropagation(); remove(d); }}>✕</button></span>)}
            <span className="ml-auto"><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></span>
          </>
        ) : (
          <><span className="text-gray-400 dark:text-gray-500 text-sm">{placeholder || '-- Pilih Perangkat --'}</span><span className="ml-auto"><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></span></>
        )}
      </div>
      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800"><input type="text" placeholder="Cari nama perangkat atau unit..." className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none" value={query} onChange={e => setQuery(e.target.value)} autoFocus /></div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? filtered.map(d => {
              const isSelected = selectedDevices.some(s => s.device_id === d.id);
              return (
                <div key={d.id} className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 transition ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => toggle(d)}>
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>{isSelected && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}</span>
                  <div><p className={`text-sm font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'}`}>{d.hostname || d.device_name || '(tanpa nama)'}</p>{d.unit && <p className="text-xs text-gray-400">{d.unit}</p>}</div>
                </div>
              );
            }) : <div className="p-4 text-sm text-gray-500 text-center">Perangkat tidak ditemukan</div>}
          </div>
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center"><button type="button" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition" onClick={() => { setOpen(false); setQuery(''); }}>Selesai</button></div>
        </div>
      )}
    </div>
  );
}

function UserDropdown({ allUsers, selectedUsers, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => allUsers.filter(u => u.name.toLowerCase().includes(query.toLowerCase())), [allUsers, query]);
  const toggle = (user) => selectedUsers.some(u => u.id === user.id) ? onChange(selectedUsers.filter(u => u.id !== user.id)) : onChange([...selectedUsers, user]);
  const remove = (user) => onChange(selectedUsers.filter(u => u.id !== user.id));
  return (
    <div className="relative">
      <div className="w-full min-h-[42px] border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1.5 cursor-pointer flex flex-wrap gap-1.5 items-center" onClick={() => setOpen(!open)}>
        {selectedUsers.length > 0 ? (
          <>
            {selectedUsers.map(u => <span key={u.id} className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">{u.name} <button type="button" className="ml-0.5 text-blue-400 hover:text-blue-700 transition" onClick={e => { e.stopPropagation(); remove(u); }}>✕</button></span>)}
            <span className="ml-auto"><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></span>
          </>
        ) : (
          <><span className="text-gray-400 dark:text-gray-500 text-sm">-- Pilih Nama Pengguna --</span><span className="ml-auto"><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></span></>
        )}
      </div>
      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800"><input type="text" placeholder="Cari nama pegawai..." className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none" value={query} onChange={e => setQuery(e.target.value)} autoFocus /></div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? filtered.map(u => {
              const isSelected = selectedUsers.some(s => s.id === u.id);
              return (
                <div key={u.id} className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 transition ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={() => toggle(u)}>
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>{isSelected && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}</span>
                  <div><p className={`text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>{u.name}</p>{u.unit && <p className="text-xs text-gray-400">{u.unit}</p>}</div>
                </div>
              );
            }) : <div className="p-4 text-sm text-gray-500 text-center">Nama tidak ditemukan</div>}
          </div>
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center"><button type="button" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition" onClick={() => { setOpen(false); setQuery(''); }}>Selesai</button></div>
        </div>
      )}
    </div>
  );
}


export default function DeviceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [device, setDevice] = useState(null);
  const [form, setForm] = useState({});
  const [tickets, setTickets] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMSG, setErrorMSG] = useState('');
  
  // Data for dropdowns
  const [allUsers, setAllUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [computerDevices, setComputerDevices] = useState([]);

  useEffect(() => {
    fetchInitData();
    fetchTickets();
  }, [id, user]);

  const fetchInitData = async () => {
    setLoading(true);
    try {
      const [devRes, usersRes, typesRes, unitsRes, allDevRes] = await Promise.all([
        fetch(`${API_BASE}/api/devices/${id}`, { headers: apiHeaders(user) }),
        fetch(`${API_BASE}/api/device-users`, { headers: apiHeaders(user) }),
        fetch(`${API_BASE}/api/device-types`, { headers: apiHeaders(user) }),
        fetch(`${API_BASE}/api/units`, { headers: apiHeaders(user) }),
        fetch(`${API_BASE}/api/devices`, { headers: apiHeaders(user) }),
      ]);
      
      const devJson = await devRes.json();
      if (devRes.ok && devJson.status === 'success') {
        const d = devJson.data;
        const mapped = apiToUi(d);
        setDevice(mapped);
        setForm({ ...mapped, selectedUsers: mapped.users, selectedConnections: mapped.parentConnections });
      }

      if (usersRes.ok) { const j = await usersRes.json(); if (j.data) setAllUsers(j.data); }
      if (typesRes.ok) { const j = await typesRes.json(); if (j.data) setDeviceTypes(j.data); }
      if (unitsRes.ok) { const j = await unitsRes.json(); if (j.data) setUnits(j.data); }
      if (allDevRes.ok) { 
        const j = await allDevRes.json(); 
        if (j.data) setComputerDevices(j.data.filter(d => (d.device_type_name || d.device_type) === 'Computer' && d.id !== parseInt(id))); 
      }
    } catch (e) {
      console.error(e);
      setErrorMSG('Gagal memuat data perangkat.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tickets?device_id=${id}`, { headers: apiHeaders(user) });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        setTickets(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.hostname?.trim()) {
      alert('Nama perangkat (Hostname) wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      const payload = uiToApi(form);
      const res = await fetch(`${API_BASE}/api/devices/${id}`, {
        method: 'PUT',
        headers: apiHeaders(user),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.status === 'success') {
        alert('Berhasil memperbarui perangkat!');
        fetchInitData();
      } else {
        alert(json.message || 'Gagal memperbarui perangkat.');
      }
    } catch (e) {
      alert('Tidak dapat terhubung ke server.');
    } finally {
      setSaving(false);
    }
  };

  const onChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading || !device) {
    return <div className="p-6 text-center text-gray-500 text-sm">Memuat data perangkat...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
           </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Detail Perangkat {id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 tracking-tight">
        
        {/* Kolom Kiri - Info Dasar & Riwayat */}
        <div className="space-y-6 lg:col-span-1 border-r border-gray-100 dark:border-gray-800 pr-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Informasi</h2>
            <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Hostname Asli</label>
                  <input type="text" readOnly value={device.hostname || '-'} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-lg p-2 outline-none transition-shadow" />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Status Saat Ini</label>
                  <div className="pt-1"><StatusBadge status={device.status} /></div>
                </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Riwayat Laporan (Ticket)</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
               {tickets.length > 0 ? tickets.map(t => (
                 <div key={t.id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition" onClick={() => navigate(`/admin/ticket/${t.id}`)}>
                    <div className="flex justify-between items-center mb-1">
                       <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Ticket #{t.id}</p>
                       <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.created_at}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 truncate">{t.title}</p>
                 </div>
               )) : (
                 <p className="text-xs text-gray-500 italic">Belum ada riwayat laporan kerusakan untuk perangkat ini.</p>
               )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan - Form Edit Devices */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 lg:col-span-3 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Edit Data Perangkat</h2>
          
          <form className="space-y-4 text-sm flex-1" onSubmit={handleUpdate}>
            {errorMSG && <div className="text-red-500 p-3 bg-red-50 rounded text-sm mb-4">{errorMSG}</div>}
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Nama Pengguna (bisa pilih lebih dari satu)</label>
              <UserDropdown allUsers={allUsers} selectedUsers={form.selectedUsers || []} onChange={val => onChange('selectedUsers', val)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Hostname / Nama Perangkat <span className="text-red-500">*</span></label>
                <input type="text" value={form.hostname || ''} onChange={e => onChange('hostname', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                <input type="text" value={form.brand || ''} onChange={e => onChange('brand', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Model</label>
                <input type="text" value={form.model || ''} onChange={e => onChange('model', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Serial Number</label>
                <input type="text" value={form.serial || ''} onChange={e => onChange('serial', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Tipe Perangkat</label>
                <select value={form.type || ''} onChange={e => onChange('type', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Pilih Tipe Perangkat --</option>
                  {deviceTypes.length > 0 ? deviceTypes.map(dt => <option key={dt.id} value={dt.name}>{dt.name}</option>) : <><option value="Computer">Computer</option><option value="Printer">Printer</option><option value="Access Point">Access Point</option><option value="CCTV">CCTV</option></>}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
                <input type="text" value={form.ip || ''} onChange={e => onChange('ip', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">MAC Address</label>
                <input type="text" value={form.mac || ''} onChange={e => onChange('mac', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Remote Address</label>
                <input type="text" value={form.remote || ''} onChange={e => onChange('remote', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">OS</label>
                <input type="text" value={form.os || ''} onChange={e => onChange('os', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                <UnitDropdown units={units} selectedUnitId={form.unit_id || null} onChange={val => onChange('unit_id', val)} />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Koordinat X</label>
                <input type="number" value={form.coordX || ''} onChange={e => onChange('coordX', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Koordinat Y</label>
                <input type="number" value={form.coordY || ''} onChange={e => onChange('coordY', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select value={form.status || 'Aktif'} onChange={e => onChange('status', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Aktif">Aktif</option>
                  <option value="Rusak">Rusak</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>
              {form.status === 'Rusak' && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Keterangan Kerusakan</label>
                  <textarea value={form.keterangan || ''} onChange={e => onChange('keterangan', e.target.value)} placeholder="Masukkan penyebab dan kondisi kerusakan..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
                </div>
              )}
            </div>

            {computerDevices.length > 0 && (
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Komputer yang Terhubung <span className="text-xs font-normal text-gray-400 ml-1">(khusus printer/scanner sharing)</span></label>
                <DeviceDropdown allDevices={computerDevices} selectedDevices={form.selectedConnections || []} onChange={val => onChange('selectedConnections', val)} placeholder="-- Pilih komputer yang terhubung --" />
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
               <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-sm flex items-center gap-2">
                 {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
