import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ isDarkMode, toggleTheme }) {
  const menus = [
    { name: "Dashboard", path: "/admin", exact: true },
    { name: "Monitoring Laporan", path: "/admin/monitoring" },
    { name: "Kelola Perangkat", path: "/admin/devices" },
    { name: "Kelola User Admin", path: "/admin/users" },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-200">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">IT Support App</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menus.map((menu, idx) => (
            <li key={idx}>
              <NavLink 
                to={menu.path}
                end={menu.exact}
                className={({ isActive }) => 
                  `block px-6 py-3 text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 border-r-4 border-blue-600 dark:border-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`
                }
              >
                {menu.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          {isDarkMode ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}
