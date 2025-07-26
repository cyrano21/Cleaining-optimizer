import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

const toasts: Toast[] = [];
const listeners: Array<(toasts: Toast[]) => void> = [];

let toastCounter = 0;

function updateToasts() {
  listeners.forEach(listener => listener([...toasts]));
}

export function toast({ title, description, variant = 'default', duration = 5000 }: ToastProps) {
  const id = (++toastCounter).toString();
  
  const newToast: Toast = {
    id,
    title,
    description,
    variant,
    duration,
  };
  
  toasts.push(newToast);
  updateToasts();
  
  if (duration > 0) {
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        updateToasts();
      }
    }, duration);
  }
  
  return {
    id,
    dismiss: () => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        updateToasts();
      }
    },
  };
}

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>([]);
  
  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);
  
  const dismiss = useCallback((toastId: string) => {
    const index = toasts.findIndex(t => t.id === toastId);
    if (index > -1) {
      toasts.splice(index, 1);
      updateToasts();
    }
  }, []);
  
  return {
    toast,
    toasts: toastList,
    dismiss,
    subscribe,
  };
}