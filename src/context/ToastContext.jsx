"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

let toastCounter = 0;

const DEFAULT_DURATION = 3500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timerRefs = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timerId = timerRefs.current.get(id);
    if (timerId) {
      window.clearTimeout(timerId);
      timerRefs.current.delete(id);
    }
  }, []);

  const showToast = useCallback((input, options = {}) => {
    const payload = typeof input === "string" ? { title: input, ...options } : input;
    const id = `toast-${Date.now()}-${++toastCounter}`;
    const duration = Number(payload?.duration) > 0 ? Number(payload.duration) : DEFAULT_DURATION;

    const toast = {
      id,
      title: payload?.title || "Notification",
      description: payload?.description || "",
      variant: payload?.variant || "info",
      duration,
    };

    setToasts((current) => [...current, toast]);

    const timerId = window.setTimeout(() => {
      removeToast(id);
    }, duration);

    timerRefs.current.set(id, timerId);

    return id;
  }, [removeToast]);

  useEffect(() => {
    const timers = timerRefs.current;

    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  const value = useMemo(() => ({ toasts, showToast, removeToast }), [removeToast, showToast, toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}