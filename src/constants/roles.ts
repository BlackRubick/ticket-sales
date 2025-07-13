
// src/constants/roles.ts
export const USER_ROLES = {
  ADMIN: 'admin',
  SALES: 'sales',
  SCANNER: 'scanner'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Configuración de permisos por rol
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canViewDashboard: true,
    canViewSales: true,
    canViewScanner: true,
    canViewTickets: true,
    canViewTicketResend: true,
    canAccessAdmin: true,
    canManageUsers: true,
    canViewReports: true,
    canExportData: true,
  },
  [USER_ROLES.SALES]: {
    canViewDashboard: false,
    canViewSales: true,
    canViewScanner: false,
    canViewTickets: false,
    canViewTicketResend: false,
    canAccessAdmin: false,
    canManageUsers: false,
    canViewReports: false,
    canExportData: false,
  },
  [USER_ROLES.SCANNER]: {
    canViewDashboard: false,
    canViewSales: false,
    canViewScanner: true,
    canViewTickets: false,
    canViewTicketResend: false,
    canAccessAdmin: false,
    canManageUsers: false,
    canViewReports: false,
    canExportData: false,
  }
} as const;

// Rutas por defecto para cada rol
export const DEFAULT_ROUTES = {
  [USER_ROLES.ADMIN]: '/dashboard',
  [USER_ROLES.SALES]: '/sales',
  [USER_ROLES.SCANNER]: '/scanner'
} as const;

// Descripciones de roles para la UI
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]: {
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    color: 'blue',
    icon: '👑'
  },
  [USER_ROLES.SALES]: {
    name: 'Vendedor',
    description: 'Crear y gestionar boletos',
    color: 'green',
    icon: '🎫'
  },
  [USER_ROLES.SCANNER]: {
    name: 'Escáner',
    description: 'Validar boletos en eventos',
    color: 'purple',
    icon: '📱'
  }
} as const;
