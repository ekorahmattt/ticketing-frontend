import React, { useState, useMemo } from 'react';
import StatCard from '../../components/ui/StatCard';
import ViewSwitcher from '../../components/feature-specific/ViewSwitcher';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const MOCK_EMPLOYEES = [
  "Budi Santoso",
  "Siti Aminah",
  "Andi Wijaya",
  "Rina Kusuma",
  "Eko Rahmad",
  "Dr. Tirta",
  "Dewi Lestari",
];

export default function Devices() {
  const [view, setView] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editForm, setEditForm] = useState({});

  // --- State untuk dropdown Nama Pengguna di modal Tambah (multi-select) ---
  const [addForm, setAddForm] = useState({ users: [], user: '' });
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const filteredUsers = useMemo(() =>
    MOCK_EMPLOYEES.filter(name =>
      name.toLowerCase().includes(userSearchQuery.toLowerCase())
    ),
    [userSearchQuery]);

  // addForm.users adalah array; toggle pilih/hapus
  const handleToggleAddUser = (name) => {
    const current = Array.isArray(addForm.users) ? addForm.users : [];
    const updated = current.includes(name)
      ? current.filter(u => u !== name)
      : [...current, name];
    setAddForm(prev => ({ ...prev, users: updated, user: updated.join(', ') }));
  };

  const handleRemoveAddUser = (name) => {
    const current = Array.isArray(addForm.users) ? addForm.users : [];
    const updated = current.filter(u => u !== name);
    setAddForm(prev => ({ ...prev, users: updated, user: updated.join(', ') }));
  };

  // --- State untuk dropdown Nama Pengguna di modal Edit (multi-select) ---
  const [isEditUserDropdownOpen, setIsEditUserDropdownOpen] = useState(false);
  const [editUserSearchQuery, setEditUserSearchQuery] = useState('');

  const filteredEditUsers = useMemo(() =>
    MOCK_EMPLOYEES.filter(name =>
      name.toLowerCase().includes(editUserSearchQuery.toLowerCase())
    ),
    [editUserSearchQuery]);

  // editForm.users adalah array; toggle pilih/hapus
  const handleToggleEditUser = (name) => {
    const current = Array.isArray(editForm.users) ? editForm.users : (editForm.user ? [editForm.user] : []);
    const updated = current.includes(name)
      ? current.filter(u => u !== name)
      : [...current, name];
    setEditForm(prev => ({ ...prev, users: updated, user: updated.join(', ') }));
  };

  const handleRemoveEditUser = (name) => {
    const current = Array.isArray(editForm.users) ? editForm.users : [];
    const updated = current.filter(u => u !== name);
    setEditForm(prev => ({ ...prev, users: updated, user: updated.join(', ') }));
  };

  const [devices, setDevices] = useState([
    { id: "PC-POLI-PD-01", users: ["Budi Santoso"], user: "Budi Santoso", unit: "Poli Penyakit Dalam", type: "PC Desktop", hostname: "PC-POLI-PD-01", ip: "192.168.10.45", mac: "AA:BB:CC:01:02:03", remote: "-", os: "Windows 10", serial: "SN-001", brand: "Lenovo", model: "ThinkCentre M720q", coordX: 120, coordY: 80, embedded: "No", status: "Aktif", loc: "Gedung A, Lt 2" },
    { id: "LAP-IT-001", users: ["Eko Rahmad"], user: "Eko Rahmad", unit: "IT RS", type: "Laptop", hostname: "LAP-IT-001", ip: "192.168.10.150", mac: "AA:BB:CC:04:05:06", remote: "10.0.0.5", os: "Windows 11", serial: "SN-002", brand: "HP", model: "EliteBook 840", coordX: 200, coordY: 150, embedded: "No", status: "Aktif", loc: "Gedung B, Lt 1" },
    { id: "PRN-IGD-01", users: ["Siti Aminah"], user: "Siti Aminah", unit: "IGD", type: "Printer", hostname: "PRN-IGD-01", ip: "192.168.11.20", mac: "AA:BB:CC:07:08:09", remote: "-", os: "-", serial: "SN-003", brand: "Epson", model: "L3150", coordX: 300, coordY: 200, embedded: "Yes", status: "Rusak", loc: "Gedung A, Lt 1" },
  ]);

  const handleOpenEdit = (device) => {
    setSelectedDevice(device);
    // Normalkan users menjadi array saat membuka edit
    const users = Array.isArray(device.users)
      ? device.users
      : device.user
        ? device.user.split(', ').map(s => s.trim()).filter(Boolean)
        : [];
    setEditForm({ ...device, users });
    setEditUserSearchQuery('');
    setIsEditUserDropdownOpen(false);
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

      {/* ─── Grafik Statistik ─── */}
      {(() => {
        const aktif = devices.filter(d => d.status === 'Aktif').length;
        const rusak = devices.filter(d => d.status === 'Rusak').length;
        const tidakAktif = devices.filter(d => d.status === 'Tidak Aktif').length;

        const statusData = [
          { name: 'Aktif', value: aktif, color: '#22c55e' },
          { name: 'Rusak', value: rusak, color: '#ef4444' },
          { name: 'Tidak Aktif', value: tidakAktif, color: '#94a3b8' },
        ].filter(d => d.value > 0);

        // Hitung jumlah per tipe
        const typeCounts = devices.reduce((acc, d) => {
          acc[d.type] = (acc[d.type] || 0) + 1;
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

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut - Status Perangkat */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Distribusi Status Perangkat</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Aktif, Rusak, dan Tidak Aktif</p>
              {statusData.length > 0 ? (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        labelLine={false}
                        label={renderCustomLabel}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                        formatter={(value, name) => [`${value} unit`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend manual */}
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
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Jumlah Perangkat per Kategori</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Berdasarkan tipe perangkat terdaftar</p>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                      formatter={(value) => [`${value} unit`, 'Jumlah']}
                      cursor={{ fill: 'rgba(99,102,241,0.07)' }}
                    />
                    <Bar dataKey="total" fill="#6366f1" radius={[0, 5, 5, 0]} barSize={20}>
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 7]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-52 flex items-center justify-center text-sm text-gray-400">Belum ada data</div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ─── StatCards dinamis dari data devices ─── */}
      {(() => {
        const aktif = devices.filter(d => d.status === 'Aktif').length;
        const rusak = devices.filter(d => d.status === 'Rusak').length;
        const tidakAktif = devices.filter(d => d.status === 'Tidak Aktif').length;
        const total = devices.length;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard title="Total Perangkat" value={total} colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400" icon={<span className="font-bold text-xl">🖥️</span>} />
            <StatCard title="Perangkat Aktif" value={aktif} colorClass="text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400" icon={<span className="font-bold text-xl">✅</span>} />
            <StatCard title="Perangkat Rusak" value={rusak} colorClass="text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400" icon={<span className="font-bold text-xl">⚠️</span>} />
            <StatCard title="Tidak Aktif" value={tidakAktif} colorClass="text-gray-500 bg-gray-100 dark:bg-gray-700/50 dark:text-gray-400" icon={<span className="font-bold text-xl">⏸️</span>} />
          </div>
        );
      })()}



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
                <td className="py-4 px-6">
                  {Array.isArray(item.users) && item.users.length > 0
                    ? item.users.join(', ')
                    : item.user || '-'}
                </td>
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
              {/* Field Nama Pengguna dengan multi-select searchable dropdown */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Nama Pengguna <span className="text-xs font-normal text-gray-400">(bisa pilih lebih dari satu)</span></label>
                <div className="relative">
                  {/* Trigger button */}
                  <div
                    className="w-full min-h-[42px] border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1.5 cursor-pointer flex flex-wrap gap-1.5 items-center"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    {Array.isArray(addForm.users) && addForm.users.length > 0 ? (
                      <>
                        {addForm.users.map((name, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full"
                          >
                            {name}
                            <button
                              type="button"
                              className="ml-0.5 text-blue-400 hover:text-blue-700 dark:hover:text-blue-100 transition leading-none"
                              onClick={(e) => { e.stopPropagation(); handleRemoveAddUser(name); }}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                        <span className="ml-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400 dark:text-gray-500 text-sm">-- Pilih Nama Pengguna --</span>
                        <span className="ml-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Dropdown panel */}
                  {isUserDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
                      {/* Search */}
                      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                        <input
                          type="text"
                          placeholder="Cari nama pegawai..."
                          className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          autoFocus
                        />
                      </div>
                      {/* List dengan checkbox */}
                      <div className="max-h-48 overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((name, idx) => {
                            const isSelected = Array.isArray(addForm.users) && addForm.users.includes(name);
                            return (
                              <div
                                key={idx}
                                className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition ${isSelected
                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                  }`}
                                onClick={() => handleToggleAddUser(name)}
                              >
                                {/* Checkbox custom */}
                                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition ${isSelected
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                  }`}>
                                  {isSelected && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </span>
                                <p className={`text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                                  }`}>{name}</p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-sm text-gray-500 text-center">Nama tidak ditemukan</div>
                        )}
                      </div>
                      {/* Footer: jumlah terpilih + tombol selesai */}
                      <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Array.isArray(addForm.users) && addForm.users.length > 0
                            ? `${addForm.users.length} pengguna dipilih`
                            : 'Belum ada yang dipilih'}
                        </span>
                        <button
                          type="button"
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition"
                          onClick={() => { setIsUserDropdownOpen(false); setUserSearchQuery(''); }}
                        >
                          Selesai
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
              {/* Field Nama Pengguna dengan multi-select searchable dropdown */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Nama Pengguna <span className="text-xs font-normal text-gray-400">(bisa pilih lebih dari satu)</span></label>
                <div className="relative">
                  {/* Trigger button */}
                  <div
                    className="w-full min-h-[42px] border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1.5 cursor-pointer flex flex-wrap gap-1.5 items-center"
                    onClick={() => setIsEditUserDropdownOpen(!isEditUserDropdownOpen)}
                  >
                    {Array.isArray(editForm.users) && editForm.users.length > 0 ? (
                      <>
                        {editForm.users.map((name, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full"
                          >
                            {name}
                            <button
                              type="button"
                              className="ml-0.5 text-blue-400 hover:text-blue-700 dark:hover:text-blue-100 transition leading-none"
                              onClick={(e) => { e.stopPropagation(); handleRemoveEditUser(name); }}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                        <span className="ml-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isEditUserDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400 dark:text-gray-500 text-sm">-- Pilih Nama Pengguna --</span>
                        <span className="ml-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isEditUserDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Dropdown panel */}
                  {isEditUserDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
                      {/* Search */}
                      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                        <input
                          type="text"
                          placeholder="Cari nama pegawai..."
                          className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                          value={editUserSearchQuery}
                          onChange={(e) => setEditUserSearchQuery(e.target.value)}
                          autoFocus
                        />
                      </div>
                      {/* List dengan checkbox */}
                      <div className="max-h-48 overflow-y-auto">
                        {filteredEditUsers.length > 0 ? (
                          filteredEditUsers.map((name, idx) => {
                            const isSelected = Array.isArray(editForm.users) && editForm.users.includes(name);
                            return (
                              <div
                                key={idx}
                                className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition ${isSelected
                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                  }`}
                                onClick={() => handleToggleEditUser(name)}
                              >
                                {/* Checkbox custom */}
                                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition ${isSelected
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                  }`}>
                                  {isSelected && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </span>
                                <p className={`text-sm font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                                  }`}>{name}</p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-sm text-gray-500 text-center">Nama tidak ditemukan</div>
                        )}
                      </div>
                      {/* Footer: jumlah terpilih + tombol selesai */}
                      <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Array.isArray(editForm.users) && editForm.users.length > 0
                            ? `${editForm.users.length} pengguna dipilih`
                            : 'Belum ada yang dipilih'}
                        </span>
                        <button
                          type="button"
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition"
                          onClick={() => { setIsEditUserDropdownOpen(false); setEditUserSearchQuery(''); }}
                        >
                          Selesai
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

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
