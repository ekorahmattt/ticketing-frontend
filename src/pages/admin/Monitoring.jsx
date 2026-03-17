import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import ViewSwitcher from '../../components/feature-specific/ViewSwitcher';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';

export default function Monitoring() {
  const [view, setView] = useState('list');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dummyToday = [
    { time: "09:15", unit: "Poli Gigi", type: "Printer Macet", status: "Open", prioritas: "Sedang", teknisi: "-" },
    { time: "10:30", unit: "Rekam Medis", type: "Internet Mati", status: "Diproses", prioritas: "Tinggi", teknisi: "Eko Rahmad" },
    { time: "11:00", unit: "Laboratorium", type: "SIMRS Lemot", status: "Selesai", prioritas: "Tinggi", teknisi: "Eko Rahmad" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Command Center - Hari Ini</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Hari Ini" value="12" colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400" icon={<span className="font-bold text-xl">12</span>} />
        <StatCard title="Laporan Baru" value="4" colorClass="text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400" icon={<span className="font-bold text-xl">4</span>} />
        <StatCard title="Diproses" value="3" colorClass="text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400" icon={<span className="font-bold text-xl">3</span>} />
        <StatCard title="Selesai" value="5" colorClass="text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400" icon={<span className="font-bold text-xl">5</span>} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">Daftar Laporan Masuk</h2>
            <ViewSwitcher view={view} setView={setView} />
          </div>
          <div className="flex flex-wrap gap-2 w-full xl:w-auto">
            {/* Filter Status */}
            <select className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none">
              <option>Semua Status</option>
              <option>Open</option>
              <option>Diproses</option>
              <option>Selesai</option>
            </select>
            
            {/* Filter Unit */}
            <select className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none">
              <option>Semua Unit</option>
              <option>IGD</option>
              <option>Farmasi</option>
              <option>Poli Anak</option>
            </select>

            {/* Filter Kategori */}
            <select className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none">
              <option>Semua Kategori</option>
              <option>Hardware</option>
              <option>Software</option>
              <option>Jaringan</option>
            </select>

            {/* Search Bar */}
            <div className="relative w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Cari pelapor / ID..." 
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
          <Table headers={["Waktu", "Unit / Lokasi", "Jenis Gangguan", "Status", "Prioritas", "Teknisi"]}>
            {dummyToday.map((item, i) => (
              <tr 
                key={i} 
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                onClick={() => navigate(`/admin/ticket/TCK-${item.time.replace(':', '')}`)}
              >
                <td className="py-4 px-6">{item.time}</td>
                <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">{item.unit}</td>
                <td className="py-4 px-6">{item.type}</td>
                <td className="py-4 px-6"><StatusBadge status={item.status} /></td>
                <td className="py-4 px-6">{item.prioritas}</td>
                <td className="py-4 px-6">{item.teknisi}</td>
              </tr>
            ))}
          </Table>
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
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
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Pelapor</label>
                <input 
                  type="text" 
                  placeholder="Masukkan nama pelapor..." 
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Unit</label>
                <input 
                  type="text" 
                  placeholder="Contoh: IGD, Laboratorium..." 
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Kategori Gangguan</label>
                <select className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Jaringan">Jaringan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Jenis Gangguan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Printer Rusak, PC Mati..." 
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
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
    </div>
  );
}
