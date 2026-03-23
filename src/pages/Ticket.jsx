import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE } from '../utils/api';

const DEFAULT_USER = {
  name: "",
  unit: "",
  hostname: "-",
  ip_address: "-",
  detection_mode: "Web/Public",
  device_brand: "",
  device_model: "",
  device_id: null
};

function formatDateTime(s) {
  if (!s) return "";
  const [datePart, timePart] = s.split(" ");
  if (!datePart || !timePart) return s;
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${d} ${months[m - 1]} ${y} - ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function statusClass(color) {
  if (color === "green") return "bg-green-100 text-green-600";
  if (color === "yellow") return "bg-yellow-100 text-yellow-700";
  if (color === "red") return "bg-red-100 text-red-600";
  return "bg-gray-100 text-gray-600";
}

function generateTicketCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `TCK-${y}${m}${d}-${hh}${mm}${ss}`;
}

export default function Ticket() {
  const [user, setUser] = useState(DEFAULT_USER);
  const [history, setHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rawEmployees, setRawEmployees] = useState([]);

  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isNameDropdownOpen, setIsNameDropdownOpen] = useState(false);
  const [nameSearchQuery, setNameSearchQuery] = useState("");

  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [unitSearchQuery, setUnitSearchQuery] = useState("");

  const filteredNames = useMemo(() => {
    const uniqueNames = Array.from(new Set(rawEmployees.map(emp => emp.full_name || emp.name).filter(Boolean)));
    return uniqueNames.filter(name =>
      name.toLowerCase().includes(nameSearchQuery.toLowerCase())
    );
  }, [nameSearchQuery, rawEmployees]);

  const filteredUnits = useMemo(() => {
    const uniqueUnits = Array.from(new Set(rawEmployees.map(emp => emp.unit_name).filter(Boolean)));
    return uniqueUnits.filter(unit =>
      unit.toLowerCase().includes(unitSearchQuery.toLowerCase())
    );
  }, [unitSearchQuery, rawEmployees]);

  const handleSelectName = (name) => {
    setUser({ ...user, name });
    setIsNameDropdownOpen(false);
    setNameSearchQuery("");
  };

  const handleSelectUnit = (unit) => {
    setUser({ ...user, unit });
    setIsUnitDropdownOpen(false);
    setUnitSearchQuery("");
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [isSubCategoryDropdownOpen, setIsSubCategoryDropdownOpen] = useState(false);
  const [subCategorySearchQuery, setSubCategorySearchQuery] = useState("");

  const handleSelectSubCategory = (subCatName) => {
    setSelectedSubCategory(subCatName);
    setIsSubCategoryDropdownOpen(false);
    setSubCategorySearchQuery("");
  };

  const [ticketStatus, setTicketStatus] = useState("form"); // "form" | "submitted"
  const [ticketData, setTicketData] = useState(null);

  // --- State untuk modal Update Ticket ---
  const navigate = useNavigate();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [adminLoginForm, setAdminLoginForm] = useState({ username: '', password: '' });
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (!adminLoginForm.username.trim() || !adminLoginForm.password.trim()) {
      setAdminLoginError('Username dan password wajib diisi.');
      return;
    }
    setAdminLoginLoading(true);
    setTimeout(() => {
      if (
        adminLoginForm.username === ADMIN_CREDENTIALS.username &&
        adminLoginForm.password === ADMIN_CREDENTIALS.password
      ) {
        setAdminLoginLoading(false);
        setIsAdminLoginModalOpen(false);
        navigate(`/admin/ticket/${ticketData?.code || 'TCK-001'}`);
      } else {
        setAdminLoginError('Username atau password salah.');
        setAdminLoginLoading(false);
      }
    }, 800);
  };

  useEffect(() => {
    // === 1. Detect Device ===
    fetch(`${API_BASE}/api/tickets/detect-device`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.device_detected) {
          const dev = data.data;
          setUser(prev => ({
            ...prev,
            device_id: dev.device_id,
            hostname: dev.hostname || dev.device_name || '-',
            ip_address: dev.ip_address || '-',
            unit: dev.unit || '-',
            detection_mode: 'LAN'
          }));
        }
      }).catch(console.error);

    // === 2. Fetch Device Users ===
    fetch(`${API_BASE}/api/device-users`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setRawEmployees(data.data || []);
        }
      }).catch(console.error);

    // === 3. Fetch Categories & Subcategories ===
    Promise.all([
      fetch(`${API_BASE}/api/categories`).then(r => r.json()),
      fetch(`${API_BASE}/api/subcategories`).then(r => r.json())
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
    
    // === 4. Fetch Ticket History (Opsional) ===
    fetch(`${API_BASE}/api/tickets`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setHistory((data.data || []).slice(0, 5)); // Ambil 5 terakhir
        }
      }).catch(console.error);
  }, []);

  // Derivations
  const subcategories = useMemo(() => {
    const cat = categories.find(c => c.category_name === selectedCategory);
    return cat ? cat.subcategories : [];
  }, [selectedCategory, categories]);

  const filteredSubCategories = useMemo(() => {
    return subcategories.filter(s =>
      s.name.toLowerCase().includes(subCategorySearchQuery.toLowerCase())
    );
  }, [subcategories, subCategorySearchQuery]);

  const slaInfo = useMemo(() => {
    if (selectedSubCategory) {
      const sub = subcategories.find(s => s.name === selectedSubCategory);
      return sub && typeof sub.sla_minutes === 'number' ? `Estimasi respon: ${sub.sla_minutes} menit.` : "Estimasi respon: -";
    } else if (subcategories.length > 0) {
      const minutes = subcategories.map(s => s.sla_minutes).filter(x => typeof x === "number");
      if (minutes.length) {
        const min = Math.min(...minutes);
        const max = Math.max(...minutes);
        return `Estimasi respon: ${min} - ${max} menit.`;
      }
    }
    return "Estimasi respon: -";
  }, [selectedSubCategory, subcategories]);

  const slaTextValue = useMemo(() => {
    if (selectedSubCategory) {
      const sub = subcategories.find(s => s.name === selectedSubCategory);
      return sub && typeof sub.sla_minutes === 'number' ? `${sub.sla_minutes} menit` : "-";
    }
    if (subcategories.length > 0) {
      const minutes = subcategories.map(s => s.sla_minutes).filter(x => typeof x === "number");
      if (minutes.length) {
        const min = Math.min(...minutes);
        const max = Math.max(...minutes);
        return `${min} - ${max} menit`;
      }
    }
    return "-";
  }, [selectedSubCategory, subcategories]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("");
    setIsSubCategoryDropdownOpen(false);
    setSubCategorySearchQuery("");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (user.device_id) formData.append('device_id', user.device_id);
      formData.append('reporter_name', user.name || '');
      formData.append('reporter_unit', user.unit || '');
      formData.append('reporter_contact', ''); // bisa ditambahkan input utk HP
      formData.append('report_device_brand', user.device_brand || '');
      formData.append('report_device_model', user.device_model || '');
      
      const catObj = categories.find(c => c.category_name === selectedCategory);
      if (catObj) formData.append('category_id', catObj.category_id);
      
      const subCatObj = subcategories.find(s => s.name === selectedSubCategory);
      if (subCatObj) formData.append('subcategory_id', subCatObj.id);

      formData.append('title', `${selectedCategory} - ${selectedSubCategory}`);
      formData.append('description', description);
      
      const submitNow = new Date();
      const submitDString = `${submitNow.getFullYear()}-${String(submitNow.getMonth() + 1).padStart(2, '0')}-${String(submitNow.getDate()).padStart(2, '0')} ${String(submitNow.getHours()).padStart(2, '0')}:${String(submitNow.getMinutes()).padStart(2, '0')}:${String(submitNow.getSeconds()).padStart(2, '0')}`;
      formData.append('created_at', submitDString);

      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      
      if (res.ok && json.status === 'success') {
        const now = new Date();
        const dString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Asumsi server mengembalikan ID atau kode di json.data
        const generatedCode = json.data?.ticket_id ? `TCK-${json.data.ticket_id}` : generateTicketCode();
        
        setTicketData({
          code: generatedCode,
          categoryText: selectedCategory ? `${selectedCategory}${selectedSubCategory ? " - " + selectedSubCategory : ""}` : "-",
          unitText: user.unit || "-",
          waktuText: formatDateTime(dString),
          waktuRaw: dString,
          slaText: slaTextValue,
          perangkatText: `${user.hostname || "-"} (${[user.device_brand, user.device_model].filter(Boolean).join(" ") || "-"})`
        });
        setTicketStatus("submitted");
      } else {
        alert(json.message || 'Gagal mengirim laporan');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat mengirim laporan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTicket = () => {
    setTicketStatus("form");
  };

  const handleNewReport = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setIsSubCategoryDropdownOpen(false);
    setSubCategorySearchQuery("");
    setDescription("");
    setScreenshot(null);
    setTicketStatus("form");
  };

  const currentTime = new Date();
  const reportTimeStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')} ${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">

          {/* ================= LEFT PANEL ================= */}
          <div className="space-y-1 lg:space-y-6 lg:col-span-1">

            {/* Informasi Sistem */}
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
              <h3 className="text-2xl lg:text-lg font-bold ">
                RAPB IT SERVICE & SUPPORT CENTER
              </h3>

              {user.detection_mode === "LAN" ? (
                <span className="inline-block px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                  Terdeteksi dari LAN RS
                </span>
              ) : (
                <span className="inline-block px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                  Mode: {user.detection_mode}
                </span>
              )}

              <div className="space-y-3 text-sm">
                <div className="relative">
                  <div
                    className="cursor-pointer border border-transparent hover:border-gray-200 rounded p-2 -mx-2 transition flex justify-between items-center"
                    onClick={() => setIsNameDropdownOpen(!isNameDropdownOpen)}
                    title="Klik untuk mengubah nama pelapor"
                  >
                    <div>
                      <p className="text-gray-500">Nama Pelapor</p>
                      <p className="font-medium">{user.name}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isNameDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {isNameDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg top-full left-0">
                      <div className="p-3 border-b border-gray-100">
                        <input
                          type="text"
                          placeholder="Cari nama pegawai..."
                          className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                          value={nameSearchQuery}
                          onChange={(e) => setNameSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (filteredNames.length > 0) {
                                handleSelectName(filteredNames[0]);
                              }
                            }
                          }}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        {filteredNames.length > 0 ? (
                          filteredNames.map((name, idx) => (
                            <div
                              key={idx}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                              onClick={() => handleSelectName(name)}
                            >
                              <p className="font-medium text-sm text-gray-800">{name}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-500 text-center">Nama tidak ditemukan</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div
                    className="cursor-pointer border border-transparent hover:border-gray-200 rounded p-2 -mx-2 transition flex justify-between items-center"
                    onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                    title="Klik untuk mengubah unit"
                  >
                    <div>
                      <p className="text-gray-500">Unit</p>
                      <p className="font-medium">{user.unit}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isUnitDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {isUnitDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg top-full left-0">
                      <div className="p-3 border-b border-gray-100">
                        <input
                          type="text"
                          placeholder="Cari unit..."
                          className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                          value={unitSearchQuery}
                          onChange={(e) => setUnitSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (filteredUnits.length > 0) {
                                handleSelectUnit(filteredUnits[0]);
                              }
                            }
                          }}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        {filteredUnits.length > 0 ? (
                          filteredUnits.map((unit, idx) => (
                            <div
                              key={idx}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                              onClick={() => handleSelectUnit(unit)}
                            >
                              <p className="font-medium text-sm text-gray-800">{unit}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-500 text-center">Unit tidak ditemukan</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="hidden lg:block">
                  <p className="text-gray-500">Hostname</p>
                  <p className="font-medium">{user.hostname}</p>
                </div>
                <div className="hidden lg:block">
                  <p className="text-gray-500">IP Address</p>
                  <p className="font-medium">{user.ip_address}</p>
                </div>
                <div className="hidden lg:block">
                  <p className="text-gray-500">Waktu</p>
                  <p className="font-medium">{formatDateTime(reportTimeStr)}</p>
                </div>
              </div>
            </div>

            {/* Riwayat Laporan */}
            <div className="hidden lg:block bg-white rounded-2xl shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Riwayat Laporan Terakhir
              </h2>

              <div className="space-y-3">
                {history.map((item, idx) => (
                  <div key={idx} className="border rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">{item.category} - {item.subcategory}</p>
                      <span className={`px-2 py-1 text-xs ${statusClass(item.status_color)} rounded-full`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(item.created_at)}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className="bg-white rounded-2xl shadow p-5 lg:p-8 lg:col-span-2 flex flex-col h-full z-0">

            {ticketStatus === "form" && (
              <div className="flex-1 flex flex-col">
                <h1 className="text-lg lg:text-3xl font-bold text-gray-800 mb-2">
                  LAPOR GANGGUAN
                </h1>
                <p className="text-gray-500 mb-6">
                  Silakan isi detail gangguan yang terjadi.
                </p>

                {/* Kategori */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori Gangguan
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c, idx) => (
                      <option key={idx} value={c.category_name}>{c.category_name}</option>
                    ))}
                  </select>
                </div>

                {/* Subkategori */}
                {subcategories.length > 0 && (
                  <div className="mb-5 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Gangguan
                    </label>
                    <div
                      className="w-full border rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer flex justify-between items-center"
                      onClick={() => setIsSubCategoryDropdownOpen(!isSubCategoryDropdownOpen)}
                    >
                      <span className={selectedSubCategory ? "text-gray-900" : "text-gray-500"}>
                        {selectedSubCategory || "-- Pilih Jenis Gangguan --"}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isSubCategoryDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {isSubCategoryDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg top-full left-0">
                        <div className="p-3 border-b border-gray-100">
                          <input
                            type="text"
                            placeholder="Cari jenis gangguan..."
                            className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            value={subCategorySearchQuery}
                            onChange={(e) => setSubCategorySearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (filteredSubCategories.length > 0) {
                                  handleSelectSubCategory(filteredSubCategories[0].name);
                                }
                              }
                            }}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                          {filteredSubCategories.length > 0 ? (
                            filteredSubCategories.map((s, idx) => (
                              <div
                                key={idx}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                                onClick={() => handleSelectSubCategory(s.name)}
                              >
                                <p className="font-medium text-sm text-gray-800">{s.name}</p>
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

                {/* Deskripsi */}
                <div className="mb-5 flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Tambahan (Opsional)
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4" 
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Tuliskan detail tambahan jika diperlukan..."></textarea>
                </div>

                {/* Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Foto (Opsional)
                  </label>
                  <input 
                    type="file" 
                    onChange={(e) => setScreenshot(e.target.files[0])}
                    accept="image/*"
                    className="w-full border rounded-lg p-2" 
                  />
                </div>

                {/* SLA */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-700">
                  {slaInfo}
                </div>

                {/* Tombol */}
                <div className="flex flex-col-reverse lg:flex-row justify-end gap-3 mt-auto pt-4">
                  <button className="w-full lg:w-auto px-6 py-3 rounded-xl lg:rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-bold lg:font-normal">
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedCategory || !selectedSubCategory || isSubmitting}
                    className={`w-full lg:w-auto px-6 py-3 rounded-xl lg:rounded-lg text-white transition font-bold lg:font-normal ${(!selectedCategory || !selectedSubCategory || isSubmitting) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] lg:active:scale-100'}`}
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                  </button>
                </div>
              </div>
            )}

            {ticketStatus === "submitted" && ticketData && (
              <div className="flex-1 flex flex-col">
                {/* Header Responsif */}
                <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between mb-6 text-center lg:text-left">
                  {/* Ikon Mobile */}
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center lg:hidden mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                      <span className="hidden lg:inline">Laporan Berhasil Dikirim</span>
                      <span className="lg:hidden">Berhasil Dikirim!</span>
                    </h1>
                    <p className="text-sm lg:text-base text-gray-500 mt-1">
                      <span className="hidden lg:inline">Tim IT akan segera menindaklanjuti laporan Anda.</span>
                      <span className="lg:hidden">Tiket Anda <span className="font-bold text-gray-700">{ticketData.code}</span> sedang diproses.</span>
                    </p>
                  </div>
                  <div className="hidden lg:block bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-medium">OPEN</div>
                </div>

                {/* Desktop Detail Grid */}
                <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Nomor Tiket</p>
                      <p className="font-semibold text-gray-800">{ticketData.code}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Kategori</p>
                      <p className="font-medium">{ticketData.categoryText}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Unit</p>
                      <p className="font-medium">{ticketData.unitText}</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500">Waktu Laporan</p>
                      <p className="font-medium">{ticketData.waktuText}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estimasi Respon</p>
                      <p className="font-medium text-blue-600">{ticketData.slaText}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Perangkat</p>
                      <p className="font-medium">{ticketData.perangkatText}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Detail Box */}
                <div className="lg:hidden bg-gray-50 p-4 rounded-xl text-left text-sm space-y-3 mb-5 border">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-500">Status</span>
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold">OPEN</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 block">Kategori</p>
                    <p className="font-medium text-gray-800">{ticketData.categoryText}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 block">Estimasi</p>
                    <p className="font-medium text-blue-600">{ticketData.slaText}</p>
                  </div>
                </div>

                {/* Timeline Status - Tampil di Desktop & Mobile */}
                <div className="border-t pt-6 mb-6 text-left">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Timeline Status</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 mt-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Tiket dibuat</p>
                        <p className="text-xs text-gray-500">{ticketData.waktuText}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 opacity-50">
                      <div className="w-3 h-3 mt-2 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Sedang diproses oleh tim IT</p>
                        <p className="text-xs text-gray-400">Menunggu update</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 opacity-50">
                      <div className="w-3 h-3 mt-2 bg-gray-300 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Selesai</p>
                        <p className="text-xs text-gray-400">-</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse lg:flex-row justify-between gap-3 mt-auto">
                  {/* Kiri: Update Ticket */}
                  <button
                    onClick={() => setIsActionModalOpen(true)}
                    className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl lg:rounded-lg bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition text-sm font-bold lg:font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Ticket
                  </button>
                  {/* Kanan: Tutup & Buat Baru */}
                  <div className="flex flex-col-reverse lg:flex-row gap-3">
                    <button onClick={handleCloseTicket} className="w-full lg:w-auto px-6 py-3 rounded-xl lg:rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm font-bold lg:font-normal">
                      Tutup
                    </button>
                    <button onClick={handleNewReport} className="w-full lg:w-auto px-6 py-3 rounded-xl lg:rounded-lg text-blue-600 bg-blue-50 lg:text-white lg:bg-blue-600 hover:bg-blue-100 lg:hover:bg-blue-700 transition text-sm font-bold lg:font-normal active:scale-[0.98] lg:active:scale-100">
                      <span className="hidden lg:inline">Buat Laporan Baru</span>
                      <span className="lg:hidden">Lapor Lagi</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ================= DIRECT MESSAGE PANEL ================= */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col h-[500px] lg:h-[700px] lg:h-auto">
            <div className="border-b pb-4 mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Direct Message</h2>
                <p className="text-xs text-gray-500 mt-1">Tanya tim IT (Online)</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <div className="flex flex-col gap-1 items-start max-w-[85%]">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-tl-none text-sm">
                  Halo! Ada yang bisa kami bantu terkait laporan Anda?
                </div>
                <span className="text-[10px] text-gray-400 ml-1">IT Support • 09:20 WIB</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex gap-2">
              <input type="text" placeholder="Ketik pesan..." className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center transition shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ============ MODAL: PILIHAN AKSI TICKET ============ */}
      {isActionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Pilih Tindakan</h3>
              <p className="text-xs text-gray-500 mt-0.5">Ticket: <span className="font-semibold text-gray-700">{ticketData?.code}</span></p>
            </div>
            <div className="p-5 space-y-3">
              {/* Update Ticket (Admin) */}
              <button
                onClick={() => { setIsActionModalOpen(false); setIsAdminLoginModalOpen(true); setAdminLoginError(''); setAdminLoginForm({ username: '', password: '' }); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-blue-100 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition text-left group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Update Ticket (Admin)</p>
                  <p className="text-xs text-gray-500 mt-0.5">Login sebagai admin untuk mengupdate status dan detail ticket ini.</p>
                </div>
              </button>

              {/* Batalkan Ticket */}
              <button
                onClick={() => { setIsActionModalOpen(false); setIsCancelConfirmOpen(true); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-red-100 bg-red-50 hover:border-red-300 hover:bg-red-100 transition text-left"
              >
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-red-600 text-sm">Batalkan Ticket</p>
                  <p className="text-xs text-gray-500 mt-0.5">Batalkan laporan ini jika masalah sudah teratasi atau laporan dibuat tidak sengaja.</p>
                </div>
              </button>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL: KONFIRMASI BATALKAN TICKET ============ */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-100">
              <div className="shrink-0 w-11 h-11 bg-red-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Batalkan Tiket?</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600">Tiket <span className="font-bold text-gray-800">{ticketData?.code}</span> akan dibatalkan. Pastikan Anda yakin sebelum melanjutkan.</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setIsCancelConfirmOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
              >
                Kembali
              </button>
              <button
                onClick={() => { setIsCancelConfirmOpen(false); handleNewReport(); }}
                className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL: LOGIN ADMIN ============ */}
      {isAdminLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Login Admin</h3>
                <p className="text-xs text-gray-500 mt-0.5">Masuk untuk mengakses detail ticket</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAdminLogin} className="px-6 py-5 space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Username admin"
                    value={adminLoginForm.username}
                    onChange={(e) => { setAdminLoginForm(p => ({...p, username: e.target.value})); setAdminLoginError(''); }}
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    placeholder="Password admin"
                    value={adminLoginForm.password}
                    onChange={(e) => { setAdminLoginForm(p => ({...p, password: e.target.value})); setAdminLoginError(''); }}
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {showAdminPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {adminLoginError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-red-600 font-medium">{adminLoginError}</p>
                </div>
              )}

              {/* Hint kredensial */}
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-gray-500">Demo: <span className="font-mono font-bold text-gray-700">admin</span> / <span className="font-mono font-bold text-gray-700">admin123</span></p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setIsAdminLoginModalOpen(false); setAdminLoginError(''); }}
                  className="flex-1 py-2.5 text-sm text-gray-600 font-medium border border-gray-200 hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={adminLoginLoading}
                  className="flex-1 py-2.5 text-sm text-white font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {adminLoginLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Memverifikasi...
                    </>
                  ) : 'Masuk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
