// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/Home';
import Dashboard from './components/Dashboard'; // Main dashboard layout
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './ProtectedRoute';

// Dashboard Pages (existing and new)
import DashboardOverview from './dashboard_pages/DashboardOverview';
import MyCreations from './dashboard_pages/MyCreations'; // Changed from MyAvatarsPage to MyCreations for consistency with your file
import PublicGallery from './dashboard_pages/PublicGallery'; // Changed to PublicGallery
import CreateAvatar from './dashboard_pages/CreateAvatar'; // Changed to CreateAvatar
import SettingsPage from './dashboard_pages/SettingsPage'; // Added SettingsPage explicitly

import VoicesPage from './dashboard_pages/VoicesPage'; // NEW
import ChatWithAvatarPage from './dashboard_pages/ChatWithAvatarPage'; // NEW
import IntegrationsPage from './dashboard_pages/IntegrationsPage'; // NEW
import PricingPage from './pages/PricingPage'; // NEW (optional, for direct /pricing route)

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />
              {/* Optional: Direct pricing page route */}
              <Route path="/pricing" element={<PricingPage />} />

              {/* Protected Dashboard Route with Nested Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                {/* Default dashboard view */}
                <Route index element={<DashboardOverview />} />
                {/* Avatars Routes */}
                <Route path="avatars/my" element={<MyCreations />} />
                <Route path="avatars/public" element={<PublicGallery />} />
                <Route path="avatars/create" element={<CreateAvatar />} />
                {/* Voices Route */}
                <Route path="voices" element={<VoicesPage />} />
                {/* Chat Route */}
                <Route path="chat" element={<ChatWithAvatarPage />} />
                {/* Integrations Route */}
                <Route path="integrations" element={<IntegrationsPage />} />
                {/* Settings Route */}
                <Route path="settings" element={<SettingsPage />} /> {/* Explicitly added SettingsPage route */}
                {/* Add more routes here as needed */}
                {/* Placeholder routes (disabled in sidebar for now) */}
                <Route path="projects" element={<div>Projects Coming Soon!</div>} />
                <Route path="templates" element={<div>Templates Coming Soon!</div>} />
                <Route path="ai-voice" element={<div>AI Voice Tools Coming Soon!</div>} />
                <Route path="brand" element={<div>Brand Kit Coming Soon!</div>} />
                <Route path="uploads" element={<div>Manage Uploaded Media Coming Soon!</div>} />
                <Route path="notifications" element={<div>Notifications Here!</div>} />

              </Route>

              {/* Catch-all for undefined routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;