import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Button } from "../../components/ui/Button";
import { adminService } from "../../services/adminService";
import type { DashboardStats } from "../../types/api";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
console.log("🔍 DEBUG Dashboard - Estado actual:");
console.log("stats:", stats);
console.log("loading:", loading);
console.log("stats?.recentTickets:", stats?.recentTickets);

if (stats?.recentTickets) {
  console.log("📊 Datos de tickets:");
  stats.recentTickets.forEach((ticket, index) => {
    console.log(`Ticket ${index + 1}:`, {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      eventName: ticket.eventName,
      buyerName: ticket.buyerName,
      status: ticket.status
    });
  });
}
useEffect(() => {
  const fetchStats = async () => {
    try {
      console.log("🚀 Iniciando carga de stats...");
      const data = await adminService.getDashboardStats();
      console.log("✅ Stats cargadas:", data);
      setStats(data);
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      // AGREGADO: Mostrar el error en consola
      console.error("Error completo:", {
        message: error.message,
        stack: error.stack,
        error
      });
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error al cargar estadísticas
            </h1>
            <p className="text-gray-600">Inténtalo de nuevo más tarde</p>
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      name: "Crear Boleto",
      href: "/sales",
      icon: "🎫",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Escanear QR",
      href: "/scanner",
      icon: "📱",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Ver Boletos",
      href: "/tickets",
      icon: "📋",
      color: "from-green-500 to-teal-500",
    },
    {
      name: "Reenviar",
      href: "/tickets/resend",
      icon: "📧",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-800/20"></div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-8 lg:mb-0">
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                  Dashboard
                  <span className="block text-2xl lg:text-3xl font-normal text-blue-100 mt-2">
                    Panel de Control
                  </span>
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl">
                  Gestiona tu sistema de boletos de manera eficiente y moderna
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-white">
                    {stats.todaysSales}
                  </div>
                  <div className="text-blue-100 text-sm">Ventas Hoy</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-white">
                    ${stats.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-blue-100 text-sm">Total Ingresos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Quick Actions */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <a
                key={action.name}
                href={action.href}
                className="group relative overflow-hidden rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>
                <div className="relative">
                  <div className="text-3xl mb-3">{action.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm lg:text-base">
                    {action.name}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
              Estadísticas
            </h2>
            <div className="flex space-x-2">
              {["today", "week", "month"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {period === "today"
                    ? "Hoy"
                    : period === "week"
                    ? "Semana"
                    : "Mes"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Tickets */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl border border-blue-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-700 rounded-xl">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-blue-200 text-sm font-medium bg-blue-700 px-2 py-1 rounded">
                  +12%
                </span>
              </div>
              <div className="text-3xl font-bold mb-1 text-white">
                {stats?.totalTickets?.toLocaleString() || "0"}
              </div>
              <div className="text-blue-200 text-sm font-medium">
                Total Boletos
              </div>
            </div>

            {/* Active Tickets */}
            <div className="bg-green-600 rounded-2xl p-6 text-white shadow-xl border border-green-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-700 rounded-xl">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-green-200 text-sm font-medium bg-green-700 px-2 py-1 rounded">
                  +8%
                </span>
              </div>
              <div className="text-3xl font-bold mb-1 text-white">
                {stats?.activeTickets?.toLocaleString() || "0"}
              </div>
              <div className="text-green-200 text-sm font-medium">
                Boletos Activos
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-purple-600 rounded-2xl p-6 text-white shadow-xl border border-purple-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-700 rounded-xl">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <span className="text-purple-200 text-sm font-medium bg-purple-700 px-2 py-1 rounded">
                  +15%
                </span>
              </div>
              <div className="text-3xl font-bold mb-1 text-white">
                ${stats?.totalRevenue?.toLocaleString() || "0"}
              </div>
              <div className="text-purple-200 text-sm font-medium">
                Ingresos Totales
              </div>
            </div>

            {/* Today's Sales */}
            <div className="bg-orange-600 rounded-2xl p-6 text-white shadow-xl border border-orange-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-700 rounded-xl">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-orange-200 text-sm font-medium bg-orange-700 px-2 py-1 rounded">
                  +25%
                </span>
              </div>
              <div className="text-3xl font-bold mb-1 text-white">
                {stats?.todaysSales?.toLocaleString() || "0"}
              </div>
              <div className="text-orange-200 text-sm font-medium">
                Ventas Hoy
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tickets & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Tickets */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Boletos Recientes
                  </h3>
                  <Button variant="secondary" size="sm">
                    Ver Todos
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {import.meta.env.DEV && (
  <div className="bg-yellow-50 border border-yellow-200 p-4 mb-4 rounded-lg">
    <h4 className="font-bold text-yellow-800 mb-2">🐛 DEBUG MODE</h4>
    <div className="text-sm text-yellow-700 space-y-1">
      <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
      <p><strong>Stats exists:</strong> {stats ? 'true' : 'false'}</p>
      <p><strong>Recent tickets count:</strong> {stats?.recentTickets?.length || 0}</p>
      
      {stats?.recentTickets && stats.recentTickets.length > 0 && (
        <div className="mt-2">
          <p><strong>Primer ticket:</strong></p>
          <div className="bg-yellow-100 p-2 rounded text-xs">
            <p>• ID: {stats.recentTickets[0].id}</p>
            <p>• Número: {stats.recentTickets[0].ticketNumber}</p>
            <p>• Evento: {stats.recentTickets[0].eventName || 'UNDEFINED'}</p>
            <p>• Comprador: {stats.recentTickets[0].buyerName || 'UNDEFINED'}</p>
            <p>• Precio: {stats.recentTickets[0].price}</p>
            <p>• Estado: {stats.recentTickets[0].status}</p>
          </div>
        </div>
      )}
    </div>
  </div>
)}
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Boleto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comprador
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentTickets.slice(0, 5).map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.ticketNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ticket.eventName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.eventLocation}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ticket.buyerName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              ticket.status === "active"
                                ? "success"
                                : ticket.status === "used"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {ticket.status === "active"
                              ? "Activo"
                              : ticket.status === "used"
                              ? "Usado"
                              : "Cancelado"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${ticket.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="space-y-6">
            {/* Performance Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Rendimiento
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Tasa de Conversión
                    </span>
                    <span className="text-sm text-gray-900 font-semibold">
                      68.5%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                      style={{ width: "68.5%" }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Boletos Activos
                    </span>
                    <span className="text-sm text-gray-900 font-semibold">
                      {(
                        (stats.activeTickets / stats.totalTickets) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>pero igual si estoy en mi pc no salen los datos xd  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (stats.activeTickets / stats.totalTickets) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Satisfacción
                    </span>
                    <span className="text-sm text-gray-900 font-semibold">
                      94.2%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                      style={{ width: "94.2%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Resumen Rápido
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm font-bold">
                        📊
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Promedio por Boleto
                      </div>
                      <div className="text-xs text-gray-500">Precio medio</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ${Math.round(stats.totalRevenue / stats.totalTickets)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm font-bold">
                        💰
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Ingresos del Mes
                      </div>
                      <div className="text-xs text-gray-500">Total mensual</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ${stats.monthlyRevenue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
