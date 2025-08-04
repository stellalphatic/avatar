// src/components/Dashboard.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const DashboardHeader = ({ onMenuClick }) => {
  const { theme } = useTheme();
  return (
    <header className={`md:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4
                       border-b border-gray-200 dark:border-gray-800
                       ${theme === 'light' ? 'bg-white/90' : 'bg-gray-900/90'} backdrop-blur-sm`}>
      <Link to="/dashboard" className="flex items-center gap-2">
        <img src="/MetaPresence.png" alt="MetaPresence Logo" className="h-10 w-auto" />
        <span className="font-extrabold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          MetaPresence
        </span>
      </Link>
      <button onClick={onMenuClick} className="p-2 -mr-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
        <Menu size={24} />
      </button>
    </header>
  );
};

const Dashboard = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className={`flex min-h-screen ${theme === 'light' ? 'bg-gray-50 text-gray-800' : 'bg-gray-900 text-gray-100'}`}>
      <Sidebar isMobileOpen={isMobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
