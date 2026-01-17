import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { View } from './types';
import { DerivationView } from './views/DerivationView';
import { AvatarView } from './views/AvatarView';
import { TryOnView } from './views/TryOnView';
import { SwapView } from './views/SwapView';
import SystemPromptsView from './views/SystemPromptsView';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModelConfigProvider } from './contexts/ModelConfigContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './views/LoginPage';
import { RegisterPage } from './views/RegisterPage';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <pre className="text-sm text-red-500 bg-gray-100 p-4 rounded overflow-auto max-w-2xl">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default App;