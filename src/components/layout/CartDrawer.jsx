"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

function resolveItemImage(item) {
  return item?.image || item?.photos?.[0] || "";
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCart();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeCart, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-70 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <button
        type="button"
        onClick={closeCart}
        className={`absolute inset-0 bg-black/45 dark:bg-white/45 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        aria-label="Close cart drawer overlay"
      />

      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-115 flex-col bg-background shadow-[0_30px_100px_rgba(0,0,0,0.26)] transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Cart</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">Your selected items</h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-color bg-background text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground"
            aria-label="Close cart drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => {
                const itemImage = resolveItemImage(item);
                const itemKey = item.key ?? item.id;

                return (
                  <article key={itemKey} className="overflow-hidden rounded-[28px] border border-border-color bg-muted shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
                    <div className="grid grid-cols-[92px_1fr] gap-0">
                            <div className="relative min-h-30 bg-muted">
                        {itemImage ? (
                          <Image src={itemImage} alt={item.title ?? item.name ?? "Cart item"} fill className="object-cover" sizes="92px" unoptimized />
                        ) : (
                          <div className="flex h-full min-h-30 items-center justify-center text-neutral-400">
                            <ShoppingCart className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-between gap-4 p-4 sm:p-5">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">{item.title ?? item.name}</h3>
                              {item.selectedColor ? <p className="mt-1 text-xs text-muted-foreground">Color: {item.selectedColor}</p> : null}
                            </div>

                            <p className="shrink-0 text-sm font-semibold text-foreground">Tk {Number(item.price || 0).toFixed(0)}</p>
                          </div>

                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Line total: Tk {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(0)}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center rounded-2xl border border-border-color bg-background">
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemKey, Math.max(1, Number(item.quantity) - 1))}
                              className="inline-flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-muted"
                              aria-label={`Decrease quantity of ${item.title ?? item.name}`}
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="min-w-10 px-3 text-center text-sm font-medium text-foreground">{item.quantity}</span>

                            <button
                              type="button"
                              onClick={() => updateQuantity(itemKey, Number(item.quantity) + 1)}
                              className="inline-flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-muted"
                              aria-label={`Increase quantity of ${item.title ?? item.name}`}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(itemKey)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-border-color bg-background px-3 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full flex-col items-start justify-center gap-4 rounded-[28px] border border-dashed border-neutral-300 bg-muted p-6 text-left">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-foreground shadow-sm">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Your cart is empty</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Add products from the shop and they will appear here with images, quantity controls, and a quick checkout path.</p>
              </div>
              <Link href="/shop" onClick={closeCart} className="inline-flex h-11 items-center justify-center rounded-2xl bg-black dark:bg-white px-4 text-sm font-medium text-white dark:text-black transition-all duration-300 hover:scale-[1.01]">
                Browse products
              </Link>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-100 bg-background px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-lg font-semibold text-foreground">Tk {total.toFixed(0)}</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Checkout stays simple, but you can review or change quantities here before paying.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/checkout" onClick={closeCart} className="inline-flex h-12 items-center justify-center rounded-2xl bg-black dark:bg-white px-4 text-sm font-medium text-white dark:text-black transition-all duration-300 hover:scale-[1.01]">
              Go to checkout
            </Link>
            <button type="button" onClick={closeCart} className="inline-flex h-12 items-center justify-center rounded-2xl border border-border-color bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground">
              Continue shopping
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}