import React from 'react';

export default function StatusBadge({ status }) {
  let colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  
  if (status.toLowerCase().includes("open") || status.toLowerCase().includes("baru") || status.toLowerCase().includes("rusak")) {
    colorClass = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  } else if (status.toLowerCase().includes("proses")) {
    colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  } else if (status.toLowerCase().includes("selesai") || status.toLowerCase().includes("closed")) {
    colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  } else if (status.toLowerCase() === "aktif") {
    colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  } else if (status.toLowerCase().includes("nonaktif")) {
    colorClass = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {status}
    </span>
  );
}
