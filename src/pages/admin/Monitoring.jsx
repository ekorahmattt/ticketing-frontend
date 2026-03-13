import React, { useState } from 'react';
import StatCard from '../../components/ui/StatCard';
import ViewSwitcher from '../../components/feature-specific/ViewSwitcher';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';

export default function Monitoring() {
  const [view, setView] = useState('list');

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
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-4 justify-between items-center">
          <ViewSwitcher view={view} setView={setView} />
        </div>

        {view === 'list' ? (
          <Table headers={["Waktu", "Unit / Lokasi", "Jenis Gangguan", "Status", "Prioritas", "Teknisi"]}>
            {dummyToday.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
    </div>
  );
}
