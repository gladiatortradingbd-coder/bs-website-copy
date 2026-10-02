"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle2,
    shell: "border-emerald-200 bg-background shadow-[0_24px_80px_rgba(16,185,129,0.18)]",
    accent: "from-emerald-50 via-white to-emerald-100/70",
    badge: "bg-emerald-600 text-white dark:text-black shadow-[0_10px_30px_rgba(16,185,129,0.28)]",
    title: "text-emerald-700",
    bar: "bg-emerald-500",
  },
  warning: {
    icon: AlertTriangle,
    shell: "border-amber-200 bg-background shadow-[0_24px_80px_rgba(245,158,11,0.16)]",
    accent: "from-amber-50 via-white to-amber-100/70",
    badge: "bg-amber-500 text-white dark:text-black shadow-[0_10px_30px_rgba(245,158,11,0.24)]",
    title: "text-amber-700",
    bar: "bg-amber-500",
  },
  error: {
    icon: AlertTriangle,
    shell: "border-rose-200 bg-background shadow-[0_24px_80px_rgba(244,63,94,0.16)]",
    accent: "from-rose-50 via-white to-rose-100/70",
    badge: "bg-rose-600 text-white dark:text-black shadow-[0_10px_30px_rgba(244,63,94,0.24)]",
    title: "text-rose-700",
    bar: "bg-rose-500",
  },
  info: {
    icon: Info,
    shell: "border-border-color bg-background shadow-[0_24px_80px_rgba(0,0,0,0.12)]",
    accent: "from-neutral-50 via-white to-neutral-100/70",
    badge: "bg-neutral-900 text-white dark:text-black shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
    title: "text-foreground",
    bar: "bg-neutral-500",
  },
};

export default function ToastViewport() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6" style={{ zIndex: 60 }}>
      {toasts.map((toast) => {
        const config = VARIANT_CONFIG[toast.variant] ?? VARIANT_CONFIG.info;
        const Icon = config.icon;

        return (
          <div key={toast.id} className={`overflow-hidden rounded-[28px] border ${config.shell} animate-[toast-in_240ms_ease-out]`}>
            <div className={`relative overflow-hidden rounded-[28px] bg-linear-to-br ${config.accent} p-4 sm:p-5`}>
              <div className="flex items-start gap-3">
                <div className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.badge}`}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold tracking-[0.08em] ${config.title}`}>{toast.title}</p>
                  {toast.description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{toast.description}</p> : null}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background/70">
                <div className={`h-full w-full origin-left rounded-full ${config.bar} animate-[toast-bar_3500ms_linear]`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}