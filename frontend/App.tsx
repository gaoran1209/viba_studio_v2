import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DERIVATION);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      
      <div className="flex-1 ml-64 flex flex-col h-full">
        <Header currentView={currentView} />
        
        <main className="flex-1 p-8 h-full overflow-hidden relative">
          {/* Derivation View: Handles its own internal scrolling */}
          <div className={`h-full w-full ${currentView === View.DERIVATION ? 'block' : 'hidden'}`}>
            <DerivationView />
          </div>

          {/* Avatar View: Needs external scrolling context */}
          <div className={`h-full w-full overflow-auto ${currentView === View.AVATAR ? 'block' : 'hidden'}`}>
            <AvatarView />
          </div>

          {/* Try On View: Fixed layout */}
          <div className={`h-full w-full ${currentView === View.TRY_ON ? 'block' : 'hidden'}`}>
             <TryOnView />
          </div>

          {/* Swap View: Fixed layout */}
           <div className={`h-full w-full ${currentView === View.SWAP ? 'block' : 'hidden'}`}>
             <SwapView />
          </div>

          {/* System Prompts: Needs external scrolling context */}
           <div className={`h-full w-full overflow-auto ${currentView === View.SYSTEM_PROMPTS ? 'block' : 'hidden'}`}>
             <SystemPromptsView />
          </div>
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
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ModelConfigProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;