"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";
import CartDrawer from "@/components/layout/CartDrawer";
import ToastViewport from "@/components/ui/ToastViewport";

const THEME_STORAGE_KEY = "succulent-hut-theme";

function applyTheme(theme) {
  const resolvedTheme = theme === "black" ? "black" : "white";
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme === "black" ? "dark" : "light";
  localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
}

function ThemeSync({ children }) {
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    applyTheme(storedTheme || "white");
  }, []);

  return children;
}

export default function AppProviders({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <ThemeSync>{children}</ThemeSync>
            <CartDrawer />
            <ToastViewport />
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
