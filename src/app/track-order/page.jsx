"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, ClipboardCopy, Search } from "lucide-react";

const STEP_ORDER = ["pending", "processing", "shipped", "delivered"];

function stepIndex(status) {
  const idx = STEP_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function normalizePhone(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  const currentStep = useMemo(() => stepIndex(order?.status), [order]);

  useEffect(() => {
    const savedOrderId = window.localStorage.getItem("succulent-hut:last-order-id");

    if (savedOrderId) {
      setOrderId(savedOrderId);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setCopied(false);

    if (!orderId.trim() || !phone.trim()) {
      setError("Enter your order id and phone number to continue.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({ orderId: orderId.trim(), phone: normalizePhone(phone) });
      const res = await fetch(`/api/orders/lookup?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Could not check order status.");

      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function copyOrderId() {
    if (!order?.id) return;

    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <section className="overflow-hidden rounded-4xl border border-border-color bg-background shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
          <header className="border-b border-neutral-100 bg-linear-to-br from-emerald-50 via-white to-neutral-50 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Order tracking</p>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Check your order status</h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                  Enter the order id from your checkout confirmation and the phone number used on the order.
                </p>
              </div>

              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Tracking steps">
                <InfoCard label="Step 1" value="ID" />
                <InfoCard label="Step 2" value="Phone" />
                <InfoCard label="Security" value="Verified" />
                <InfoCard label="Update" value="Live" />
              </ul>
            </div>
          </header>

          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="border-b border-neutral-100 bg-muted/70 px-5 py-6 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-8">
              <div className="rounded-[28px] border border-border-color bg-background p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">Find your order</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">This lookup only returns the order that matches both the id and the phone number.</p>
                  </div>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <Field
                    label="Order ID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Example: 6a196a94246518e2d081b558"
                    autoComplete="off"
                  />

                  <Field
                    label="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Example: 01949564807"
                    autoComplete="tel"
                  />

                  {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-4 text-sm font-medium text-white dark:text-black transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Checking..." : "Check status"}
                    {!loading ? <ArrowRight className="h-4 w-4" /> : null}
                  </button>

                  <p className="text-xs leading-5 text-muted-foreground">
                    Tip: you can copy the order id from your order confirmation after checkout.
                  </p>
                </form>
              </div>
            </section>

            <section className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
              {order ? (
                <div className="space-y-5">
                  <div className="rounded-[28px] border border-border-color bg-background p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Order found</p>
                        <h2 className="mt-2 break-all text-xl font-semibold text-foreground">{order.id}</h2>
                      </div>

                      <button
                        type="button"
                        onClick={copyOrderId}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border-color bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-neutral-300 hover:bg-muted"
                      >
                        <ClipboardCopy className="h-4 w-4" />
                        {copied ? "Copied" : "Copy id"}
                      </button>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <StatCard label="Status" value={order.status} accent />
                      <StatCard label="Total" value={`৳${order.total}`} />
                      <StatCard label="Payment" value={order.paymentMethod} />
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-border-color bg-background p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Progress</p>
                        <h3 className="mt-2 text-lg font-semibold text-foreground">Order timeline</h3>
                      </div>
                      <div className={statusPillClass(order.status)}>{order.status}</div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {STEP_ORDER.map((step, index) => {
                        const active = index <= currentStep;
                        const done = index < currentStep;
                        return (
                          <div key={step} className="flex items-center gap-3 rounded-2xl border border-border-color bg-muted px-4 py-3">
                            <div className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${done || active ? "bg-emerald-600 text-white dark:text-black" : "bg-muted text-muted-foreground"}`}>
                              {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground capitalize">{step}</p>
                              <p className="text-xs text-muted-foreground">{done ? "Completed" : active ? "Current step" : "Waiting"}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <section className="rounded-[28px] border border-border-color bg-background p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6">
                      <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Customer</h3>
                      <div className="mt-3 space-y-2">
                        <p className="text-lg font-semibold text-foreground">{order.customer?.name}</p>
                        <p className="text-sm text-foreground">{order.customer?.phone}</p>
                        <p className="whitespace-pre-line text-sm leading-6 text-foreground">{order.customer?.address}</p>
                      </div>
                    </section>

                    <section className="rounded-[28px] border border-border-color bg-background p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6">
                      <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Placed</h3>
                      <p className="mt-3 text-lg font-semibold text-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">Your order details are secure and only visible after successful verification.</p>
                    </section>
                  </div>

                  <section className="rounded-[28px] border border-border-color bg-background p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Items</h3>
                    <div className="mt-4 space-y-3">
                      {order.items.map((item) => (
                        <div key={item.productId + item.title} className="flex items-center justify-between gap-4 rounded-2xl border border-border-color bg-muted px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{item.title || item.productId}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} • ৳{item.price}</p>
                          </div>
                          <div className="shrink-0 text-sm font-semibold text-foreground">৳{item.lineTotal}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="flex h-full min-h-105 items-center justify-center rounded-[28px] border border-dashed border-neutral-300 bg-muted/70 p-8 text-center">
                  <div className="max-w-md">
                    <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-emerald-700 shadow-sm">
                      <Search className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold text-foreground">No status loaded yet</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Enter the order id and phone number to see progress, total, items, and delivery details.
                    </p>
                    <div className="mt-4 text-sm text-muted-foreground">
                      Need your order id? Check the confirmation message after checkout.
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-border-color bg-background px-4 py-3 text-sm text-foreground outline-none ring-0 placeholder:text-neutral-400 focus:border-emerald-400"
      />
    </label>
  );
}

function InfoCard({ label, value }) {
  return (
    <li className="rounded-3xl border border-white/70 dark:border-black/70 bg-background/80 p-4 shadow-sm backdrop-blur list-none">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </li>
  );
}

function StatCard({ label, value, accent = false }) {
  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${accent ? "border-emerald-100 bg-emerald-50 text-emerald-900" : "border-border-color bg-muted text-foreground"}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function statusPillClass(status) {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-indigo-100 text-indigo-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return `rounded-full px-3 py-1 text-xs font-medium ${map[status] || "bg-muted text-foreground"}`;
}