// src/components/common/RoleGuard.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { getDefaultRouteForRole } from '../../utils/roleUtils';

interface RoleGuardProps {
  children: React.ReactNode;
  permission: keyof ReturnType<typeof usePermissions>;
  fallback?: React.ReactNode;
  showFallback?: boolean; // Si mostrar fallback o redirigir
}

/**
 * Componente para mostrar contenido condicionalmente basado en permisos
 * Si el usuario no tiene el permiso requerido, puede mostrar un fallback o redirigir
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  permission,
  fallback = null,
  showFallback = true
}) => {
  const { user } = useAuth();
  const permissions = usePermissions();

  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario no tiene el permiso requerido
  if (!permissions[permission]) {
    if (showFallback) {
      // Mostrar fallback (útil para elementos de UI)
      return <>{fallback}</>;
    } else {
      // Redirigir a la ruta por defecto del rol (útil para rutas completas)
      const defaultRoute = getDefaultRouteForRole(user.role);
      return <Navigate to={defaultRoute} replace />;
    }
  }

  // El usuario tiene el permiso, mostrar el contenido
  return <>{children}</>;
};

/**
 * Componente específico para proteger rutas completas
 * Siempre redirige si no hay permisos (no muestra fallback)
 */
export const RouteGuard: React.FC<{
  children: React.ReactNode;
  permission: keyof ReturnType<typeof usePermissions>;
}> = ({ children, permission }) => {
  return (
    <RoleGuard 
      permission={permission} 
      showFallback={false}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * Componente para proteger elementos de UI
 * Puede mostrar un fallback o simplemente ocultar el elemento
 */
export const UIGuard: React.FC<{
  children: React.ReactNode;
  permission: keyof ReturnType<typeof usePermissions>;
  fallback?: React.ReactNode;
}> = ({ children, permission, fallback }) => {
  return (
    <RoleGuard 
      permission={permission} 
      fallback={fallback}
      showFallback={true}
    >
      {children}
    </RoleGuard>
  );
};

/**
 * Hook para verificar permisos en componentes funcionales
 */
export const useHasPermission = (permission: keyof ReturnType<typeof usePermissions>): boolean => {
  const { user } = useAuth();
  const permissions = usePermissions();

  if (!user) return false;
  return permissions[permission];
};

/**
 * Componente para mostrar contenido diferente según el rol
 */
export const RoleBasedContent: React.FC<{
  admin?: React.ReactNode;
  sales?: React.ReactNode;
  scanner?: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ admin, sales, scanner, fallback = null }) => {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

  switch (user.role) {
    case 'admin':
      return <>{admin || fallback}</>;
    case 'sales':
      return <>{sales || fallback}</>;
    case 'scanner':
      return <>{scanner || fallback}</>;
    default:
      return <>{fallback}</>;
  }
};

/**
 * Componente para mostrar indicador de rol del usuario
 */
export const RoleIndicator: React.FC<{
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}> = ({ className = '', showIcon = true, showText = true }) => {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          icon: '👑',
          text: 'Administrador',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'sales':
        return {
          icon: '🎫',
          text: 'Vendedor',
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'scanner':
        return {
          icon: '📱',
          text: 'Escáner',
          color: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      default:
        return {
          icon: '👤',
          text: role,
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getRoleConfig(user.role);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {showText && config.text}
    </span>
  );
};

/**
 * Ejemplo de uso en comentarios:
 * 
 * // Proteger una ruta completa
 * <RouteGuard permission="canViewDashboard">
 *   <AdminDashboard />
 * </RouteGuard>
 * 
 * // Proteger un elemento de UI con fallback
 * <UIGuard 
 *   permission="canViewTickets" 
 *   fallback={<p>No tienes permisos para ver esto</p>}
 * >
 *   <TicketList />
 * </UIGuard>
 * 
 * // Uso en componente funcional
 * const canEditTickets = useHasPermission('canViewTickets');
 * 
 * // Contenido basado en rol
 * <RoleBasedContent
 *   admin={<AdminPanel />}
 *   sales={<SalesPanel />}
 *   scanner={<ScannerPanel />}
 *   fallback={<div>Rol no reconocido</div>}
 * />
 * 
 * // Indicador de rol
 * <RoleIndicator showIcon={true} showText={true} />
 */