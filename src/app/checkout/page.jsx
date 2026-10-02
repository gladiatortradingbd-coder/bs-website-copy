"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Minus, Plus, ShoppingCart, ShieldCheck, Truck, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { calculateDeliveryCharge } from "@/lib/delivery";
import { useSession } from "next-auth/react";

function resolveItemImage(item) {
  return item?.image || item?.photos?.[0] || "";
}

export default function CheckoutPage() {
  const { items, total, clearCart, removeItem, updateQuantity } = useCart();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [toast, setToast] = useState(null);
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    if (session?.user) {
      if (session.user.fullName || session.user.name) {
        setName(session.user.fullName || session.user.name);
      }
      if (session.user.phone) {
        setPhone(session.user.phone);
      }
      if (session.user.region) {
        setRegion(session.user.region);
      }
      if (session.user.address) {
        setAddress(session.user.address);
      }
    }
  }, [session]);

  const summaryCount = useMemo(() => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0), [items]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  // Fetch product details (category + weight) for delivery charge calculation
  useEffect(() => {
    if (!items.length) {
      setProductDetails({});
      return;
    }

    const ids = [...new Set(items.map((it) => String(it.id)))];

    Promise.all(
      ids.map((id) =>
        fetch(`/api/products/${id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => (data?.product ? [id, data.product] : null))
          .catch(() => null),
      ),
    ).then((results) => {
      const details = {};
      for (const result of results) {
        if (result) details[result[0]] = result[1];
      }
      setProductDetails(details);
    });
  }, [items]);

  const deliveryCharge = useMemo(() => {
    if (!region) return null;
    const enrichedItems = items.map((it) => ({
      category: productDetails[it.id]?.category ?? "",
      weight: productDetails[it.id]?.weight ?? null,
      quantity: it.quantity,
    }));
    return calculateDeliveryCharge(region, enrichedItems);
  }, [region, items, productDetails]);

  const grandTotal = total + (deliveryCharge?.total ?? 0);

  async function submitOrder(e) {
    e.preventDefault();
    setMessage(null);

    if (!items.length) return setMessage("Cart is empty");
    if (!name || !phone || !region || !address) return setMessage("Please fill name, phone, region and address");

    setLoading(true);

    try {
      const payload = {
        items: items.map((it) => ({ id: it.id, quantity: it.quantity, selectedColor: it.selectedColor ?? null })),
        customer: { name, phone, region, address, notes },
        paymentMethod: "COD",
      };

      const idempotencyKey = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "idempotency-key": idempotencyKey },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order failed");

      if (typeof window !== "undefined") {
        window.localStorage.setItem("succulent-hut:last-order-id", data.orderId);
      }

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(data.orderId);
        }
      } catch {
        // Clipboard access can fail on some browsers; keep the saved id and continue.
      }

      setToast({
        title: "Order ID copied successfully",
        description: `Your order id ${data.orderId} was copied and saved for tracking.`,
      });
      setMessage(`Order created: ${data.orderId}. Our team will contact you.`);
      clearCart();
      setName("");
      setPhone("");
      setRegion("");
      setAddress("");
      setNotes("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-[28px] border border-emerald-200 bg-background shadow-[0_24px_80px_rgba(16,185,129,0.18)] backdrop-blur-sm animate-[toast-in_240ms_ease-out] sm:right-6 sm:top-6">
          <div className="relative overflow-hidden rounded-[28px] bg-linear-to-br from-emerald-50 via-white to-emerald-100/70 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white dark:text-black shadow-[0_10px_30px_rgba(16,185,129,0.28)]">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tracking-[0.08em] text-emerald-700">{toast.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{toast.description}</p>
              </div>

              <button
                type="button"
                onClick={() => setToast(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                aria-label="Dismiss order confirmation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full w-full origin-left rounded-full bg-emerald-500 animate-[toast-bar_3500ms_linear]" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl">
        <section className="overflow-hidden rounded-4xl border border-border-color bg-background shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
          <header className="border-b border-neutral-100 bg-linear-to-br from-neutral-50 via-white to-emerald-50/50 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Checkout</p>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Review your cart and finish the order</h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                  Keep the items you like, adjust quantities, and complete your delivery details in one clean step.
                </p>
              </div>

              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Checkout summary">
                <li className="rounded-3xl border border-white/70 dark:border-black/70 bg-background/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Items</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{summaryCount}</p>
                </li>
                <li className="rounded-3xl border border-white/70 dark:border-black/70 bg-background/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subtotal</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">Tk {total.toFixed(0)}</p>
                </li>
                <li className="rounded-3xl border border-white/70 dark:border-black/70 bg-background/80 p-4 shadow-sm backdrop-blur col-span-2 sm:col-span-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Delivery</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {deliveryCharge ? `Tk ${deliveryCharge.total}` : "—"}
                  </p>
                </li>
              </ul>
            </div>
          </header>

          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="border-b border-neutral-100 bg-muted/70 px-5 py-6 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cart summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Your selected products</h2>
                </div>
                <Link href="/shop" className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
                  Continue shopping
                </Link>
              </div>

              {items.length === 0 ? (
                <div className="mt-6 flex flex-col items-start gap-4 rounded-[28px] border border-dashed border-neutral-300 bg-background p-6">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-foreground shadow-sm">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Your cart is empty</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">Add products from the shop and they will appear here with images and quantity controls.</p>
                  </div>
                  <Link href="/shop" className="inline-flex h-11 items-center justify-center rounded-2xl bg-black dark:bg-white px-4 text-sm font-medium text-white dark:text-black transition-all duration-300 hover:scale-[1.01]">
                    Browse products
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {items.map((item) => {
                    const itemKey = item.key ?? item.id;
                    const itemImage = resolveItemImage(item);

                    return (
                      <article key={itemKey} className="overflow-hidden rounded-[28px] border border-border-color bg-background shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
                        <div className="grid gap-0 sm:grid-cols-[112px_1fr]">
                          <div className="relative min-h-36 bg-muted sm:min-h-full">
                            {itemImage ? (
                              <Image
                                src={itemImage}
                                alt={item.title}
                                fill
                                unoptimized
                                sizes="(max-width: 640px) 100vw, 112px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full min-h-36 items-center justify-center text-neutral-400">
                                <ShoppingCart className="h-6 w-6" />
                              </div>
                            )}
                          </div>

                          <div className="p-4 sm:p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <h3 className="truncate text-lg font-semibold text-foreground">{item.title}</h3>
                                {item.selectedColor ? <p className="mt-1 text-sm text-muted-foreground">Color: {item.selectedColor}</p> : null}
                                <p className="mt-2 text-sm text-muted-foreground">Line total</p>
                                <p className="text-lg font-semibold text-foreground">Tk {(Number(item.price) * Number(item.quantity)).toFixed(0)}</p>
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

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                              <div className="inline-flex items-center rounded-2xl border border-border-color bg-muted">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(itemKey, Math.max(1, Number(item.quantity) - 1))}
                                  className="inline-flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-background"
                                  aria-label={`Decrease quantity of ${item.title}`}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>

                                <span className="min-w-10 px-3 text-center text-sm font-medium text-foreground">{item.quantity}</span>

                                <button
                                  type="button"
                                  onClick={() => updateQuantity(itemKey, Number(item.quantity) + 1)}
                                  className="inline-flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-background"
                                  aria-label={`Increase quantity of ${item.title}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                                Ready for checkout
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
              <div className="sticky top-6 space-y-5">
                <div className="rounded-4xl border border-border-color bg-background p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Delivery details</p>
                      <h2 className="mt-1 text-2xl font-semibold text-foreground">Shipping & contact</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">Use a simple form with clear spacing and a clean hierarchy. No extra noise.</p>
                    </div>
                  </div>

                  <form onSubmit={submitOrder} className="mt-6 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Full name</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="h-14 w-full rounded-2xl border border-border-color bg-background px-4 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Phone number</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="h-14 w-full rounded-2xl border border-border-color bg-background px-4 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Region</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="h-14 w-full rounded-2xl border border-border-color bg-background px-4 text-sm outline-none transition-colors focus:border-black dark:focus:border-white"
                      >
                        <option value="">Select your region</option>
                        <option value="Barishal">Barishal</option>
                        <option value="Chattogram">Chattogram</option>
                        <option value="Dhaka">Dhaka</option>
                        <option value="Khulna">Khulna</option>
                        <option value="Mymensingh">Mymensingh</option>
                        <option value="Rajshahi">Rajshahi</option>
                        <option value="Rangpur">Rangpur</option>
                        <option value="Sylhet">Sylhet</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Delivery address</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House, street, area, city"
                        rows={4}
                        className="w-full rounded-2xl border border-border-color bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Order notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Optional delivery instructions"
                        rows={3}
                        className="w-full rounded-2xl border border-border-color bg-muted px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-black dark:focus:border-white"
                      />
                    </div>

                    <div className="rounded-[28px] border border-border-color bg-muted p-4">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-emerald-700 shadow-sm">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Cash on delivery</p>
                          <p className="text-xs leading-5 text-muted-foreground">Pay when your order arrives. No card required.</p>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={loading || items.length === 0}
                      type="submit"
                      className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-black dark:bg-white px-5 text-sm font-medium text-white dark:text-black transition-all duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Placing order..." : "Place order"}
                    </button>
                  </form>

                  {message ? (
                    <div className="mt-4 rounded-2xl border border-border-color bg-background px-4 py-3 text-sm text-foreground">
                      {message}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-4xl border border-border-color bg-background p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Order summary</p>
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Items</span>
                      <span className="font-medium text-foreground">{summaryCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-foreground">Tk {total.toFixed(0)}</span>
                    </div>
                    {deliveryCharge ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span>Delivery ({region})</span>
                          <span className="font-medium text-foreground">Tk {deliveryCharge.base}</span>
                        </div>
                        {deliveryCharge.weightSurcharge > 0 && (
                          <div className="flex items-center justify-between">
                            <span>Weight surcharge</span>
                            <span className="font-medium text-foreground">Tk {deliveryCharge.weightSurcharge}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span>Delivery</span>
                        <span className="text-neutral-400 italic text-xs">Select a region above</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-base">
                      <span className="font-semibold text-foreground">Grand Total</span>
                      <span className="font-semibold text-foreground">Tk {grandTotal.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
