"use client";

import { useMemo } from "react";
import { Package, AlertTriangle, Boxes, TrendingDown } from "lucide-react";

const LOW_STOCK_THRESHOLD = 5;

function toStockValue(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : 0;
}

function getCategoryLabel(value) {
  const label = String(value ?? "").trim();
  return label || "Uncategorized";
}

export default function InventoryPanel({ initialProducts = [] }) {
  const inventory = useMemo(() => {
    const products = Array.isArray(initialProducts) ? initialProducts : [];

    const rows = products.map((product) => {
      const stock = toStockValue(product.stock);

      return {
        id: product.id,
        title: product.title ?? "Untitled product",
        category: getCategoryLabel(product.category),
        stock,
      };
    });

    const totalProducts = rows.length;
    const totalStock = rows.reduce((sum, item) => sum + item.stock, 0);
    const lowStockProducts = rows.filter((item) => item.stock > 0 && item.stock <= LOW_STOCK_THRESHOLD);
    const outOfStockProducts = rows.filter((item) => item.stock === 0);
    const categories = rows.reduce((accumulator, item) => {
      accumulator.set(item.category, (accumulator.get(item.category) ?? 0) + item.stock);
      return accumulator;
    }, new Map());

    return {
      rows: rows.sort((left, right) => left.stock - right.stock || left.title.localeCompare(right.title)),
      totalProducts,
      totalStock,
      lowStockProducts,
      outOfStockProducts,
      categories: Array.from(categories.entries()).sort((left, right) => right[1] - left[1]),
    };
  }, [initialProducts]);

  const summaryCards = [
    {
      title: "Total products",
      value: inventory.totalProducts,
      description: "Saved product records in the catalog.",
      icon: Package,
    },
    {
      title: "Total stock",
      value: inventory.totalStock,
      description: "All units currently listed across products.",
      icon: Boxes,
    },
    {
      title: "Low stock",
      value: inventory.lowStockProducts.length,
      description: `Products with ${LOW_STOCK_THRESHOLD} or fewer units left.`,
      icon: TrendingDown,
    },
    {
      title: "Out of stock",
      value: inventory.outOfStockProducts.length,
      description: "Products that need restocking now.",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border-color bg-muted p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Inventory</p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">Stock overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Check how many products you have, how much stock is available, and what needs restocking.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
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

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-border-color bg-background p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Products</p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">Stock by item</h3>
            </div>
            <p className="text-sm text-muted-foreground">{inventory.rows.length} items</p>
          </div>

          {inventory.rows.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-3xl border border-border-color">
              <div className="divide-y divide-neutral-200">
                {inventory.rows.map((product) => {
                  const status = product.stock === 0 ? "Out of stock" : product.stock <= LOW_STOCK_THRESHOLD ? "Low stock" : "In stock";
                  const statusClasses =
                    product.stock === 0
                      ? "bg-red-100 text-red-800"
                      : product.stock <= LOW_STOCK_THRESHOLD
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800";

                  return (
                    <div key={product.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-foreground">{product.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses}`}>{status}</span>
                        <span className="min-w-14 text-right text-sm font-semibold text-foreground">{product.stock}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-neutral-300 bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
              No products found.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border-color bg-background p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Categories</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">Stock by category</h3>

            <div className="mt-4 space-y-3">
              {inventory.categories.length > 0 ? (
                inventory.categories.map(([category, stock]) => (
                  <div key={category} className="flex items-center justify-between gap-3 rounded-2xl border border-border-color px-4 py-3">
                    <span className="text-sm font-medium text-foreground">{category}</span>
                    <span className="text-sm font-semibold text-foreground">{stock}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No category data available.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border-color bg-muted p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Attention</p>
            <p className="mt-2 text-sm text-foreground">
              {inventory.outOfStockProducts.length > 0
                ? `${inventory.outOfStockProducts.length} product${inventory.outOfStockProducts.length === 1 ? " is" : "s are"} out of stock and need restocking.`
                : "No out-of-stock products right now."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}