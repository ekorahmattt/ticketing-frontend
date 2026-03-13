import React from 'react';
import StatCard from '../../components/ui/StatCard';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const dummyHistory = [
    { id: "TCK-20240510-001", category: "Hardware", type: "Printer Rusak/Error", user_name: "Budi", unit: "Poli Anak", status: "Selesai", priority: "Rendah", date: "10 Mei 2024 09:00", resolve: "10 Mei 2024 10:15" },
    { id: "TCK-20240509-021", category: "Software", type: "SIMRS Tidak Bisa Login", user_name: "Siti", unit: "IGD", status: "Selesai", priority: "Tinggi", date: "09 Mei 2024 14:10", resolve: "09 Mei 2024 14:20" },
    { id: "TCK-20240508-011", category: "Jaringan", type: "Internet Mati", user_name: "Andi", unit: "Farmasi", status: "Selesai", priority: "Sedang", date: "08 Mei 2024 08:30", resolve: "08 Mei 2024 09:00" },
  ];

  const unitData = [
    { name: 'IGD', total: 120 },
    { name: 'Poli Anak', total: 98 },
    { name: 'Farmasi', total: 86 },
    { name: 'Pendaftaran', total: 65 },
    { name: 'Laboratorium', total: 50 },
  ];

  const categoryData = [
    { name: 'Hardware', total: 154 },
    { name: 'Software', total: 110 },
    { name: 'Jaringan', total: 85 },
    { name: 'Sistem', total: 55 },
    { name: 'Lainnya', total: 20 },
  ];

  const priorityData = [
    { name: 'Tinggi', value: 45, color: '#ef4444' },
    { name: 'Sedang', value: 85, color: '#eab308' },
    { name: 'Rendah', value: 120, color: '#3b82f6' },
  ];

  const statusData = [
    { name: 'Open', value: 15, color: '#ef4444' },
    { name: 'Diproses', value: 25, color: '#eab308' },
    { name: 'Selesai', value: 210, color: '#22c55e' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard Statistik</h1>
      </div>

      {/* Baris Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
           <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Top 5 Unit Laporan Terbanyak</h3>
           <div className="h-64 text-sm font-medium">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={unitData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                 <XAxis type="number" />
                 <YAxis dataKey="name" type="category" width={80} />
                 <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
           <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Top 5 Kategori Gangguan</h3>
           <div className="h-64 text-sm font-medium">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                 <XAxis type="number" />
                 <YAxis dataKey="name" type="category" width={80} />
                 <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
           <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1 text-center">Distribusi Prioritas</h3>
           <div className="h-60 text-sm font-bold">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                   {priorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                 </Pie>
                 <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="flex justify-center gap-6 mt-1">
             {priorityData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </div>
             ))}
           </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
           <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1 text-center">Rasio Status Laporan</h3>
           <div className="h-60 text-sm font-bold">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                   {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                 </Pie>
                 <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="flex justify-center gap-6 mt-1">
             {statusData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </div>
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Laporan" value="1,245" colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>} />
        <StatCard title="Laporan Hari Ini" value="12" colorClass="text-purple-600 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-400" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Diproses" value="3" colorClass="text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>} />
        <StatCard title="Selesai" value="1,230" colorClass="text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">Riwayat Laporan Lampau</h2>
          <div className="flex flex-wrap gap-2 w-full xl:w-auto">
            {/* Filter Rentang Tanggal */}
            <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-2 text-sm focus-within:ring-2 focus-within:ring-blue-500 w-full xl:w-auto">
              <input 
                type="date" 
                className="bg-transparent text-gray-700 dark:text-gray-300 py-2 focus:outline-none w-full sm:w-auto"
                title="Tanggal Mulai"
              />
              <span className="text-gray-400 font-medium">-</span>
              <input 
                type="date" 
                className="bg-transparent text-gray-700 dark:text-gray-300 py-2 focus:outline-none w-full sm:w-auto"
                title="Tanggal Selesai"
              />
            </div>
            
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
            
            {/* Export Button */}
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Export Data
            </button>
          </div>
        </div>
        <Table headers={["ID Laporan", "Kategori", "Jenis Gangguan", "Pelapor", "Unit", "Status", "Prioritas", "Tgl Laporan", "Tgl Selesai"]}>
          {dummyHistory.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">{item.id}</td>
              <td className="py-4 px-6">{item.category}</td>
              <td className="py-4 px-6">{item.type}</td>
              <td className="py-4 px-6">{item.user_name}</td>
              <td className="py-4 px-6">{item.unit}</td>
              <td className="py-4 px-6"><StatusBadge status={item.status} /></td>
              <td className="py-4 px-6">{item.priority}</td>
              <td className="py-4 px-6">{item.date}</td>
              <td className="py-4 px-6">{item.resolve}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
