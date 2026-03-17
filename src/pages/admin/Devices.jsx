import React, { useState } from 'react';
import StatCard from '../../components/ui/StatCard';
import ViewSwitcher from '../../components/feature-specific/ViewSwitcher';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';

export default function Devices() {
  const [view, setView] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [devices, setDevices] = useState([
    { id: "PC-POLI-PD-01", user: "Budi Santoso", unit: "Poli Penyakit Dalam", type: "PC Desktop", hostname: "PC-POLI-PD-01", ip: "192.168.10.45", mac: "AA:BB:CC:01:02:03", remote: "-", os: "Windows 10", serial: "SN-001", brand: "Lenovo", model: "ThinkCentre M720q", coordX: 120, coordY: 80, embedded: "No", status: "Aktif", loc: "Gedung A, Lt 2" },
    { id: "LAP-IT-001", user: "Eko Rahmad", unit: "IT RS", type: "Laptop", hostname: "LAP-IT-001", ip: "192.168.10.150", mac: "AA:BB:CC:04:05:06", remote: "10.0.0.5", os: "Windows 11", serial: "SN-002", brand: "HP", model: "EliteBook 840", coordX: 200, coordY: 150, embedded: "No", status: "Aktif", loc: "Gedung B, Lt 1" },
    { id: "PRN-IGD-01", user: "Siti Aminah", unit: "IGD", type: "Printer", hostname: "PRN-IGD-01", ip: "192.168.11.20", mac: "AA:BB:CC:07:08:09", remote: "-", os: "-", serial: "SN-003", brand: "Epson", model: "L3150", coordX: 300, coordY: 200, embedded: "Yes", status: "Rusak", loc: "Gedung A, Lt 1" },
  ]);

  const handleOpenEdit = (device) => {
    setSelectedDevice(device);
    setEditForm({ ...device });
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = () => {
    setDevices(prev => prev.map(d => d.id === editForm.id ? { ...editForm } : d));
    setSelectedDevice(null);
    setEditForm({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Kelola Perangkat</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm w-full sm:w-auto"
        >
          + Tambah Perangkat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Perangkat" value="150" colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400" icon={<span className="font-bold text-xl">150</span>} />
        <StatCard title="PC / Laptop" value="120" colorClass="text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-400" icon={<span className="font-bold text-xl">💻</span>} />
        <StatCard title="Printer / Scanner" value="30" colorClass="text-purple-600 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-400" icon={<span className="font-bold text-xl">🖨️</span>} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <ViewSwitcher view={view} setView={setView} />
          <div className="flex gap-2 w-full md:w-auto">
            <input type="text" placeholder="Cari perangkat..." className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hidden md:block">
              <option>Semua Kategori</option>
              <option>PC Desktop</option>
              <option>Laptop</option>
              <option>Printer</option>
            </select>
          </div>
        </div>

        {view === 'list' ? (
          <Table headers={["Device ID", "Pengguna", "Unit", "Jenis", "Hostname", "IP Address", "Status", "Lokasi", "Aksi"]}>
            {devices.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">{item.id}</td>
                <td className="py-4 px-6">{item.user}</td>
                <td className="py-4 px-6">{item.unit}</td>
                <td className="py-4 px-6">{item.type}</td>
                <td className="py-4 px-6">{item.hostname}</td>
                <td className="py-4 px-6">{item.ip}</td>
                <td className="py-4 px-6"><StatusBadge status={item.status} /></td>
                <td className="py-4 px-6">{item.loc}</td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="p-6 h-[500px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden">
             <div className="text-gray-400 dark:text-gray-500 font-medium text-xl opacity-50 text-center">
                <p className="mb-2">[ Denah Pemetaan Perangkat ]</p>
                <p className="text-sm font-normal">Klik pada denah untuk menambah perangkat baru.</p>
             </div>
          </div>
        )}
      </div>

      {/* Modal Tambah Perangkat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Tambah Perangkat</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 font-medium text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Hostname</label>
                  <input type="text" placeholder="Masukkan hostname..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                  <input type="text" placeholder="Masukkan brand..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Model</label>
                  <input type="text" placeholder="Masukkan model..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Serial Number</label>
                  <input type="text" placeholder="Masukkan serial number..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Kategori Device</label>
                  <select className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">-- Pilih Kategori --</option>
                    <option value="PC Desktop">PC Desktop</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Printer">Printer</option>
                    <option value="Scanner">Scanner</option>
                    <option value="Router / Switch">Router / Switch</option>
                    <option value="Server">Server</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
                  <input type="text" placeholder="Contoh: 192.168.1.10" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">MAC Address</label>
                  <input type="text" placeholder="Masukkan MAC Address..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Remote Address</label>
                  <input type="text" placeholder="Remote address (opsional)..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">OS</label>
                  <input type="text" placeholder="Contoh: Windows 10, Linux..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                  <input type="text" placeholder="Unit penempatan..." className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Koordinat X</label>
                  <input type="number" placeholder="Contoh: 120" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Koordinat Y</label>
                  <input type="number" placeholder="Contoh: 350" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Aktif">Aktif</option>
                    <option value="Rusak">Rusak</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Embedded</label>
                  <select className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="No">Tidak</option>
                    <option value="Yes">Ya</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Batal
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Edit Perangkat */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Edit Perangkat</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedDevice.id}</p>
              </div>
              <button
                onClick={() => { setSelectedDevice(null); setEditForm({}); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-medium text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Hostname</label>
                  <input type="text" value={editForm.hostname || ''} onChange={e => handleEditChange('hostname', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                  <input type="text" value={editForm.brand || ''} onChange={e => handleEditChange('brand', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Model</label>
                  <input type="text" value={editForm.model || ''} onChange={e => handleEditChange('model', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Serial Number</label>
                  <input type="text" value={editForm.serial || ''} onChange={e => handleEditChange('serial', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Kategori Device</label>
                  <select value={editForm.type || ''} onChange={e => handleEditChange('type', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="PC Desktop">PC Desktop</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Printer">Printer</option>
                    <option value="Scanner">Scanner</option>
                    <option value="Router / Switch">Router / Switch</option>
                    <option value="Server">Server</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
                  <input type="text" value={editForm.ip || ''} onChange={e => handleEditChange('ip', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">MAC Address</label>
                  <input type="text" value={editForm.mac || ''} onChange={e => handleEditChange('mac', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Remote Address</label>
                  <input type="text" value={editForm.remote || ''} onChange={e => handleEditChange('remote', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">OS</label>
                  <input type="text" value={editForm.os || ''} onChange={e => handleEditChange('os', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                  <input type="text" value={editForm.unit || ''} onChange={e => handleEditChange('unit', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Koordinat X</label>
                  <input type="number" value={editForm.coordX || ''} onChange={e => handleEditChange('coordX', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Koordinat Y</label>
                  <input type="number" value={editForm.coordY || ''} onChange={e => handleEditChange('coordY', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={editForm.status || ''} onChange={e => handleEditChange('status', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Aktif">Aktif</option>
                    <option value="Rusak">Rusak</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Embedded</label>
                  <select value={editForm.embedded || 'No'} onChange={e => handleEditChange('embedded', e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="No">Tidak</option>
                    <option value="Yes">Ya</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => { setSelectedDevice(null); setEditForm({}); }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
