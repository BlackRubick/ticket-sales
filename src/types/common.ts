// src/types/common.ts
export interface SelectOption {
  value: string;
  label: string;
}

export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}