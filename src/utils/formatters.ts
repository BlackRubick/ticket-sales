export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatTicketNumber = (number: string): string => {
  // Format: NBL-12345678 -> NBL-1234-5678
  if (number.includes('-') && number.length === 12) {
    const [prefix, digits] = number.split('-');
    return `${prefix}-${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return number;
};
