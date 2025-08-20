import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import ProtectedRoute from './ProtectedRoute';

// Dashboard Pages
import DashboardOverview from './dashboard_pages/DashboardOverview';
import MyCreations from './dashboard_pages/MyCreations';
// import PublicGallery from './dashboard_pages/PublicGallery';
import CreateAvatar from './dashboard_pages/CreateAvatar';
import SettingsPage from './dashboard_pages/SettingsPage'; 
import VoicesPage from './dashboard_pages/VoicesPage';
import ChatWithAvatarPage from './dashboard_pages/ConversationStudio';
import IntegrationsPage from './dashboard_pages/IntegrationsPage';

import VideoGenerationPage from './dashboard_pages/VideoGeneration';
import VideoLibraryPage from './dashboard_pages/VideoLibrary';
import ConversationLibraryPage from './dashboard_pages/ConversationLibrary';

import APIManagement from './dashboard_pages/APIManagement';

// New/Updated top-level pages
import PricingPage from './pages/PricingPage'; // Full-page pricing
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';

// Placeholder components for routes not yet fully implemented
// const ConversationLibraryPage = () => <div className="p-8 text-center text-xl dark:text-gray-200">Conversation Library Coming Soon!</div>;
// const VideoGenerationPage = () => <div className="p-8 text-center text-xl dark:text-gray-200">Video Generation Coming Soon!</div>;
const PublicGallery = () => <div className="p-8 text-center text-xl dark:text-gray-200">Public Gallery Coming Soon!</div>;


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
              
              {/* Top-level routes */}
              <Route path="/pricing" element={<PricingPage />} /> {/* Dedicated Pricing Page */}
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-conditions" element={<TermsConditionsPage />} />

              {/* Protected Dashboard Route with Nested Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                <Route index element={<DashboardOverview />} />
                {/* Conversation Routes */}
                <Route path="chat" element={<ChatWithAvatarPage />} />
                <Route path="conversation/library" element={<ConversationLibraryPage />} />
                
                {/* Avatar Routes */}
                <Route path="avatars/create" element={<CreateAvatar />} />
                <Route path="avatars/my" element={<MyCreations />} /> 
                <Route path="avatars/public" element={<PublicGallery />} />
                <Route path="voices" element={<VoicesPage />} /> 

                {/* Video Routes */}
                <Route path="video/generate" element={<VideoGenerationPage />} />
                <Route path="video/library" element={<VideoLibraryPage />} />

                {/* Integrations & Settings */}
                <Route path="integrations" element={<APIManagement />} /> 
                <Route path="settings" element={<SettingsPage />} /> 
                
                
                {/* Catch-all for undefined dashboard sub-routes, redirects to dashboard home */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Catch-all for undefined top-level routes, redirects to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
