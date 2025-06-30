export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TICKETS: {
    LIST: '/tickets',
    CREATE: '/tickets/create',
    DETAILS: '/tickets/:id',
    RESEND: '/tickets/resend'
  },
  SALES: {
    NEW: '/sales/new',
    HISTORY: '/sales/history'
  },
  SCANNER: {
    QR: '/scanner',
    RESULTS: '/scanner/results'
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    STATS: '/admin/statistics',
    USERS: '/admin/users'
  }
};