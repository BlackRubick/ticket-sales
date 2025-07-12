import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Alert } from "../../components/ui/Alert";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useTickets } from "../../hooks/useTickets";
import type { Ticket } from "../../types/ticket";
import { qrService } from "../../services/qrService";

export const TicketList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12); // 12 boletos por página

  const { tickets, loading, error, resendTicket, fetchTickets } = useTickets();

  // Cargar tickets al montar el componente y cuando cambien los filtros
  useEffect(() => {
    const loadTickets = async () => {
      try {
        await fetchTickets({
          page: currentPage,
          limit,
          search: searchTerm.trim() || undefined,
          status: filterStatus === "all" ? undefined : filterStatus
        });
      } catch (err) {
        console.error("Error loading tickets:", err);
      }
    };

    loadTickets();
  }, [currentPage, limit, searchTerm, filterStatus, fetchTickets]);

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset a la primera página cuando se busca
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const displayTickets = Array.isArray(tickets) ? tickets : [];

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleResendTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setResendEmail(ticket.buyerEmail);
    setShowResendModal(true);
  };

  const handleConfirmResend = async () => {
    if (!selectedTicket || !resendEmail) return;

    try {
      setResendLoading(true);
      await resendTicket(selectedTicket.id, resendEmail);
      setSuccess(`Boleto reenviado exitosamente a ${resendEmail}`);
      setShowResendModal(false);
      setResendEmail("");
      setSelectedTicket(null);
    } catch (err) {
      console.error("Error resending ticket:", err);
    } finally {
      setResendLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="success" size="sm">
            🟢 Activo
          </Badge>
        );
      case "used":
        return (
          <Badge variant="warning" size="sm">
            🟡 Usado
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="danger" size="sm">
            🔴 Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm">
            {status}
          </Badge>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "from-green-500 to-emerald-600";
      case "used":
        return "from-yellow-500 to-orange-600";
      case "cancelled":
        return "from-red-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // Calcular estadísticas de los tickets actuales
  const statusCounts = {
    all: displayTickets.length,
    active: displayTickets.filter((t) => t.status === "active").length,
    used: displayTickets.filter((t) => t.status === "used").length,
    cancelled: displayTickets.filter((t) => t.status === "cancelled").length,
  };

  if (loading && displayTickets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando boletos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 w-full">
        <div className="absolute inset-0 bg-black opacity-20"></div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-pink-400/20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 sm:px-0">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
                Lista de Boletos
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-purple-100 mb-3 sm:mb-0">
                Gestiona todos los boletos del sistema
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="flex bg-white/10 backdrop-blur-lg rounded-xl p-1 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <svg
                    className="h-4 w-4 sm:mr-2 inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Tarjetas</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white text-indigo-600 shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <svg
                    className="h-4 w-4 sm:mr-2 inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  <span className="hidden sm:inline">Lista</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="px-4 sm:px-0">
          {success && (
            <div className="mb-6 sm:mb-8">
              <Alert
                type="success"
                message={success}
                onClose={() => setSuccess("")}
              />
            </div>
          )}
          {error && (
            <div className="mb-6 sm:mb-8">
              <Alert type="error" message={error} />
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                  filterStatus === status
                    ? "bg-white border-indigo-500 shadow-lg"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  {count}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 capitalize">
                  {status === "all"
                    ? "Total"
                    : status === "active"
                    ? "Activos"
                    : status === "used"
                    ? "Usados"
                    : "Cancelados"}
                </div>
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4 mb-6 sm:mb-8">
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar boletos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
                {loading && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-600">
                  {displayTickets.length} boletos encontrados
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="used">Usados</option>
                  <option value="cancelled">Cancelados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets Display */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {displayTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewDetails(ticket)}
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${getStatusColor(
                      ticket.status
                    )}`}
                  ></div>

                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-mono text-xs sm:text-sm font-bold text-gray-900 truncate mr-2">
                        {ticket.ticketNumber}
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>

                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2">
                        {ticket.eventName}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                        📍 {ticket.eventLocation}
                      </p>
                      <p className="text-gray-600 text-sm">
                        🗓️{" "}
                        {new Date(ticket.eventDate).toLocaleDateString("es-MX", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-900 font-medium text-sm line-clamp-1">
                        {ticket.buyerName}
                      </p>
                      <p className="text-gray-500 text-xs line-clamp-1">
                        {ticket.buyerEmail}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        ${ticket.price}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(ticket);
                          }}
                        >
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResendTicket(ticket);
                          }}
                        >
                          📧
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Boleto
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Evento
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Comprador
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        onClick={() => handleViewDetails(ticket)}
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-3 bg-gradient-to-r ${getStatusColor(
                                ticket.status
                              )}`}
                            ></div>
                            <div>
                              <div className="text-sm font-mono font-bold text-gray-900">
                                {ticket.ticketNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </div>
                              <div className="lg:hidden mt-1">
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {ticket.eventName}
                                </div>
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {ticket.buyerName}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-gray-900 font-medium">
                            {ticket.eventName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.eventLocation}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(ticket.eventDate).toLocaleDateString(
                              "es-MX",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900 font-medium">
                            {ticket.buyerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.buyerEmail}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-green-600">
                            ${ticket.price}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(ticket);
                              }}
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              <span className="hidden sm:inline ml-1">Ver</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResendTicket(ticket);
                              }}
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="hidden sm:inline ml-1">
                                Enviar
                              </span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {displayTickets.length === 0 && !loading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                <svg
                  className="h-8 sm:h-10 w-8 sm:w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                No se encontraron boletos
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                {searchTerm || filterStatus !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Aún no hay boletos en el sistema"}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {(searchTerm || filterStatus !== "all") && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                )}
                <Button onClick={() => (window.location.href = "/sales")}>
                  Crear Primer Boleto
                </Button>
              </div>
            </div>
          )}

          {/* Loading State para paginación */}
          {loading && displayTickets.length > 0 && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalles del Boleto"
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Preview con gradiente - texto blanco */}
            <div
              className={`relative overflow-hidden bg-gradient-to-br ${getStatusColor(
                selectedTicket.status
              )} text-black p-6 sm:p-8 rounded-2xl shadow-2xl`}
            >
              <div className="absolute inset-0 opacity-20">
                <div
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                ></div>
              </div>

              <div className="relative text-black">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
                      {selectedTicket.eventName}
                    </h3>
                    <p className="text-black/80 text-base sm:text-lg">
                      {selectedTicket.eventLocation}
                    </p>
                  </div>
                  <div className="flex justify-start sm:justify-end">
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div>
                    <p className="text-black/60 text-sm mb-1">
                      Fecha del Evento
                    </p>
                    <p className="font-semibold text-base sm:text-lg text-black">
                      {new Date(selectedTicket.eventDate).toLocaleDateString(
                        "es-MX",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-black/60 text-sm mb-1">Precio</p>
                    <p className="font-semibold text-base sm:text-lg text-white">
                      ${selectedTicket.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-black/60 text-sm mb-1">Comprador</p>
                    <p className="font-semibold text-sm sm:text-base text-white">
                      {selectedTicket.buyerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-black/60 text-sm mb-1">Boleto #</p>
                    <p className="font-semibold font-mono text-sm sm:text-base text-white">
                      {selectedTicket.ticketNumber}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                    <img
                      src={qrService.generateQRCode(selectedTicket.qrCode)}
                      alt="QR Code"
                      className="w-24 h-24 sm:w-32 sm:h-32 mx-auto"
                    />
                    <p className="text-center text-gray-600 text-xs mt-3 font-mono break-all">
                      {selectedTicket.qrCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details - FONDO GRIS CON TEXTO OSCURO */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
              <h4 className="font-bold text-gray-900 mb-4">
                Información Adicional
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900 text-sm break-all">
                      {selectedTicket.buyerEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {selectedTicket.buyerPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Fecha de Creación
                    </p>
                    <p className="font-medium text-gray-900 text-sm">
                      {new Date(selectedTicket.createdAt).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedTicket.usedAt && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Fecha de Uso</p>
                      <p className="font-medium text-orange-600 text-sm">
                        {new Date(selectedTicket.usedAt).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Código QR</p>
                    <p className="font-mono text-xs sm:text-sm text-gray-900 bg-gray-200 px-3 py-2 rounded-lg break-all">
                      {selectedTicket.qrCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDetailModal(false)}
                className="flex-1 sm:flex-none"
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  handleResendTicket(selectedTicket);
                }}
                className="flex-1 sm:flex-none"
              >
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Reenviar Boleto
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Resend Ticket Modal */}
      <Modal
        isOpen={showResendModal}
        onClose={() => setShowResendModal(false)}
        title="Reenviar Boleto"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Reenviar Boleto
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Se reenviará el boleto{" "}
                    <strong>{selectedTicket?.ticketNumber}</strong> a la
                    dirección especificada.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de destino
            </label>
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="correo@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              El boleto será enviado con el mismo código QR original
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowResendModal(false)}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmResend}
              loading={resendLoading}
              disabled={!resendEmail}
              className="flex-1 sm:flex-none"
            >
              {resendLoading ? "Enviando..." : "Reenviar Boleto"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};