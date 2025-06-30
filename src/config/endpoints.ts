export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  },
  TICKETS: {
    LIST: '/tickets',
    CREATE: '/tickets',
    GET: '/tickets/:id',
    UPDATE: '/tickets/:id',
    DELETE: '/tickets/:id',
    RESEND: '/tickets/:id/resend',
    SCAN: '/tickets/scan'
  },
  ADMIN: {
    STATS: '/admin/statistics',
    USERS: '/admin/users'
  }
};
