import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

interface RoleGuardProps {
  children: React.ReactNode;
  permission: keyof ReturnType<typeof usePermissions>;
  fallback?: React.ReactNode;
}

/**
 * Componente para mostrar contenido condicionalmente basado en permisos
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  permission,
  fallback = null
}) => {
  const { user } = useAuth();
  const permissions = usePermissions();

  if (!user || !permissions[permission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};