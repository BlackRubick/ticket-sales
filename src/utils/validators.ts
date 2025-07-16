
// src/utils/validators.ts - SIN RESTRICCIONES DE FECHA

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateTicketNumber = (ticketNumber: string): boolean => {
  const ticketRegex = /^NBL-\d{8}$/;
  return ticketRegex.test(ticketNumber);
};

export const validatePrice = (price: number): boolean => {
  return price > 0 && price <= 10000; // Max $10,000
};

// ✅ OPCIÓN 1: Eliminar completamente la validación (permite cualquier fecha)
export const validateEventDate = (date: string): boolean => {
  // Solo verificar que sea una fecha válida
  const eventDate = new Date(date);
  return !isNaN(eventDate.getTime()); // Retorna true si es una fecha válida
};