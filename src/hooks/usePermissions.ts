// src/hooks/usePermissions.ts
import { useAuth } from '../context/AuthContext';
import { ROLE_PERMISSIONS } from '../constants/roles';

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

  // Si no hay usuario, devolver permisos vacíos
  if (!user || !user.role) {
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

  // Obtener permisos del rol desde la configuración
  const rolePermissions = ROLE_PERMISSIONS[user.role];
  
  // Si el rol no existe en la configuración, devolver permisos vacíos
  if (!rolePermissions) {
    console.warn(`⚠️ Rol '${user.role}' no encontrado en ROLE_PERMISSIONS`);
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

  // Log para debugging en desarrollo
  if (import.meta.env.DEV) {
    console.log(`🔐 Permisos para ${user.name} (${user.role}):`, rolePermissions);
  }

  return rolePermissions;
};