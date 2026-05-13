import { toast } from 'react-toastify'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

/**
 * Centralized toast notification service
 * Use this instead of setting local state for error/success messages
 */
export const toastService = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
  // Generic method for dynamic type
  show: (message: string, type: ToastType = 'info') => {
    toast[type](message)
  },
}
