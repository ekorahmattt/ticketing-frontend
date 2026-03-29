import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import ViewSwitcher from '../../components/feature-specific/ViewSwitcher';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { API_BASE, apiHeaders, SOCKET_URL } from '../../utils/api';
import { io } from 'socket.io-client';
import newTicketSound from '../../sounds/new ticket.mp3';

export default function Monitoring() {
  const [view, setView] = useState('list');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // === Modal Tambah Laporan States ===
  const [reportUser, setReportUser] = useState({ name: "", unit: "" });
  const [rawEmployees, setRawEmployees] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isNameDropdownOpen, setIsNameDropdownOpen] = useState(false);
  const [nameSearchQuery, setNameSearchQuery] = useState("");

  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [unitSearchQuery, setUnitSearchQuery] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [isSubCategoryDropdownOpen, setIsSubCategoryDropdownOpen] = useState(false);
  const [subCategorySearchQuery, setSubCategorySearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data Table Filter States
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterUnit, setFilterUnit] = useState('Semua Unit');
  const [searchTableQuery, setSearchTableQuery] = useState('');

  const filteredNames = useMemo(() => {
    const uniqueNames = Array.from(new Set(rawEmployees.map(emp => emp.full_name || emp.name).filter(Boolean)));
    return uniqueNames.filter(name => name.toLowerCase().includes(nameSearchQuery.toLowerCase()));
  }, [nameSearchQuery, rawEmployees]);

  const filteredUnits = useMemo(() => {
    const uniqueUnits = Array.from(new Set(rawEmployees.map(emp => emp.unit_name).filter(Boolean)));
    return uniqueUnits.filter(unit => unit.toLowerCase().includes(unitSearchQuery.toLowerCase()));
  }, [unitSearchQuery, rawEmployees]);

  const subcategories = useMemo(() => {
    const cat = categories.find(c => c.category_name === selectedCategory);
    return cat ? cat.subcategories : [];
  }, [selectedCategory, categories]);

  const filteredSubCategories = useMemo(() => {
    return subcategories.filter(s => s.name.toLowerCase().includes(subCategorySearchQuery.toLowerCase()));
  }, [subcategories, subCategorySearchQuery]);

  const handleSelectName = (name) => {
    setReportUser({ ...reportUser, name });
    setIsNameDropdownOpen(false);
    setNameSearchQuery("");
  };

  const handleSelectUnit = (unit) => {
    setReportUser({ ...reportUser, unit });
    setIsUnitDropdownOpen(false);
    setUnitSearchQuery("");
  };

  const handleSelectSubCategory = (subCatName) => {
    setSelectedSubCategory(subCatName);
    setIsSubCategoryDropdownOpen(false);
    setSubCategorySearchQuery("");
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("");
    setIsSubCategoryDropdownOpen(false);
    setSubCategorySearchQuery("");
  };

  const handleSimpanManual = async () => {
    if (!selectedCategory || !selectedSubCategory) {
      alert("Kategori dan Jenis Gangguan harus dipilih!");
      return;
    }
    setIsSubmitting(true);
    try {
      const catObj = categories.find(c => c.category_name === selectedCategory);
      const subCatObj = subcategories.find(s => s.name === selectedSubCategory);

      const now = new Date();
      const clientCreatedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const payload = {
        reporter_name: reportUser.name || '',
        reporter_unit: reportUser.unit || '',
        category_id: catObj ? catObj.category_id : null,
        subcategory_id: subCatObj ? subCatObj.id : null,
        title: `${selectedCategory} - ${selectedSubCategory}`,
        description: 'Laporan Manual dari Admin',
        created_at: clientCreatedAt
      };

      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: 'POST',
        headers: apiHeaders(user),
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      
      if (res.ok && json.status === 'success') {
        alert("Berhasil menambahkan laporan!");
        setIsModalOpen(false);
        setReportUser({ name: '', unit: '' });
        setSelectedCategory('');
        setSelectedSubCategory('');
        fetchTickets();
      } else {
        alert(json.message || 'Gagal menyimpan laporan');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchTickets = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/tickets`, {
        headers: apiHeaders(user)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTickets(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(true);

    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('ticketUpdated', (payload) => {
      console.log('WebSocket trigger received:', payload);
      if (payload?.event === 'ticket_created') {
        try {
          const audio = new Audio(newTicketSound);
          audio.play().catch(e => console.error("Audio block play failed:", e));
        } catch (err) {}
      }
      fetchTickets(false);
    });

    // Fetch Device Users
    fetch(`${API_BASE}/api/device-users`, { headers: apiHeaders(user) })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setRawEmployees(data.data || []);
        }
      }).catch(console.error);

    // Fetch Categories & Subcategories
    Promise.all([
      fetch(`${API_BASE}/api/categories`, { headers: apiHeaders(user) }).then(r => r.json()),
      fetch(`${API_BASE}/api/subcategories`, { headers: apiHeaders(user) }).then(r => r.json())
    ]).then(([catRes, subRes]) => {
      if (catRes.status === 'success' && subRes.status === 'success') {
        const cats = catRes.data || [];
        const subs = subRes.data || [];
        const mappedCats = cats.map(c => ({
          category_id: c.id,
          category_name: c.name,
          subcategories: subs.filter(s => s.category_id === c.id)
        }));
        setCategories(mappedCats);
      }
    }).catch(console.error);

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Statistik & Filter Hari Ini
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const ticketsToday = tickets.filter(t => t.created_at && t.created_at.startsWith(todayStr));
  
  const totalHariIni = ticketsToday.length;
  const laporanBaru = ticketsToday.filter(t => t.status === 'baru' || t.status === 'open').length;
  const diproses = ticketsToday.filter(t => t.status === 'proses' || t.status === 'process').length;
  const selesai = ticketsToday.filter(t => t.status === 'selesai' || t.status === 'done').length;

  const getFormatTime = (datetimeStr) => {
    if (!datetimeStr) return '-';
    return datetimeStr.split(' ')[1]?.substring(0, 5) || '-';
  };

  const displayTickets = ticketsToday.filter(t => {
    // Status Filter
    let matchStatus = true;
    if (filterStatus === 'Open') matchStatus = t.status === 'baru' || t.status === 'open';
    else if (filterStatus === 'Diproses') matchStatus = t.status === 'proses' || t.status === 'process';
    else if (filterStatus === 'Selesai') matchStatus = t.status === 'selesai' || t.status === 'done';
    
    // Unit Filter
    let matchUnit = true;
    if (filterUnit !== 'Semua Unit') {
      matchUnit = t.reporter_unit?.toLowerCase() === filterUnit.toLowerCase();
    }

    // Search Query
    let matchSearch = true;
    if (searchTableQuery) {
      const q = searchTableQuery.toLowerCase();
      matchSearch = 
        (t.reporter_name && t.reporter_name.toLowerCase().includes(q)) ||
        (t.id && String(t.id).includes(q));
    }

    return matchStatus && matchUnit && matchSearch;
  }).sort((a, b) => {
    // Urutan prioritas status
    const getStatusRank = (status) => {
      const s = status?.toLowerCase();
      if (s === 'baru' || s === 'open') return 1;
      if (s === 'proses' || s === 'process' || s === 'diproses') return 2;
      if (s === 'selesai' || s === 'done') return 3;
      return 4;
    };

    const rankA = getStatusRank(a.status);
    const rankB = getStatusRank(b.status);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // Jika status sama, urutkan berdasarkan waktu (terbaru di atas)
    const timeA = a.created_at || "";
    const timeB = b.created_at || "";
    return timeB.localeCompare(timeA);
  });

  const availableUnits = ['Semua Unit', ...new Set(ticketsToday.map(t => t.reporter_unit).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Command Center - Hari Ini</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Hari Ini" value={totalHariIni.toString()} colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400" icon={<span className="font-bold text-xl">{totalHariIni}</span>} />
        <StatCard title="Laporan Baru" value={laporanBaru.toString()} colorClass="text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400" icon={<span className="font-bold text-xl">{laporanBaru}</span>} />
        <StatCard title="Diproses" value={diproses.toString()} colorClass="text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400" icon={<span className="font-bold text-xl">{diproses}</span>} />
        <StatCard title="Selesai" value={selesai.toString()} colorClass="text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400" icon={<span className="font-bold text-xl">{selesai}</span>} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">Daftar Laporan Masuk</h2>
            <ViewSwitcher view={view} setView={setView} />
          </div>
          <div className="flex flex-wrap gap-2 w-full xl:w-auto">
            {/* Filter Status */}
            <select 
              className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option>Semua Status</option>
              <option>Open</option>
              <option>Diproses</option>
              <option>Selesai</option>
            </select>

            {/* Filter Unit */}
            <select 
              className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
            >
              {availableUnits.map((unit, idx) => (
                <option key={idx} value={unit}>{unit}</option>
              ))}
            </select>

            {/* Search Bar */}
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari pelapor / ID..."
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Tambah Laporan Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Laporan
            </button>
          </div>
        </div>

        {view === 'list' ? (
          isLoading ? (
            <div className="p-6 text-center text-gray-500">Memuat data...</div>
          ) : ticketsToday.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Belum ada laporan hari ini.</div>
          ) : displayTickets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Tidak ada laporan yang sesuai filter.</div>
          ) : (
            <Table headers={["ID Laporan", "Waktu", "Pelapor", "Unit / Lokasi", "Jenis Gangguan", "Status", "Teknisi"]} >
              {displayTickets.map((item, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => navigate(`/admin/ticket/${item.id}`)}
                >
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">TCK-{item.id}</td>
                  <td className="py-4 px-6">{getFormatTime(item.created_at)}</td>
                  <td className="py-4 px-6 font-medium text-gray-800 dark:text-gray-200">{item.reporter_name || '-'}</td>
                  <td className="py-4 px-6">{item.reporter_unit || '-'}</td>
                  <td className="py-4 px-6">{item.subcategory || item.category || '-'}</td>
                  <td className="py-4 px-6"><StatusBadge status={item.status} /></td>
                  <td className="py-4 px-6">{item.teknisi || '-'}</td>
                </tr>
              ))}
            </Table>
          )
        ) : (
          <div className="p-6 h-[500px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 relative">
            <div className="absolute top-1/4 left-1/4 group cursor-pointer">
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse relative z-10 shadow-lg"></div>
              <div className="hidden group-hover:block absolute top-6 left-0 bg-white dark:bg-gray-700 p-3 rounded-lg shadow-xl text-xs w-48 z-20 border border-gray-100 dark:border-gray-600">
                <p className="font-bold mb-1 text-gray-800 dark:text-gray-100">Poli Gigi</p>
                <p className="text-gray-500 dark:text-gray-300">Printer Macet</p>
                <p className="text-red-500 font-semibold mt-1">Open</p>
              </div>
            </div>

            <div className="absolute top-1/2 left-2/3 group cursor-pointer">
              <div className="w-4 h-4 rounded-full bg-yellow-400 relative z-10 shadow-lg"></div>
              <div className="hidden group-hover:block absolute top-6 -left-20 bg-white dark:bg-gray-700 p-3 rounded-lg shadow-xl text-xs w-48 z-20 border border-gray-100 dark:border-gray-600">
                <p className="font-bold mb-1 text-gray-800 dark:text-gray-100">Rekam Medis</p>
                <p className="text-gray-500 dark:text-gray-300">Internet Mati</p>
                <p className="text-yellow-600 font-semibold mt-1">Diproses</p>
              </div>
            </div>

            <div className="text-gray-400 dark:text-gray-500 font-medium text-xl opacity-50">
              [ Peta Denah interaktif akan dirender di sini ]
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah Laporan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-visible flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Tambah Laporan Manual</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-visible space-y-5">
              
              {/* Nama Pelapor Dropdown */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Pelapor</label>
                <div
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer flex justify-between items-center"
                  onClick={() => setIsNameDropdownOpen(!isNameDropdownOpen)}
                >
                  <span className={reportUser.name ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}>
                    {reportUser.name || "Pilih / Cari Nama Pelapor..."}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isNameDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                {isNameDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                      <input
                        type="text"
                        placeholder="Cari nama pegawai..."
                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                        value={nameSearchQuery}
                        onChange={(e) => setNameSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filteredNames.length > 0) handleSelectName(filteredNames[0]);
                          }
                        }}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar">
                      {filteredNames.length > 0 ? (
                        filteredNames.map((name, idx) => (
                          <div
                            key={idx}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-0"
                            onClick={() => handleSelectName(name)}
                          >
                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{name}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-gray-500 text-center">Nama tidak ditemukan</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Nama Unit Dropdown */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Unit</label>
                <div
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer flex justify-between items-center"
                  onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                >
                  <span className={reportUser.unit ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}>
                    {reportUser.unit || "Pilih / Cari Unit..."}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isUnitDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                {isUnitDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                      <input
                        type="text"
                        placeholder="Cari unit..."
                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                        value={unitSearchQuery}
                        onChange={(e) => setUnitSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filteredUnits.length > 0) handleSelectUnit(filteredUnits[0]);
                          }
                        }}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar">
                      {filteredUnits.length > 0 ? (
                        filteredUnits.map((unit, idx) => (
                          <div
                            key={idx}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-0"
                            onClick={() => handleSelectUnit(unit)}
                          >
                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{unit}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-gray-500 text-center">Unit tidak ditemukan</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Kategori Gangguan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Kategori Gangguan</label>
                <select 
                   className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                   value={selectedCategory}
                   onChange={handleCategoryChange}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((c, idx) => (
                    <option key={idx} value={c.category_name}>{c.category_name}</option>
                  ))}
                </select>
              </div>

              {/* Jenis Gangguan Dropdown */}
              {subcategories.length > 0 && (
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Jenis Gangguan</label>
                  <div
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer flex justify-between items-center"
                    onClick={() => setIsSubCategoryDropdownOpen(!isSubCategoryDropdownOpen)}
                  >
                    <span className={selectedSubCategory ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}>
                      {selectedSubCategory || "-- Pilih Jenis Gangguan --"}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isSubCategoryDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {isSubCategoryDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
                      <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                        <input
                          type="text"
                          placeholder="Cari jenis gangguan..."
                          className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                          value={subCategorySearchQuery}
                          onChange={(e) => setSubCategorySearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (filteredSubCategories.length > 0) handleSelectSubCategory(filteredSubCategories[0].name);
                            }
                          }}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto custom-scrollbar">
                        {filteredSubCategories.length > 0 ? (
                          filteredSubCategories.map((s, idx) => (
                            <div
                              key={idx}
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-0"
                              onClick={() => handleSelectSubCategory(s.name)}
                            >
                              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{s.name}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-500 text-center">Jenis gangguan tidak ditemukan</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleSimpanManual}
                disabled={isSubmitting}
                className={isSubmitting ? "px-6 py-2 bg-blue-300 text-white font-medium rounded-lg shadow-sm cursor-not-allowed" : "px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm"}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
