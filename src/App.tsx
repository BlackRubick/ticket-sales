// src/App.tsx
import React from 'react';
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-4">Página no encontrada</p>
            <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
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
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;