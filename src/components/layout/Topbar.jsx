import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onLogout }) {
  const { user } = useAuth();

  // Inisial dari nama user (maks 2 huruf)
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : 'A';

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center">
        <h2 className="text-gray-800 dark:text-gray-100 font-semibold text-lg hidden sm:block">
          Selamat datang, <span className="text-blue-600 dark:text-blue-400">{user?.name || 'Admin'}</span>
        </h2>
      </div>
      <div className="flex items-center gap-3">
        {/* Role badge */}
        {user?.role && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 capitalize">
            {user.role}
          </span>
        )}

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm select-none">
          {initials}
        </div>

        {/* Logout button */}
        <button
          id="btn-logout"
          onClick={onLogout}
          title="Keluar"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800/50 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
