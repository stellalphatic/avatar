import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import { AuthProvider } from './AuthContext';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />
              {/* Protected Dashboard Route */}
              <Route path="/dashboard/*" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
              {/* Add other public routes as needed */}
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;