import React from 'react';

export default function StatCard({ title, value, icon, colorClass = "text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400" }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 flex items-center transition-colors duration-200">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass} mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}
