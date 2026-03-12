import React, { useState, useEffect, useMemo } from 'react';

// --- MOCK DATA SEBAGAI PENGGANTI FETCH API SEMENTARA ---
const MOCK_USER = {
  name: "Budi Santoso",
  unit: "Poliklinik Penyakit Dalam",
  hostname: "PC-POLI-PD-01",
  ip_address: "192.168.10.45",
  detection_mode: "LAN",
  device_brand: "Lenovo",
  device_model: "ThinkCentre M720q",
};

const MOCK_EMPLOYEES = [
  { name: "Budi Santoso", unit: "Poliklinik Penyakit Dalam" },
  { name: "Siti Aminah", unit: "Instalasi Gawat Darurat" },
  { name: "Andi Wijaya", unit: "Laboratorium Terpadu" },
  { name: "Rina Kusuma", unit: "Pendaftaran" },
  { name: "Eko Rahmad", unit: "IT RS" },
  { name: "Dr. Tirta", unit: "Poli Anak" },
  { name: "Dewi Lestari", unit: "Farmasi" },
];

const MOCK_CATEGORIES = [
  {
    category_name: "Hardware",
    subcategories: [
      { name: "Printer Rusak/Error", sla_minutes: 60 },
      { name: "Komputer Mati", sla_minutes: 120 },
      { name: "Scanner Rusak", sla_minutes: 60 }
    ]
  },
  {
    category_name: "Software & Aplikasi",
    subcategories: [
      { name: "SIMRS Tidak Bisa Login", sla_minutes: 15 },
      { name: "Error Fitur Aplikasi", sla_minutes: 30 }
    ]
  },
  {
    category_name: "Jaringan",
    subcategories: [
      { name: "Internet Mati", sla_minutes: 30 },
      { name: "Kabel Lan Putus", sla_minutes: 120 }
    ]
  }
];

