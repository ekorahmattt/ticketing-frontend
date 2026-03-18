import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MOCK_EMPLOYEES = [
  { name: "Budi Santoso", unit: "Poliklinik Penyakit Dalam" },
  { name: "Siti Aminah", unit: "Instalasi Gawat Darurat" },
  { name: "Andi Wijaya", unit: "Laboratorium Terpadu" },
  { name: "Rina Kusuma", unit: "Pendaftaran" },
  { name: "Eko Rahmad", unit: "IT RS" },
  { name: "Dr. Tirta", unit: "Poli Anak" },
  { name: "Dewi Lestari", unit: "Farmasi" },
];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reporter, setReporter] = useState({
    name: "Budi Santoso",
    unit: "Poliklinik Penyakit Dalam"
  });

  const [isNameDropdownOpen, setIsNameDropdownOpen] = useState(false);
  const [nameSearchQuery, setNameSearchQuery] = useState("");

  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [unitSearchQuery, setUnitSearchQuery] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteTicket = () => {
    setIsDeleteModalOpen(false);
    navigate(-1);
  };

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
    setReporter({ ...reporter, name });
    setIsNameDropdownOpen(false);
    setNameSearchQuery("");
  };

  const handleSelectUnit = (unit) => {
    setReporter({ ...reporter, unit });
    setIsUnitDropdownOpen(false);
    setUnitSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
           </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Detail Laporan {id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 tracking-tight">
        
        {/* Kolom Kiri - Info Pelapor & Riwayat */}
        <div className="space-y-6 lg:col-span-1">
          {/* Info Pelapor */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Informasi Pelapor</h2>
            <div className="space-y-3 text-sm">
                <div className="relative">
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Nama Pelapor</label>
                  <div
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2 flex justify-between items-center cursor-pointer focus:ring-2 focus:ring-blue-500 transition-shadow"
                    onClick={() => setIsNameDropdownOpen(!isNameDropdownOpen)}
                  >
                    <span>{reporter.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isNameDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {isNameDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
                      <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                        <input
                          type="text"
                          placeholder="Cari nama pegawai..."
                          className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
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
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-0"
                              onClick={() => handleSelectName(name)}
                            >
                              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{name}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">Nama tidak ditemukan</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Unit</label>
                  <div
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2 flex justify-between items-center cursor-pointer focus:ring-2 focus:ring-blue-500 transition-shadow"
                    onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                  >
                    <span>{reporter.unit}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isUnitDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {isUnitDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg top-full left-0">
                      <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                        <input
                          type="text"
                          placeholder="Cari unit..."
                          className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
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
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-0"
                              onClick={() => handleSelectUnit(unit)}
                            >
                              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{unit}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">Unit tidak ditemukan</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Hostname</label>
                  <input type="text" defaultValue="PC-POLI-PD-01" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">IP Address</label>
                  <input type="text" defaultValue="192.168.10.45" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Brand & Model Device</label>
                  <input type="text" defaultValue="Lenovo ThinkCentre M720q" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                </div>
            </div>
          </div>

          {/* Riwayat Laporan */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Riwayat Laporan Unit</h2>
            <div className="space-y-3">
              <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-3">
                 <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Hardware - Printer Error</p>
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400 rounded-lg">Selesai</span>
                 </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400">01 Mei 2024 - 10:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Tengah - Form Informasi Laporan & Update */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 lg:col-span-2 flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Informasi Laporan</h2>
            
            <form className="space-y-4 text-sm flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Kategori Gangguan</label>
                    <input type="text" readOnly value="Hardware" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 outline-none font-medium text-sm" />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Jenis Gangguan</label>
                    <input type="text" readOnly value="Printer Rusak/Error" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 outline-none font-medium text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Deskripsi Tambahan</label>
                  <textarea readOnly rows="2" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 outline-none font-medium text-sm resize-none" value="Printer tidak bisa menarik kertas"></textarea>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Gambar yang Diupload</label>
                  <div className="w-full h-32 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400">
                     <div className="flex flex-col items-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                       <span className="text-xs">foto_error_printer.jpg</span>
                     </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-5 mt-5 space-y-4">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Update Penyelesaian</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Status</label>
                      <select className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                         <option value="Open">Open</option>
                         <option value="Diproses">Diproses</option>
                         <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Diambil Alih Oleh (Admin)</label>
                      <select className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none">
                         <option>Pilih Admin...</option>
                         <option>Eko Rahmad (Anda)</option>
                         <option>Bagus Setiawan</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Prioritas & SLA Responses</label>
                      <select className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 outline-none">
                         <option>Tinggi - 30 Menit</option>
                         <option>Sedang - 60 Menit</option>
                         <option>Rendah - 120 Menit</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Tindakan</label>
                    <textarea rows="2" className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tindakan yang telah atau akan dilakukan..."></textarea>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Keterangan Khusus</label>
                    <textarea rows="2" className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Catatan internal tambahan..."></textarea>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold py-2.5 px-5 rounded-lg transition border border-red-200 dark:border-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus Ticket
                    </button>
                    <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-sm">
                      Update Ticket
                    </button>
                  </div>
                </div>
            </form>
        </div>

        {/* Kolom Kanan - Chat */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-[600px] lg:h-auto lg:col-span-1">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Direct Message</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Chat ke Pelapor (Online)</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-[pulse_2s_ease-in-out_infinite]"></div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              <div className="flex flex-col gap-1 items-start max-w-[85%]">
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-[20px] rounded-tl-sm text-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm leading-relaxed">
                  Halo, Pak! Printer saya tiba-tiba tidak bisa menarik kertas.
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1 font-medium">Budi Santoso • 09:15 WIB</span>
              </div>
              <div className="flex flex-col gap-1 items-end ml-auto max-w-[85%]">
                 <div className="bg-blue-600 dark:bg-blue-600 text-white py-3 px-4 rounded-[20px] rounded-tr-sm text-sm shadow-sm leading-relaxed font-medium">
                  Baik Pak, segera kami cek kesana.
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 mr-1 font-medium">Terkirim • 09:20 WIB</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
              <input type="text" placeholder="Ketik pesan..." className="flex-1 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center transition shrink-0 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>
        </div>

      </div>

      {/* Modal Konfirmasi Hapus Ticket */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800">
              <div className="shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Hapus Ticket?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Anda akan menghapus ticket <span className="font-bold text-gray-900 dark:text-gray-100">{id}</span> secara permanen.
                Semua data laporan, riwayat, dan percakapan terkait ticket ini akan ikut terhapus.
              </p>
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  ⚠️ Data yang sudah dihapus tidak dapat dipulihkan kembali.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteTicket}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Ya, Hapus Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
