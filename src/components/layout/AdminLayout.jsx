import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/ticketing-backend/index.php';

export default function AdminLayout() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Proteksi: redirect ke /login jika belum autentikasi
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const isDark = !prev;
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      return isDark;
    });
  };

  const handleLogout = useCallback(async () => {
    try {
      // Best-effort backend notification (use beacon for browser closing)
      if (typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(`${API_BASE}/api/auth/logout`);
      } else {
        await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
      }
    } catch {
      // Ignored
    }
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  // Logout otomatis saat tab/browser ditutup atau navigasi keluar dari admin
  useEffect(() => {
    const handleUnload = () => {
      // Gunakan beacon agar tetap terkirim saat tab ditutup
      navigator.sendBeacon(`${API_BASE}/api/auth/logout`);
      logout();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200`}>
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
