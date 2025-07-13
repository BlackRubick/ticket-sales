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
import { usePermissions } from './hooks/usePermissions';
import { getDefaultRouteForRole } from './utils/roleUtils';
import './App.css';

// Protected Route Component - Verifica autenticación Y permisos
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  requiredPermission: keyof ReturnType<typeof usePermissions>;
}> = ({ children, requiredPermission }) => {
  const { user, isLoading } = useAuth();
  const permissions = usePermissions();

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

  // Verificar si el usuario tiene el permiso requerido
  if (!permissions[requiredPermission]) {
    // Redirigir a la ruta por defecto del rol del usuario
    const defaultRoute = getDefaultRouteForRole(user.role);
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to default route based on role if already authenticated)
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
    // Redirigir a la ruta por defecto según el rol
    const defaultRoute = getDefaultRouteForRole(user.role);
    return <Navigate to={defaultRoute} replace />;
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

// Componente para redirigir a la ruta por defecto basada en el rol
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const defaultRoute = getDefaultRouteForRole(user.role);
  return <Navigate to={defaultRoute} replace />;
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

      {/* Protected Routes with Role-based Access Control */}
      
      {/* Dashboard - Solo Admin */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredPermission="canViewDashboard">
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Sales - Admin y Sales */}
      <Route path="/sales" element={
        <ProtectedRoute requiredPermission="canViewSales">
          <AppLayout>
            <TicketSales />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Scanner - Admin y Scanner */}
      <Route path="/scanner" element={
        <ProtectedRoute requiredPermission="canViewScanner">
          <AppLayout>
            <QRScanner />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Tickets List - Solo Admin */}
      <Route path="/tickets" element={
        <ProtectedRoute requiredPermission="canViewTickets">
          <AppLayout>
            <TicketList />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Resend Ticket - Solo Admin */}
      <Route path="/tickets/resend" element={
        <ProtectedRoute requiredPermission="canViewTicketResend">
          <AppLayout>
            <ResendTicket />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Default redirect - Redirige según el rol */}
      <Route path="/" element={<RoleBasedRedirect />} />
      
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
            <p className="text-gray-600 mb-6">Página no encontrada o no tienes permisos para acceder</p>
            <RoleBasedRedirect />
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