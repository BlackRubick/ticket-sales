import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Ventas', href: '/sales', icon: '💳' },
    { name: 'Escáner', href: '/scanner', icon: '📱' },
    { name: 'Boletos', href: '/tickets', icon: '🎫' },
  ];

  const currentPath = window.location.pathname;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a href="/dashboard" className="text-2xl font-bold text-blue-600">
                Nebula
              </a>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    currentPath === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Abrir menú de usuario</span>
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>
              </div>

              {showUserMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                    </div>
                    <a
                      href="/tickets/resend"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Reenviar Boleto
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Abrir menú principal</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showUserMenu && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                  currentPath === item.href
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => setShowUserMenu(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <a
                href="/tickets/resend"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => setShowUserMenu(false)}
              >
                Reenviar Boleto
              </a>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
