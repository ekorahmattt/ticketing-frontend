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

const MOCK_HISTORY = [
  { category: "Hardware", subcategory: "Printer Error", status: "Closed", status_color: "green", created_at: "2024-05-01 10:00" },
  { category: "Software & Aplikasi", subcategory: "SIMRS Tidak Bisa Login", status: "Closed", status_color: "green", created_at: "2024-05-05 14:30" }
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
  const [user, setUser] = useState(MOCK_USER);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  
  const [ticketStatus, setTicketStatus] = useState("form"); // "form" | "submitted"
  const [ticketData, setTicketData] = useState(null);

  // useEffect(() => {
  //   Fetch data sebenarnya ditaruh disini nanti
  // }, []);

  // Derivations
  const subcategories = useMemo(() => {
    const cat = categories.find(c => c.category_name === selectedCategory);
    return cat ? cat.subcategories : [];
  }, [selectedCategory, categories]);

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
  };

  const handleSubmit = () => {
    const now = new Date();
    const dString = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
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
    setTicketStatus("form");
  };

  const currentTime = new Date();
  const reportTimeStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth()+1).padStart(2,'0')}-${String(currentTime.getDate()).padStart(2,'0')} ${String(currentTime.getHours()).padStart(2,'0')}:${String(currentTime.getMinutes()).padStart(2,'0')}`;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ================= LEFT PANEL ================= */}
          <div className="space-y-6 lg:col-span-1">

            {/* Informasi Sistem */}
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Informasi Sistem</h2>

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
                <div>
                  <p className="text-gray-500">Nama Pelapor</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Unit</p>
                  <p className="font-medium">{user.unit}</p>
                </div>
                <div>
                  <p className="text-gray-500">Hostname</p>
                  <p className="font-medium">{user.hostname}</p>
                </div>
                <div>
                  <p className="text-gray-500">IP Address</p>
                  <p className="font-medium">{user.ip_address}</p>
                </div>
                <div>
                  <p className="text-gray-500">Waktu</p>
                  <p className="font-medium">{formatDateTime(reportTimeStr)}</p>
                </div>
              </div>
            </div>

            {/* Riwayat Laporan */}
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
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
          <div className="bg-white rounded-2xl shadow p-8 lg:col-span-2 flex flex-col h-full">
            
            {ticketStatus === "form" && (
              <div className="flex-1 flex flex-col">
                <h3 className="text-md font-semibold text-gray-700">
                  RAPB IT SERVICE & SUPPORT CENTER
                </h3>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
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
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Gangguan
                    </label>
                    <select 
                      value={selectedSubCategory} 
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">-- Pilih Jenis Gangguan --</option>
                      {subcategories.map((s, idx) => (
                        <option key={idx} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Deskripsi */}
                <div className="mb-5 flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Tambahan (Opsional)
                  </label>
                  <textarea rows="4" className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Tuliskan detail tambahan jika diperlukan..."></textarea>
                </div>

                {/* Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Foto (Opsional)
                  </label>
                  <input type="file" className="w-full border rounded-lg p-2" />
                </div>

                {/* SLA */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-700">
                  {slaInfo}
                </div>

                {/* Tombol */}
                <div className="flex justify-end gap-3 mt-auto">
                  <button className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">
                    Batal
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={!selectedCategory || !selectedSubCategory}
                    className={`px-6 py-3 rounded-lg text-white transition ${!selectedCategory || !selectedSubCategory ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    Kirim Laporan
                  </button>
                </div>
              </div>
            )}

            {ticketStatus === "submitted" && ticketData && (
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Laporan Berhasil Dikirim</h1>
                    <p className="text-gray-500 mt-1">Tim IT akan segera menindaklanjuti laporan Anda.</p>
                  </div>
                  <div className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-medium">OPEN</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                
                <div className="border-t pt-6 mb-6">
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
                
                <div className="flex justify-end gap-3 mt-auto">
                  <button onClick={handleCloseTicket} className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">
                    Tutup
                  </button>
                  <button onClick={handleNewReport} className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                    Buat Laporan Baru
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ================= DIRECT MESSAGE PANEL ================= */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col h-[700px] lg:h-auto">
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
    </div>
  );
}
