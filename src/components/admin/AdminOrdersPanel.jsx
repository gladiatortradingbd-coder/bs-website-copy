"use client";

import { useEffect, useMemo, useState } from "react";

const STATUS_LIST = ["pending", "processing", "shipped", "delivered", "cancelled"];

function statusBadge(status) {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-indigo-100 text-indigo-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const cls = map[status] || "bg-muted text-foreground";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{status}</span>;
}

export default function AdminOrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Could not fetch orders");
        const data = await res.json();
        if (mounted) setOrders(data.orders ?? []);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;

      if (!query) return true;

      const q = String(query).toLowerCase();
      return (
        String(order.id).toLowerCase().includes(q) ||
        String(order.customer?.name ?? "").toLowerCase().includes(q) ||
        String(order.customer?.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, query, statusFilter]);

  async function fetchProductsByIds(ids) {
    const results = {};

    await Promise.all(ids.map(async (id) => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.product) results[id] = data.product;
      } catch {
        // ignore
      }
    }));

    return results;
  }

  async function viewOrder(order) {
    const missingIds = (order.items || []).filter((item) => !item.title || !item.photo).map((item) => String(item.productId));

    if (missingIds.length === 0) {
      setSelectedOrder(order);
      return;
    }

    const products = await fetchProductsByIds([...new Set(missingIds)]);

    setSelectedOrder({
      ...order,
      items: (order.items || []).map((item) => {
        const product = products[String(item.productId)];
        return {
          ...item,
          title: item.title || product?.title || "",
          photo: item.photo || product?.photos?.[0] || null,
        };
      }),
    });
  }

  async function changeStatus(orderId, newStatus) {
    setUpdating(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Could not update status");
      }

      const body = await res.json();
      const updated = body.order;

      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
      setSelectedOrder(updated);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdating(false);
    }
  }

  async function deleteOrder(orderId) {
    if (!window.confirm("Delete this order permanently?")) return;

    setUpdating(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Could not delete order");
      }

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setSelectedOrder((current) => (current?.id === orderId ? null : current));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="mt-6">Loading orders…</div>;
  if (error) return <div className="mt-6 text-sm text-red-600">{error}</div>;

  return (
    <div className="mt-8 rounded-2xl border border-border-color bg-muted/70 p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">Search, inspect, update, or delete orders.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          aria-label="Search orders"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by id, customer name or phone"
          className="w-full rounded-xl border border-border-color bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 placeholder:text-neutral-400 sm:w-72"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border-color bg-background px-3 py-2 text-sm text-foreground outline-none ring-0"
        >
          <option value="all">All statuses</option>
          {STATUS_LIST.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border-color bg-background px-4 py-3 text-sm text-muted-foreground">No orders found.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border-color bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-215 table-auto text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr className="border-b border-border-color">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100 last:border-b-0 hover:bg-muted/80">
                    <td className="max-w-xs break-all px-4 py-4 font-mono text-xs text-foreground">{order.id}</td>
                    <td className="px-4 py-4 text-foreground">
                      <div className="font-medium">{order.customer?.name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer?.phone}</div>
                    </td>
                    <td className="px-4 py-4 text-foreground">৳{order.total}</td>
                    <td className="px-4 py-4 text-foreground">{order.paymentMethod}</td>
                    <td className="px-4 py-4">{statusBadge(order.status)}</td>
                    <td className="px-4 py-4 text-foreground">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => viewOrder(order)}
                          className="inline-flex items-center justify-center rounded-lg border border-border-color bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-neutral-300 hover:bg-muted"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          disabled={updating}
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close order details"
            className="absolute inset-0 bg-black/45 dark:bg-white/45"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-border-color bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border-color px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Order</p>
                <h3 className="mt-1 break-all text-xl font-semibold text-foreground sm:text-2xl">{selectedOrder.id}</h3>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full border border-border-color bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <section className="rounded-2xl border border-border-color bg-muted/80 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Customer</h4>
                  <div className="mt-3 space-y-2">
                    <p className="text-lg font-semibold text-foreground">{selectedOrder.customer?.name}</p>
                    <p className="text-sm text-foreground">{selectedOrder.customer?.phone}</p>
                    <p className="text-sm text-muted-foreground">
                      Region: <span className="font-medium text-foreground">{selectedOrder.customer?.region || "—"}</span>
                    </p>
                    <p className="whitespace-pre-line text-sm leading-6 text-foreground">{selectedOrder.customer?.address}</p>
                  </div>
                </section>

                <section className="rounded-2xl border border-border-color bg-background p-4 shadow-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Items</h4>
                  <div className="mt-3 space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 rounded-2xl border border-border-color bg-muted p-3">
                        <div className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-muted">
                          {item.photo ? (
                            <img src={item.photo} alt={item.title || "product"} className="h-full w-full object-cover" />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{item.title || item.productId}</p>
                              <p className="mt-1 text-sm text-muted-foreground">Qty: {item.quantity} • ৳{item.price}</p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold text-foreground">৳{item.lineTotal}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <section className="rounded-2xl border border-border-color bg-background p-4 shadow-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Status</h4>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {STATUS_LIST.map((status) => (
                      <span
                        key={status}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${status === selectedOrder.status ? "bg-neutral-900 text-white dark:text-black" : "bg-muted text-muted-foreground"}`}
                      >
                        {status}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Update status
                    </label>
                    <select
                      disabled={updating}
                      value={selectedOrder.status}
                      onChange={(e) => changeStatus(selectedOrder.id, e.target.value)}
                      className="w-full rounded-xl border border-border-color bg-muted px-3 py-2 text-sm text-foreground outline-none ring-0"
                    >
                      {STATUS_LIST.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </section>

                <section className="rounded-2xl border border-border-color bg-neutral-900 p-4 text-white dark:text-black shadow-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 dark:text-black/70">Cost Breakdown</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-white/60 dark:text-black/60">Subtotal</dt>
                      <dd className="font-medium">৳{selectedOrder.subtotal ?? selectedOrder.total}</dd>
                    </div>
                    {selectedOrder.deliveryCharge ? (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-white/60 dark:text-black/60">Delivery ({selectedOrder.customer?.region || "—"})</dt>
                          <dd className="font-medium">৳{selectedOrder.deliveryCharge.base}</dd>
                        </div>
                        {selectedOrder.deliveryCharge.weightSurcharge > 0 && (
                          <div className="flex items-center justify-between gap-4">
                            <dt className="text-white/60 dark:text-black/60">Weight surcharge</dt>
                            <dd className="font-medium">৳{selectedOrder.deliveryCharge.weightSurcharge}</dd>
                          </div>
                        )}
                      </>
                    ) : null}
                  </dl>
                  <div className="mt-3 border-t border-white/20 dark:border-black/20 pt-3">
                    <p className="text-xs text-white/60 dark:text-black/60 uppercase tracking-[0.2em]">Grand Total</p>
                    <p className="mt-1 text-3xl font-semibold">৳{selectedOrder.total}</p>
                  </div>
                </section>

                <section className="rounded-2xl border border-border-color bg-background p-4 shadow-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Summary</h4>
                  <dl className="mt-3 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">Payment method</dt>
                      <dd className="font-medium text-foreground">{selectedOrder.paymentMethod}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">Created</dt>
                      <dd className="font-medium text-foreground">{new Date(selectedOrder.createdAt).toLocaleString()}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">Items</dt>
                      <dd className="font-medium text-foreground">{selectedOrder.items?.length ?? 0}</dd>
                    </div>
                  </dl>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
