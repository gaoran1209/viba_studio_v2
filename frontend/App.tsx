import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { View } from './types';
import { DerivationView } from './views/DerivationView';
import { AvatarView } from './views/AvatarView';
import { TryOnView } from './views/TryOnView';
import { SwapView } from './views/SwapView';
import { SystemPromptsView } from './views/SystemPromptsView';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModelConfigProvider } from './contexts/ModelConfigContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './views/LoginPage';
import { RegisterPage } from './views/RegisterPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current view based on path
  const getCurrentView = (): View => {
    const path = location.pathname;
    if (path.includes('/avatar')) return View.AVATAR;
    if (path.includes('/tryon')) return View.TRY_ON;
    if (path.includes('/swap')) return View.SWAP;
    if (path.includes('/prompts')) return View.SYSTEM_PROMPTS;
    return View.DERIVATION;
  };

  const currentView = getCurrentView();

  const handleNavigate = (view: View) => {
    switch(view) {
      case View.AVATAR: navigate('/avatar'); break;
      case View.TRY_ON: navigate('/tryon'); break;
      case View.SWAP: navigate('/swap'); break;
      case View.SYSTEM_PROMPTS: navigate('/prompts'); break;
      case View.DERIVATION: 
      default:
        navigate('/derivation');
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      
      <div className="flex-1 ml-64 flex flex-col h-full">
        <Header currentView={currentView} />
        
        <main className="flex-1 p-8 h-full overflow-hidden relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <ModelConfigProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Dashboard Routes */}
              <Route 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Navigate to="/derivation" replace />} />
                <Route path="/derivation" element={<DerivationView />} />
                <Route path="/avatar" element={<AvatarView />} />
                <Route path="/tryon" element={<TryOnView />} />
                <Route path="/swap" element={<SwapView />} />
                <Route path="/prompts" element={<SystemPromptsView />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ModelConfigProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;