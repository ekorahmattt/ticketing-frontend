import React, { useState } from 'react';
import StatCard from '../../components/ui/StatCard';
import ViewSwitcher from '../../components/feature-specific/ViewSwitcher';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';

export default function Devices() {
  const [view, setView] = useState('list');

  const dummyDevices = [
    { id: "PC-POLI-PD-01", user: "Budi Santoso", unit: "Poli Penyakit Dalam", type: "PC Desktop", hostname: "PC-POLI-PD-01", ip: "192.168.10.45", status: "Aktif", loc: "Gedung A, Lt 2" },
    { id: "LAP-IT-001", user: "Eko Rahmad", unit: "IT RS", type: "Laptop", hostname: "LAP-IT-001", ip: "192.168.10.150", status: "Aktif", loc: "Gedung B, Lt 1" },
    { id: "PRN-IGD-01", user: "Siti Aminah", unit: "IGD", type: "Printer", hostname: "PRN-IGD-01", ip: "192.168.11.20", status: "Rusak", loc: "Gedung A, Lt 1" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Kelola Perangkat</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm w-full sm:w-auto">
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
          <Table headers={["Device ID", "Pengguna", "Unit", "Jenis", "Hostname", "IP Address", "Status", "Lokasi"]}>
            {dummyDevices.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">{item.id}</td>
                <td className="py-4 px-6">{item.user}</td>
                <td className="py-4 px-6">{item.unit}</td>
                <td className="py-4 px-6">{item.type}</td>
                <td className="py-4 px-6">{item.hostname}</td>
                <td className="py-4 px-6">{item.ip}</td>
                <td className="py-4 px-6"><StatusBadge status={item.status} /></td>
                <td className="py-4 px-6">{item.loc}</td>
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
    </div>
  );
}
