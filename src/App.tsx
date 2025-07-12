// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/login/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { TicketSales } from './pages/sales/TicketSales';
import { QRScanner } from './pages/scanner/QRScanner';
import { TicketList } from './pages/tickets/TicketList';
import { ResendTicket } from './pages/tickets/ResendTicket';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Navbar } from './components/common/Navbar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Alert } from './components/ui/Alert';
import { apiClient } from './config/api';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Layout with Navbar
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

// Component para verificar estado de la API
const ApiHealthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const isHealthy = await apiClient.healthCheck();
        setApiStatus(isHealthy ? 'online' : 'offline');
        
        if (!isHealthy && import.meta.env.PROD) {
          setShowOfflineAlert(true);
        }
      } catch (error) {
        console.warn('⚠️ API Health Check failed, using offline mode');
        setApiStatus('offline');
        
        // En producción, mostrar alerta
        if (import.meta.env.PROD) {
          setShowOfflineAlert(true);
        }
      }
    };

    checkApiHealth();
    
    // Verificar cada 5 minutos
    const interval = setInterval(checkApiHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Alerta de estado offline */}
      {showOfflineAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4">
          <Alert
            type="warning"
            message="La API no está disponible. Usando modo offline con datos de ejemplo."
            onClose={() => setShowOfflineAlert(false)}
          />
        </div>
      )}

      {/* Indicador de estado de API en desarrollo */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
            apiStatus === 'checking' 
              ? 'bg-yellow-100 text-yellow-800' 
              : apiStatus === 'online'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            API: {apiStatus === 'checking' ? 'Verificando...' : apiStatus === 'online' ? 'En línea' : 'Desconectada'}
          </div>
        </div>
      )}

      {children}
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/sales" element={
        <ProtectedRoute>
          <AppLayout>
            <TicketSales />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/scanner" element={
        <ProtectedRoute>
          <AppLayout>
            <QRScanner />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/tickets" element={
        <ProtectedRoute>
          <AppLayout>
            <TicketList />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/tickets/resend" element={
        <ProtectedRoute>
          <AppLayout>
            <ResendTicket />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 fallback */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-6">Página no encontrada</p>
            <a 
              href="/dashboard" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Volver al inicio
            </a>
          </div>
        </div>
      } />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ApiHealthCheck>
            <AppRoutes />
          </ApiHealthCheck>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;