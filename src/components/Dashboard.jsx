// src/Dashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { BackgroundBeams } from './ui/BackgroundBeams';
import { SparklesCore } from './ui/SparklesCore';
import Navbar from './Navbar'; // Keep your existing Navbar
import { Routes, Route, Link, useLocation } from 'react-router-dom'; // Import router components
import { Home as HomeIcon, Settings, UserPlus, History, Cloud } from 'lucide-react'; // Icons for sidebar

// Import your new dashboard sub-pages
import DashboardOverview from '../dashboard_pages/DashboardOverview'; // New file
import CreateAvatar from '../dashboard_pages/CreateAvatar'; // Your existing component, potentially renamed/modified
import MyCreations from '../dashboard_pages/MyCreations'; // New file for displaying user's avatars/voices
import SettingsPage from '../dashboard_pages/SettingsPage'; // New file for user settings, subscriptions
import PublicGallery from '../dashboard_pages/PublicGallery'; // New file for public content

const Dashboard = () => {
    const location = useLocation(); // To highlight active link

    const sidebarItems = [
        { name: 'Overview', path: '/dashboard', icon: HomeIcon },
        { name: 'Create Avatar', path: '/dashboard/create-avatar', icon: UserPlus },
        { name: 'My Creations', path: '/dashboard/my-creations', icon: History },
        { name: 'Public Gallery', path: '/dashboard/public-gallery', icon: Cloud },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-background relative flex flex-col">
            <Navbar />
            <BackgroundBeams className="absolute inset-0 z-0" />
            <div className="absolute inset-0 w-full h-full z-0">
                <SparklesCore
                    id="tsparticlesfullpage-dashboard"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={100}
                    className="w-full h-full"
                    particleColor="#a855f7"
                />
            </div>

            <div className="relative z-10 flex flex-1 pt-16"> {/* pt-16 to account for fixed navbar */}
                {/* Sidebar */}
                <motion.aside
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-64 bg-card border-r border-border p-6 flex flex-col min-h-[calc(100vh-64px)]"
                >
                    <nav className="flex-1">
                        <ul className="space-y-4">
                            {sidebarItems.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200
                                            ${location.pathname === item.path
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                            }`}
                                    >
                                        <item.icon size={20} />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    {/* Add any dashboard footer or user info here */}
                </motion.aside>

                {/* Main Content Area */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <Routes>
                        <Route index element={<DashboardOverview />} /> {/* Default dashboard view */}
                        <Route path="create-avatar" element={<CreateAvatar />} />
                        <Route path="my-creations" element={<MyCreations />} />
                        <Route path="public-gallery" element={<PublicGallery />} />
                        <Route path="settings" element={<SettingsPage />} />
                        {/* Add more dashboard sub-routes as needed */}
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;