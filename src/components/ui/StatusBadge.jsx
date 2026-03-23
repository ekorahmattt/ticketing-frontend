import React from 'react';

export default function StatusBadge({ status }) {
  let colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  let displayStatus = status || '-';
  
  if (status) {
    const s = status.toLowerCase();
    
    if (s.includes("open") || s === "baru") {
      colorClass = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      displayStatus = "Open";
    } else if (s.includes("rusak")) {
      colorClass = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      displayStatus = "Rusak";
    } else if (s.includes("proses") || s.includes("diproses") || s === "process") {
      colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      displayStatus = "Diproses";
    } else if (s.includes("selesai") || s.includes("closed") || s === "done") {
      colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      displayStatus = "Selesai";
    } else if (s.includes("on hold") || s === "hold" || s === "on_hold") {
      colorClass = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      displayStatus = "On Hold";
    } else if (s.includes("canceled") || s.includes("batal") || s === "cancelled") {
      colorClass = "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
      displayStatus = "Canceled";
    } else if (s === "aktif") {
      colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      displayStatus = "Aktif";
    } else if (s.includes("tidak aktif") || s.includes("nonaktif")) {
      colorClass = "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
      displayStatus = "Tidak Aktif";
    } else {
      // capitalize first letter
      displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {displayStatus}
    </span>
  );
}
