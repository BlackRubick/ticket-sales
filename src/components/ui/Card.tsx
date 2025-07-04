import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle
}) => {
  return (
    <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
};
