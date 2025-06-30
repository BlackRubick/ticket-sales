export const APP_CONFIG = {
  name: 'Nebula',
  version: '1.0.0',
  author: 'Tu Empresa',
  description: 'Sistema de gestión de boletos con QR'
};

export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  retries: 3
};

export const STORAGE_KEYS = {
  auth_token: 'nebula_auth_token',
  user_data: 'nebula_user_data',
  refresh_token: 'nebula_refresh_token'
};

export const TICKET_STATUS = {
  ACTIVE: 'active',
  USED: 'used',
  CANCELLED: 'cancelled'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  SALES: 'sales',
  SCANNER: 'scanner'
} as const;