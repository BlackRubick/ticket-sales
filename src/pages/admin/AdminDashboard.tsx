import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { adminService } from '../../services/adminService';
import type { DashboardStats } from '../../types/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error al cargar estadísticas</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600">Panel de control y estadísticas</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Última actualización</p>
              <p className="text-sm font-medium">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-blue-100 text-sm font-medium">Total Boletos</p>
                <p className="text-3xl font-bold">{stats.totalTickets.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-green-100 text-sm font-medium">Boletos Activos</p>
                <p className="text-3xl font-bold">{stats.activeTickets.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-purple-100 text-sm font-medium">Ingresos Totales</p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-orange-100 text-sm font-medium">Ventas Hoy</p>
                <p className="text-3xl font-bold">{stats.todaysSales}</p>
              </div>
              <div className="p-3 bg-orange-400 bg-opacity-30 rounded-full">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Tickets */}
        <Card title="Boletos Recientes" className="mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Boleto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comprador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.eventName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.buyerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={ticket.status === 'active' ? 'success' : ticket.status === 'used' ? 'warning' : 'danger'}
                      >
                        {ticket.status === 'active' ? 'Activo' : ticket.status === 'used' ? 'Usado' : 'Cancelado'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${ticket.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Estadísticas del Mes">
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Gráfico de ventas mensuales</p>
              <p className="text-sm text-gray-400 ml-2">(Próximamente)</p>
            </div>
          </Card>

          <Card title="Estados de Boletos">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Activos</span>
                <span className="text-sm text-gray-900">{stats.activeTickets}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(stats.activeTickets / stats.totalTickets) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Usados</span>
                <span className="text-sm text-gray-900">{stats.usedTickets}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${(stats.usedTickets / stats.totalTickets) * 100}%` }}
                ></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};