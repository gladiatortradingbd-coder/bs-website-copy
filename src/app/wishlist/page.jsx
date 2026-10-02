"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";

export default function WishlistPage() {
  const { items, count, removeItem, clearWishlist } = useWishlist();
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (item) => {
    if (!item.cartItem) {
      return;
    }

    const stockCount = item.cartItem.stock ?? item.stock ?? null;
    const isAvailable = stockCount === null ? true : stockCount > 0;

    if (!isAvailable) {
      showToast({
        title: "Out of stock",
        description: `${item.name} is currently unavailable.`,
        variant: "warning",
      });
      return;
    }

    const wasAdded = addItem({
      ...item.cartItem,
      image: item.cartItem.image || item.image || item.cartItem.photos?.[0] || "",
      key: item.cartItem.key ?? item.key,
    }, 1);

    if (!wasAdded) {
      showToast({
        title: "Out of stock",
        description: `${item.name} is currently unavailable.`,
        variant: "warning",
      });
      return;
    }

    openCart();
  };

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <section className="rounded-4xl border border-border-color bg-background p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-8 lg:p-10">
          <header className="flex flex-col gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Wishlist</p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">Saved products</h1>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <p className="text-sm text-muted-foreground">{count} saved item{count === 1 ? "" : "s"}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-border-color bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white"
                >
                  Continue shopping
                </Link>

                {count > 0 ? (
                  <button
                    type="button"
                    onClick={clearWishlist}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-border-color bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground"
                  >
                    Clear wishlist
                  </button>
                ) : null}
              </div>
            </div>
          </header>

          {items.length > 0 ? (
            <ul className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2" aria-label="Wishlist items">
              {items.map((item) => (
                (() => {
                  const stockCount = item.cartItem?.stock ?? item.stock ?? null;
                  const isAvailable = stockCount === null ? true : stockCount > 0;

                  return (
                <li key={item.key}>
                  <article className="overflow-hidden rounded-[28px] border border-border-color bg-muted shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
                  <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
                    <div className="relative min-h-64 bg-muted sm:min-h-full">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 100vw, 180px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="flex flex-col justify-between gap-5 p-5 sm:p-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Saved item</p>
                        <h2 className="mt-2 text-xl font-semibold text-foreground">{item.name}</h2>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          {item.category ? <span className="rounded-full bg-background px-3 py-1">{item.category}</span> : null}
                          {item.price ? <span className="rounded-full bg-background px-3 py-1 font-medium text-foreground">{typeof item.price === "number" ? `Tk ${item.price}` : item.price}</span> : null}
                          <span className={`rounded-full px-3 py-1 font-medium ${isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                            {isAvailable ? (stockCount === null ? "In stock" : `${stockCount} left`) : "Out of stock"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border-color bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>

                        {item.cartItem ? (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-black dark:bg-white px-4 text-sm font-medium text-white dark:text-black transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            {isAvailable ? "Add to cart" : "Out of stock"}
                          </button>
                        ) : null}

                        {item.href ? (
                          <Link
                            href={item.href}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border-color bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:text-foreground"
                          >
                            View product
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  </article>
                </li>
                  );
                })()
              ))}
            </ul>
          ) : (
            <section className="mt-8 flex flex-col items-start gap-4 rounded-[28px] border border-dashed border-neutral-300 bg-muted p-6 sm:p-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-foreground shadow-sm">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Your wishlist is empty</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Tap the heart on any product to save it here for later.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-black dark:bg-white px-5 text-sm font-medium text-white dark:text-black transition-all duration-300 hover:scale-[1.02]"
              >
                Browse products
              </Link>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
