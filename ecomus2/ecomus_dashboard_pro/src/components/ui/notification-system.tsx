"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  notifications: NotificationProps[];
  onRemoveNotification?: (id: string) => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

const typeStyles = {
  success: {
    icon: CheckCircle,
    colors: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/50 dark:border-green-800 dark:text-green-300",
    iconColor: "text-green-500 dark:text-green-400",
    progressColor: "bg-green-500"
  },
  error: {
    icon: AlertCircle,
    colors: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300",
    iconColor: "text-red-500 dark:text-red-400",
    progressColor: "bg-red-500"
  },
  warning: {
    icon: AlertTriangle,
    colors: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-300",
    iconColor: "text-yellow-500 dark:text-yellow-400",
    progressColor: "bg-yellow-500"
  },
  info: {
    icon: Info,
    colors: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300",
    iconColor: "text-blue-500 dark:text-blue-400",
    progressColor: "bg-blue-500"
  }
};

const positionStyles = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2"
};

function Notification({ id, type, title, message, duration = 5000, onClose, action }: NotificationProps) {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const style = typeStyles[type];
  const Icon = style.icon;

  useEffect(() => {
    if (duration <= 0) return;

    const interval = setInterval(() => {
      if (!isPaused) {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 50));
          if (newProgress <= 0) {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
            return 0;
          }
          return newProgress;
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, isPaused, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          layout
          initial={{ opacity: 0, x: 300, scale: 0.3 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.3 } }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-sm mb-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={cn(
            "relative overflow-hidden rounded-lg border p-4 shadow-lg backdrop-blur-sm",
            style.colors
          )}>
            {/* Progress bar */}
            {duration > 0 && (
              <div className="absolute bottom-0 left-0 h-1 bg-black/10 dark:bg-white/10 w-full">
                <motion.div
                  className={cn("h-full", style.progressColor)}
                  initial={{ width: "100%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.05, ease: "linear" }}
                />
              </div>
            )}

            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 25 }}
              >
                <Icon className={cn("h-5 w-5 mt-0.5", style.iconColor)} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <motion.h4
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm font-semibold"
                >
                  {title}
                </motion.h4>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-1 text-sm opacity-90"
                >
                  {message}
                </motion.p>

                {action && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={action.onClick}
                    className="mt-2 text-sm font-medium underline hover:no-underline transition-all"
                  >
                    {action.label}
                  </motion.button>
                )}
              </div>

              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onClick={handleClose}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function NotificationSystem({ 
  notifications, 
  position = "top-right" 
}: NotificationSystemProps) {
  return (
    <div className={cn("fixed z-50 flex flex-col", positionStyles[position])}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <Notification key={notification.id} {...notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook pour gérer les notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Fonctions de convenance
  const success = (title: string, message: string, options?: Partial<NotificationProps>) =>
    addNotification({ type: "success", title, message, ...options });

  const error = (title: string, message: string, options?: Partial<NotificationProps>) =>
    addNotification({ type: "error", title, message, ...options });

  const warning = (title: string, message: string, options?: Partial<NotificationProps>) =>
    addNotification({ type: "warning", title, message, ...options });

  const info = (title: string, message: string, options?: Partial<NotificationProps>) =>
    addNotification({ type: "info", title, message, ...options });

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
}

export default NotificationSystem;
export { useNotifications as useNotification };
