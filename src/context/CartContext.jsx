"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "succulent-hut-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch (error) {
      setItems([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }, [items, isHydrated]);

  function addItem(product, quantity = 1) {
    const stockCount = product?.stock ?? null;
    const isAvailable = stockCount === null ? true : stockCount > 0;

    if (!isAvailable) {
      return false;
    }

    let added = false;

    setItems((prev) => {
      const derivedKey = [product.id, product.selectedColor ?? product.color ?? ""].filter(Boolean).join("|");
      const itemKey = String(product.key ?? (derivedKey || product.id));
      const existing = prev.find((p) => String(p.key ?? p.id) === itemKey);

      if (existing) {
        added = true;
        return prev.map((p) => String(p.key ?? p.id) === itemKey ? { ...p, quantity: p.quantity + quantity } : p);
      }

      added = true;
      return [...prev, { ...product, key: itemKey, quantity }];
    });

    return added;
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((p) => String(p.key ?? p.id) !== String(id)));
  }

  function updateQuantity(id, quantity) {
    setItems((prev) => prev.map((p) => String(p.key ?? p.id) === String(id) ? { ...p, quantity } : p));
  }

  function clearCart() {
    setItems([]);
  }

  function openCart() {
    setIsOpen(true);
  }

  function closeCart() {
    setIsOpen(false);
  }

  function toggleCart() {
    setIsOpen((current) => !current);
  }

  const total = items.reduce((s, it) => s + (Number(it.price || 0) * (it.quantity || 0)), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, isOpen, openCart, closeCart, toggleCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
