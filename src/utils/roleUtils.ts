import { USER_ROLES, DEFAULT_ROUTES, ROLE_PERMISSIONS, type UserRole } from '../constants/roles';

/**
 * Obtiene la ruta por defecto para un rol específico
 */
export const getDefaultRouteForRole = (role: UserRole): string => {
  return DEFAULT_ROUTES[role] || DEFAULT_ROUTES[USER_ROLES.SALES];
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export const hasPermission = (
  role: UserRole, 
  permission: keyof typeof ROLE_PERMISSIONS.admin
): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return rolePermissions ? rolePermissions[permission] : false;
};

/**
 * Obtiene todos los permisos para un rol
 */
export const getPermissionsForRole = (role: UserRole) => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[USER_ROLES.SALES];
};

/**
 * Verifica si un rol es válido
 */
export const isValidRole = (role: string): role is UserRole => {
  return Object.values(USER_ROLES).includes(role as UserRole);
};

/**
 * Obtiene una lista de rutas permitidas para un rol
 */
export const getAllowedRoutesForRole = (role: UserRole): string[] => {
  const permissions = getPermissionsForRole(role);
  const routes: string[] = [];

  if (permissions.canViewDashboard) routes.push('/dashboard');
  if (permissions.canViewSales) routes.push('/sales');
  if (permissions.canViewScanner) routes.push('/scanner');
  if (permissions.canViewTickets) routes.push('/tickets');
  if (permissions.canViewTicketResend) routes.push('/tickets/resend');

  return routes;
};



export type { UserRole };

