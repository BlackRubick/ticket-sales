import React from 'react';
import { ROLE_DESCRIPTIONS, type UserRole } from '../../constants/roles';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  showIcon = true
}) => {
  const roleInfo = ROLE_DESCRIPTIONS[role];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        sizeClasses[size]
      } ${colorClasses[roleInfo.color]}`}
    >
      {showIcon && <span className="mr-1">{roleInfo.icon}</span>}
      {roleInfo.name}
    </span>
  );
};