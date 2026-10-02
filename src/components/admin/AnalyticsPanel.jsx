"use client";

import { useMemo, useState } from "react";
import { Award, BarChart3, CheckCircle2, Clock3, DollarSign, PackageCheck } from "lucide-react";

function toAmount(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatCurrency(value) {
  return `৳${Math.round(toAmount(value)).toLocaleString("en-BD")}`;
}

export default function AnalyticsPanel({ initialOrders = [] }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [topSellerRanking, setTopSellerRanking] = useState("quantity");

  const analytics = useMemo(() => {
    const orders = Array.isArray(initialOrders) ? initialOrders : [];
    const startTime = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const endTime = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : null;

    const inRange = (order) => {
      if (!startTime && !endTime) {
        return true;
      }

      const createdAt = new Date(order.createdAt).getTime();

      if (Number.isNaN(createdAt)) {
        return false;
      }

      if (startTime !== null && createdAt < startTime) {
        return false;
      }

      if (endTime !== null && createdAt > endTime) {
        return false;
      }

      return true;
    };

    const rangedOrders = orders.filter(inRange);
    const deliveredOrders = rangedOrders.filter((order) => String(order.status ?? "").toLowerCase() === "delivered");
    const pendingOrders = rangedOrders.filter((order) => String(order.status ?? "").toLowerCase() === "pending");
    const deliveredRevenue = deliveredOrders.reduce((sum, order) => sum + toAmount(order.total), 0);
    const deliveredItems = deliveredOrders.reduce((sum, order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      return sum + items.reduce((itemSum, item) => itemSum + toAmount(item.quantity), 0);
    }, 0);

    const revenueByDateMap = new Map();

    for (const order of deliveredOrders) {
      const createdAt = new Date(order.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        continue;
      }

      const dateKey = createdAt.toISOString().slice(0, 10);
      revenueByDateMap.set(dateKey, (revenueByDateMap.get(dateKey) ?? 0) + toAmount(order.total));
    }

    const revenueOverTime = Array.from(revenueByDateMap.entries())
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([date, revenue]) => ({
        date,
        revenue,
      }));

    const topSellingProductsMap = new Map();

    for (const order of deliveredOrders) {
      const items = Array.isArray(order.items) ? order.items : [];

      for (const item of items) {
        const productId = String(item.productId ?? item.id ?? item.title ?? "unknown");
        const title = String(item.title ?? item.productId ?? "Untitled product").trim() || "Untitled product";
        const quantity = toAmount(item.quantity);
        const revenue = toAmount(item.lineTotal) || toAmount(item.price) * quantity;
        const existing = topSellingProductsMap.get(productId) ?? {
          productId,
          title,
          quantity: 0,
          revenue: 0,
        };

        topSellingProductsMap.set(productId, {
          ...existing,
          title,
          quantity: existing.quantity + quantity,
          revenue: existing.revenue + revenue,
        });
      }
    }

    const topSellingProducts = Array.from(topSellingProductsMap.values())
      .sort((left, right) => {
        const primarySort = topSellerRanking === "revenue" ? right.revenue - left.revenue : right.quantity - left.quantity;

        return primarySort || right.quantity - left.quantity || right.revenue - left.revenue || left.title.localeCompare(right.title);
      })
      .slice(0, 5);

    const averageOrderValue = deliveredOrders.length > 0 ? deliveredRevenue / deliveredOrders.length : 0;

    return {
      appliedRangeLabel:
        startDate || endDate
          ? `${startDate || "Start"} to ${endDate || "End"}`
          : "All dates",
      totalOrders: orders.length,
      rangedOrders,
      deliveredOrders,
      pendingOrders,
      deliveredRevenue,
      deliveredItems,
      revenueOverTime,
      topSellingProducts,
      averageOrderValue,
      recentDeliveredOrders: deliveredOrders.slice(0, 5),
    };
  }, [endDate, initialOrders, startDate, topSellerRanking]);

  const statCards = [
    {
      title: "Delivered sales",
      value: analytics.deliveredOrders.length,
      description: "Orders counted as sales after delivery.",
      icon: CheckCircle2,
    },
    {
      title: "Sales revenue",
      value: formatCurrency(analytics.deliveredRevenue),
      description: "Revenue from delivered orders only.",
      icon: DollarSign,
    },
    {
      title: "Delivered items",
      value: analytics.deliveredItems,
      description: "Total product quantity included in delivered orders.",
      icon: PackageCheck,
    },
    {
      title: "Pending orders",
      value: analytics.pendingOrders.length,
      description: "Orders not yet counted as sales.",
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border-color bg-muted p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Analytics</p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">Sales overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sales are counted only when an order is marked delivered, not pending.
        </p>
        <div className="mt-4 rounded-2xl border border-border-color bg-background p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-xl border border-border-color bg-background px-3 py-2 text-sm text-foreground outline-none ring-0"
              />
            </label>

            <label className="flex-1">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">End date</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-xl border border-border-color bg-background px-3 py-2 text-sm text-foreground outline-none ring-0"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border-color bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:border-black dark:hover:border-white hover:bg-background"
            >
              Clear range
            </button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">Showing data for: <span className="font-medium text-foreground">{analytics.appliedRangeLabel}</span></p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.title} className="rounded-3xl border border-border-color bg-background p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{card.title}</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{card.value}</p>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{card.description}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-border-color bg-background p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Revenue trend</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">Revenue over time</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <BarChart3 className="h-3.5 w-3.5" />
            Delivered only
          </div>
        </div>

        {analytics.revenueOverTime.length > 0 ? (
          <>
            <div className="mt-5 overflow-x-auto pb-2">
              <div className="flex min-w-max items-end gap-3">
                {analytics.revenueOverTime.map((point) => {
                  const maxRevenue = Math.max(...analytics.revenueOverTime.map((item) => item.revenue), 1);
                  const barHeight = Math.max((point.revenue / maxRevenue) * 160, 10);
                  const formattedDate = new Date(`${point.date}T00:00:00`).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div key={point.date} className="flex w-16 flex-col items-center gap-2">
                      <div className="flex h-44 w-full items-end rounded-2xl bg-muted px-2 py-2">
                        <div
                          className="w-full rounded-xl bg-gradient-to-t from-neutral-900 to-emerald-500 transition-all duration-300"
                          style={{ height: `${barHeight}px` }}
                          title={`${formattedDate}: ${formatCurrency(point.revenue)}`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-foreground">{formattedDate}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{formatCurrency(point.revenue)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Chart shows delivered revenue grouped by day for the selected range.
            </p>
          </>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-neutral-300 bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
            No delivered revenue in the selected range.
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border-color bg-background p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Delivered orders</p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">Recent sales</h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <BarChart3 className="h-3.5 w-3.5" />
              Delivered only
            </div>
          </div>

          {analytics.recentDeliveredOrders.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-3xl border border-border-color">
              <div className="divide-y divide-neutral-200">
                {analytics.recentDeliveredOrders.map((order) => (
                  <div key={order.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{order.customer?.name || "Customer"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="flex flex-col items-start gap-1 sm:items-end">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">Delivered</span>
                      <span className="text-sm font-semibold text-foreground">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-neutral-300 bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
              No delivered orders yet.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border-color bg-muted p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Notes</p>
          <div className="mt-3 space-y-3 text-sm text-foreground">
            <p>Orders with the status <span className="font-semibold">delivered</span> are counted as sales.</p>
            <p>Pending orders are tracked separately and are not included in revenue.</p>
            <p>
              Orders in selected range: <span className="font-semibold text-foreground">{analytics.rangedOrders.length}</span>
            </p>
            <p>
              Total orders in the system: <span className="font-semibold text-foreground">{analytics.totalOrders}</span>
            </p>
            <p>
              Average delivered order: <span className="font-semibold text-foreground">{formatCurrency(analytics.averageOrderValue)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border-color bg-background p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Top sellers</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">Products sold through delivered orders</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTopSellerRanking("quantity")}
              className={
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors " +
                (topSellerRanking === "quantity" ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground hover:bg-muted")
              }
            >
              <Award className="h-3.5 w-3.5" />
              Quantity
            </button>

            <button
              type="button"
              onClick={() => setTopSellerRanking("revenue")}
              className={
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors " +
                (topSellerRanking === "revenue" ? "bg-blue-50 text-blue-700" : "bg-muted text-muted-foreground hover:bg-muted")
              }
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Revenue
            </button>
          </div>
        </div>

        {analytics.topSellingProducts.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-3xl border border-border-color">
            <div className="divide-y divide-neutral-200">
              {analytics.topSellingProducts.map((product, index) => (
                <div key={product.productId} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-sm font-semibold text-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Sold in delivered orders by {topSellerRanking === "revenue" ? "revenue" : "quantity"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <span className="text-sm font-semibold text-foreground">{product.quantity} sold</span>
                    <span className="text-sm text-muted-foreground">Revenue: {formatCurrency(product.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-neutral-300 bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
            No delivered sales yet.
          </div>
        )}
      </div>
    </div>
  );
}