function formatDateTime(s) {
  if (!s) return "";
  const [datePart, timePart] = s.split(" ");
  if (!datePart || !timePart) return s;
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${d} ${months[m - 1]} ${y} - ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
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

export default function TicketMobile() {
  const [user, setUser] = useState(MOCK_USER);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);

  const [isNameDropdownOpen, setIsNameDropdownOpen] = useState(false);
  const [nameSearchQuery, setNameSearchQuery] = useState("");

  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [unitSearchQuery, setUnitSearchQuery] = useState("");

  const filteredNames = useMemo(() => {
    const uniqueNames = Array.from(new Set(MOCK_EMPLOYEES.map(emp => emp.name)));
    return uniqueNames.filter(name => 
      name.toLowerCase().includes(nameSearchQuery.toLowerCase())
    );
  }, [nameSearchQuery]);

  const filteredUnits = useMemo(() => {
    const uniqueUnits = Array.from(new Set(MOCK_EMPLOYEES.map(emp => emp.unit)));
    return uniqueUnits.filter(unit => 
      unit.toLowerCase().includes(unitSearchQuery.toLowerCase())
    );
  }, [unitSearchQuery]);

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

  const [ticketStatus, setTicketStatus] = useState("form");
  const [ticketData, setTicketData] = useState(null);

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

  const handleSubmit = () => {
    const now = new Date();
    const dString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setTicketData({
      code: generateTicketCode(),
      categoryText: selectedCategory ? `${selectedCategory}${selectedSubCategory ? " - " + selectedSubCategory : ""}` : "-",
      unitText: user.unit || "-",
      waktuText: formatDateTime(dString),
      waktuRaw: dString,
      slaText: slaTextValue,
      perangkatText: `${user.hostname || "-"} (${[user.device_brand, user.device_model].filter(Boolean).join(" ") || "-"})`
    });
    setTicketStatus("submitted");
  };

  const handleCloseTicket = () => {
    setTicketStatus("form");
  };

  const handleNewReport = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setIsSubCategoryDropdownOpen(false);
    setSubCategorySearchQuery("");
    setTicketStatus("form");
  };

  const currentTime = new Date();
  const reportTimeStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')} ${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* ================= 1. INFORMASI PELAPOR & UNIT ================= */}
        <div className="bg-white rounded-2xl shadow p-5 space-y-4">
          <h3 className="text-lg font-bold text-center border-b pb-3 text-gray-800">
            RAPB IT SERVICE & SUPPORT CENTER
          </h3>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-800">
              Profil Pelapor
            </h3>
            {user.detection_mode === "LAN" && (
              <span className="px-2 py-1 text-[10px] bg-green-100 text-green-600 rounded-full font-medium">
                Aktif (LAN)
              </span>
            )}
          </div>

          <div className="space-y-4 text-sm">
            {/* Input Nama Pelapor */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Pelapor</label>
              <div 
                className="w-full border rounded-lg p-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white cursor-pointer flex justify-between items-center"
                onClick={() => setIsNameDropdownOpen(!isNameDropdownOpen)}
              >
                <span className="font-medium text-gray-800">{user.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isNameDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              {isNameDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl top-full left-0">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Cari nama..."
                      className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
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
                  <div className="max-h-40 overflow-y-auto">
                    {filteredNames.length > 0 ? (
                      filteredNames.map((name, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                          onClick={() => handleSelectName(name)}
                        >
                          <p className="font-medium text-sm text-gray-800">{name}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500 text-center">Tidak ditemukan</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Input Unit */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Unit / Ruangan</label>
              <div 
                className="w-full border rounded-lg p-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white cursor-pointer flex justify-between items-center"
                onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
              >
                <span className="font-medium text-gray-800">{user.unit}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isUnitDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              
              {isUnitDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-xl top-full left-0">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Cari unit..."
                      className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
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
                  <div className="max-h-40 overflow-y-auto">
                    {filteredUnits.length > 0 ? (
                      filteredUnits.map((unit, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                          onClick={() => handleSelectUnit(unit)}
                        >
                          <p className="font-medium text-sm text-gray-800">{unit}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500 text-center">Tidak ditemukan</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* ================= 2. LAPOR GANGGUAN ================= */}
        <div className="bg-white rounded-2xl shadow p-5 flex flex-col z-0">
          {ticketStatus === "form" && (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Lapor Gangguan
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                Pilih kategori dan jenis gangguan
              </p>

              {/* Input Kategori */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Gangguan
                </label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full border rounded-lg p-3 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((c, idx) => (
                    <option key={idx} value={c.category_name}>{c.category_name}</option>
                  ))}
                </select>
              </div>

              {/* Input Jenis Gangguan */}
              {subcategories.length > 0 && (
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Gangguan
                  </label>
                  <div 
                    className="w-full border rounded-lg p-3 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer flex justify-between items-center"
                    onClick={() => setIsSubCategoryDropdownOpen(!isSubCategoryDropdownOpen)}
                  >
                    <span className={selectedSubCategory ? "text-gray-900" : "text-gray-500"}>
                      {selectedSubCategory || "-- Pilih Jenis Gangguan --"}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isSubCategoryDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {isSubCategoryDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-xl top-full left-0">
                      <div className="p-2 border-b border-gray-100">
                        <input
                          type="text"
                          placeholder="Cari jenis gangguan..."
                          className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
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
                      <div className="max-h-40 overflow-y-auto">
                        {filteredSubCategories.length > 0 ? (
                          filteredSubCategories.map((s, idx) => (
                            <div 
                              key={idx} 
                              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                              onClick={() => handleSelectSubCategory(s.name)}
                            >
                              <p className="font-medium text-sm text-gray-800">{s.name}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-sm text-gray-500 text-center">Tidak ditemukan</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Deskripsi Tambahan */}
              <div className="mb-4 flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Tambahan (Opsional)
                </label>
                <textarea rows="3" className="w-full border rounded-lg p-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ketik detail tambahan jika diperlukan..."></textarea>
              </div>

              {/* SLA */}
              <div className="bg-blue-50 p-3 rounded-lg mb-5 text-xs text-blue-700 font-medium">
                {slaInfo}
              </div>

              {/* Tombol Kirim */}
              <button
                onClick={handleSubmit}
                disabled={!selectedCategory || !selectedSubCategory}
                className={`w-full py-3 rounded-xl font-bold text-white transition shadow-sm ${!selectedCategory || !selectedSubCategory ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}
              >
                Kirim Laporan
              </button>
            </>
          )}

          {ticketStatus === "submitted" && ticketData && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Berhasil Dikirim!</h2>
              <p className="text-sm text-gray-500 mb-4">Tiket Anda <span className="font-bold text-gray-700">{ticketData.code}</span> sedang diproses.</p>
              
              <div className="bg-gray-50 p-4 rounded-xl text-left text-sm space-y-3 mb-5 border">
                <div>
                  <p className="text-xs text-gray-500 block">Kategori</p>
                  <p className="font-medium text-gray-800">{ticketData.categoryText}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 block">Estimasi</p>
                  <p className="font-medium text-blue-600">{ticketData.slaText}</p>
                </div>
              </div>

              <button
                onClick={handleNewReport}
                className="w-full py-3 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition active:scale-[0.98]"
              >
                Lapor Lagi
              </button>
            </div>
          )}
        </div>

        {/* ================= 3. DIRECT MESSAGE ================= */}
        <div className="bg-white rounded-2xl shadow p-5 flex flex-col h-[350px]">
          <div className="border-b pb-3 mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-md font-bold text-gray-800">Pesan (Live Chat)</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">Tanya tim IT Support</p>
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-medium text-green-700">Online</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="flex flex-col gap-1 items-start max-w-[85%]">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-tl-sm text-sm">
                Halo! Ada yang bisa kami bantu terkait laporan Anda hari ini?
              </div>
              <span className="text-[9px] font-medium text-gray-400 ml-1">IT Support • 09:20</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t flex gap-2">
            <input type="text" placeholder="Ketik pesan disini..." className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center transition shrink-0 active:scale-95 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
