import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const newToast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const successToast = useCallback((message, duration) =>
    addToast(message, 'success', duration), [addToast]);

  const errorToast = useCallback((message, duration) =>
    addToast(message, 'error', duration), [addToast]);

  const warningToast = useCallback((message, duration) =>
    addToast(message, 'warning', duration), [addToast]);

  const infoToast = useCallback((message, duration) =>
    addToast(message, 'info', duration), [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    successToast,
    errorToast,
    warningToast,
    infoToast
  };
};
