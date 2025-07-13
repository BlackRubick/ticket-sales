// src/hooks/usePermissions.ts
import { useAuth } from '../context/AuthContext';

interface Permissions {
  canViewDashboard: boolean;
  canViewSales: boolean;
  canViewScanner: boolean;
  canViewTickets: boolean;
  canViewTicketResend: boolean;
  canAccessAdmin: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canExportData: boolean;
}

export const usePermissions = (): Permissions => {
  const { user } = useAuth();

  if (!user) {
    return {
      canViewDashboard: false,
      canViewSales: false,
      canViewScanner: false,
      canViewTickets: false,
      canViewTicketResend: false,
      canAccessAdmin: false,
      canManageUsers: false,
      canViewReports: false,
      canExportData: false,
    };
  }

  // Definir permisos según el rol
  switch (user.role) {
    case 'admin':
      return {
        canViewDashboard: true,
        canViewSales: true,
        canViewScanner: true,
        canViewTickets: true,
        canViewTicketResend: true,
        canAccessAdmin: true,
        canManageUsers: true,
        canViewReports: true,
        canExportData: true,
      };

    case 'sales':
      return {
        canViewDashboard: false,
        canViewSales: true,
        canViewScanner: false,
        canViewTickets: false,
        canViewTicketResend: false,
        canAccessAdmin: false,
        canManageUsers: false,
        canViewReports: false,
        canExportData: false,
      };

    case 'scanner':
      return {
        canViewDashboard: false,
        canViewSales: false,
        canViewScanner: true,
        canViewTickets: false,
        canViewTicketResend: false,
        canAccessAdmin: false,
        canManageUsers: false,
        canViewReports: false,
        canExportData: false,
      };

    default:
      // Fallback para roles desconocidos - sin permisos
      return {
        canViewDashboard: false,
        canViewSales: false,
        canViewScanner: false,
        canViewTickets: false,
        canViewTicketResend: false,
        canAccessAdmin: false,
        canManageUsers: false,
        canViewReports: false,
        canExportData: false,
      };
  }
};