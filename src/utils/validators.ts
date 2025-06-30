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

export const validateEventDate = (date: string): boolean => {
  const eventDate = new Date(date);
  const now = new Date();
  return eventDate > now; // Event must be in the future
};