import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { API_BASE, apiHeaders } from '../../utils/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [filterUnit, setFilterUnit] = useState("Semua Unit");
  const [filterCategory, setFilterCategory] = useState("Semua Kategori");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
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
        setIsLoading(false);
      }
    };
    if (user) fetchTickets();
  }, [user]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      let matchDate = true;
      if (dateStart || dateEnd) {
        const tDateStr = t.created_at?.split(' ')[0]; // YYYY-MM-DD
        if (tDateStr) {
          if (dateStart && tDateStr < dateStart) matchDate = false;
          if (dateEnd && tDateStr > dateEnd) matchDate = false;
        } else {
          matchDate = false;
        }
      }

      let matchUnit = true;
      if (filterUnit !== 'Semua Unit') {
        matchUnit = t.reporter_unit?.toLowerCase() === filterUnit.toLowerCase();
      }

      let matchCat = true;
      if (filterCategory !== 'Semua Kategori') {
        matchCat = t.category?.toLowerCase() === filterCategory.toLowerCase();
      }

      let matchStatus = true;
      if (filterStatus !== 'Semua Status') {
        const s = t.status?.toLowerCase() || '';
        if (filterStatus === 'Open') matchStatus = (s === 'baru' || s === 'open');
        else if (filterStatus === 'Diproses') matchStatus = (s === 'proses' || s === 'process' || s === 'diproses');
        else if (filterStatus === 'Selesai') matchStatus = (s === 'selesai' || s === 'done');
        else if (filterStatus === 'On Hold') matchStatus = (s === 'on_hold');
        else if (filterStatus === 'Canceled') matchStatus = (s === 'canceled' || s === 'cancelled');
      }

      let matchSearch = true;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        matchSearch =
          (t.reporter_name && t.reporter_name.toLowerCase().includes(q)) ||
          (t.id && String(t.id).includes(q)) ||
          (t.title && t.title.toLowerCase().includes(q));
      }

      return matchDate && matchUnit && matchCat && matchStatus && matchSearch;
    });
  }, [tickets, dateStart, dateEnd, filterUnit, filterCategory, filterStatus, searchQuery]);

  // --- STATS OVERALL ---
  const totalLaporan = tickets.length;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const laporanHariIni = tickets.filter(t => t.created_at && t.created_at.startsWith(todayStr)).length;
  const diproses = tickets.filter(t => t.status === 'proses' || t.status === 'process').length;
  const selesai = tickets.filter(t => t.status === 'selesai' || t.status === 'done').length;

  // --- CHARTS OVERALL ---
  const unitCounts = {};
  tickets.forEach(t => {
    const u = t.reporter_unit || 'Tanpa Unit';
    unitCounts[u] = (unitCounts[u] || 0) + 1;
  });
  const unitData = Object.entries(unitCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => ({ name: entry[0], total: entry[1] }));

  const subCatCounts = {};
  tickets.forEach(t => {
    const s = t.subcategory || 'Lainnya';
    subCatCounts[s] = (subCatCounts[s] || 0) + 1;
  });
  const subCategoryData = Object.entries(subCatCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => ({ name: entry[0], total: entry[1] }));

  const categoryCounts = {};
  tickets.forEach(t => {
    const c = t.category || 'Lainnya';
    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  });
  const categoryColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];
  const categoryDataPie = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map((entry, idx) => ({ name: entry[0], value: entry[1], color: categoryColors[idx % categoryColors.length] }));

  const statusCounts = { 'Open': 0, 'Diproses': 0, 'Selesai': 0, 'On Hold': 0, 'Canceled': 0 };
  tickets.forEach(t => {
    let s = t.status?.toLowerCase();
    if (s === 'baru' || s === 'open') statusCounts['Open']++;
    else if (s === 'proses' || s === 'process' || s === 'diproses') statusCounts['Diproses']++;
    else if (s === 'selesai' || s === 'done') statusCounts['Selesai']++;
    else if (s === 'on_hold') statusCounts['On Hold']++;
    else if (s === 'cancelled' || s === 'canceled') statusCounts['Canceled']++;
  });
  const statusData = [
    { name: 'Open', value: statusCounts['Open'], color: '#ef4444' },
    { name: 'Diproses', value: statusCounts['Diproses'], color: '#eab308' },
    { name: 'Selesai', value: statusCounts['Selesai'], color: '#22c55e' },
  ].filter(d => d.value > 0);
  if (statusCounts['On Hold'] > 0) statusData.push({ name: 'On Hold', value: statusCounts['On Hold'], color: '#a855f7' });
  if (statusCounts['Canceled'] > 0) statusData.push({ name: 'Canceled', value: statusCounts['Canceled'], color: '#9ca3af' });

  // Options untuk filter
  const availableUnits = [...new Set(tickets.map(t => t.reporter_unit).filter(Boolean))].sort();
  const availableCategories = [...new Set(tickets.map(t => t.category).filter(Boolean))].sort();

  const exportToXLSX = () => {
    if (filteredTickets.length === 0) {
      alert("Tidak ada data untuk diexport!");
      return;
    }

    const dataToExport = filteredTickets.map(t => ({
      'ID': t.id,
      'Device ID': t.device_id || '-',
      'Reporter Name': t.reporter_name || '-',
      'Reporter Unit': t.reporter_unit || '-',
      'Reporter Contact': t.reporter_contact || '-',
      'Hostname': t.report_hostname || '-',
      'IP Address': t.report_ip || '-',
      'Device Brand': t.report_device_brand || '-',
      'Device Model': t.report_device_model || '-',
      'User Agent': t.report_user_agent || '-',
      'Title': t.title || '-',
      'Description': t.description || '-',
      'Action Taken': t.action_taken || '-',
      'Handling Notes': t.handling_notes || '-',
      'Status': t.status || '-',
      'Priority': t.priority || '-',
      'SLA (Minutes)': t.sla_response_minutes || '-',
      'First Response At': t.first_response_at || '-',
      'Handled By (UserID)': t.handled_by || '-',
      'Created At': t.created_at || '-',
      'Updated At': t.updated_at || '-',
      'Resolved At': t.resolved_at || '-',
      'Category ID': t.category_id || '-',
      'Subcategory ID': t.subcategory_id || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    saveAs(data, `Laporan_Ticket_Filtered_${todayStr}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard Statistik</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Top 5 Unit Laporan Terbanyak</h3>
          <div className="h-64 min-h-[256px] w-full text-sm font-medium">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={unitData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Top 5 Jenis Gangguan</h3>
          <div className="h-64 min-h-[256px] w-full text-sm font-medium">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={subCategoryData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1 text-center">Distribusi Kategori</h3>
          <div className="h-60 min-h-[240px] w-full text-sm font-bold">
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie data={categoryDataPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                  {categoryDataPie.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-1">
            {categoryDataPie.map(item => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                {item.name}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1 text-center">Rasio Status Laporan</h3>
          <div className="h-60 min-h-[240px] w-full text-sm font-bold">
            <ResponsiveContainer width="99%" height="100%">
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
        <StatCard title="Total Laporan" value={totalLaporan.toString()} colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>} />
        <StatCard title="Laporan Hari Ini" value={laporanHariIni.toString()} colorClass="text-purple-600 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-400" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Diproses" value={diproses.toString()} colorClass="text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>} />
        <StatCard title="Selesai" value={selesai.toString()} colorClass="text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <h2 className="text-xl font-bold text-gray-800 text-center ps-6 pt-6 dark:text-gray-100 whitespace-nowrap">Riwayat Laporan Gangguan</h2>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="m-auto flex flex-wrap gap-2 w-full xl:w-auto">
            {/* Filter Rentang Tanggal */}
            <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-2 text-sm focus-within:ring-2 focus-within:ring-blue-500 w-full xl:w-auto">
              <input
                type="date"
                value={dateStart}
                onChange={e => setDateStart(e.target.value)}
                className="bg-transparent text-gray-700 dark:text-gray-300 py-2 focus:outline-none w-full sm:w-auto"
                title="Tanggal Mulai"
              />
              <span className="text-gray-400 font-medium">-</span>
              <input
                type="date"
                value={dateEnd}
                onChange={e => setDateEnd(e.target.value)}
                className="bg-transparent text-gray-700 dark:text-gray-300 py-2 focus:outline-none w-full sm:w-auto"
                title="Tanggal Selesai"
              />
            </div>

            {/* Filter Unit */}
            <select
              value={filterUnit}
              onChange={e => setFilterUnit(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none">
              <option>Semua Unit</option>
              {availableUnits.map((u, i) => <option key={i} value={u}>{u}</option>)}
            </select>

            {/* Filter Kategori */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none">
              <option>Semua Kategori</option>
              {availableCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none">
              <option>Semua Status</option>
              <option>Open</option>
              <option>Diproses</option>
              <option>Selesai</option>
              <option>On Hold</option>
              <option>Canceled</option>
            </select>

            {/* Search Bar */}
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari pelapor / ID..."
                className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg p-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToXLSX}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-md shadow-green-900/20 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Memuat data histori laporan...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-10 text-center text-gray-500">Tidak ada laporan yang sesuai kriteria.</div>
        ) : (
          <div className="overflow-y-auto max-h-[500px]">
            <Table headers={["ID Laporan", "Kategori", "Jenis Gangguan", "Pelapor", "Unit", "Status", "Tgl Laporan"]}>
              {filteredTickets.map((item, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => navigate(`/admin/ticket/${item.id}`)}
                >
                  <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">TCK-{item.id}</td>
                  <td className="py-4 px-6">{item.category || '-'}</td>
                  <td className="py-4 px-6">{item.subcategory || '-'}</td>
                  <td className="py-4 px-6">{item.reporter_name || '-'}</td>
                  <td className="py-4 px-6">{item.reporter_unit || '-'}</td>
                  <td className="py-4 px-6"><StatusBadge status={item.status} /></td>
                  <td className="py-4 px-6">{item.created_at ? item.created_at.substring(0, 16) : '-'}</td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
